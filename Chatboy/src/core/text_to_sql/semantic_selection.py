"""Closed semantic choice made before a Rating query plan is compiled."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


DenominatorScope = Literal["none", "all_categories", "selected_categories"]


@dataclass(frozen=True)
class SemanticSelection:
    """Catalog IDs selected from user evidence; this contract never contains SQL."""

    metric_ids: tuple[str, ...]
    pattern_name: str
    denominator_scope: DenominatorScope = "none"
    source: Literal["llm", "rules", "pattern_router"] = "rules"

    @property
    def primary_metric_id(self) -> str | None:
        return self.metric_ids[0] if self.metric_ids else None


__all__ = [
    "DenominatorScope",
    "SemanticSelection",
]
