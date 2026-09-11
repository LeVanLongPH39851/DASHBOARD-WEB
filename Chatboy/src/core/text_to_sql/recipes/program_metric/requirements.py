"""Hợp nhất dependency của các metric mà không rẽ nhánh theo metric ID."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.program_metric.contracts import ProgramRequirements


class ProgramRequirementCollector:
    def collect(self, metrics: tuple[Any, ...], catalog: Any) -> ProgramRequirements:
        if not metrics:
            raise ValueError("program_metric_requires_metric")
        recipe_ids = {metric.recipe for metric in metrics}
        if len(recipe_ids) != 1:
            raise ValueError("program_metric_recipe_mismatch")
        recipe = catalog.require_recipe(next(iter(recipe_ids)))
        if not recipe.fact_contract:
            raise ValueError(f"program_metric_has_no_fact_contract:{recipe.id}")

        calculations = []
        for metric in metrics:
            calculation = catalog.calculation_for(metric)
            if calculation is None:
                raise ValueError(f"program_metric_has_no_calculation:{metric.id}")
            calculations.append(calculation)
        strategies = {item.execution_strategy for item in calculations}
        if len(strategies) != 1:
            raise ValueError("program_metric_execution_strategy_mismatch")

        return ProgramRequirements(
            fact_contract_id=recipe.fact_contract,
            measures=tuple(
                dict.fromkeys(
                    measure
                    for calculation in calculations
                    for measure in calculation.required_measures
                )
            ),
            joins=tuple(
                dict.fromkeys(
                    join
                    for calculation in calculations
                    for join in calculation.required_joins
                )
            ),
            grain_keys=tuple(
                dict.fromkeys(
                    key
                    for calculation in calculations
                    for key in calculation.required_grain_keys
                )
            ),
            execution_strategy=next(iter(strategies)),
        )


__all__ = ("ProgramRequirementCollector",)
