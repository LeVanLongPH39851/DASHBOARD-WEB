"""SQL-independent query plan contracts for the fixed Rating dashboard."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal


class QueryPlanError(ValueError):
    """A plan cannot be represented safely."""


@dataclass(frozen=True)
class MetricRef:
    id: str
    alias: str | None = None

    def __post_init__(self) -> None:
        if not self.id.strip():
            raise QueryPlanError("metric_id_required")


@dataclass(frozen=True)
class Filter:
    """A predicate over a semantic dimension, never a physical SQL column."""

    field: str
    operator: Literal["eq", "in"]
    value: str | tuple[str, ...]

    def __post_init__(self) -> None:
        if self.operator not in {"eq", "in"}:
            raise QueryPlanError(f"filter_operator_not_allowed:{self.operator}")
        if self.operator == "eq" and isinstance(self.value, tuple):
            raise QueryPlanError("eq_filter_requires_scalar_value")
        if self.operator == "in" and (not isinstance(self.value, tuple) or not self.value):
            raise QueryPlanError("in_filter_requires_non_empty_tuple")


@dataclass(frozen=True)
class OrderSpec:
    field: str
    direction: Literal["asc", "desc"] = "desc"

    def __post_init__(self) -> None:
        if self.direction not in {"asc", "desc"}:
            raise QueryPlanError(f"order_direction_not_allowed:{self.field}:{self.direction}")


@dataclass(frozen=True)
class TimeRange:
    """Business-date range with an exclusive end boundary: ``[start, end)``."""

    start: str
    end: str
    grain: Literal["day", "week", "month"] = "day"

    def __post_init__(self) -> None:
        try:
            start, end = date.fromisoformat(self.start), date.fromisoformat(self.end)
        except ValueError as exc:
            raise QueryPlanError("time_range_requires_iso_dates") from exc
        if start >= end:
            raise QueryPlanError("time_range_end_must_be_after_start")
        if self.grain not in {"day", "week", "month"}:
            raise QueryPlanError(f"time_grain_not_allowed:{self.grain}")


@dataclass(frozen=True)
class RatingQueryPlan:
    """The complete, semantic-only input for the Rating SQL renderer."""

    domain: str
    metrics: tuple[MetricRef, ...]
    dimensions: tuple[str, ...]
    filters: tuple[Filter, ...]
    time_range: TimeRange
    order_by: tuple[OrderSpec, ...]
    limit: int | None
    query_shape: str
    raw_question: str
    source: Literal["deterministic"] = "deterministic"
    pattern_name: str | None = None
    channel_weight_scope: Literal["total", "active_channels"] = "total"
    denominator_scope: Literal["none", "all_categories", "selected_categories"] = "none"

    def __post_init__(self) -> None:
        if not self.metrics and not self.dimensions:
            raise QueryPlanError("at_least_one_metric_or_dimension_required")
        metric_ids = tuple(item.id for item in self.metrics)
        if len(metric_ids) != len(set(metric_ids)):
            raise QueryPlanError("duplicate_metrics")
        if not self.query_shape or not self.query_shape.replace("_", "").isalnum():
            raise QueryPlanError(f"invalid_query_shape_id:{self.query_shape}")
        if self.source != "deterministic":
            raise QueryPlanError(f"plan_source_not_allowed:{self.source}")
        if self.channel_weight_scope not in {"total", "active_channels"}:
            raise QueryPlanError(
                f"channel_weight_scope_not_allowed:{self.channel_weight_scope}"
            )
        if self.denominator_scope not in {"none", "all_categories", "selected_categories"}:
            raise QueryPlanError(
                f"denominator_scope_not_allowed:{self.denominator_scope}"
            )

    @property
    def primary_metric(self) -> MetricRef | None:
        return self.metrics[0] if self.metrics else None
