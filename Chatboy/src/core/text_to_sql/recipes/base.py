"""Contracts shared by catalog-selected SQL recipes."""

from __future__ import annotations

from typing import Any, Protocol

from src.core.text_to_sql.query_plan import RatingQueryPlan


class RecipeRenderer(Protocol):
    """Render one approved recipe using the main renderer's safe helpers."""

    def render(self, plan: RatingQueryPlan, table: Any, metric: Any, helpers: Any) -> Any:
        ...
