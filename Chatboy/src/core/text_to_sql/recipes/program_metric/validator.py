"""Validation boundary trước khi Program recipe dựng SQL."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.program_metric.contracts import ProgramRequirements
from src.core.text_to_sql.recipes.program_metric.join_builder import ProgramJoinPlanner


class ProgramMetricValidator:
    def __init__(self):
        self._joins = ProgramJoinPlanner()

    def validate(
        self,
        plan: Any,
        table: Any,
        metrics: tuple[Any, ...],
        requirements: ProgramRequirements,
        catalog: Any,
    ) -> None:
        if table.fact_family != "program":
            raise ValueError(f"program_metric_requires_program_fact:{table.id}")
        contract = catalog.require_fact_contract(requirements.fact_contract_id)
        if contract.table_id != table.id:
            raise ValueError(
                f"program_metric_fact_contract_mismatch:{contract.id}:{table.id}"
            )
        recipe = catalog.require_recipe(metrics[0].recipe)
        unknown_measures = set(requirements.measures) - set(recipe.measures)
        if unknown_measures:
            raise ValueError(
                f"program_metric_unknown_measure:{','.join(sorted(unknown_measures))}"
            )
        unknown_grain = set(requirements.grain_keys) - set(contract.base_grain)
        if unknown_grain:
            raise ValueError(
                f"program_metric_unknown_grain_key:{','.join(sorted(unknown_grain))}"
            )
        if requirements.execution_strategy == "scoped_denominator" and len(metrics) != 1:
            raise ValueError("scoped_denominator_requires_single_metric")
        if any(metric.denominator_scope != plan.denominator_scope for metric in metrics):
            raise ValueError("program_metric_denominator_scope_mismatch")
        self._joins.validate(metrics, requirements, catalog, table.id)


__all__ = ("ProgramMetricValidator",)
