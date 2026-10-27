"""Built-in post-processing plugins referenced by Rating pattern metadata."""

from __future__ import annotations

from typing import Any
from decimal import Decimal, InvalidOperation
from datetime import date, timedelta
from .planning_contracts import InvalidResultError


def _metric_column(plan: Any) -> str:
    metric = plan.primary_metric
    return metric.alias or metric.id.rsplit(".", 1)[-1]


def _number(value: Any) -> Decimal:
    number = _optional_number(value)
    if number is None:
        raise InvalidResultError("numeric_value_unavailable")
    return number


def _optional_number(value: Any) -> Decimal | None:
    if value is None or isinstance(value, bool):
        return None
    try:
        number = Decimal(str(value))
        return number if number.is_finite() else None
    except (InvalidOperation, ValueError, TypeError):
        return None


def _restore_number(value: Decimal, original: Any) -> Any:
    return int(value) if isinstance(original, int) and not isinstance(original, bool) and value == value.to_integral_value() else value


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
        "delta_pct": None if first_value == 0 else delta / first_value * 100,
        "status": "available",
    }


def _order_direction(plan: Any, field: str, default: str) -> str:
    for item in getattr(plan, "order_by", ()):
        if item.field == field:
            return item.direction
    return default


def compute_period_comparison(rows: list[dict[str, Any]], plan: Any) -> dict[str, Any]:
    spec = getattr(plan, "comparison_spec", None)
    if spec is None:
        return {"rows": rows, "error": "missing_comparison_spec"}
    group_dimensions = tuple(d for d in plan.dimensions if d.rsplit(".", 1)[-1] not in {"date", "date_ott"})
    groups = {}
    for row in rows:
        period_id = row.get("__period_id")
        if period_id is None:
            # Compatibility with already aggregated fixture rows; match exact keys.
            period_id = next((p.id for p in spec.periods if str(row.get("date", ""))[:10] == p.time_range.start), None)
        if period_id not in {"a", "b"}:
            continue
        key = tuple(row.get(_dimension_column(d, rows)) for d in group_dimensions)
        periods = groups.setdefault(key, {})
        if period_id in periods:
            return {"rows": rows, "error": "duplicate_comparison_group"}
        periods[period_id] = dict(row)
    comparisons = []
    for key, periods in groups.items():
        first, second = periods.get("a", {}), periods.get("b", {})
        for metric in plan.metrics:
            alias = metric.alias or metric.id.rsplit(".", 1)[-1]
            item = _metric_comparison(metric, first.get(alias), second.get(alias))
            item["group"] = dict(zip(group_dimensions, key))
            comparisons.append(item)
    return {
        "period_a": {"date": spec.baseline.time_range.start, "end": spec.baseline.time_range.end},
        "period_b": {"date": spec.target.time_range.start, "end": spec.target.time_range.end},
        "comparisons": comparisons,
        **({"error": "insufficient_data"} if not comparisons or all(c["status"] != "available" for c in comparisons) else {}),
    }


def compute_dimension_comparison(rows: list[dict[str, Any]], plan: Any) -> dict[str, Any]:
    """Keep the requested baseline even when it is absent; compare within each group."""
    if not plan.dimensions:
        return {"rows": rows, "error": "missing_comparison_dimension"}
    predicate = next((f for f in plan.filters if f.field in plan.dimensions and isinstance(f.value, tuple) and len(f.value) >= 2), None)
    dimension_id = predicate.field if predicate else plan.dimensions[0]
    dimension_alias = _dimension_column(dimension_id, rows)
    if any(dimension_alias not in row for row in rows):
        return {"rows": rows, "error": "missing_comparison_dimension"}
    other_dimensions = tuple(d for d in plan.dimensions if d != dimension_id)
    grouped = {}
    for row in rows:
        key = tuple(row.get(_dimension_column(d, rows)) for d in other_dimensions)
        group = grouped.setdefault(key, {})
        name = str(row[dimension_alias])
        if name in group:
            return {"rows": rows, "error": "duplicate_comparison_group"}
        group[name] = row
    comparisons, baselines, targets = [], [], []
    for key, values in grouped.items():
        requested = tuple(str(v) for v in predicate.value) if predicate else tuple(sorted(values))
        if len(requested) < 2:
            continue
        baseline_name = requested[0]
        baseline = values.get(baseline_name, {dimension_alias: baseline_name})
        baselines.append(baseline)
        for target_name in requested[1:]:
            target = values.get(target_name, {dimension_alias: target_name})
            targets.append(target)
            for metric in plan.metrics:
                alias = metric.alias or metric.id.rsplit(".", 1)[-1]
                item = _metric_comparison(metric, baseline.get(alias), target.get(alias))
                item.update(group_a=baseline_name, group_b=target_name, group=dict(zip(other_dimensions,key)))
                comparisons.append(item)
    return {"dimension_id": dimension_id, "dimension_alias": dimension_alias,
            "baseline": baselines[0] if baselines else None, "targets": targets, "comparisons": comparisons,
            **({"error": "insufficient_data"} if not comparisons else {})}


def compute_rank_comparison(rows: list[dict[str, Any]], plan: Any) -> list[dict[str, Any]]:
    metric_col = _metric_column(plan)
    result = [dict(row) for row in rows]
    direction = _order_direction(plan, plan.primary_metric.id, "desc")
    available = [row for row in result if row.get(metric_col) is not None]
    missing = [row for row in result if row.get(metric_col) is None]
    available.sort(key=lambda row: _number(row[metric_col]), reverse=direction == "desc")
    result = available + missing
    total = sum(_number(row[metric_col]) for row in available) if not missing else None
    leader = _optional_number(result[0].get(metric_col)) if result else None
    for index, row in enumerate(result, start=1):
        value = _optional_number(row.get(metric_col))
        row["rank"] = index if value is not None else None
        row["pct_of_total"] = value / total * 100 if total and value is not None else None
        row["gap_vs_leader_pct"] = abs(leader - value) / abs(leader) * 100 if leader and value is not None else None
        row["share_scope"] = "top_n"
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
            reverse=False,
        )
        previous: Decimal | None = None
        previous_day = None
        for row in grouped_rows:
            current = _optional_number(row.get(metric_col))
            current_day = date.fromisoformat(str(row[time_column])[:10])
            consecutive = False
            if previous_day is not None:
                grain = plan.time_range.grain
                if grain == "month":
                    month_index = previous_day.year * 12 + previous_day.month
                    expected_day = date(month_index // 12, month_index % 12 + 1, 1)
                else:
                    expected_day = previous_day + timedelta(days=7 if grain == "week" else 1)
                consecutive = current_day == expected_day
            row["mom_change_pct"] = (
                None
                if current is None or previous is None or previous == 0 or not consecutive
                else (current - previous) / previous * 100
            )
            previous = current
            previous_day = current_day
    if not group_dimensions:
        ordered = next(iter(groups.values()), result)
        if _order_direction(plan, time_dimension or "date", "asc") == "desc":
            ordered.reverse()
        return ordered
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
        "category_level1": ("category_level1", "firstlevel_vn"),
        "category_name": ("category_name", "name_vn"),
        "province": ("province", "province_name"),
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
    values = [_optional_number(row.get(metric_col)) for row in result]
    total = sum(values) if all(v is not None for v in values) else None
    for row, value in zip(result, values):
        row["pct_of_total"] = value / total * 100 if total and value is not None else None
    return result
