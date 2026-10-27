"""Workflow 013: apply the compute function declared by a pattern."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from decimal import localcontext

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.catalog_models import PatternSpec
from src.core.text_to_sql.query_plan import RatingQueryPlan


class PatternCompute:
    """Catalog-backed post-processing boundary between execution and narration."""

    def __init__(
        self,
        pattern_catalog: Mapping[str, PatternSpec] | None = None,
        catalog: RatingCatalog | None = None,
    ):
        self._patterns = (
            catalog.patterns
            if catalog is not None
            else pattern_catalog or RatingCatalog.load().patterns
        )

    def process(self, plan: RatingQueryPlan, rows: list[dict[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {
            "pattern": plan.pattern_name,
            "query_shape": plan.query_shape,
            "raw_row_count": len(rows),
        }
        pattern = self._patterns.get(plan.pattern_name or "")
        # Airtime share is a canonical SQL metric because its denominator must
        # be computed before a category filter is applied. Recomputing it from
        # returned rows would turn a single-category query into 100 percent.
        if plan.denominator_scope != "none" and plan.pattern_name == "share_distribution":
            result["data"] = rows
            return result
        if pattern is None or pattern.compute_fn is None or not rows:
            result["data"] = rows
            return result
        with localcontext() as decimal_context:
            # Unexpected compute bugs propagate to the application error boundary.
            decimal_context.prec = 100
            result["data"] = pattern.compute_fn(rows, plan)
        return result
