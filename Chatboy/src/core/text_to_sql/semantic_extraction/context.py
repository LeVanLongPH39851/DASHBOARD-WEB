"""Extract non-semantic query context without tokenizing names or dimension values."""

from __future__ import annotations

import re
from typing import Literal

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.input_contracts import ExtractedEntity, ExtractedInput, ExtractedSortIntent
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value


class QuestionContextExtractor:
    """Own time, limit and sort syntax; metric/dimension extraction lives elsewhere."""

    _ANSI_ESCAPE = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
    _SORT_MARKERS: tuple[tuple[str, Literal["asc", "desc"], bool], ...] = (
        ("tu thap den cao", "asc", False),
        ("tu cao den thap", "desc", False),
        ("tang dan", "asc", False),
        ("giam dan", "desc", False),
        ("thap nhat", "asc", True),
        ("it nhat", "asc", True),
        ("nho nhat", "asc", True),
        ("cao nhat", "desc", True),
        ("nhieu nhat", "desc", True),
        ("lon nhat", "desc", True),
        ("asc", "asc", False),
        ("desc", "desc", False),
        ("a z", "asc", False),
        ("z a", "desc", False),
    )

    def __init__(self, catalog: RatingCatalog):
        self._catalog = catalog

    def extract(self, question: str) -> ExtractedInput:
        cleaned = self._ANSI_ESCAPE.sub("", question).strip()
        normalized = normalize_lookup_value(cleaned)
        entities = self._time_and_limit_entities(cleaned, normalized)
        return ExtractedInput(
            question=cleaned,
            normalized_question=normalized,
            domain_id=self._catalog.domain_id,
            entities=tuple(entities),
            sort_intents=self._sort_intents(self._normalize_sort_text(cleaned)),
            channel_weight_scope=(
                "active_channels"
                if any(self._contains(normalized, phrase) for phrase in ("active", "kenh dang hoat dong"))
                else "total"
            ),
        )

    def _time_and_limit_entities(
        self,
        question: str,
        normalized: str,
    ) -> list[ExtractedEntity]:
        entities: list[ExtractedEntity] = []
        for matched in re.findall(r"\b\d{4}-\d{2}-\d{2}\b", question):
            entities.append(self._entity("time_expression", matched, matched, "*.date", 1.0))
        for matched in (
            "hom nay",
            "hom qua",
            "hom kia",
            "ngay qua",
            "1 ngay qua",
            "tuan nay",
            "tuan qua",
            "tuan truoc",
            "tuan kia",
            "1 tuan qua",
            "7 ngay qua",
            "thang nay",
            "thang qua",
            "thang truoc",
            "quy nay",
            "nam nay",
            "cuoi tuan",
        ):
            if self._contains(normalized, matched):
                entities.append(self._entity("time_expression", matched, matched, "*.date", 0.9))
        for matched in re.findall(
            r"(?<!\w)\d+\s+(?:hom\s+(?:truoc|qua|kia)|ngay\s+(?:truoc|qua)|"
            r"tuan\s+(?:truoc|qua|kia)|thang\s+(?:truoc|qua))(?!\w)",
            normalized,
        ):
            entities.append(self._entity("time_expression", matched, matched, "*.date", 0.9))
        for matched in re.findall(
            r"(?<!\w)(?:ngay\s+)?\d{1,2}\s+thang\s+\d{1,2}(?!\s*(?:[,và&/-]|den|toi|\s)\s*\d{1,2})(?:\s+nam\s+\d{4})?(?!\w)",
            normalized,
        ):
            entities.append(self._entity("time_expression", matched, matched, "*.date", 0.9))
        for matched in re.findall(
            r"(?<!\w)ngay\s+\d{1,2}(?!\w)",
            normalized,
        ):
            entities.append(self._entity("time_expression", matched, matched, "*.date", 0.9))
        for matched in re.findall(
            r"(?<!\d)\d{1,2}[-/.](?:\d{1,2})(?:[-/.]\d{2,4})?(?!\d)",
            normalized,
        ):
            entities.append(self._entity("time_expression", matched, matched, "*.date", 0.9))
        for matched in re.findall(
            r"(?<!\w)(?:(?:trong\s+)?(?:\d+\s+)?thang|cac\s+thang|tu\s+thang)\s+\d{1,2}(?:\s*(?:[,&/-]|và|va|den|toi|\s)\s*(?:thang\s+)?\d{1,2})+(?:\s+nam\s+\d{4})?(?!\w)",
            normalized,
        ):
            entities.append(self._entity("time_expression", matched, matched, "*.date", 0.9))
        for matched in re.findall(
            r"(?<!\w)thang\s+\d{1,2}(?:\s+nam\s+\d{4})?(?!\w)",
            normalized,
        ):
            entities.append(self._entity("time_expression", matched, matched, "*.date", 0.9))
        top_match = re.search(r"\btop\s+(\d+)\b", normalized)
        if top_match:
            entities.append(self._entity("limit", top_match.group(1), top_match.group(1), None, 1.0))

        # Filter out time expressions that are strict substrings of larger time expressions
        time_entities = [e for e in entities if e.kind == "time_expression"]
        non_time_entities = [e for e in entities if e.kind != "time_expression"]
        filtered_time: list[ExtractedEntity] = []
        for e in time_entities:
            if not any(
                other != e and e.normalized_value in other.normalized_value
                for other in time_entities
            ):
                filtered_time.append(e)

        unique: dict[tuple[str, str], ExtractedEntity] = {}
        for entity in (*filtered_time, *non_time_entities):
            unique[(entity.kind, entity.normalized_value)] = entity
        return list(unique.values())

    def _sort_intents(self, normalized: str) -> tuple[ExtractedSortIntent, ...]:
        markers: list[tuple[int, int, str, Literal["asc", "desc"], bool]] = []
        occupied: list[tuple[int, int]] = []
        for phrase, direction, is_extreme in self._SORT_MARKERS:
            for match in re.finditer(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", normalized):
                if any(match.start() < end and start < match.end() for start, end in occupied):
                    continue
                occupied.append((match.start(), match.end()))
                markers.append((match.start(), match.end(), phrase, direction, is_extreme))
        targets = self._sort_targets(normalized)
        intents: list[ExtractedSortIntent] = []
        for start, end, phrase, direction, is_extreme in sorted(markers):
            candidates = self._targets_in_clause(normalized, start, end, targets)
            if is_extreme:
                candidates = [target for target in targets if target[2] == "metric"]
            target = self._nearest_target(start, end, candidates)
            intents.append(
                ExtractedSortIntent(
                    direction=direction,
                    source_text=phrase,
                    target_kind=("metric" if is_extreme and target is None else target[2] if target else None),
                    target_value=target[3] if target else None,
                    confidence=0.9,
                )
            )
        return tuple(intents)

    def _sort_targets(
        self,
        normalized: str,
    ) -> list[tuple[int, int, Literal["metric", "dimension"], str]]:
        targets: list[tuple[int, int, Literal["metric", "dimension"], str]] = []
        terms = (
            *((phrase, "metric") for phrase, _metric_id in self._catalog.metric_terms()),
            *((phrase, "dimension") for phrase, _dimension_id in self._catalog.dimension_terms()),
        )
        seen: set[tuple[int, int, str, str]] = set()
        for phrase, kind in terms:
            for match in re.finditer(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", normalized):
                key = (match.start(), match.end(), kind, phrase)
                if key not in seen:
                    seen.add(key)
                    targets.append((match.start(), match.end(), kind, phrase))  # type: ignore[arg-type]
        return targets

    @staticmethod
    def _targets_in_clause(text: str, marker_start: int, marker_end: int, targets):
        separators = list(
            re.finditer(r"[,;]|(?<!\w)(?:va|roi|sau do)(?!\w)", text)
        )
        clause_start = max(
            (match.end() for match in separators if match.end() <= marker_start),
            default=0,
        )
        clause_end = min(
            (match.start() for match in separators if match.start() >= marker_end),
            default=len(text),
        )
        return [
            target
            for target in targets
            if target[0] >= clause_start and target[1] <= clause_end
        ]

    @staticmethod
    def _nearest_target(start: int, end: int, targets):
        if not targets:
            return None
        return min(
            targets,
            key=lambda item: (
                start - item[1] if item[1] <= start else item[0] - end if item[0] >= end else 0,
                -len(item[3]),
            ),
        )

    def _entity(
        self,
        kind: str,
        value: str,
        normalized_value: str,
        dimension_id: str | None,
        confidence: float,
    ) -> ExtractedEntity:
        return ExtractedEntity(
            kind=kind,
            value=value,
            normalized_value=normalized_value,
            source_text=value,
            domain_id=self._catalog.domain_id,
            dimension_id=dimension_id,
            confidence=confidence,
            match_type="context_rule",
        )

    @staticmethod
    def _contains(text: str, phrase: str) -> bool:
        return bool(re.search(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", text))

    @staticmethod
    def _normalize_sort_text(text: str) -> str:
        normalized = normalize_lookup_value(text.replace(",", " comma ").replace(";", " semicolon "))
        return normalized.replace(" comma ", ",").replace(" semicolon ", ";")


__all__ = ("QuestionContextExtractor",)
