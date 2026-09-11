"""Stable question-context contracts used after semantic extraction."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


NO_DASHBOARD_VALUE_ERROR = "Không có giá trị nào phục vụ dashboard"


@dataclass(frozen=True)
class ExtractedEntity:
    """One canonical semantic or deterministic question-context entity."""

    kind: str
    value: str
    normalized_value: str
    source_text: str
    domain_id: str | None = None
    dimension_id: str | None = None
    confidence: float = 1.0
    source_start: int | None = None
    source_end: int | None = None
    match_type: str = "semantic"


@dataclass(frozen=True)
class ExtractedSortIntent:
    """A requested ordering before its semantic target is resolved."""

    direction: Literal["asc", "desc"]
    source_text: str
    target_kind: Literal["metric", "dimension"] | None = None
    target_value: str | None = None
    confidence: float = 1.0


@dataclass(frozen=True)
class ExtractedInput:
    """Downstream-compatible context for one raw question."""

    question: str
    normalized_question: str
    domain_id: str | None = "RATING"
    entities: tuple[ExtractedEntity, ...] = ()
    unresolved_terms: tuple[str, ...] = ()
    notes: tuple[str, ...] = ()
    sort_intents: tuple[ExtractedSortIntent, ...] = ()
    channel_weight_scope: Literal["total", "active_channels"] = "total"
    error: str | None = None

    @property
    def is_domain_ambiguous(self) -> bool:
        return False


__all__ = (
    "ExtractedEntity",
    "ExtractedInput",
    "ExtractedSortIntent",
    "NO_DASHBOARD_VALUE_ERROR",
)
