"""Stable, SQL-independent contracts produced from one raw question."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


ExtractionRole = Literal["filter", "group_by", "sort"]


@dataclass(frozen=True)
class ExtractedDimension:
    """One catalog dimension and the raw values attributed to it by extraction."""

    dimension_id: str
    raw_values: tuple[str, ...] = ()
    roles: tuple[ExtractionRole, ...] = ()


@dataclass(frozen=True)
class SemanticExtractionResult:
    """Exactly one semantic interpretation for one original question."""

    question: str
    metric_id: str | None
    dimensions: tuple[ExtractedDimension, ...] = ()
    source: Literal["llm", "rules"] = "llm"
    error: str | None = None
    output_text: str | None = None

    @property
    def is_valid(self) -> bool:
        return self.error is None

    @property
    def has_semantic_context(self) -> bool:
        return self.metric_id is not None or bool(self.dimensions)


__all__ = ("ExtractedDimension", "ExtractionRole", "SemanticExtractionResult")
