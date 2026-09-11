"""Build the compact catalog context supplied to semantic extraction."""

from __future__ import annotations

from dataclasses import dataclass

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.semantic_memory import CanonicalMemory


@dataclass(frozen=True)
class MetricContext:
    id: str
    label: str
    description: str
    aliases: tuple[str, ...]
    fact_family: str
    semantic_key: str
    supported_dimensions: tuple[str, ...]
    required_dimensions: tuple[str, ...]
    default_dimensions: tuple[str, ...]
    denominator_scope: str
    unit: str | None
    disambiguation: str | None = None


@dataclass(frozen=True)
class DimensionContext:
    id: str
    label: str
    aliases: tuple[str, ...]
    semantic_type: str
    filterable: bool
    group_by: bool
    metric_bundle: tuple[str, ...]
    canonical_values: tuple[str, ...] = ()


@dataclass(frozen=True)
class CatalogContext:
    domain_id: str
    metrics: tuple[MetricContext, ...]
    dimensions: tuple[DimensionContext, ...]


class CatalogContextBuilder:
    """Compile immutable LLM context once; high-cardinality values stay local."""

    def __init__(self, catalog: RatingCatalog, memory: CanonicalMemory):
        self._catalog = catalog
        self._memory = memory

    def build(self) -> CatalogContext:
        metrics = tuple(
            MetricContext(
                id=metric.id,
                label=metric.label,
                description=metric.description,
                aliases=metric.aliases,
                fact_family=metric.fact_family,
                semantic_key=metric.semantic_key,
                supported_dimensions=metric.supported_dimensions,
                required_dimensions=metric.required_dimensions,
                default_dimensions=metric.default_dimensions,
                denominator_scope=metric.denominator_scope,
                unit=metric.unit,
                disambiguation=metric.disambiguation,
            )
            for metric in self._catalog.metrics.values()
            if metric.status == "active"
        )
        dimensions = tuple(
            DimensionContext(
                id=dimension.id,
                label=dimension.label,
                aliases=dimension.aliases,
                semantic_type=dimension.semantic_type,
                filterable=dimension.filterable,
                group_by=dimension.group_by,
                metric_bundle=dimension.metric_bundle,
                canonical_values=(
                    self._memory.canonical_values(dimension.id)
                    if dimension.matching.expose_values_to_llm
                    else ()
                ),
            )
            for dimension in self._catalog.dimensions.values()
        )
        return CatalogContext(self._catalog.domain_id, metrics, dimensions)


__all__ = (
    "CatalogContext",
    "CatalogContextBuilder",
    "DimensionContext",
    "MetricContext",
)
