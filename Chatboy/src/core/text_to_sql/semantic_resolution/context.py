"""Shared operations available to every semantic resolution policy."""

from __future__ import annotations

from src.core.text_to_sql.planning_contracts import UnsupportedRequest

from dataclasses import replace

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents


class SemanticResolutionContext:
    def __init__(self, catalog: RatingCatalog):
        self.catalog = catalog

    @staticmethod
    def requested_dimensions(components: ResolvedSQLComponents) -> tuple[str, ...]:
        return tuple(
            dict.fromkeys(
                (*components.dimensions, *(item.dimension_id for item in components.filters))
            )
        )

    def validate_metric_contract(
        self,
        components: ResolvedSQLComponents,
    ) -> ResolvedSQLComponents:
        metric_id = components.metric_id
        if not metric_id:
            raise UnsupportedRequest("missing_metric")
        metric = self.catalog.require_metric(metric_id)
        requested = set(self.requested_dimensions(components))
        unsupported = requested - set(metric.supported_dimensions)
        if unsupported:
            raise UnsupportedRequest(
                f"metric_unsupported_dimensions:{metric.id}:{','.join(sorted(unsupported))}"
            )
        missing = set(metric.required_dimensions) - requested
        if missing:
            raise UnsupportedRequest(
                f"metric_required_dimensions_missing:{metric.id}:{','.join(sorted(missing))}"
            )
        return replace(
            components,
            metric_id=metric.id,
            metric_ids=(metric.id,),
        )


__all__ = ("SemanticResolutionContext",)
