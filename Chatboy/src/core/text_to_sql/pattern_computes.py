"""Built-in post-processing plugins referenced by Rating pattern metadata."""

from __future__ import annotations

from typing import Any


def _metric_column(plan: Any) -> str:
    metric = plan.primary_metric
    return metric.alias or metric.id.rsplit(".", 1)[-1]


def _number(value: Any) -> float:
    if value is None:
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _optional_number(value: Any) -> float | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _restore_number(value: float, original: Any) -> Any:
    return int(value) if isinstance(original, int) and not isinstance(original, bool) else value


def _metric_comparison(metric: Any, raw_first: Any, raw_second: Any) -> dict[str, Any]:
    metric_alias = metric.alias or metric.id.rsplit(".", 1)[-1]
    first_value = _optional_number(raw_first)
    second_value = _optional_number(raw_second)
    if first_value is None or second_value is None:
        return {
            "metric_id": metric.id,
            "metric_alias": metric_alias,
            "value_a": raw_first,
            "value_b": raw_second,
            "delta": None,
            "delta_pct": None,
            "status": "insufficient_data",
        }
    delta = second_value - first_value
    return {
        "metric_id": metric.id,
        "metric_alias": metric_alias,
        "value_a": raw_first,
        "value_b": raw_second,
        "delta": _restore_number(delta, raw_first),
        "delta_pct": None if first_value == 0 else round(delta / first_value * 100, 2),
        "status": "available",
    }


def _order_direction(plan: Any, field: str, default: str) -> str:
    for item in getattr(plan, "order_by", ()):
        if item.field == field:
            return item.direction
    return default


def compute_period_comparison(rows: list[dict[str, Any]], plan: Any) -> dict[str, Any]:
    if len(rows) < 2:
        return {"rows": rows, "error": "insufficient_data"}
    first, second = dict(rows[0]), dict(rows[1])
    comparisons: list[dict[str, Any]] = []
    for metric in plan.metrics:
        metric_alias = metric.alias or metric.id.rsplit(".", 1)[-1]
        comparisons.append(_metric_comparison(metric, first.get(metric_alias), second.get(metric_alias)))

    result = {
        "period_a": first,
        "period_b": second,
        "comparisons": comparisons,
    }
    return result


def compute_dimension_comparison(rows: list[dict[str, Any]], plan: Any) -> dict[str, Any]:
    """Compare each selected metric across values of one grouped dimension."""
    if not plan.dimensions or len(rows) < 2:
        return {"rows": rows, "error": "insufficient_data"}
    dimension_id = plan.dimensions[0]
    metric_aliases = {
        metric.alias or metric.id.rsplit(".", 1)[-1]
        for metric in plan.metrics
    }
    preferred_alias = dimension_id.rsplit(".", 1)[-1]
    dimension_alias = preferred_alias if preferred_alias in rows[0] else None
    if dimension_alias is None:
        candidates = [
            key
            for key in rows[0]
            if key not in metric_aliases and key != "date"
        ]
        dimension_alias = candidates[0] if len(candidates) == 1 else None
    if dimension_alias is None:
        return {"rows": rows, "error": "missing_comparison_dimension"}

    requested_values: tuple[Any, ...] = ()
    for predicate in plan.filters:
        if predicate.field == dimension_id and isinstance(predicate.value, tuple):
            requested_values = predicate.value
            break
    rows_by_value = {str(row.get(dimension_alias)): dict(row) for row in rows}
    ordered_rows = [rows_by_value[str(value)] for value in requested_values if str(value) in rows_by_value]
    if not ordered_rows:
        ordered_rows = [dict(row) for row in rows]
    if len(ordered_rows) < 2:
        return {"rows": rows, "error": "insufficient_data"}

    baseline = ordered_rows[0]
    comparisons: list[dict[str, Any]] = []
    for target in ordered_rows[1:]:
        for metric in plan.metrics:
            metric_alias = metric.alias or metric.id.rsplit(".", 1)[-1]
            comparison = _metric_comparison(
                metric,
                baseline.get(metric_alias),
                target.get(metric_alias),
            )
            comparison.update(
                group_a=baseline.get(dimension_alias),
                group_b=target.get(dimension_alias),
            )
            comparisons.append(comparison)
    return {
        "dimension_id": dimension_id,
        "dimension_alias": dimension_alias,
        "baseline": baseline,
        "targets": ordered_rows[1:],
        "comparisons": comparisons,
    }


