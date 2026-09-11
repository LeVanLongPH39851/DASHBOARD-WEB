"""Aggregate strategy for Channel metrics using module-owned metadata."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.query_plan import RatingQueryPlan
from src.core.text_to_sql.recipes.weighted_channel import WeightedChannelRecipe


class ChannelFactBuilder(WeightedChannelRecipe):
    """Reuse the weighted SQL kernel with Channel fact contracts."""

    def _measure_aggregations(self, metric: Any, helpers: Any) -> dict[str, str]:
        recipe = helpers.catalog.require_recipe(metric.recipe)
        return {
            measure_id: (
                f"{measure.expression} AS {helpers._identifier(measure.output_alias)}"
            )
            for measure_id, measure in recipe.measures.items()
        }

    @staticmethod
    def _measure_names(required_measures: tuple[str, ...]) -> tuple[str, ...]:
        # Preserve the stable channel fact shape used by the existing recipe.
        return tuple(dict.fromkeys(("distinct_user_by_day", *required_measures)))

    def _fixed_fact_predicates(
        self,
        plan: RatingQueryPlan,
        table: Any,
        parameters: dict[str, str],
        helpers: Any,
    ) -> tuple[str, ...]:
        metric = helpers.catalog.require_metric(plan.primary_metric.id)
        recipe = helpers.catalog.require_recipe(metric.recipe)
        if not recipe.fact_contract:
            raise ValueError(f"channel_metric_has_no_fact_contract:{recipe.id}")
        contract = helpers.catalog.require_fact_contract(recipe.fact_contract)
        if contract.table_id != table.id:
            raise ValueError(
                f"channel_metric_fact_contract_mismatch:{contract.id}:{table.id}"
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
                    f"channel_metric_fact_predicate_has_no_value:{definition.parameter_prefix}"
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
                    f"unsupported_channel_metric_fact_predicate:{definition.operator}"
                )
        return tuple(predicates)


__all__ = ("ChannelFactBuilder",)
