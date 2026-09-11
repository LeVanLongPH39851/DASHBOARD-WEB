"""Facade chọn capability theo calculation metadata, không theo metric ID."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.program_metric.denominator_planner import ProgramDenominatorPlanner
from src.core.text_to_sql.recipes.program_metric.fact_builder import ProgramFactBuilder
from src.core.text_to_sql.recipes.program_metric.requirements import ProgramRequirementCollector
from src.core.text_to_sql.recipes.program_metric.validator import ProgramMetricValidator


class ProgramMetricRecipe:
    def __init__(self):
        self._requirements = ProgramRequirementCollector()
        self._validator = ProgramMetricValidator()
        self._strategies = {
            "aggregate": ProgramFactBuilder(),
            "scoped_denominator": ProgramDenominatorPlanner(),
        }

    @staticmethod
    def validate_definition(recipe: Any) -> None:
        if not recipe.fact_contract:
            raise ValueError("program_metric_fact_contract_required")
        if not recipe.measures:
            raise ValueError("program_metric_measures_required")
        if not recipe.calculations:
            raise ValueError("program_metric_calculations_required")
        unknown_measures = {
            measure
            for calculation in recipe.calculations.values()
            for measure in calculation.required_measures
            if measure not in recipe.measures
        }
        if unknown_measures:
            raise ValueError(
                f"program_metric_unknown_measures:{','.join(sorted(unknown_measures))}"
            )

    def render(self, plan: Any, table: Any, metric: Any, helpers: Any):
        metrics = tuple(helpers.catalog.require_metric(item.id) for item in plan.metrics)
        requirements = self._requirements.collect(metrics, helpers.catalog)
        self._validator.validate(plan, table, metrics, requirements, helpers.catalog)
        try:
            strategy = self._strategies[requirements.execution_strategy]
        except KeyError as exc:
            raise ValueError(
                f"unsupported_program_execution_strategy:"
                f"{requirements.execution_strategy}"
            ) from exc
        return strategy.render(plan, table, metric, helpers)


__all__ = ("ProgramMetricRecipe",)
