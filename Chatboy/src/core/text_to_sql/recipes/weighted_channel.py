"""Shared recipe for weighted channel audience calculations.

The recipe owns the common fact/weight/population/coef shape.  Metric-specific
math is selected from the closed ``calculation`` enum in metrics_v3.yaml; no SQL
expression is accepted from the question or from the LLM.
"""

from __future__ import annotations

from datetime import date, timedelta
import re
from typing import Any

from src.core.text_to_sql.query_plan import RatingQueryPlan


class WeightedChannelRecipe:
    """Render weighted channel metrics from one approved CTE/JOIN skeleton."""

    _SUPPORTED_MEASURES = frozenset(("duration_view", "distinct_user_by_day"))
    _CTE_NAMES = {
        "weight": "dim_weight",
        "population": "dim_population",
        "coef": "dim_coef",
    }

    _SCOPE_DIMENSIONS = {
        "province": "province",
        "key_city": "province",
        "region": "regional",
    }
    _EXTRA_FACT_GRAIN: tuple[str, ...] = ()

    @classmethod
    def validate_definition(cls, recipe: Any) -> None:
        """Fail startup when YAML requests a measure this handler cannot build."""
        unknown = {
            measure
            for calculation in recipe.calculations.values()
            for measure in calculation.required_measures
            if measure not in cls._SUPPORTED_MEASURES
        }
        if unknown:
            raise ValueError(f"unsupported_measures:{','.join(sorted(unknown))}")

    def _measure_aggregations(
        self,
        metric: Any,
        helpers: Any,
    ) -> dict[str, str]:
        """Render the module-owned measure definitions in the fact CTE."""
        recipe = helpers.catalog.require_recipe(metric.recipe)
        return {
            measure_id: (
                f"{measure.expression} AS {helpers._identifier(measure.output_alias)}"
            )
            for measure_id, measure in recipe.measures.items()
        }

    def _extra_fact_grain(
        self,
        metric: Any,
        helpers: Any,
    ) -> tuple[str, ...]:
        return self._EXTRA_FACT_GRAIN

    @staticmethod
    def _measure_names(required_measures: tuple[str, ...]) -> tuple[str, ...]:
        """Channel giữ bitmap measure để bảo toàn CTE shape lịch sử."""
        return tuple(dict.fromkeys(("distinct_user_by_day", *required_measures)))

    def render(self, plan: RatingQueryPlan, table: Any, metric: Any, helpers: Any):
        metrics = tuple(helpers.catalog.metrics[item.id] for item in plan.metrics)
        measure_aggregations = self._measure_aggregations(metric, helpers)
        extra_fact_grain = self._extra_fact_grain(metric, helpers)
        has_non_time = self._has_non_time_context(plan, helpers)
        metric_expressions = {
            item.id: self._metric_expression(item, helpers, plan)
            for item in metrics
        }
        all_expressions_text = " ".join(metric_expressions.values())

        required_joins = tuple(
            dict.fromkeys(
                join_name
                for item in metrics
                for join_name in item.required_joins
                if join_name != "coef" or "dim_coef" in all_expressions_text
            )
        )
        required_measures = tuple(
            dict.fromkeys(measure for item in metrics for measure in item.required_measures)
        )
        scope = self._scope(plan)
        channel_join = self._channel_join_required(plan)
        profile_id = f"{scope}_{'channel' if channel_join else 'total'}_weight"
        profile = None
        for candidate_id in (
            f"{table.id}_{profile_id}",
            profile_id,
            metric.join_profile,
        ):
            candidate = helpers.catalog.join_profile_for(candidate_id)
            if candidate is not None and candidate.fact_table_id == table.id:
                profile = candidate
                break
        if profile is None:
            raise ValueError(f"invalid_weighted_join_profile:{table.id}:{profile_id}")
        joins = {item.name: item for item in profile.joins}
        missing = [name for name in required_joins if name not in joins]
        if missing:
            raise ValueError(f"missing_weighted_join:{','.join(missing)}")
        if not required_measures:
            raise ValueError(f"weighted_measure_contract_invalid:{metric.id}")
        unknown_measures = [item for item in required_measures if item not in measure_aggregations]
        if unknown_measures:
            raise ValueError(f"unsupported_weighted_measure:{','.join(unknown_measures)}")

        fact_date = helpers.catalog.date_dimension_for(table.id)
        if fact_date is None:
            raise ValueError(f"missing_time_dimension:{table.id}")

        parameters = self._time_parameters(plan)
        output_dimensions: list[tuple[str, str, str]] = []
        fact_select: list[str] = [f"{helpers._identifier(fact_date.column)} AS date"]
        fact_group: list[str] = [helpers._identifier(fact_date.column)]
        fact_column_aliases: dict[str, str] = {fact_date.column: "date"}
        selected_columns: list[str] = []

        for dimension_id in plan.dimensions:
            dimension = helpers._dimension(dimension_id, table.id)
            column = helpers._identifier(dimension.column)
            # Weighted dashboard SQL exposes physical grain names in its
            # result contract (channel_name_tvd, event_category_name, ...).
            alias = column
            output_dimensions.append((dimension_id, column, alias))
            if column != fact_date.column:
                fact_select.append(f"{column} AS {alias}")
                fact_group.append(column)
            fact_column_aliases[column] = alias
            selected_columns.append(alias)

        # Some fact tables require a hidden inner grain even when those fields
        # are not requested as output dimensions.
        for fact_column in extra_fact_grain:
            if fact_column in fact_column_aliases:
                continue
            safe_column = helpers._identifier(fact_column)
            helpers._column_in_table(safe_column, table.id)
            fact_select.append(f"{safe_column} AS {safe_column}")
            fact_group.append(safe_column)
            fact_column_aliases[fact_column] = safe_column

        # JOIN keys must be present in the fact CTE even when a caller builds a
        # lower-level plan without selecting the corresponding dimension.
        for join_name in required_joins:
            for fact_column, _dependency_column in joins[join_name].join_on:
                if fact_column in fact_column_aliases:
                    continue
                safe_column = helpers._identifier(fact_column)
                fact_select.append(f"{safe_column} AS {safe_column}")
                fact_group.append(safe_column)
                fact_column_aliases[fact_column] = safe_column

        # Keep one stable fact CTE shape for every channel calculation.  Reach
        # recipes need the bitmap measure; rating recipes may leave it unused,
        # but sharing the same grain makes recipe output predictable.
        measure_names = self._measure_names(required_measures)
        fact_select.extend(measure_aggregations[item] for item in measure_names)
        fact_where = [
            f"{helpers._identifier(fact_date.column)} BETWEEN :time_start AND :time_end",
        ]
        fact_where.extend(self._fixed_fact_predicates(plan, table, parameters, helpers))
        for index, predicate in enumerate(plan.filters):
            fact_where.append(helpers._filter(predicate, table.id, index, parameters))

        fact_cte = [
            "rating_ott AS (",
            "  SELECT",
            "    " + ",\n    ".join(fact_select),
            f"  FROM {helpers._qualified_identifier(table.physical_name)}",
            "  WHERE " + "\n    AND ".join(fact_where),
            "  GROUP BY " + ", ".join(fact_group),
            ")",
        ]

        ctes = ["\n".join(fact_cte)]
        join_sql: list[str] = []
        for join_name in required_joins:
            dependency = joins[join_name]
            dependency_table = helpers.catalog.tables[dependency.table_id]
            cte_name = self._CTE_NAMES.get(dependency.name, f"dim_{dependency.name}")
            select_columns = ", ".join(helpers._identifier(column) for column in dependency.columns)
            dependency_date = next(
                (
                    dependency_column
                    for fact_column, dependency_column in dependency.join_on
                    if fact_column == fact_date.column
                ),
                None,
            )
            where = (
                [f"{helpers._identifier(dependency_date)} BETWEEN :time_start AND :time_end"]
                if dependency_date
                else []
            )
            for filter_index, (column, value) in enumerate(dependency.filters):
                name = f"{join_name}_filter_{filter_index}"
                parameters[name] = value
                where.append(f"{helpers._identifier(column)} = :{name}")
            self._append_dynamic_scope_filters(
                dependency.name,
                scope,
                channel_join,
                self._filter_values(plan, "channel"),
                self._filter_values(plan, "province"),
                self._filter_values(plan, "region"),
                where,
                parameters,
                helpers,
            )
            dependency_sql = [
                f"{cte_name} AS (",
                f"  SELECT {select_columns}",
                f"  FROM {helpers._qualified_identifier(dependency_table.physical_name)}",
            ]
            if where:
                dependency_sql.append("  WHERE " + "\n    AND ".join(where))
            dependency_sql.append(")")
            ctes.append("\n".join(dependency_sql))
            if dependency.scalar:
                join_sql.append(f"JOIN {cte_name} ON 1 = 1")
            else:
                conditions = [
                    f"rating_ott.{fact_column_aliases[helpers._identifier(fact_column)]} = "
                    f"{cte_name}.{helpers._identifier(dependency_column)}"
                    for fact_column, dependency_column in dependency.join_on
                ]
                join_sql.append(f"JOIN {cte_name} ON " + " AND ".join(conditions))

        select_parts: list[str] = []
        group_by: list[str] = []
        aliases: dict[str, str] = {}
        for dimension_id, column, alias in output_dimensions:
            if dimension_id == fact_date.id:
                time_bucket = helpers._time_bucket("rating_ott.date", plan.time_range.grain)
                select_parts.append(f"{time_bucket} AS {alias}")
                group_by.append(time_bucket)
            else:
                select_parts.append(f"rating_ott.{alias} AS {alias}")
                group_by.append(f"rating_ott.{alias}")
            aliases[dimension_id] = alias

        metric_aliases: dict[str, str] = {}
        for item in metrics:
            expression = metric_expressions[item.id]
            metric_alias = helpers._identifier(item.output_alias)
            select_parts.append(f"{expression} AS {metric_alias}")
            selected_columns.append(metric_alias)
            metric_aliases[item.id] = metric_alias
            aliases[item.id] = metric_alias

        sql = [
            "WITH " + ",\n".join(ctes),
            "SELECT",
            "  " + ",\n  ".join(select_parts),
            "FROM rating_ott",
            *join_sql,
        ]
        if group_by:
            sql.append("GROUP BY " + ", ".join(group_by))
        if plan.order_by:
            clauses = []
            for item in plan.order_by:
                if item.field in aliases:
                    clauses.append(f"{aliases[item.field]} {item.direction.upper()}")
                elif item.field in metric_aliases:
                    clauses.append(f"{metric_aliases[item.field]} {item.direction.upper()}")
                else:
                    raise ValueError(f"order_field_not_selected:{item.field}")
            sql.append("ORDER BY " + ", ".join(clauses))
        limit = plan.limit if plan.limit is not None else int(helpers.catalog.constant("weighted_default_limit", 50000))
        if limit <= 0:
            raise ValueError("invalid_weighted_limit")
        sql.append(f"LIMIT {limit}")
        return helpers._generated_batch("primary", "\n".join(sql), parameters, tuple(selected_columns))

    def _scope(self, plan: RatingQueryPlan) -> str:
        fields = [item.field.rsplit(".", 1)[-1] for item in plan.filters]
        fields.extend(item.rsplit(".", 1)[-1] for item in plan.dimensions)
        if any(self._SCOPE_DIMENSIONS.get(field) == "province" for field in fields):
            return "province"
        if any(self._SCOPE_DIMENSIONS.get(field) == "regional" for field in fields):
            return "regional"
        return "national"

    def _fixed_fact_predicates(
        self,
        plan: RatingQueryPlan,
        table: Any,
        parameters: dict[str, str],
        helpers: Any,
    ) -> tuple[str, ...]:
        """Apply fact-contract predicates whose dimensions are in the plan."""
        metric = helpers.catalog.require_metric(plan.primary_metric.id)
        recipe = helpers.catalog.require_recipe(metric.recipe)
        if not recipe.fact_contract:
            return ()
        contract = helpers.catalog.require_fact_contract(recipe.fact_contract)
        if contract.table_id != table.id:
            raise ValueError(
                f"weighted_fact_contract_table_mismatch:{contract.id}:{table.id}"
            )
        requested_dimensions = {
            *plan.dimensions,
            *(item.field for item in plan.filters),
        }
        predicates: list[str] = []
        for definition in contract.predicates:
            if definition.when_dimensions and not (
                set(definition.when_dimensions) & requested_dimensions
            ):
                continue
            column = helpers._identifier(definition.column)
            if definition.operator == "is_not_null":
                predicates.append(f"{column} IS NOT NULL")
                continue
            if not definition.values:
                raise ValueError(
                    f"weighted_fact_predicate_has_no_value:{definition.parameter_prefix}"
                )
            names: list[str] = []
            for index, value in enumerate(definition.values):
                name = (
                    definition.parameter_prefix
                    if len(definition.values) == 1
                    else f"{definition.parameter_prefix}_{index}"
                )
                parameters[name] = value
                names.append(f":{name}")
            if definition.operator in {"in", "not_in"}:
                keyword = "IN" if definition.operator == "in" else "NOT IN"
                predicates.append(f"{column} {keyword} (" + ", ".join(names) + ")")
            elif definition.operator in {"eq", "ne"} and len(names) == 1:
                operator = "=" if definition.operator == "eq" else "<>"
                predicates.append(f"{column} {operator} {names[0]}")
            else:
                raise ValueError(
                    f"unsupported_weighted_fact_predicate:{definition.operator}"
                )
        return tuple(predicates)

    @staticmethod
    def _channel_join_required(plan: RatingQueryPlan) -> bool:
        fields = [item.field.rsplit(".", 1)[-1] for item in plan.filters]
        fields.extend(item.rsplit(".", 1)[-1] for item in plan.dimensions)
        if "channel" in fields:
            return True
        return plan.channel_weight_scope == "active_channels"

    @staticmethod
    def _filter_values(plan: RatingQueryPlan, field_suffix: str) -> tuple[str, ...]:
        values: list[str] = []
        for item in plan.filters:
            if item.field.rsplit(".", 1)[-1] != field_suffix:
                continue
            if item.operator == "eq":
                values.append(str(item.value))
            elif item.operator == "in" and isinstance(item.value, tuple):
                values.extend(str(value) for value in item.value)
        return tuple(dict.fromkeys(values))

    def _append_dynamic_scope_filters(
        self,
        dependency_name: str,
        scope: str,
        channel_join: bool,
        channel_values: tuple[str, ...],
        province_values: tuple[str, ...],
        region_values: tuple[str, ...],
        where: list[str],
        parameters: dict[str, str],
        helpers: Any,
    ) -> None:
        """Bind question-derived scope values without embedding Jinja/SQL."""
        if dependency_name not in {"weight", "population"}:
            return

        if dependency_name == "weight":
            if scope == "national":
                self._append_eq(where, parameters, "weight_scope", "province", "Toàn quốc", helpers)
            elif province_values:
                self._append_in(where, parameters, "weight_province", "province", province_values, helpers)
            elif region_values:
                self._append_in(where, parameters, "weight_region", "province", region_values, helpers)
            else:
                self._append_ne(where, parameters, "weight_scope", "province", "Toàn quốc", helpers)

            if channel_join and channel_values:
                self._append_in(where, parameters, "weight_channel", "channel_name_tvd", channel_values, helpers)
            elif not channel_join:
                self._append_eq(where, parameters, "weight_channel", "channel_name_tvd", "Total", helpers)
        elif scope == "national":
            self._append_eq(where, parameters, "population_scope", "province", "Toàn quốc", helpers)
        elif province_values:
            self._append_in(where, parameters, "population_province", "province", province_values, helpers)
        elif region_values:
            self._append_in(where, parameters, "population_region", "province", region_values, helpers)
        else:
            self._append_ne(where, parameters, "population_scope", "province", "Toàn quốc", helpers)

    @staticmethod
    def _append_eq(where, parameters, prefix, column, value, helpers):
        name = f"{prefix}_eq"
        parameters[name] = value
        where.append(f"{helpers._identifier(column)} = :{name}")

    @staticmethod
    def _append_ne(where, parameters, prefix, column, value, helpers):
        name = f"{prefix}_ne"
        parameters[name] = value
        where.append(f"{helpers._identifier(column)} <> :{name}")

    @staticmethod
    def _append_in(where, parameters, prefix, column, values, helpers):
        names = []
        for index, value in enumerate(values):
            name = f"{prefix}_{index}"
            parameters[name] = value
            names.append(f":{name}")
        where.append(f"{helpers._identifier(column)} IN (" + ", ".join(names) + ")")

    @staticmethod
    def _time_parameters(plan: RatingQueryPlan) -> dict[str, str]:
        """Convert the plan's half-open range to inclusive BETWEEN bounds."""
        start = date.fromisoformat(plan.time_range.start)
        exclusive_end = date.fromisoformat(plan.time_range.end)
        end = exclusive_end - timedelta(days=1)
        return {
            "time_start": f"{start.isoformat()}T00:00:00",
            "time_end": f"{end.isoformat()}T23:59:59",
        }

    @classmethod
    def _has_non_time_context(cls, plan: RatingQueryPlan, helpers: Any) -> bool:
        """Check if plan contains non-time dimensions or non-time filters."""
        for dim_id in plan.dimensions:
            dimension = helpers.catalog.get_dimension(dim_id)
            if dimension is None or dimension.semantic_type != "time":
                return True
        for filter_pred in plan.filters:
            dimension = helpers.catalog.get_dimension(filter_pred.field)
            if dimension is None or dimension.semantic_type != "time":
                return True
        return False

    @classmethod
    def _metric_expression(
        cls,
        metric: Any,
        helpers: Any,
        plan: RatingQueryPlan | None = None,
    ) -> str:
        """Resolve one startup-validated formula from recipe metadata."""
        try:
            expression = helpers.catalog.render_calculation(metric)
            if plan is not None and not cls._has_non_time_context(plan, helpers):
                # Type 1: date only query (no extra dimensions/filters) -> do not multiply user_coef
                expression = re.sub(r"\s*\*\s*dim_coef\.user_coef\b", "", expression)
            return expression
        except (KeyError, ValueError) as exc:
            raise ValueError(f"unsupported_weighted_calculation:{metric.calculation}") from exc
