"""Workflow 007: bind canonical resolved filters into the query plan."""

from __future__ import annotations

from src.core.text_to_sql.query_plan import Filter
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents


class CanonicalFilterBinder:
    """Only values canonicalized against Rating dictionaries become filters."""

    @staticmethod
    def plan_filters(components: ResolvedSQLComponents) -> tuple[Filter, ...]:
        filters: list[Filter] = []
        for item in components.filters:
            if item.operator == "=" and len(item.values) == 1:
                filters.append(Filter(field=item.dimension_id, operator="eq", value=item.values[0]))
            elif item.operator == "IN" and item.values:
                filters.append(Filter(field=item.dimension_id, operator="in", value=item.values))
            else:
                raise ValueError(f"unsupported_resolved_filter:{item.dimension_id}:{item.operator}")
        return tuple(filters)
