"""Shared result contracts for the fixed Rating semantic pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from src.core.text_to_sql.input_contracts import ExtractedEntity, ExtractedSortIntent


@dataclass(frozen=True)
class ResolvedEntity:
    """An extracted entity matched against the Rating semantic catalog."""

    source: ExtractedEntity
    canonical_id: str | None
    canonical_value: str | None = None
    status: str = "resolved"
    reason: str = ""
    candidates: tuple[str, ...] = ()


@dataclass(frozen=True)
class ResolvedFilter:
    """A canonical predicate for the Rating SQL planner."""

    dimension_id: str
    physical_column: str | None
    operator: str
    values: tuple[str, ...]
    source_text: str


@dataclass(frozen=True)
class ResolvedSort:
    """An extracted sort intent bound to one semantic metric or dimension."""

    source: ExtractedSortIntent
    field_id: str | None
    direction: Literal["asc", "desc"]
    status: Literal["resolved", "unresolved", "ambiguous"] = "resolved"
    reason: str = ""
    candidates: tuple[str, ...] = ()


@dataclass(frozen=True)
class ResolvedSQLComponents:
    """Validated semantic components from which a Rating SQL plan is built."""

    domain_id: str
    table: str | None
    metric_id: str | None
    metric_ids: tuple[str, ...] = ()
    dimensions: tuple[str, ...] = ()
    filters: tuple[ResolvedFilter, ...] = ()
    resolved_entities: tuple[ResolvedEntity, ...] = ()
    unresolved_entities: tuple[ResolvedEntity, ...] = ()
    notes: tuple[str, ...] = ()
    sorts: tuple[ResolvedSort, ...] = ()


__all__ = ["ResolvedEntity", "ResolvedFilter", "ResolvedSort", "ResolvedSQLComponents"]
