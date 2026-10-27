"""Workflow 008: resolve time expressions into half-open date ranges."""

from __future__ import annotations

import re
import unicodedata
from dataclasses import replace
from datetime import date, datetime, timedelta
from typing import Callable
from zoneinfo import ZoneInfo

from src.core.text_to_sql.input_contracts import ExtractedInput
from src.core.text_to_sql.query_plan import ComparisonPeriod, ComparisonSpec, QueryPlanError, TimeRange
from src.core.text_to_sql.planning_contracts import TimeResolution, TimeInputError
from src.core.text_to_sql.semantic_extraction.normalization import contains_lookup_phrase, normalize_lookup_value


class RatingTimeResolver:
    """Resolve Rating time phrases, defaulting to yesterday when absent."""

    _ISO_DATE_PATTERN = re.compile(
        r"(?<!\d)(?P<year>\d{4})[-/.](?P<month>\d{1,2})[-/.](?P<day>\d{1,2})(?!\d)"
    )
    _DAY_FIRST_FULL_PATTERN = re.compile(
        r"(?<!\d)(?P<day>\d{1,2})[-/.](?P<month>\d{1,2})[-/.](?P<year>\d{4})(?!\d)"
    )
    _VIETNAMESE_FULL_DATE_PATTERN = re.compile(
        r"(?<!\w)(?:ngay\s+)?(?P<day>\d{1,2})\s+thang\s+"
        r"(?P<month>\d{1,2})\s+nam\s+(?P<year>\d{4})(?!\w)"
    )
    _VIETNAMESE_DAY_MONTH_PATTERN = re.compile(
        r"(?<!\w)(?:ngay\s+)?(?P<day>\d{1,2})\s+thang\s+(?P<month>\d{1,2})(?!\s*(?:[,và&/-]|den|toi|\s)\s*\d{1,2})(?!\s+nam\s+\d{4})(?!\w)"
    )
    _DAY_MONTH_NUMERIC_PATTERN = re.compile(
        r"(?<!\d)(?P<day>\d{1,2})[-/.](?P<month>\d{1,2})(?!\d|[-/.]\d)"
    )
    _VIETNAMESE_DAY_ONLY_PATTERN = re.compile(
        r"(?<!\w)(?:hom\s+)?ngay\s+(?P<day>\d{1,2})(?!\s+thang)(?!\w)"
    )
    _EXPLICIT_MONTH_PATTERN = re.compile(
        r"(?<!\w)thang\s+(?P<month>\d{1,2})(?:\s+nam\s+(?P<year>\d{4}))?(?!\w)"
    )

    def __init__(self, today_provider: Callable[[], date] | None = None):
        self.today_provider = today_provider or (lambda: datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")).date())

    def comparison(self, extracted: ExtractedInput) -> ComparisonSpec:
        """Resolve the two requested periods independently, never from row order."""
        if extracted.comparison_override:
            return extracted.comparison_override
        today = self.today_provider()
        text = extracted.normalized_question
        self._reject_vague_time(text)
        calendar_periods = self._calendar_periods(text, today)
        if calendar_periods:
            if len(calendar_periods) != 2:
                raise QueryPlanError('comparison_requires_two_periods')
            if re.search(r'\b(?:so voi|vs)\b', text):
                target, baseline = calendar_periods
            else:
                baseline, target = sorted(calendar_periods, key=lambda value: value.start)
            return ComparisonSpec(ComparisonPeriod('a', baseline), ComparisonPeriod('b', target))
        parts = re.split(r"\b(?:so với|so voi|vs)\b", extracted.question, maxsplit=1, flags=re.IGNORECASE)
        if len(parts) == 2 and all(self._has_period(p) or self._has_period(normalize_lookup_value(p)) for p in parts):
            for part in parts:
                normalized = normalize_lookup_value(part)
                dates = self._extract_explicit_dates(part, normalized, today)
                months = self._extract_explicit_months(normalized, today) if not dates else []
                # Lists on either side represent more than two periods. Explicit ranges
                # ('từ ... đến ...') remain one period and are resolved independently.
                if (len(dates) > 1 or len(months) > 1) and not re.search(r"\btu\b.*\b(?:den|toi)\b", normalized):
                    raise QueryPlanError("comparison_requires_two_periods")
            # In 'X so với Y', Y is the baseline and X is the target.
            ranges = [self.resolve(replace(extracted, question=p, normalized_question=normalize_lookup_value(p))) for p in parts]
            baseline, target = ranges[1], ranges[0]
        else:
            dates = self._extract_explicit_dates(extracted.question, text, today)
            month_tokens = list(self._EXPLICIT_MONTH_PATTERN.finditer(text))
            explicit_years = {m.group("year") for m in month_tokens if m.group("year")}
            if not dates and len(explicit_years) > 1:
                if len(month_tokens) != 2:
                    raise QueryPlanError("comparison_requires_two_periods")
                months = sorted(date(int(m.group("year") or today.year), int(m.group("month")), 1) for m in month_tokens)
            else:
                months = self._extract_explicit_months(text, today) if not dates else []
            if dates:
                if len(set(dates)) != 2:
                    raise QueryPlanError("comparison_requires_two_periods")
                baseline, target = (self._one_day(d) for d in sorted(set(dates)))
            elif months:
                if len(months) != 2:
                    raise QueryPlanError("comparison_requires_two_periods")
                ranges = []
                for start in months:
                    end = self._month_start(start, 1)
                    if start <= today < end:
                        end = today + timedelta(days=1)
                    ranges.append(TimeRange(start.isoformat(), end.isoformat(), "month"))
                baseline, target = ranges
            else:
                phrases = [p for p in ("hom qua", "hom nay", "hom kia", "tuan truoc", "tuan nay", "thang truoc", "thang nay") if self._contains(text, p)]
                if len(phrases) != 2:
                    raise QueryPlanError("comparison_requires_two_periods")
                ranges = [self.resolve(replace(extracted, question=p, normalized_question=p)) for p in phrases]
                baseline, target = sorted(ranges, key=lambda r: (r.start, r.end))
        return ComparisonSpec(ComparisonPeriod("a", baseline), ComparisonPeriod("b", target))

    @staticmethod
    def _has_period(text: str) -> bool:
        text = normalize_lookup_value(text)
        return bool(re.search(r'\b(?:ngay|hom|tuan|thang|quy|nam)\s*(?:\d|nay|truoc|qua|kia|sau|toi|i\b|ii\b|iii\b|iv\b)|\bq\s*\d|\b(?:dip|tet|giang sinh|cuoi tuan|gan day|mua he|mua dong)\b|\b(?:dau|giua|cuoi|nua)\s+(?:thang|quy|nam)\b', text))

    @staticmethod
    def _reject_vague_time(text):
        if re.search(r'\b(?:dip|tet|giang sinh|cuoi tuan|gan day|mua he|mua dong)\b|\b(?:dau|giua|cuoi|nua)\s+(?:thang|quy|nam)\b', text):
            raise QueryPlanError('unsupported_time_expression')

    def resolve(self, extracted: ExtractedInput) -> TimeRange:
        resolution = self.inspect(extracted)
        if resolution.status not in {'resolved', 'absent'}:
            raise TimeInputError(resolution)
        return resolution.resolved_ranges[0]

    def inspect(self, extracted: ExtractedInput, *, comparison=False) -> TimeResolution:
        """An unparsed/invalid expression is never treated as an absent one."""
        text = extracted.normalized_question
        supplied = bool(extracted.time_range_override or extracted.comparison_override)
        present = supplied or self._has_period(text) or bool(re.search(r'\d{1,4}[-/.]\d', extracted.question))
        source = 'clarification' if supplied else 'question' if present else 'catalog_default'
        try:
            if comparison:
                spec = self.comparison(extracted)
                ranges = tuple(p.time_range for p in spec.periods)
            else:
                ranges = (self._resolve_supported(extracted),)
            return TimeResolution('resolved' if present else 'absent', self.today_provider().isoformat(),
                                  source, extracted.question, ranges,
                                  None if present else 'default_previous_completed_day')
        except QueryPlanError as exc:
            status = 'ambiguous' if exc.code in {'ambiguous_time_range', 'ambiguous_month_year',
                'comparison_requires_two_periods', 'comparison_requires_distinct_periods'} else 'unsupported' if exc.code == 'unsupported_time_expression' else 'invalid'
            return TimeResolution(status, self.today_provider().isoformat(), source,
                                  extracted.question, reason_code=exc.code)
        except TimeInputError as exc:
            return exc.resolution

    @staticmethod
    def _requested_grain(text, default):
        match = re.search(r'\btheo\s+(?:tung\s+)?(ngay|tuan|thang)\b', text)
        return {'ngay': 'day', 'tuan': 'week', 'thang': 'month'}[match[1]] if match else default

    def _resolve_supported(self, extracted: ExtractedInput) -> TimeRange:
        if extracted.time_range_override:
            return extracted.time_range_override
        today = self.today_provider()
        explicit_dates = self._extract_explicit_dates(
            extracted.question,
            extracted.normalized_question,
            today,
        )
        self._reject_vague_time(extracted.normalized_question)
        if len(explicit_dates) == 2:
            return self._inclusive_dates(explicit_dates[0], explicit_dates[1])
        if len(explicit_dates) == 1:
            return self._one_day(explicit_dates[0])
        if len(explicit_dates) > 2:
            raise QueryPlanError("ambiguous_time_range")

        text = extracted.normalized_question
        explicit_months = self._extract_explicit_months(text, today)
        if explicit_months:
            starts = sorted(explicit_months)
            start = starts[0]
            next_month = self._month_start(starts[-1], 1)
            if starts[-1] <= today < next_month:
                end = today + timedelta(days=1)
            else:
                end = next_month
            return TimeRange(
                start=start.isoformat(),
                end=end.isoformat(),
                grain=self._requested_grain(text, 'month'),
            )
        calendar_periods = self._calendar_periods(text, today)
        if calendar_periods:
            if len(calendar_periods) > 1 and not re.search(r'\btu\b.*\b(?:den|toi)\b', text):
                raise QueryPlanError('ambiguous_time_range')
            if calendar_periods[0].start > calendar_periods[-1].start:
                raise QueryPlanError('invalid_time_range_order')
            return TimeRange(calendar_periods[0].start, calendar_periods[-1].end,
                             self._requested_grain(text, 'month'))
        relative_range = self._resolve_numbered_relative_range(text, today)
        if relative_range:
            return relative_range
        if self._contains(text, "hom kia"):
            return self._until_today(today - timedelta(days=2), today)
        if self._contains(text, "hom nay") and self._contains(text, "hom qua"):
            return TimeRange(
                start=(today - timedelta(days=1)).isoformat(),
                end=(today + timedelta(days=1)).isoformat(),
                grain="day",
            )
        if self._contains(text, "hom qua") or self._contains(text, "ngay qua"):
            return self._until_today(today - timedelta(days=1), today)
        if self._contains(text, "hom nay"):
            return self._from_today(today, today + timedelta(days=1))
        if self._contains(text, "tuan kia"):
            return self._until_today(today - timedelta(days=14), today)
        if self._contains(text, "tuan qua") or self._contains(text, "tuan truoc"):
            return self._until_today(today - timedelta(days=7), today)
        if self._contains(text, "tuan nay"):
            start = today - timedelta(days=today.weekday())
            next_week = start + timedelta(days=7)
            if start <= today < next_week:
                end = today + timedelta(days=1)
            else:
                end = next_week
            return self._from_today(start, end)
        if self._contains(text, "thang qua") or self._contains(text, "thang truoc"):
            return self._until_today(self._month_start(today, -1), today)
        if self._contains(text, "thang nay"):
            start = today.replace(day=1)
            end = today + timedelta(days=1)
            return self._from_today(start, end)
        if self._has_period(text):
            raise QueryPlanError('unsupported_time_expression')
        # Rating data for the current day may be incomplete. When users do
        # not specify a period, query the latest fully completed day instead.
        return self._until_today(today - timedelta(days=1), today)

    @classmethod
    def _calendar_periods(cls, text, today):
        quarter_pattern = r'\b(?:quy\s*(?P<quarter>[a-z]+|\d+)|q\s*(?P<q>\d+))(?:\s+(?:nam\s*)?(?P<year>\d{4}))?\b'
        quarters = list(re.finditer(quarter_pattern, text))
        ranges = []
        years = set(re.findall(r'\bnam\s+(\d{4})\b', text))
        shared_year = int(next(iter(years))) if len(years) == 1 else today.year
        if quarters:
            if len(years) > 1 and any(not match['year'] for match in quarters):
                raise QueryPlanError('ambiguous_time_range')
            for match in quarters:
                value = match['quarter'] or match['q']
                year = int(match['year'] or shared_year)
                if value in {'nay', 'truoc'}:
                    ordinal = today.year * 4 + (today.month - 1) // 3 - int(value == 'truoc')
                    year, quarter = ordinal // 4, ordinal % 4 + 1
                else:
                    quarter = {'i': 1, 'ii': 2, 'iii': 3, 'iv': 4}.get(value)
                    if quarter is None:
                        if not value.isdigit():
                            raise QueryPlanError('unsupported_time_expression')
                        quarter = int(value)
                    if not 1 <= quarter <= 4:
                        raise QueryPlanError('invalid_quarter')
                try:
                    start = date(year, (quarter - 1) * 3 + 1, 1)
                    end = cls._month_start(start, 3)
                except (ValueError, OverflowError) as exc:
                    raise QueryPlanError('invalid_explicit_date') from exc
                if start <= today < end:
                    end = today + timedelta(days=1)
                ranges.append(TimeRange(start.isoformat(), end.isoformat(), 'month'))
            return tuple(ranges)
        # Years attached to an explicit day/month belong to that expression.
        if re.search(r'\b(?:thang|ngay)\s+\d', text):
            return ()
        for match in re.finditer(r'\bnam\s*(\d{4}|nay|truoc)\b', text):
            year = today.year - int(match[1] == 'truoc') if match[1] in {'nay', 'truoc'} else int(match[1])
            try:
                start, end = date(year, 1, 1), date(year + 1, 1, 1)
            except ValueError as exc:
                raise QueryPlanError('invalid_explicit_date') from exc
            if start <= today < end:
                end = today + timedelta(days=1)
            ranges.append(TimeRange(start.isoformat(), end.isoformat(), 'month'))
        return tuple(ranges)

    @staticmethod
    def _inclusive_dates(start: date, end: date) -> TimeRange:
        if start > end:
            raise QueryPlanError("invalid_time_range_order")
        if end == date.max:
            raise QueryPlanError('invalid_explicit_date')
        return TimeRange(start=start.isoformat(), end=(end + timedelta(days=1)).isoformat())

    @staticmethod
    def _one_day(target: date) -> TimeRange:
        if target == date.max:
            raise QueryPlanError('invalid_explicit_date')
        return TimeRange(start=target.isoformat(), end=(target + timedelta(days=1)).isoformat())

    @classmethod
    def _extract_explicit_dates(
        cls,
        question: str,
        normalized_question: str,
        today: date,
    ) -> list[date]:
        """Parse supported explicit date formats and return normalized dates."""
        # All patterns must use the same coordinate system. The general lookup
        # normalizer collapses whitespace (including masked program names),
        # which otherwise makes short dates overlap the wrong full-date spans.
        normalized_question = ''.join(c for c in unicodedata.normalize('NFD', question.casefold()).replace('đ', 'd')
                                      if unicodedata.category(c) != 'Mn')
        question = normalized_question
        matches: list[tuple[int, int, date]] = []
        for match in cls._ISO_DATE_PATTERN.finditer(question):
            matches.append((match.start(), match.end(), cls._date_from_match(match, "year", "month", "day")))
        for match in cls._DAY_FIRST_FULL_PATTERN.finditer(question):
            matches.append((match.start(), match.end(), cls._date_from_match(match, "year", "month", "day")))
        for match in cls._VIETNAMESE_FULL_DATE_PATTERN.finditer(normalized_question):
            matches.append((match.start(), match.end(), cls._date_from_match(match, "year", "month", "day")))

        month_spans = [
            (m.start(), m.end())
            for pattern in (cls._EXPLICIT_MONTH_PATTERN, cls._MONTH_LIST_PATTERN)
            for m in pattern.finditer(normalized_question)
        ]

        for match in cls._VIETNAMESE_DAY_MONTH_PATTERN.finditer(normalized_question):
            if any(m_start <= match.start() and match.end() <= m_end for m_start, m_end in month_spans):
                continue
            if any(start < match.end() and match.start() < end for start, end, _ in matches):
                continue
            try:
                matches.append((match.start(), match.end(), date(today.year, int(match.group("month")), int(match.group("day")))))
            except ValueError as exc:
                raise QueryPlanError('invalid_explicit_date') from exc
        for match in cls._DAY_MONTH_NUMERIC_PATTERN.finditer(question):
            if any(m_start <= match.start() and match.end() <= m_end for m_start, m_end in month_spans):
                continue
            if any(start < match.end() and match.start() < end for start, end, _ in matches):
                continue
            try:
                matches.append((match.start(), match.end(), date(today.year, int(match.group("month")), int(match.group("day")))))
            except ValueError as exc:
                raise QueryPlanError('invalid_explicit_date') from exc
        for match in cls._VIETNAMESE_DAY_ONLY_PATTERN.finditer(normalized_question):
            if any(m_start <= match.start() and match.end() <= m_end for m_start, m_end in month_spans):
                continue
            if any(start < match.end() and match.start() < end for start, end, _ in matches):
                continue
            try:
                matches.append((match.start(), match.end(), date(today.year, today.month, int(match.group("day")))))
            except ValueError as exc:
                raise QueryPlanError('invalid_explicit_date') from exc

        ordered: list[date] = []
        occupied: list[tuple[int, int]] = []
        for start, end, value in sorted(matches, key=lambda item: (item[0], -(item[1] - item[0]))):
            if any(start < other_end and end > other_start for other_start, other_end in occupied):
                continue
            occupied.append((start, end))
            ordered.append(value)
        return ordered

    _EXPLICIT_MONTH_PATTERN = re.compile(
        r"(?<!\w)thang\s+(?P<month>\d{1,2})(?:\s+nam\s+(?P<year>\d{4}))?(?!\w)"
    )
    _MONTH_LIST_PATTERN = re.compile(
        r"(?<!\w)(?:(?:trong\s+)?(?:\d+\s+)?thang|cac\s+thang|tu\s+thang)\s+(?P<months>\d{1,2}(?:\s*(?:[,&/-]|và|va|den|toi|\s)\s*(?:thang\s+)?\d{1,2})+)(?:\s+nam\s+(?P<year>\d{4}))?(?!\w)"
    )

    @classmethod
    def _extract_explicit_months(cls, text: str, today: date) -> list[date]:
        """Resolve named month numbers, lists, or ranges; an omitted year means the current year."""
        explicit_years = {
            int(match.group("year"))
            for pattern in (cls._EXPLICIT_MONTH_PATTERN, cls._MONTH_LIST_PATTERN)
            for match in pattern.finditer(text)
            if match.group("year")
        }
        if len(explicit_years) > 1:
            raise QueryPlanError("ambiguous_month_year")
        shared_year = next(iter(explicit_years), today.year)
        result: list[date] = []

        # Check multi-month list/range patterns first (e.g. 3 tháng 6,7,8 or tháng 6-8)
        for match in cls._MONTH_LIST_PATTERN.finditer(text):
            year = int(match.group("year") or shared_year)
            raw_months = match.group("months")
            numbers = [int(value) for value in re.findall(r'\b\d{1,2}\b', raw_months)]
            if any(not 1 <= value <= 12 for value in numbers) or not 1 <= year <= 9999:
                raise QueryPlanError('invalid_explicit_month')
            # If range format like '6 - 8' or '6 den 8'
            range_match = re.search(r"(\d{1,2})\s*(?:-|den|toi)\s*(?:thang\s+)?(\d{1,2})", raw_months)
            if range_match and not re.search(r"[,và&]", raw_months):
                m_start, m_end = int(range_match.group(1)), int(range_match.group(2))
                if m_start > m_end:
                    raise QueryPlanError('invalid_time_range_order')
                for m in range(min(m_start, m_end), max(m_start, m_end) + 1):
                    if 1 <= m <= 12:
                        val = date(year, m, 1)
                        if val not in result:
                            result.append(val)
            else:
                for num_str in re.findall(r"\b\d{1,2}\b", raw_months):
                    m = int(num_str)
                    if 1 <= m <= 12:
                        val = date(year, m, 1)
                        if val not in result:
                            result.append(val)

        # Also find standalone month patterns
        for match in cls._EXPLICIT_MONTH_PATTERN.finditer(text):
            year = int(match.group("year") or shared_year)
            try:
                value = date(year, int(match.group("month")), 1)
            except ValueError as exc:
                raise QueryPlanError("invalid_explicit_month") from exc
            if value not in result:
                result.append(value)
        return sorted(result)

    @staticmethod
    def _date_from_match(match: re.Match[str], year_key: str, month_key: str, day_key: str) -> date:
        try:
            return date(
                int(match.group(year_key)),
                int(match.group(month_key)),
                int(match.group(day_key)),
            )
        except ValueError as exc:
            raise QueryPlanError("invalid_explicit_date") from exc

    @staticmethod
    def _resolve_numbered_relative_range(text: str, today: date) -> TimeRange | None:
        patterns = (
            (r"(?<!\w)(?:trong\s+)?(\d+)\s+(?:hom\s+(?:truoc|qua|kia)|ngay\s+(?:truoc|qua))(?!\w)", "day"),
            (r"(?<!\w)(?:trong\s+)?(\d+)\s+tuan\s+(?:truoc|qua|kia)(?!\w)", "week"),
            (r"(?<!\w)(?:trong\s+)?(\d+)\s+thang\s+(?:truoc|qua)(?!\w)", "month"),
        )
        for pattern, unit in patterns:
            match = re.search(pattern, text)
            if not match:
                continue
            count = int(match.group(1))
            if count <= 0:
                raise QueryPlanError("invalid_relative_time")
            if unit == "day":
                start = today - timedelta(days=count)
                return RatingTimeResolver._until_today(start, today)
            if unit == "week":
                start = today - timedelta(days=7 * count)
                return RatingTimeResolver._until_today(start, today)
            start = RatingTimeResolver._month_start(today, -count)
            return RatingTimeResolver._until_today(start, today)
        return None

    @staticmethod
    def _month_start(value: date, offset: int) -> date:
        month_index = value.year * 12 + value.month - 1 + offset
        year, month = divmod(month_index, 12)
        if not 1 <= year <= 9999:
            raise QueryPlanError('invalid_relative_time')
        return date(year, month + 1, 1)

    @staticmethod
    def _until_today(start: date, today: date) -> TimeRange:
        return TimeRange(start=start.isoformat(), end=today.isoformat())

    @staticmethod
    def _from_today(start: date, end: date) -> TimeRange:
        return TimeRange(start=start.isoformat(), end=end.isoformat())

    @staticmethod
    def _contains(text: str, phrase: str) -> bool:
        return contains_lookup_phrase(text, phrase)

    @staticmethod
    def format_display(time_range: TimeRange) -> str:
        """Format a TimeRange into Vietnamese display string."""
        start_dt = date.fromisoformat(time_range.start)
        exclusive_end = date.fromisoformat(time_range.end)
        inclusive_end = exclusive_end - timedelta(days=1)
        fmt = "%d/%m/%Y"
        if start_dt == inclusive_end:
            return start_dt.strftime(fmt)
        return f"{start_dt.strftime(fmt)} tới {inclusive_end.strftime(fmt)}"
