"""Adapt canonical extraction to the stable Rating resolver output contract."""

from __future__ import annotations

import logging
from dataclasses import dataclass, replace

from src.core.text_to_sql.canonical_binding.contracts import CanonicalBindingResult
from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.input_contracts import ExtractedEntity, ExtractedInput
from src.core.text_to_sql.rating_resolver import RatingResolveEntities
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value
from src.core.text_to_sql.semantic_resolution.context import SemanticResolutionContext
from src.core.text_to_sql.semantic_resolution.policies import (
    DimensionBundlePolicy,
    MetricDimensionsPolicy,
    MetricOnlyPolicy,
    MissingContextPolicy,
)


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class SemanticResolverResult:
    extracted_input: ExtractedInput
    components: ResolvedSQLComponents
    policy_name: str


class SemanticResolver:
    """Select one generic policy and preserve ``ResolvedSQLComponents`` downstream."""

    def __init__(self, catalog: RatingCatalog, component_builder: RatingResolveEntities):
        self._catalog = catalog
        self._component_builder = component_builder
        self._context = SemanticResolutionContext(catalog)
        self._policies = {
            (True, False): MetricOnlyPolicy(),
            (True, True): MetricDimensionsPolicy(),
            (False, True): DimensionBundlePolicy(),
            (False, False): MissingContextPolicy(),
        }

    def resolve(
        self,
        context_input: ExtractedInput,
        binding: CanonicalBindingResult,
    ) -> SemanticResolverResult:
        if not binding.is_valid:
            raise ValueError(binding.error or "canonical_binding_failed")
        self._validate_binding_metric_contract(binding)
        extracted = self._to_extracted_input(context_input, binding)
        components = self._component_builder.resolve(extracted)
        has_metric = binding.metric_id is not None
        has_dimensions = bool(binding.dimensions)
        policy = self._policies[(has_metric, has_dimensions)]
        components = policy.apply(self._context, components)
        logger.info(
            "[R] policy=%s metric=%s dimensions=%d filters=%d status=resolved",
            policy.name,
            components.metric_id,
            len(components.dimensions),
            len(components.filters),
        )
        return SemanticResolverResult(extracted, components, policy.name)

    def _validate_binding_metric_contract(
        self,
        binding: CanonicalBindingResult,
    ) -> None:
        if binding.metric_id is None:
            return
        metric = self._catalog.require_metric(binding.metric_id)
        requested_ids = {dimension.dimension_id for dimension in binding.dimensions}
        supported = set(metric.supported_dimensions)
        unsupported = requested_ids - supported
        remaining: set[str] = set()
        for dimension_id in unsupported:
            dimension = self._catalog.get_dimension(dimension_id)
            has_supported_equivalent = bool(
                dimension
                and any(
                    candidate_id in requested_ids
                    and (candidate := self._catalog.get_dimension(candidate_id)) is not None
                    and (candidate.column, candidate.label)
                    == (dimension.column, dimension.label)
                    for candidate_id in supported
                )
            )
            if not has_supported_equivalent:
                remaining.add(dimension_id)
        if remaining:
            raise ValueError(
                f"metric_unsupported_dimensions:{metric.id}:{','.join(sorted(remaining))}"
            )
        effective_requested = requested_ids - unsupported
        missing = set(metric.required_dimensions) - effective_requested
        if missing:
            raise ValueError(
                f"metric_required_dimensions_missing:{metric.id}:{','.join(sorted(missing))}"
            )

    def _to_extracted_input(
        self,
        context_input: ExtractedInput,
        binding: CanonicalBindingResult,
    ) -> ExtractedInput:
        entities = list(context_input.entities)
        source = binding.extraction.source
        if binding.metric_id:
            metric = self._catalog.require_metric(binding.metric_id)
            entities.append(
                ExtractedEntity(
                    kind="metric_term",
                    value=metric.id,
                    normalized_value=normalize_lookup_value(metric.id),
                    source_text=metric.label,
                    domain_id=self._catalog.domain_id,
                    confidence=1.0,
                    match_type=f"{source}_metric",
                )
            )
        for canonical_dimension in binding.dimensions:
            dimension = self._catalog.get_dimension(canonical_dimension.dimension_id)
            if dimension is None:
                continue
            if not canonical_dimension.canonical_values or any(
                role in {"group_by", "sort"}
                for role in canonical_dimension.roles
            ):
                entities.append(
                    ExtractedEntity(
                        kind="dimension_term",
                        value=dimension.label,
                        normalized_value=normalize_lookup_value(dimension.label),
                        source_text=dimension.label,
                        domain_id=self._catalog.domain_id,
                        dimension_id=dimension.id,
                        confidence=1.0,
                        match_type=f"{source}_dimension",
                    )
                )
            raw_by_canonical = dict(
                zip(canonical_dimension.canonical_values, canonical_dimension.raw_values)
            )
            for canonical_value in canonical_dimension.canonical_values:
                entities.append(
                    ExtractedEntity(
                        kind="dimension_value",
                        value=canonical_value,
                        normalized_value=normalize_lookup_value(canonical_value),
                        source_text=raw_by_canonical.get(canonical_value, canonical_value),
                        domain_id=self._catalog.domain_id,
                        dimension_id=dimension.id,
                        confidence=1.0,
                        match_type="canonical",
                    )
                )
        notes = (
            ("Không có metric đơn; resolver sử dụng metric bundle của dimension.",)
            if binding.metric_id is None and binding.dimensions
            else ()
        )
        return replace(
            context_input,
            entities=tuple(entities),
            notes=notes,
            error=None,
        )


__all__ = ("SemanticResolver", "SemanticResolverResult")
