"""Recipe plugin used to prove catalog discovery without a central registry edit."""

from __future__ import annotations

from typing import Any

from src.core.text_to_sql.recipes.direct_aggregate import DirectAggregateRecipe


class FixtureRecipePlugin:
    def render(self, plan: Any, table: Any, metric: Any, helpers: Any):
        return DirectAggregateRecipe().render(plan, table, metric, helpers)
