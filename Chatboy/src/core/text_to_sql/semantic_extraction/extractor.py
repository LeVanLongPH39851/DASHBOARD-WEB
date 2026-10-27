"""Orchestrate Explicit LLM or offline rule extraction; failures never change provider."""

from __future__ import annotations

import logging
import re

from src.core.text_to_sql.semantic_extraction.catalog_context import CatalogContext
from src.core.text_to_sql.semantic_extraction.contracts import SemanticExtractionResult
from src.core.text_to_sql.semantic_extraction.providers.base import ExtractionProvider


logger = logging.getLogger(__name__)


class SemanticExtractor:
    """Return one extraction result; never mix LLM and rule entities."""

    _ANSI_ESCAPE = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")

    def __init__(
        self,
        *,
        context: CatalogContext,
        fallback: ExtractionProvider,
        primary: ExtractionProvider | None = None,
    ):
        self._context = context
        self._primary = primary
        self._fallback = fallback

    def extract(self, question: str) -> SemanticExtractionResult:
        cleaned = self._ANSI_ESCAPE.sub("", question).strip()
        if self._primary is not None:
            return self._primary.extract(cleaned, self._context)
        result = self._fallback.extract(cleaned, self._context)
        logger.info(
            "[E] source=rules metric=%s dimensions=%d status=%s",
            result.metric_id,
            len(result.dimensions),
            "resolved" if result.is_valid else "failed",
        )
        return result


__all__ = ("SemanticExtractor",)
