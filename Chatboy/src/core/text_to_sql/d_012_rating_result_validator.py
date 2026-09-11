"""Workflow 012: validate Doris rows before analysis or narration."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any, Literal

from src.core.text_to_sql.query_plan import RatingQueryPlan


@dataclass(frozen=True)
class RatingDataValidation:
    """Data-availability state derived from one executed Rating query."""

    status: Literal["available", "no_data"]
    message: str | None = None

    @property
    def is_available(self) -> bool:
        return self.status == "available"


class RatingResultValidator:
    """Prevent empty or all-null metric results from reaching the LLM."""

    def validate(
        self,
        plan: RatingQueryPlan,
        rows: list[dict[str, Any]],
    ) -> RatingDataValidation:
        if not rows or self._all_selected_metrics_are_null(plan, rows):
            return RatingDataValidation("no_data", self._no_data_message(plan))
        return RatingDataValidation("available")

    @staticmethod
    def _all_selected_metrics_are_null(
        plan: RatingQueryPlan,
        rows: list[dict[str, Any]],
    ) -> bool:
        aliases = tuple(item.alias for item in plan.metrics if item.alias)
        metric_values = [
            row[alias]
            for row in rows
            for alias in aliases
            if alias in row
        ]
        return bool(metric_values) and all(value is None for value in metric_values)

    @staticmethod
    def _no_data_message(plan: RatingQueryPlan) -> str:
        start = date.fromisoformat(plan.time_range.start)
        end = date.fromisoformat(plan.time_range.end) - timedelta(days=1)
        if start == end:
            return f"Chưa có dữ liệu của ngày {start.isoformat()}"
        return f"Chưa có dữ liệu từ ngày {start.isoformat()} đến ngày {end.isoformat()}"
