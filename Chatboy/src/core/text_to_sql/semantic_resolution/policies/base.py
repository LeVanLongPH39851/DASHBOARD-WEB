"""Policy protocol."""

from __future__ import annotations

from typing import Protocol

from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.semantic_resolution.context import SemanticResolutionContext


class ResolutionPolicy(Protocol):
    name: str

    def apply(
        self,
        context: SemanticResolutionContext,
        components: ResolvedSQLComponents,
    ) -> ResolvedSQLComponents:
        """Validate and finalize canonical components."""


__all__ = ("ResolutionPolicy",)