def compute_rank_comparison(rows: list[dict[str, Any]], plan: Any) -> list[dict[str, Any]]:
    metric_col = _metric_column(plan)
    result = [dict(row) for row in rows]
    direction = _order_direction(plan, plan.primary_metric.id, "desc")
    result.sort(key=lambda row: _number(row.get(metric_col)), reverse=direction == "desc")
    total = sum(_number(row.get(metric_col)) for row in result)
    leader = _number(result[0].get(metric_col)) if result else 0.0
    for index, row in enumerate(result, start=1):
        value = _number(row.get(metric_col))
        row["rank"] = index
        row["pct_of_total"] = round(value / total * 100, 1) if total else 0
        row["gap_vs_leader_pct"] = round(abs(leader - value) / abs(leader) * 100, 1) if leader else 0
    return result


def compute_trend(rows: list[dict[str, Any]], plan: Any) -> list[dict[str, Any]]:
    metric_col = _metric_column(plan)
    result = [dict(row) for row in rows]
    dimensions = getattr(plan, "dimensions", ())
    time_dimension = next(
        (
            dimension_id
            for dimension_id in dimensions
            if dimension_id.rsplit(".", 1)[-1] in {"date", "date_ott"}
        ),
        dimensions[0] if dimensions else None,
    )
    time_column = _dimension_column(time_dimension, result) if time_dimension else "date"
    group_dimensions = tuple(
        dimension_id for dimension_id in dimensions if dimension_id != time_dimension
    )
    groups: dict[tuple[Any, ...], list[dict[str, Any]]] = {}
    for row in result:
        key = tuple(
            row.get(_dimension_column(dimension_id, result))
            for dimension_id in group_dimensions
        )
        groups.setdefault(key, []).append(row)

    for grouped_rows in groups.values():
        direction = _order_direction(plan, time_dimension or "date", "asc")
        grouped_rows.sort(
            key=lambda row: str(row.get(time_column, "")),
            reverse=direction == "desc",
        )
        previous: float | None = None
        for row in grouped_rows:
            current = _number(row.get(metric_col))
            row["mom_change_pct"] = (
                None
                if previous is None or previous == 0
                else round((current - previous) / previous * 100, 2)
            )
            previous = current
    if not group_dimensions:
        return next(iter(groups.values()), result)
    return result


def _dimension_column(dimension_id: str | None, rows: list[dict[str, Any]]) -> str:
    if not dimension_id:
        return "date"
    suffix = dimension_id.rsplit(".", 1)[-1]
    candidates = {
        "channel": ("channel_name_tvd", "channel"),
        "date": ("date",),
        "date_ott": ("date_ott", "date"),
        "region": ("regional_name", "region"),
        "time_band": ("time_band", "timeband"),
        "event_category": ("event_category_name", "event_category"),
    }.get(suffix, (suffix,))
    for candidate in candidates:
        if any(candidate in row for row in rows):
            return candidate
    return candidates[0]


def compute_share(rows: list[dict[str, Any]], plan: Any) -> list[dict[str, Any]]:
    metric_col = _metric_column(plan)
    result = [dict(row) for row in rows]
    total = sum(_number(row.get(metric_col)) for row in result)
    for row in result:
        value = _number(row.get(metric_col))
        row["pct_of_total"] = round(value / total * 100, 1) if total else 0
    return result
