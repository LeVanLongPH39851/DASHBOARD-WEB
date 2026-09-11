"""Validate join dependencies declared by Channel calculations."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.channel_metric.contracts import ChannelRequirements


class ChannelJoinPlanner:
    def validate(
        self,
        metrics: tuple[Any, ...],
        requirements: ChannelRequirements,
        catalog: Any,
        table_id: str,
    ) -> None:
        if not requirements.joins:
            return
        for metric in metrics:
            calculation = catalog.calculation_for(metric)
            if calculation is None or not calculation.required_joins:
                continue
            profile = catalog.join_profile_for(metric.join_profile)
            if profile is None:
                raise ValueError(f"channel_metric_missing_join_profile:{metric.id}")
            if profile.fact_table_id != table_id:
                raise ValueError(f"channel_metric_join_table_mismatch:{metric.id}")
            declared = {join.name for join in profile.joins}
            missing = set(calculation.required_joins) - declared
            if missing:
                raise ValueError(
                    f"channel_metric_missing_join:{metric.id}:{','.join(sorted(missing))}"
                )


__all__ = ("ChannelJoinPlanner",)
