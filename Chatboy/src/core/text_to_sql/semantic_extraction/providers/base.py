"""Provider interface for semantic extraction."""

from __future__ import annotations

from typing import Protocol

from src.core.text_to_sql.semantic_extraction.catalog_context import CatalogContext
from src.core.text_to_sql.semantic_extraction.contracts import SemanticExtractionResult


class ExtractionProvider(Protocol):
    def extract(self, question: str, context: CatalogContext) -> SemanticExtractionResult:
        """Return exactly one metric/dimension interpretation."""


__all__ = ("ExtractionProvider",)
