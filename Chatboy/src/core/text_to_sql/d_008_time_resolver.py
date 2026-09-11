"""Workflow 008: resolve time expressions into half-open date ranges."""

from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Callable

from src.core.text_to_sql.input_contracts import ExtractedInput
from src.core.text_to_sql.query_plan import QueryPlanError, TimeRange
from src.core.text_to_sql.semantic_extraction.normalization import contains_lookup_phrase


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
        self.today_provider = today_provider or date.today

    def resolve(self, extracted: ExtractedInput) -> TimeRange:
        today = self.today_provider()
        explicit_dates = self._extract_explicit_dates(
            extracted.question,
            extracted.normalized_question,
            today,
        )
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
                grain="month",
            )
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
        # Rating data for the current day may be incomplete. When users do
        # not specify a period, query the latest fully completed day instead.
        return self._until_today(today - timedelta(days=1), today)

    @staticmethod
    def _inclusive_dates(start: date, end: date) -> TimeRange:
        if start > end:
            raise QueryPlanError("invalid_time_range_order")
        return TimeRange(start=start.isoformat(), end=(end + timedelta(days=1)).isoformat())

    @staticmethod
    def _one_day(target: date) -> TimeRange:
        return TimeRange(start=target.isoformat(), end=(target + timedelta(days=1)).isoformat())

    @classmethod
    def _extract_explicit_dates(
        cls,
        question: str,
        normalized_question: str,
        today: date,
    ) -> list[date]:
        """Parse supported explicit date formats and return normalized dates."""
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
            try:
                matches.append((match.start(), match.end(), date(today.year, int(match.group("month")), int(match.group("day")))))
            except ValueError:
                pass
        for match in cls._DAY_MONTH_NUMERIC_PATTERN.finditer(question):
            if any(m_start <= match.start() and match.end() <= m_end for m_start, m_end in month_spans):
                continue
            try:
                matches.append((match.start(), match.end(), date(today.year, int(match.group("month")), int(match.group("day")))))
            except ValueError:
                pass
        for match in cls._VIETNAMESE_DAY_ONLY_PATTERN.finditer(normalized_question):
            if any(m_start <= match.start() and match.end() <= m_end for m_start, m_end in month_spans):
                continue
            try:
                matches.append((match.start(), match.end(), date(today.year, today.month, int(match.group("day")))))
            except ValueError:
                pass

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
            # If range format like '6 - 8' or '6 den 8'
            range_match = re.search(r"(\d{1,2})\s*(?:-|den|toi)\s*(?:thang\s+)?(\d{1,2})", raw_months)
            if range_match and not re.search(r"[,và&]", raw_months):
                m_start, m_end = int(range_match.group(1)), int(range_match.group(2))
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
