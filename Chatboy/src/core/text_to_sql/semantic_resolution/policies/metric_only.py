"""Resolve one explicit metric without requested dimensions."""

from __future__ import annotations

from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.semantic_resolution.context import SemanticResolutionContext


class MetricOnlyPolicy:
    name = "metric_only"

    def apply(self, context: SemanticResolutionContext, components: ResolvedSQLComponents) -> ResolvedSQLComponents:
        return context.validate_metric_contract(components)


__all__ = ("MetricOnlyPolicy",)
