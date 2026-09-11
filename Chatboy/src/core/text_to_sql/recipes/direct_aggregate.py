"""Single-source aggregate SQL recipe."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.query_plan import RatingQueryPlan


class DirectAggregateRecipe:
    """Render the original one-table aggregate shape."""

    def render(self, plan: RatingQueryPlan, table: Any, metric: Any, helpers: Any):
        select_parts: list[str] = []
        group_by: list[str] = []
        selected_columns: list[str] = []
        aliases: dict[str, str] = {}
        for dimension_id in plan.dimensions:
            dimension = helpers._dimension(dimension_id, table.id)
            alias = helpers._alias(dimension_id)
            column = helpers._identifier(dimension.column)
            expression = (
                helpers._time_bucket(column, plan.time_range.grain)
                if dimension.semantic_type == "time"
                else column
            )
            select_parts.append(f"{expression} AS {alias}")
            group_by.append(expression)
            selected_columns.append(alias)
            aliases[dimension_id] = alias

        metrics = tuple(
            helpers.catalog.metrics[item.id]
            for item in plan.metrics
        )
        for item in metrics:
            metric_alias = helpers._identifier(item.output_alias)
            select_parts.append(f"{item.expression} AS {metric_alias}")
            selected_columns.append(metric_alias)
            aliases[item.id] = metric_alias
        aliases[metric.id] = metric_alias

        date_dimension = helpers.catalog.date_dimension_for(table.id)
        if not date_dimension:
            raise ValueError(f"missing_time_dimension:{table.id}")
        where_parts = [
            f"{helpers._identifier(date_dimension.column)} >= :time_start",
            f"{helpers._identifier(date_dimension.column)} < :time_end",
        ]
        parameters = {"time_start": plan.time_range.start, "time_end": plan.time_range.end}
        for index, predicate in enumerate(plan.filters):
            where_parts.append(helpers._filter(predicate, table.id, index, parameters))

        sql = [
            "SELECT",
            "  " + ",\n  ".join(select_parts),
            f"FROM {helpers._qualified_identifier(table.physical_name)}",
            "WHERE " + "\n  AND ".join(where_parts),
        ]
        if group_by:
            sql.append("GROUP BY " + ", ".join(group_by))
        if plan.order_by:
            clauses = []
            for item in plan.order_by:
                if item.field not in aliases:
                    raise ValueError(f"order_field_not_selected:{item.field}")
                clauses.append(f"{aliases[item.field]} {item.direction.upper()}")
            sql.append("ORDER BY " + ", ".join(clauses))
        if plan.limit is not None:
            sql.append(f"LIMIT {plan.limit}")
        return helpers._generated_batch("primary", "\n".join(sql), parameters, tuple(selected_columns))
