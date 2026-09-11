"""Observable contracts for matching LLM values to catalog-owned values."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from src.core.text_to_sql.semantic_extraction.contracts import ExtractionRole, SemanticExtractionResult


CanonicalMatchStatus = Literal["matched", "not_found", "ambiguous"]


@dataclass(frozen=True)
class CanonicalValueBinding:
    dimension_id: str
    raw_value: str
    canonical_value: str | None
    status: CanonicalMatchStatus
    match_type: str
    score: float | None = None
    alternatives: tuple[str, ...] = ()


@dataclass(frozen=True)
class CanonicalDimension:
    dimension_id: str
    raw_values: tuple[str, ...]
    canonical_values: tuple[str, ...]
    roles: tuple[ExtractionRole, ...]


@dataclass(frozen=True)
class CanonicalBindingResult:
    extraction: SemanticExtractionResult
    metric_id: str | None
    dimensions: tuple[CanonicalDimension, ...] = ()
    value_bindings: tuple[CanonicalValueBinding, ...] = ()
    status: Literal["resolved", "failed"] = "resolved"
    error: str | None = None
    output_text: str | None = None

    @property
    def is_valid(self) -> bool:
        return self.status == "resolved" and self.error is None


__all__ = (
    "CanonicalBindingResult",
    "CanonicalDimension",
    "CanonicalMatchStatus",
    "CanonicalValueBinding",
)
