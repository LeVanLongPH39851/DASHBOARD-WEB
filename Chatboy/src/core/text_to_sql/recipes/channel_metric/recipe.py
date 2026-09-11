"""Facade selecting Channel SQL capability from calculation metadata."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.channel_metric.fact_builder import ChannelFactBuilder
from src.core.text_to_sql.recipes.channel_metric.requirements import ChannelRequirementCollector
from src.core.text_to_sql.recipes.channel_metric.validator import ChannelMetricValidator


class ChannelMetricRecipe:
    def __init__(self):
        self._requirements = ChannelRequirementCollector()
        self._validator = ChannelMetricValidator()
        self._strategies = {
            "aggregate": ChannelFactBuilder(),
        }

    @staticmethod
    def validate_definition(recipe: Any) -> None:
        if not recipe.fact_contract:
            raise ValueError("channel_metric_fact_contract_required")
        if not recipe.measures:
            raise ValueError("channel_metric_measures_required")
        if not recipe.calculations:
            raise ValueError("channel_metric_calculations_required")
        unknown_measures = {
            measure
            for calculation in recipe.calculations.values()
            for measure in calculation.required_measures
            if measure not in recipe.measures
        }
        if unknown_measures:
            raise ValueError(
                f"channel_metric_unknown_measures:{','.join(sorted(unknown_measures))}"
            )
        unsupported_strategies = {
            calculation.execution_strategy
            for calculation in recipe.calculations.values()
            if calculation.execution_strategy != "aggregate"
        }
        if unsupported_strategies:
            raise ValueError(
                "unsupported_channel_execution_strategy:"
                + ",".join(sorted(unsupported_strategies))
            )

    def render(self, plan: Any, table: Any, metric: Any, helpers: Any):
        metrics = tuple(helpers.catalog.require_metric(item.id) for item in plan.metrics)
        requirements = self._requirements.collect(metrics, helpers.catalog)
        self._validator.validate(plan, table, metrics, requirements, helpers.catalog)
        try:
            strategy = self._strategies[requirements.execution_strategy]
        except KeyError as exc:
            raise ValueError(
                f"unsupported_channel_execution_strategy:{requirements.execution_strategy}"
            ) from exc
        return strategy.render(plan, table, metric, helpers)


__all__ = ("ChannelMetricRecipe",)
