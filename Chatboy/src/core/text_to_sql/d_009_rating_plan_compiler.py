"""Workflow 009: compile resolved semantics into a query-plan candidate."""

from __future__ import annotations

from collections.abc import Mapping

from src.core.text_to_sql.d_007_canonical_filter_binder import CanonicalFilterBinder
from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.catalog_models import PatternSpec
from src.core.text_to_sql.input_contracts import ExtractedInput, NO_DASHBOARD_VALUE_ERROR
from src.core.text_to_sql.query_plan import MetricRef, OrderSpec, QueryPlanError, RatingQueryPlan
from src.core.text_to_sql.resolved_entities import ResolvedSort, ResolvedSQLComponents
from src.core.text_to_sql.d_008_time_resolver import RatingTimeResolver


class RatingPlanCompiler:
    """Build approved query plans from one validated pattern catalog."""

    def __init__(
        self,
        catalog: RatingCatalog | None = None,
        time_resolver: RatingTimeResolver | None = None,
        project_root=None,
        pattern_catalog: Mapping[str, PatternSpec] | None = None,
    ):
        self.catalog = catalog or RatingCatalog.load(project_root=project_root)
        self.time_resolver = time_resolver or RatingTimeResolver()
        self._patterns = pattern_catalog or self.catalog.patterns

    def compile(
        self,
        extracted: ExtractedInput,
        components: ResolvedSQLComponents,
        pattern_name: str | None = None,
        denominator_scope: str = "none",
    ) -> RatingQueryPlan:
        if components.domain_id != self.catalog.domain_id:
            raise QueryPlanError("rating_domain_mismatch")
        if components.unresolved_entities:
            names = ",".join(item.source.source_text for item in components.unresolved_entities)
            raise QueryPlanError(f"unresolved_entities:{names}")
        unresolved_sorts = [
            item for item in components.sorts if item.status != "resolved" or not item.field_id
        ]
        if unresolved_sorts:
            names = ",".join(item.source.source_text for item in unresolved_sorts)
            raise QueryPlanError(f"unresolved_order_by:{names}")
        metric_ids: tuple[str, ...]
        if components.metric_ids:
            metric_ids = components.metric_ids
        elif components.metric_id:
            metric_ids = (components.metric_id,)
        elif pattern_name == "dimension_listing":
            metric_ids = ()
        else:
            # A question can intentionally ask for the state/profile of a
            # dimension without naming one KPI ("Kênh VTV1 hôm nay ra sao?").
            # Resolve that intent from the catalog-owned semantic bundle.
            bundle_context = tuple(
                dict.fromkeys(
                    [*components.dimensions, *(item.dimension_id for item in components.filters)]
                )
            )
            if not bundle_context:
                raise QueryPlanError(NO_DASHBOARD_VALUE_ERROR)
            metric_ids = self.catalog.metric_bundle_for(bundle_context)
            if not metric_ids:
                raise QueryPlanError("missing_metric_bundle")

        selected_metrics: list[MetricRef] = []
        metric = None
        if metric_ids:
            metric = self.catalog.metrics.get(metric_ids[0])
            if not metric or metric.status != "active":
                raise QueryPlanError(f"metric_not_active:{metric_ids[0]}")
            if not components.table:
                raise QueryPlanError("missing_compatible_table")

            requested_fields = [*components.dimensions, *(item.dimension_id for item in components.filters)]
            for metric_id in metric_ids:
                candidate = self.catalog.metrics.get(metric_id)
                if not candidate or candidate.status != "active":
                    raise QueryPlanError(f"metric_not_active:{metric_id}")
                if candidate.recipe != metric.recipe:
                    raise QueryPlanError(f"metric_bundle_recipe_mismatch:{metric.id}:{candidate.id}")
                candidate_table = self.catalog.table_for(candidate.id, requested_fields)
                if not candidate_table or candidate_table.physical_name != components.table:
                    raise QueryPlanError(f"metric_bundle_table_mismatch:{candidate.id}")
                selected_metrics.append(MetricRef(candidate.id, candidate.output_alias))

        if not pattern_name:
            raise QueryPlanError("missing_pattern")
        pattern = self._patterns.get(pattern_name)
        if pattern is None:
            raise QueryPlanError(f"unknown_pattern:{pattern_name}")
        filters = CanonicalFilterBinder.plan_filters(components)
        filtered_fields = {item.field for item in filters}
        dimensions = tuple(dict.fromkeys(item for item in components.dimensions if item not in filtered_fields))
        if pattern.group_filtered_dimensions:
            grouped_filters = tuple(
                item.field
                for item in filters
                if item.operator == "in"
                and isinstance(item.value, tuple)
                and len(item.value) >= 2
            )
            dimensions = tuple(dict.fromkeys((*dimensions, *grouped_filters)))
        if pattern.requires_time_dimension and not any(
            (dimension := self.catalog.get_dimension(dimension_id))
            and dimension.semantic_type == "time"
            for dimension_id in dimensions
        ):
            table = self.catalog.table_for(metric.id, requested_fields)
            date_dimension = self.catalog.date_dimension_for(table.id) if table else None
            if date_dimension is None:
                raise QueryPlanError("missing_time_dimension")
            dimensions = (*dimensions, date_dimension.id)
        query_shape = pattern.query_shape
        time_range = self.time_resolver.resolve(extracted)
        limit = self._limit(extracted, pattern, metric)
        order_by = self._order_by(
            pattern,
            tuple(item.id for item in selected_metrics),
            dimensions,
            components.sorts,
        )
        return RatingQueryPlan(
            domain=self.catalog.domain_id,
            metrics=tuple(selected_metrics),
            dimensions=dimensions,
            filters=filters,
            time_range=time_range,
            order_by=order_by,
            limit=limit,
            query_shape=query_shape,
            raw_question=extracted.question,
            pattern_name=pattern.name,
            channel_weight_scope=extracted.channel_weight_scope,
            denominator_scope=denominator_scope,
        )

    def _limit(
        self,
        extracted: ExtractedInput,
        pattern: PatternSpec,
        metric=None,
    ) -> int | None:
        values = [entity.value for entity in extracted.entities if entity.kind == "limit"]
        if len(values) > 1 and len(set(values)) > 1:
            raise QueryPlanError("ambiguous_limit")
        if values:
            try:
                limit = int(values[0])
            except ValueError as exc:
                raise QueryPlanError("invalid_limit") from exc
        elif pattern.needs_limit and pattern.default_limit:
            limit = int(pattern.default_limit)
        elif metric and (recipe_limit := self.catalog.require_recipe(metric.recipe).default_limit) is not None:
            limit = int(recipe_limit)
        elif pattern.needs_limit:
            limit = int(self.catalog.default_limit)
        else:
            return None
        if not 1 <= limit <= self.catalog.maximum_limit:
            raise QueryPlanError(f"limit_out_of_range:{limit}")
        return limit

    @staticmethod
    def _order_by(
        pattern: PatternSpec,
        metric_ids: tuple[str, ...],
        dimensions: tuple[str, ...],
        explicit_sorts: tuple[ResolvedSort, ...],
    ) -> tuple[OrderSpec, ...]:
        if explicit_sorts:
            selected_fields = {*metric_ids, *dimensions}
            directions: dict[str, str] = {}
            order_by: list[OrderSpec] = []
            for item in explicit_sorts:
                field_id = item.field_id or ""
                if field_id not in selected_fields:
                    raise QueryPlanError(f"order_field_not_selected:{field_id}")
                prior_direction = directions.get(field_id)
                if prior_direction and prior_direction != item.direction:
                    raise QueryPlanError(f"ambiguous_order_by:{field_id}")
                if prior_direction:
                    continue
                directions[field_id] = item.direction
                order_by.append(OrderSpec(field_id, item.direction))
            return tuple(order_by)

        order_by: list[OrderSpec] = []
        for default in pattern.default_order:
            fields = metric_ids if default.target == "primary_metric" else dimensions
            if default.index < len(fields):
                order_by.append(OrderSpec(fields[default.index], default.direction))
        return tuple(order_by)
