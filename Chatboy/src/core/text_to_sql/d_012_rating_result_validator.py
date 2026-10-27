"""Validate schema, numeric values, and availability before computation."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Any, Literal

from src.core.text_to_sql.query_plan import RatingQueryPlan
from src.core.text_to_sql.result_contracts import ResultSchema


@dataclass(frozen=True)
class RatingDataValidation:
    status: Literal["available", "partial", "no_data", "invalid"]
    message: str | None = None
    errors: tuple[str, ...] = ()

    @property
    def is_available(self) -> bool:
        return self.status in {"available", "partial"}


class RatingResultValidator:
    def __init__(self, catalog=None):
        self.catalog = catalog

    def validate(self, plan: RatingQueryPlan, rows: list[dict[str, Any]],
                 schema: ResultSchema | None = None, columns=None) -> RatingDataValidation:
        aliases = tuple(m.alias or m.id.rsplit(".", 1)[-1] for m in plan.metrics)
        errors = []
        required = tuple(c.alias for c in schema.columns) if schema else aliases
        if columns is not None:
            errors.extend(f"missing_column:{a}" for a in required if a not in columns)
        if errors:
            return RatingDataValidation("invalid", "Kết quả dữ liệu không đúng cấu trúc yêu cầu.", tuple(errors))
        if not rows:
            return RatingDataValidation("no_data", self._no_data_message(plan))
        values = []
        keys = set()
        for row in rows:
            if not isinstance(row, dict):
                errors.append("invalid_row")
                continue
            errors.extend(f"missing_column:{a}" for a in required if a not in row)
            for alias in aliases:
                if alias not in row:
                    continue
                value = row[alias]
                values.append(value)
                if value is None:
                    continue
                if isinstance(value, bool) or not isinstance(value, (int, float, Decimal)):
                    errors.append(f"invalid_numeric_type:{alias}")
                else:
                    try:
                        if not Decimal(str(value)).is_finite():
                            errors.append(f"non_finite:{alias}")
                    except InvalidOperation:
                        errors.append(f"invalid_number:{alias}")
            if schema:
                for column in schema.columns:
                    value = row.get(column.alias)
                    if column.data_type == "date" and value is not None:
                        try:
                            day = date.fromisoformat(str(value)[:10])
                            if not date.fromisoformat(plan.time_range.start) <= day < date.fromisoformat(plan.time_range.end):
                                errors.append(f"date_outside_period:{column.alias}")
                        except (TypeError, ValueError):
                            errors.append(f"invalid_date:{column.alias}")
                    if column.data_type == "string" and value is not None and not isinstance(value, str):
                        errors.append(f"invalid_string:{column.alias}")
            elif self.catalog:
                for dimension_id in plan.dimensions:
                    dim = self.catalog.get_dimension(dimension_id)
                    if plan.comparison_spec and dim.semantic_type == "time":
                        continue
                    if not any(a in row for a in (dim.column, dimension_id.rsplit(".", 1)[-1])):
                        errors.append(f"missing_dimension:{dimension_id}")
            if self.catalog:
                key = []
                for dimension_id in plan.dimensions:
                    dim = self.catalog.get_dimension(dimension_id)
                    if plan.comparison_spec and dim.semantic_type == "time":
                        continue
                    alias = dimension_id.rsplit(".", 1)[-1]
                    key.append(str(row.get(alias, row.get(dim.column))))
                if plan.comparison_spec:
                    key.append(str(row.get("__period_id", row.get("date", "query_period"))))
                key = tuple(key)
                if key in keys:
                    errors.append("duplicate_group")
                keys.add(key)
                for predicate in plan.filters:
                    if predicate.field not in plan.dimensions:
                        continue
                    dim = self.catalog.get_dimension(predicate.field)
                    value = row.get(predicate.field.rsplit(".", 1)[-1], row.get(dim.column))
                    allowed = predicate.value if isinstance(predicate.value, tuple) else (predicate.value,)
                    if value is not None and value not in allowed:
                        errors.append(f"group_outside_filter:{predicate.field}")
        if errors:
            return RatingDataValidation("invalid", "Kết quả dữ liệu không đúng cấu trúc yêu cầu.", tuple(dict.fromkeys(errors)))
        if values and all(v is None for v in values):
            return RatingDataValidation("no_data", self._no_data_message(plan))
        return RatingDataValidation("partial" if any(v is None for v in values) else "available")

    @staticmethod
    def _no_data_message(plan: RatingQueryPlan) -> str:
        start = date.fromisoformat(plan.time_range.start)
        end = date.fromisoformat(plan.time_range.end) - timedelta(days=1)
        if start == end:
            return f"Chưa có dữ liệu của ngày {start.isoformat()}"
        return f"Chưa có dữ liệu từ ngày {start.isoformat()} đến ngày {end.isoformat()}"
