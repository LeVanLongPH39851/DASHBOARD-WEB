"""Strategy cho metric cần giữ phạm vi mẫu số độc lập với filter tử số."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.program_airtime import ProgramAirtimeRecipe


class ProgramDenominatorPlanner:
    def __init__(self):
        self._renderer = ProgramAirtimeRecipe()

    def render(self, plan: Any, table: Any, metric: Any, helpers: Any):
        return self._renderer.render(plan, table, metric, helpers)


__all__ = ("ProgramDenominatorPlanner",)
