"""Internal scoped-denominator strategy for Program Dashboard airtime metrics.

The catalog registers ``ProgramMetricRecipe``. This class remains an internal
renderer because category-share SQL needs filter placement that differs from
the aggregate strategy.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from src.core.text_to_sql.query_plan import Filter, RatingQueryPlan


class ProgramAirtimeRecipe:
    """Deduplicate EPG events before computing airtime and category shares."""

    _CATEGORY_DIMENSION = "agg_info_program.category_level1"
    _CATEGORY_COLUMN = "firstlevel_vn"
    _CALCULATIONS = {
        "airtime_duration",
        "airtime_share_all_categories_percent",
        "airtime_share_selected_categories_percent",
        "view_duration",
        "view_duration_share_all_categories_percent",
        "view_duration_share_selected_categories_percent",
    }
    _EPG_GRAIN = (
        ("date", "date"),
        ("channel_name_tvd", "channel_name_tvd"),
        ("program_name", "program_name"),
        ("start_time", "LEFT(start_time, 5)"),
        ("end_time", "LEFT(end_time, 5)"),
        ("epg_id_hash", "epg_id_hash"),
    )

    @classmethod
    def validate_definition(cls, recipe: Any) -> None:
        unknown = set(recipe.calculations) - cls._CALCULATIONS
        if unknown:
            raise ValueError(f"unsupported_calculations:{','.join(sorted(unknown))}")
        invalid_measures = {
            measure
            for calculation in recipe.calculations.values()
            for measure in calculation.required_measures
            if measure not in {"event_duration", "duration_view"}
        }
        if invalid_measures:
            raise ValueError(f"unsupported_measures:{','.join(sorted(invalid_measures))}")
        if any(calculation.required_joins for calculation in recipe.calculations.values()):
            raise ValueError("program_airtime_must_not_require_joins")

    def render(self, plan: RatingQueryPlan, table: Any, metric: Any, helpers: Any):
        if table.fact_family != "program":
            raise ValueError(f"program_airtime_requires_program_fact:{table.id}")
        if len(plan.metrics) != 1:
            raise ValueError("program_airtime_requires_single_metric")
        if metric.calculation not in self._CALCULATIONS:
            raise ValueError(f"unsupported_program_airtime_calculation:{metric.calculation}")
        if metric.denominator_scope != plan.denominator_scope:
            raise ValueError(
                f"airtime_denominator_scope_mismatch:{metric.id}:{plan.denominator_scope}"
            )

        is_share = plan.denominator_scope != "none"
        is_view_duration = metric.calculation.startswith("view_duration")
        grouped_cte_name = "view_grouped" if is_view_duration else "airtime_grouped"
        total_cte_name = "view_total" if is_view_duration else "airtime_total"
        fact_measure_col = "duration_view" if is_view_duration else "event_duration"
        grouped_measure_col = "view_duration" if is_view_duration else "airtime_duration"
        total_measure_col = "total_view_duration" if is_view_duration else "total_airtime_duration"

        category_filters = tuple(
            item for item in plan.filters if item.field == self._CATEGORY_DIMENSION
        )
        has_category_dimension = self._CATEGORY_DIMENSION in plan.dimensions
        if is_share and not (has_category_dimension or category_filters):
            raise ValueError("airtime_share_requires_category_context")
        if plan.denominator_scope == "selected_categories":
            selected_values = self._filter_values(category_filters)
            if len(selected_values) < 2:
                raise ValueError("selected_category_share_requires_multiple_categories")

        parameters = self._time_parameters(plan)
        event_select: list[str] = []
        event_group: list[str] = []
        selected_event_aliases: set[str] = set()

        def add_event_field(alias: str, expression: str) -> None:
            if alias in selected_event_aliases:
                return
            event_select.append(f"{expression} AS {alias}")
            event_group.append(expression)
            selected_event_aliases.add(alias)

        for alias, expression in self._EPG_GRAIN:
            helpers._column_in_table(alias, table.id)
            add_event_field(helpers._identifier(alias), expression)

        requested_dimension_ids = tuple(
            dict.fromkeys((*plan.dimensions, *(item.field for item in plan.filters)))
        )
        if is_share and self._CATEGORY_DIMENSION not in requested_dimension_ids:
            requested_dimension_ids = (*requested_dimension_ids, self._CATEGORY_DIMENSION)
        for dimension_id in requested_dimension_ids:
            dimension = helpers._dimension(dimension_id, table.id)
            column = helpers._identifier(dimension.column)
            add_event_field(column, column)

        if is_view_duration:
            event_select.append("SUM(duration_view) AS duration_view")
        else:
            event_select.append("MAX(event_duration) AS event_duration")
        fact_where = ["date BETWEEN :time_start AND :time_end"]
        parameters["program_excluded_category_0"] = "Quảng cáo"
        parameters["program_excluded_category_1"] = "Quảng bá"
        fact_where.append(
            "firstlevel_vn NOT IN "
            "(:program_excluded_category_0, :program_excluded_category_1)"
        )
        requested_suffixes = {
            item.rsplit(".", 1)[-1] for item in requested_dimension_ids
        }
        if requested_suffixes & {"province", "region", "key_city"}:
            parameters["program_unknown_province"] = "Không rõ"
            fact_where.append("province_name <> :program_unknown_province")
        if "key_city" in requested_suffixes:
            fact_where.append("key_city IS NOT NULL")

        deferred_category_filters: list[tuple[int, Filter]] = []
        for index, predicate in enumerate(plan.filters):
            if (
                plan.denominator_scope == "all_categories"
                and predicate.field == self._CATEGORY_DIMENSION
            ):
                deferred_category_filters.append((index, predicate))
                continue
            fact_where.append(helpers._filter(predicate, table.id, index, parameters))

        event_cte = "\n".join(
            (
                "program_events AS (",
                "  SELECT",
                "    " + ",\n    ".join(event_select),
                f"  FROM {helpers._qualified_identifier(table.physical_name)}",
                "  WHERE " + "\n    AND ".join(fact_where),
                "  GROUP BY " + ", ".join(event_group),
                ")",
            )
        )

        output_dimensions: list[tuple[str, str]] = []
        grouped_select: list[str] = []
        grouped_by: list[str] = []
        aliases: dict[str, str] = {}
        for dimension_id in plan.dimensions:
            dimension = helpers._dimension(dimension_id, table.id)
            alias = helpers._identifier(dimension.column)
            expression = f"program_events.{alias}"
            if dimension.semantic_type == "time":
                expression = helpers._time_bucket(expression, plan.time_range.grain)
            grouped_select.append(f"{expression} AS {alias}")
            grouped_by.append(expression)
            output_dimensions.append((dimension_id, alias))
            aliases[dimension_id] = alias

        if is_share and not has_category_dimension:
            grouped_select.append(
                f"program_events.{self._CATEGORY_COLUMN} AS {self._CATEGORY_COLUMN}"
            )
            grouped_by.append(f"program_events.{self._CATEGORY_COLUMN}")

        grouped_select.append(
            f"SUM(program_events.{fact_measure_col}) AS {grouped_measure_col}"
        )
        grouped_sql = [
            f"{grouped_cte_name} AS (",
            "  SELECT",
            "    " + ",\n    ".join(grouped_select),
            "  FROM program_events",
        ]
        if grouped_by:
            grouped_sql.append("  GROUP BY " + ", ".join(grouped_by))
        grouped_sql.append(")")
        ctes = [event_cte, "\n".join(grouped_sql)]

        metric_alias = helpers._identifier(metric.output_alias)
        selected_columns = [alias for _dimension_id, alias in output_dimensions]
        selected_columns.append(metric_alias)
        select_parts = [
            f"{grouped_cte_name}.{alias} AS {alias}"
            for _dimension_id, alias in output_dimensions
        ]
        final_from = f"FROM {grouped_cte_name}"
        final_where: list[str] = []
        final_group_by: list[str] = []

        if not is_share:
            expression = helpers.catalog.render_calculation(metric)
            select_parts.append(f"{expression} AS {metric_alias}")
            final_group_by = [
                f"{grouped_cte_name}.{alias}" for _dimension_id, alias in output_dimensions
            ]
        else:
            category_alias = self._CATEGORY_COLUMN
            partition_aliases = [
                alias
                for dimension_id, alias in output_dimensions
                if dimension_id != self._CATEGORY_DIMENSION
            ]
            total_select = [
                *(f"{grouped_cte_name}.{alias} AS {alias}" for alias in partition_aliases),
                f"SUM({grouped_cte_name}.{grouped_measure_col}) AS {total_measure_col}",
            ]
            total_sql = [
                f"{total_cte_name} AS (",
                "  SELECT",
                "    " + ",\n    ".join(total_select),
                f"  FROM {grouped_cte_name}",
            ]
            if partition_aliases:
                total_sql.append(
                    "  GROUP BY "
                    + ", ".join(f"{grouped_cte_name}.{alias}" for alias in partition_aliases)
                )
            total_sql.append(")")
            ctes.append("\n".join(total_sql))
            if partition_aliases:
                join_conditions = " AND ".join(
                    f"{grouped_cte_name}.{alias} = {total_cte_name}.{alias}"
                    for alias in partition_aliases
                )
                final_from += f"\nJOIN {total_cte_name} ON " + join_conditions
            else:
                final_from += f"\nJOIN {total_cte_name} ON 1 = 1"
            expression = helpers.catalog.render_calculation(metric)
            select_parts.append(f"{expression} AS {metric_alias}")
            aliases[metric.id] = metric_alias
            for filter_index, predicate in deferred_category_filters:
                final_where.append(
                    self._qualified_filter(
                        predicate,
                        filter_index,
                        category_alias,
                        parameters,
                    )
                )

        aliases[metric.id] = metric_alias
        sql = [
            "WITH " + ",\n".join(ctes),
            "SELECT",
            "  " + ",\n  ".join(select_parts),
            final_from,
        ]
        if final_where:
            sql.append("WHERE " + "\n  AND ".join(final_where))
        if final_group_by:
            sql.append("GROUP BY " + ", ".join(final_group_by))
        if plan.order_by:
            clauses = []
            for item in plan.order_by:
                alias = aliases.get(item.field)
                if not alias:
                    raise ValueError(f"order_field_not_selected:{item.field}")
                clauses.append(f"{alias} {item.direction.upper()}")
            sql.append("ORDER BY " + ", ".join(clauses))
        limit = plan.limit if plan.limit is not None else 50000
        if limit <= 0:
            raise ValueError("invalid_program_airtime_limit")
        sql.append(f"LIMIT {limit}")
        return helpers._generated_batch(
            "primary",
            "\n".join(sql),
            parameters,
            tuple(selected_columns),
        )

    @staticmethod
    def _filter_values(filters: tuple[Filter, ...]) -> tuple[str, ...]:
        values: list[str] = []
        for item in filters:
            if item.operator == "eq":
                values.append(str(item.value))
            elif item.operator == "in" and isinstance(item.value, tuple):
                values.extend(str(value) for value in item.value)
        return tuple(dict.fromkeys(values))

    @staticmethod
    def _qualified_filter(
        predicate: Filter,
        index: int,
        column: str,
        parameters: dict[str, Any],
    ) -> str:
        if predicate.operator == "eq":
            name = f"share_filter_{index}"
            parameters[name] = predicate.value
            return f"airtime_grouped.{column} = :{name}"
        if predicate.operator == "in" and isinstance(predicate.value, tuple):
            names = []
            for value_index, value in enumerate(predicate.value):
                name = f"share_filter_{index}_{value_index}"
                parameters[name] = value
                names.append(f":{name}")
            return f"airtime_grouped.{column} IN (" + ", ".join(names) + ")"
        raise ValueError(f"unsupported_filter_operator:{predicate.operator}")

    @staticmethod
    def _time_parameters(plan: RatingQueryPlan) -> dict[str, str]:
        start = date.fromisoformat(plan.time_range.start)
        exclusive_end = date.fromisoformat(plan.time_range.end)
        end = exclusive_end - timedelta(days=1)
        return {
            "time_start": f"{start.isoformat()}T00:00:00",
            "time_end": f"{end.isoformat()}T23:59:59",
        }
