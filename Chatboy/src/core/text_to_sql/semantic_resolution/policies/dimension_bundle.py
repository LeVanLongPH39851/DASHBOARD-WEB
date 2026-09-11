"""Expand the catalog-owned metric bundle when no explicit metric exists."""

from __future__ import annotations

from dataclasses import replace

from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.semantic_resolution.context import SemanticResolutionContext


class DimensionBundlePolicy:
    name = "dimension_bundle"

    def apply(self, context: SemanticResolutionContext, components: ResolvedSQLComponents) -> ResolvedSQLComponents:
        dimension_ids = context.requested_dimensions(components)
        metric_ids = context.catalog.metric_bundle_for(dimension_ids)
        if not metric_ids:
            raise ValueError("missing_metric_bundle")
        recipes = {context.catalog.require_metric(metric_id).recipe for metric_id in metric_ids}
        if len(recipes) != 1:
            raise ValueError("metric_bundle_recipe_mismatch")
        for metric_id in metric_ids:
            metric = context.catalog.require_metric(metric_id)
            unsupported = set(dimension_ids) - set(metric.supported_dimensions)
            if unsupported:
                raise ValueError(
                    f"metric_bundle_unsupported_dimensions:{metric_id}:{','.join(sorted(unsupported))}"
                )
        return replace(
            components,
            # Keep bundle intent distinct from an explicitly extracted metric
            # while the pattern router is classifying the question.
            metric_id=None,
            metric_ids=metric_ids,
        )


__all__ = ("DimensionBundlePolicy",)
