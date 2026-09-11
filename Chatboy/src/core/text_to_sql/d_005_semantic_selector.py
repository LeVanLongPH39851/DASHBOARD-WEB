"""Workflow 005: preserve resolved metrics and select the analysis pattern."""

from __future__ import annotations

import logging
from typing import Any

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.input_contracts import ExtractedInput
from src.core.text_to_sql.d_004_pattern_router import PatternRouter
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.semantic_selection import SemanticSelection

logger = logging.getLogger(__name__)


class SemanticSelector:
    """Choose the pattern after semantic extraction has fixed the metric IDs."""

    def __init__(
        self,
        *,
        catalog: RatingCatalog,
        pattern_router: PatternRouter,
        llm_client: Any | None = None,
    ):
        self._catalog = catalog
        self._pattern_router = pattern_router
        self._llm = llm_client

    def select(
        self,
        extracted: ExtractedInput,
        components: ResolvedSQLComponents,
    ) -> SemanticSelection:
        pattern_name = self._pattern_router.classify(extracted, components)
        if pattern_name == "dimension_listing":
            metric_ids = ()
        else:
            metric_ids = tuple(
                components.metric_ids
                or ((components.metric_id,) if components.metric_id else ())
            )
        selection = SemanticSelection(
            metric_ids=metric_ids,
            pattern_name=pattern_name,
            denominator_scope=self._denominator_scope(metric_ids) if metric_ids else "none",
            # PatternRouter tự log nguồn LLM/rule chính xác, kể cả fallback.
            source="pattern_router",
        )
        self._log_selection(selection, handler="generic")
        return selection

    def _denominator_scope(self, metric_ids: tuple[str, ...]) -> str:
        scopes = {
            self._catalog.require_metric(metric_id).denominator_scope
            for metric_id in metric_ids
        }
        if len(scopes) > 1:
            raise ValueError("metric_bundle_denominator_scope_mismatch")
        return next(iter(scopes), "none")

    @staticmethod
    def _log_selection(selection: SemanticSelection, *, handler: str) -> None:
        logger.info(
            "[SemanticSelector] handler=%s source=%s metric=%s pattern=%s denominator_scope=%s",
            handler,
            selection.source,
            selection.primary_metric_id,
            selection.pattern_name,
            selection.denominator_scope,
        )


__all__ = ["SemanticSelector"]
