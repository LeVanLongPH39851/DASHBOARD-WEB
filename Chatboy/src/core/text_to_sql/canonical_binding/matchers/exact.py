"""Case/accent-insensitive exact dictionary matching."""

from __future__ import annotations

from src.core.text_to_sql.canonical_binding.contracts import CanonicalValueBinding
from src.core.text_to_sql.semantic_catalog import DimensionDefinition
from src.core.text_to_sql.semantic_memory import CanonicalMemory


class ExactCanonicalMatcher:
    def __init__(self, memory: CanonicalMemory):
        self._memory = memory

    def match(
        self,
        dimension: DimensionDefinition,
        raw_value: str,
    ) -> CanonicalValueBinding:
        matches = self._memory.exact_matches(dimension.id, raw_value)
        if len(matches) == 1:
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=matches[0],
                status="matched",
                match_type="exact",
                score=1.0,
            )
        if len(matches) > 1:
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=None,
                status="ambiguous",
                match_type="exact",
                score=1.0,
                alternatives=matches,
            )
        return CanonicalValueBinding(
            dimension_id=dimension.id,
            raw_value=raw_value,
            canonical_value=None,
            status="not_found",
            match_type="exact",
        )


__all__ = ("ExactCanonicalMatcher",)
