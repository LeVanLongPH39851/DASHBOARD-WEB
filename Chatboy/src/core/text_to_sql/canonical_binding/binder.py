"""Bind extracted raw values before deterministic semantic resolution."""

from __future__ import annotations

import logging

from src.core.text_to_sql.canonical_binding.contracts import (
    CanonicalBindingResult,
    CanonicalDimension,
    CanonicalValueBinding,
)
from src.core.text_to_sql.canonical_binding.registry import CanonicalMatcherRegistry
from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.semantic_extraction.contracts import SemanticExtractionResult


logger = logging.getLogger(__name__)


class CanonicalBinder:
    """Use metadata-selected matchers; never invent or silently drop a filter."""

    def __init__(self, catalog: RatingCatalog, registry: CanonicalMatcherRegistry):
        self._catalog = catalog
        self._registry = registry

    def bind(self, extraction: SemanticExtractionResult) -> CanonicalBindingResult:
        if not extraction.is_valid:
            return CanonicalBindingResult(
                extraction=extraction,
                metric_id=extraction.metric_id,
                status="failed",
                error=extraction.error,
                output_text=extraction.output_text,
            )

        dimensions: list[CanonicalDimension] = []
        bindings: list[CanonicalValueBinding] = []
        unmatched: list[CanonicalValueBinding] = []
        for extracted_dimension in extraction.dimensions:
            dimension = self._catalog.get_dimension(extracted_dimension.dimension_id)
            if dimension is None:
                return self._failure(
                    extraction,
                    bindings,
                    f"unknown_dimension:{extracted_dimension.dimension_id}",
                    f'Dimension "{extracted_dimension.dimension_id}" không có trong catalog.',
                )
            if dimension.semantic_type == "time":
                # Giá trị thời gian thuộc TimeResolver, không phải canonical dictionary.
                # Chỉ giữ dimension khi người dùng yêu cầu group/sort theo thời gian.
                retained_roles = tuple(
                    role
                    for role in extracted_dimension.roles
                    if role in {"group_by", "sort"}
                )
                logger.info(
                    "[C] dimension=%s status=delegated_to_time_resolver raw_values=%d retained_roles=%s",
                    dimension.id,
                    len(extracted_dimension.raw_values),
                    retained_roles,
                )
                if retained_roles:
                    dimensions.append(
                        CanonicalDimension(
                            dimension_id=dimension.id,
                            raw_values=(),
                            canonical_values=(),
                            roles=retained_roles,
                        )
                    )
                continue
            canonical_values: list[str] = []
            matched_raw_values: list[str] = []
            matcher = self._registry.require(dimension.matching.strategy)
            for raw_value in extracted_dimension.raw_values:
                binding = matcher.match(dimension, raw_value)
                bindings.append(binding)
                logger.info(
                    "[C] dimension=%s raw=%r status=%s match=%s canonical=%r",
                    dimension.id,
                    raw_value,
                    binding.status,
                    binding.match_type,
                    binding.canonical_value,
                )
                if binding.status != "matched" or binding.canonical_value is None:
                    unmatched.append(binding)
                    continue
                if binding.canonical_value not in canonical_values:
                    canonical_values.append(binding.canonical_value)
                    matched_raw_values.append(raw_value)
            if extracted_dimension.raw_values and not canonical_values:
                continue
            dimensions.append(
                CanonicalDimension(
                    dimension_id=dimension.id,
                    raw_values=tuple(matched_raw_values),
                    canonical_values=tuple(canonical_values),
                    roles=extracted_dimension.roles,
                )
            )
        matched_values = tuple(
            (binding.dimension_id, binding.raw_value)
            for binding in bindings
            if binding.status == "matched" and binding.canonical_value is not None
        )
        blocking = tuple(
            binding
            for binding in unmatched
            if not self._overlaps_matched_value(
                binding.raw_value,
                matched_values,
                binding.dimension_id,
            )
        )
        for binding in unmatched:
            if binding not in blocking:
                logger.info(
                    "[D] ignored_non_canonical_overlap dimension=%s raw=%r",
                    binding.dimension_id,
                    binding.raw_value,
                )
        if blocking:
            first = blocking[0]
            dimension = self._catalog.get_dimension(first.dimension_id)
            dim_label = dimension.label if dimension else first.dimension_id
            alternatives = ", ".join(first.alternatives[:3])
            suffix = f" Có phải bạn muốn tìm: {alternatives}?" if alternatives else ""
            user_message = (
                f"Không tìm thấy '{first.raw_value}' trong danh mục {dim_label}.{suffix}"
            )
            return self._failure(
                extraction,
                bindings,
                f"canonical_value_{first.status}:{first.dimension_id}",
                user_message,
            )
        logger.info(
            "[C] status=resolved dimensions=%d values=%d",
            len(dimensions),
            len(bindings),
        )
        return CanonicalBindingResult(
            extraction=extraction,
            metric_id=extraction.metric_id,
            dimensions=tuple(dimensions),
            value_bindings=tuple(bindings),
        )

    @staticmethod
    def _failure(
        extraction: SemanticExtractionResult,
        bindings: list[CanonicalValueBinding],
        error: str,
        output_text: str,
    ) -> CanonicalBindingResult:
        logger.warning("[C] status=failed error=%s", error)
        return CanonicalBindingResult(
            extraction=extraction,
            metric_id=extraction.metric_id,
            value_bindings=tuple(bindings),
            status="failed",
            error=error,
            output_text=output_text,
        )

    @staticmethod
    def _overlaps_matched_value(
        raw_value: str,
        matched_values: tuple[tuple[str, str], ...],
        dimension_id: str | None = None,
    ) -> bool:
        from src.core.text_to_sql.semantic_extraction.normalization import (
            contains_lookup_phrase,
            normalize_lookup_value,
        )

        raw = normalize_lookup_value(raw_value)
        return bool(
            raw
            and any(
                contains_lookup_phrase(normalize_lookup_value(matched), raw)
                or contains_lookup_phrase(raw, normalize_lookup_value(matched))
                for matched_dimension_id, matched in matched_values
                if dimension_id is None or matched_dimension_id == dimension_id
            )
        )


__all__ = ("CanonicalBinder",)
