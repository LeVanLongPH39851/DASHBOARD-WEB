"""Orchestrate LLM-first extraction with an observable deterministic fallback."""

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
            try:
                result = self._primary.extract(cleaned, self._context)
                logger.info(
                    "[E] source=llm metric=%s dimensions=%d status=%s",
                    result.metric_id,
                    len(result.dimensions),
                    "resolved" if result.is_valid else "failed",
                )
                return result
            except Exception as exc:
                logger.warning("[E] source=llm status=fallback error=%s", exc)
        result = self._fallback.extract(cleaned, self._context)
        logger.info(
            "[E] source=rules metric=%s dimensions=%d status=%s",
            result.metric_id,
            len(result.dimensions),
            "resolved" if result.is_valid else "failed",
        )
        return result


__all__ = ("SemanticExtractor",)
