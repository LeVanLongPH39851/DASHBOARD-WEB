"""Deterministic intent corrections between extraction and canonical binding."""

from __future__ import annotations

import logging
from dataclasses import dataclass, replace
from typing import Literal

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.semantic_extraction.contracts import (
    ExtractedDimension,
    SemanticExtractionResult,
)
from src.core.text_to_sql.semantic_extraction.normalization import (
    contains_lookup_phrase,
    normalize_lookup_value,
)


logger = logging.getLogger(__name__)

IntentAction = Literal["accept", "augment", "clarify", "reject"]


@dataclass(frozen=True)
class SemanticIntentDecision:
    extraction: SemanticExtractionResult
    action: IntentAction
    reasons: tuple[str, ...] = ()
    clarification: str | None = None
    suggestions: tuple[str, ...] = ()


class SemanticIntentRuleLayer:
    """Correct explicit grouping intent without allowing the LLM to invent IDs."""

    _GROUPING_PHRASES = {
        "theo tung kenh",
        "tung kenh",
        "moi kenh",
        "rieng tung kenh",
        "toan bo cac kenh",
        "toan bo kenh",
    }
    _TIME_GROUPING_PHRASES = {
        "theo ngay": "date",
        "theo tuan": "date",
        "theo thang": "date",
    }

    def __init__(self, catalog: RatingCatalog):
        self._catalog = catalog

    def apply(self, extraction: SemanticExtractionResult) -> SemanticIntentDecision:
        if not extraction.is_valid:
            return SemanticIntentDecision(extraction, "accept")

        normalized = normalize_lookup_value(extraction.question)
        dimensions = list(extraction.dimensions)
        added: list[str] = []

        if self._has_grouping_phrase(normalized, self._GROUPING_PHRASES):
            dimension_id = self._dimension_for(extraction, "channel")
            if dimension_id and self._add_role(dimensions, dimension_id, "group_by"):
                added.append(dimension_id)

        for phrase, dimension_suffix in self._TIME_GROUPING_PHRASES.items():
            if not contains_lookup_phrase(normalized, phrase):
                continue
            dimension_id = self._dimension_for(extraction, dimension_suffix)
            if dimension_id and self._add_role(dimensions, dimension_id, "group_by"):
                added.append(dimension_id)

        if not added:
            decision = SemanticIntentDecision(extraction, "accept")
        else:
            decision = SemanticIntentDecision(
                extraction=replace(extraction, dimensions=tuple(dimensions)),
                action="augment",
                reasons=("explicit_grouping_phrase",),
            )
        logger.info(
            "[I] action=%s source=rules added_dimensions=%s reasons=%s",
            decision.action,
            ",".join(added) or "none",
            ",".join(decision.reasons) or "none",
        )
        return decision

    def _dimension_for(
        self,
        extraction: SemanticExtractionResult,
        suffix: str,
    ) -> str | None:
        metric = self._catalog.metrics.get(extraction.metric_id or "")
        supported = set(metric.supported_dimensions) if metric else set()
        candidates = [
            dimension.id
            for dimension in self._catalog.dimensions.values()
            if dimension.id.rsplit(".", 1)[-1] == suffix
            and (not supported or dimension.id in supported)
        ]
        if len(candidates) == 1:
            return candidates[0]
        if metric:
            fact_tables = set(metric.source_tables)
            candidates = [
                dimension_id
                for dimension_id in candidates
                if self._catalog.get_dimension(dimension_id).table_id in fact_tables
            ]
        return candidates[0] if len(candidates) == 1 else None

    @staticmethod
    def _has_grouping_phrase(text: str, phrases: set[str]) -> bool:
        return any(contains_lookup_phrase(text, phrase) for phrase in phrases)

    @staticmethod
    def _add_role(
        dimensions: list[ExtractedDimension],
        dimension_id: str,
        role: str,
    ) -> bool:
        for index, dimension in enumerate(dimensions):
            if dimension.dimension_id != dimension_id:
                continue
            if role in dimension.roles:
                return False
            dimensions[index] = replace(
                dimension,
                roles=(*dimension.roles, role),
            )
            return True
        dimensions.append(
            ExtractedDimension(
                dimension_id=dimension_id,
                raw_values=(),
                roles=(role,),
            )
        )
        return True


__all__ = ("SemanticIntentDecision", "SemanticIntentRuleLayer")
