"""Validation boundary before Channel SQL construction."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.channel_metric.contracts import ChannelRequirements
from src.core.text_to_sql.recipes.channel_metric.join_builder import ChannelJoinPlanner


class ChannelMetricValidator:
    def __init__(self):
        self._joins = ChannelJoinPlanner()

    def validate(
        self,
        plan: Any,
        table: Any,
        metrics: tuple[Any, ...],
        requirements: ChannelRequirements,
        catalog: Any,
    ) -> None:
        if table.fact_family != "channel":
            raise ValueError(f"channel_metric_requires_channel_fact:{table.id}")
        contract = catalog.require_fact_contract(requirements.fact_contract_id)
        if contract.table_id != table.id:
            raise ValueError(
                f"channel_metric_fact_contract_mismatch:{contract.id}:{table.id}"
            )
        recipe = catalog.require_recipe(metrics[0].recipe)
        unknown_measures = set(requirements.measures) - set(recipe.measures)
        if unknown_measures:
            raise ValueError(
                f"channel_metric_unknown_measure:{','.join(sorted(unknown_measures))}"
            )
        unknown_grain = set(requirements.grain_keys) - set(contract.base_grain)
        if unknown_grain:
            raise ValueError(
                f"channel_metric_unknown_grain_key:{','.join(sorted(unknown_grain))}"
            )
        if requirements.execution_strategy != "aggregate":
            raise ValueError(
                f"unsupported_channel_execution_strategy:{requirements.execution_strategy}"
            )
        if any(metric.denominator_scope != plan.denominator_scope for metric in metrics):
            raise ValueError("channel_metric_denominator_scope_mismatch")
        self._joins.validate(metrics, requirements, catalog, table.id)


__all__ = ("ChannelMetricValidator",)
