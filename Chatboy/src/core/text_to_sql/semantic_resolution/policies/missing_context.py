"""Reject questions that contain neither a metric nor a dimension."""

from __future__ import annotations

from src.core.text_to_sql.input_contracts import NO_DASHBOARD_VALUE_ERROR
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.semantic_resolution.context import SemanticResolutionContext


class MissingContextPolicy:
    name = "missing_context"

    def apply(self, context: SemanticResolutionContext, components: ResolvedSQLComponents) -> ResolvedSQLComponents:
        raise ValueError(NO_DASHBOARD_VALUE_ERROR)


__all__ = ("MissingContextPolicy",)
