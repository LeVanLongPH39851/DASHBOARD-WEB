"""Typed access to the fixed Rating dashboard semantic catalog.

The Version 3 pipeline deliberately owns its metadata under
``data/dashboard/rating``.  It does not fall back to ``data/domains`` because
the dashboard is a single, preselected business context rather than a
multi-domain router.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


class SemanticCatalogError(ValueError):
    """The Rating dashboard semantic metadata is missing or invalid."""


@dataclass(frozen=True)
class MetricDefinition:
    id: str
    label: str
    description: str
    aliases: tuple[str, ...]
    expression: str
    output_alias: str
    source_tables: tuple[str, ...]
    status: str = "active"
    recipe: str = ""
    calculation: str | None = None
    required_joins: tuple[str, ...] = ()
    required_measures: tuple[str, ...] = ()
    join_profile: str | None = None
    supported_dimensions: tuple[str, ...] = ()
    required_dimensions: tuple[str, ...] = ()
    default_dimensions: tuple[str, ...] = ()
    fact_family: str = ""
    semantic_key: str = ""
    denominator_scope: str = "none"
    unit: str | None = None
    disambiguation: str | None = None


@dataclass(frozen=True)
class DimensionMatchingDefinition:
    """Catalog-selected canonical matching strategy for one dimension."""

    strategy: str = "fuzzy"
    expose_values_to_llm: bool = True
    top_k: int = 5
    minimum_score: float = 0.85
    table: str | None = None
    column: str | None = None
    ngram_size: int = 4


@dataclass(frozen=True)
class DimensionDefinition:
    id: str
    table_id: str
    column: str
    label: str
    aliases: tuple[str, ...]
    semantic_type: str
    filterable: bool
    group_by: bool
    value_dictionary: str | None = None
    free_text: bool = False
    metric_bundle: tuple[str, ...] = ()
    matching: DimensionMatchingDefinition = DimensionMatchingDefinition()


@dataclass(frozen=True)
class TableDefinition:
    id: str
    physical_name: str
    columns: tuple[str, ...]
    grain: tuple[str, ...]
    fact_family: str | None = None


@dataclass(frozen=True)
class JoinDefinition:
    """A catalog-owned, parameterized dependency of a semantic recipe."""

    name: str
    table_id: str
    columns: tuple[str, ...]
    join_on: tuple[tuple[str, str], ...]
    filters: tuple[tuple[str, str], ...] = ()
    scalar: bool = False


@dataclass(frozen=True)
class JoinProfile:
    """Approved join set for one fact grain/calculation family."""

    id: str
    fact_table_id: str
    joins: tuple[JoinDefinition, ...]


class SemanticCatalogBase:
    """Load the YAML contract for the one configured Rating dashboard.

    Metrics may be supported by several fact tables.  The resolver narrows
    the table from metric and dimension evidence, then falls back to the
    dashboard default declared in ``domain.yaml``.
    """

    def __init__(
        self,
        project_root: str | Path | None = None,
        source_files: dict[str, str] | None = None,
    ):
        self.project_root = Path(project_root or Path(__file__).resolve().parents[3])
        self.rating_dir = self.project_root / "data" / "dashboard" / "rating"
        self._source_files = {
            "domain": "domain.yaml",
            "tables": "table.yaml",
            "metrics": "metrics_v3.yaml",
            "dimensions": "dimensions.yaml",
            **(source_files or {}),
        }
        self._loaded = False
        self._domain: dict[str, Any] = {}
        self._metrics: dict[str, MetricDefinition] = {}
        self._dimensions: dict[str, DimensionDefinition] = {}
        self._tables: dict[str, TableDefinition] = {}
        self._join_profiles: dict[str, JoinProfile] = {}
        self._constants: dict[str, Any] = {}

    @property
    def domain_id(self) -> str:
        self._ensure_loaded()
        return str(self._domain["domain"])

    @property
    def default_table_id(self) -> str | None:
        self._ensure_loaded()
        value = self._domain.get("default_table")
        return str(value) if value else None

    @property
    def default_limit(self) -> int:
        self._ensure_loaded()
        return int(self._domain.get("default_limit", 100))

    @property
    def maximum_limit(self) -> int:
        self._ensure_loaded()
        return int(self._domain.get("maximum_limit", self.default_limit))

    @property
    def maximum_dimensions(self) -> int:
        self._ensure_loaded()
        return int(self._domain.get("maximum_dimensions", 3))

    @property
    def tables(self) -> dict[str, TableDefinition]:
        self._ensure_loaded()
        return self._tables

    @property
    def join_profiles(self) -> dict[str, JoinProfile]:
        self._ensure_loaded()
        return self._join_profiles

    def constant(self, name: str, default: Any = None) -> Any:
        self._ensure_loaded()
        return self._constants.get(name, default)

    @property
    def metrics(self) -> dict[str, MetricDefinition]:
        self._ensure_loaded()
        return self._metrics

    @property
    def dimensions(self) -> dict[str, DimensionDefinition]:
        self._ensure_loaded()
        return self._dimensions

    def metric_terms(self) -> tuple[tuple[str, str], ...]:
        """Return ``(normalized phrase, metric id)`` for active metrics."""
        self._ensure_loaded()
        terms: list[tuple[str, str]] = []
        for metric in self._metrics.values():
            if metric.status != "active":
                continue
            for phrase in (metric.id, metric.label, *metric.aliases):
                normalized = self.normalize(phrase)
                if normalized:
                    terms.append((normalized, metric.id))
        return tuple(terms)

    def dimension_terms(self) -> tuple[tuple[str, str], ...]:
        self._ensure_loaded()
        terms: list[tuple[str, str]] = []
        for dimension in self._dimensions.values():
            for phrase in (dimension.id, dimension.label, *dimension.aliases):
                normalized = self.normalize(phrase)
                if normalized:
                    terms.append((normalized, dimension.id))
        return tuple(terms)

    def dictionary_dimensions(self) -> tuple[DimensionDefinition, ...]:
        self._ensure_loaded()
        return tuple(
            item
            for item in self._dimensions.values()
            if item.value_dictionary and item.matching.strategy not in {"doris_ngram", "sql_ngram"}
        )

    def find_metric_id(self, normalized_value: str) -> str | None:
        self._ensure_loaded()
        normalized_value = self.normalize(normalized_value)
        for phrase, metric_id in self.metric_terms():
            if phrase == normalized_value:
                return metric_id
        return None

    def get_dimension(self, dimension_id: str) -> DimensionDefinition | None:
        self._ensure_loaded()
        return self._dimensions.get(dimension_id)

    def table_for(
        self,
        metric_id: str | None,
        dimension_ids: tuple[str, ...] | list[str],
    ) -> TableDefinition | None:
        """Choose one fact table from compatible metric/dimension evidence.

        A shared dictionary value (for example a channel name) can match the
        Channel and Program table.  If that weak evidence conflicts, retain the
        configured dashboard default instead of guessing a cross-table query.
        Explicit dimension terms are handled by the caller before this method.
        """
        self._ensure_loaded()
        metric = self._metrics.get(metric_id) if metric_id else None
        candidates = set(metric.source_tables if metric else self._tables)
        if metric is None and dimension_ids:
            # Shared aliases such as "kênh" can produce one dimension per fact
            # table. Prefer the table with the strongest dimension evidence;
            # keep the configured default only when the evidence is tied.
            evidence: dict[str, int] = {}
            for dimension_id in dimension_ids:
                dimension = self._dimensions.get(dimension_id)
                if dimension is not None:
                    evidence[dimension.table_id] = evidence.get(dimension.table_id, 0) + 1
            if evidence:
                strongest = max(evidence.values())
                strongest_tables = {
                    table_id for table_id, score in evidence.items() if score == strongest
                }
                default_table_id = self.default_table_id
                selected_table_id = (
                    default_table_id
                    if default_table_id in strongest_tables
                    else next(iter(strongest_tables))
                )
                candidates = {selected_table_id}
        for dimension_id in dimension_ids:
            dimension = self._dimensions.get(dimension_id)
            if not dimension:
                continue
            narrowed = candidates & {dimension.table_id}
            if narrowed:
                candidates = narrowed
            else:
                # Keep the prior candidate set; the caller will omit this
                # cross-table dictionary match from the final predicates.
                continue

        default_table_id = self.default_table_id
        if default_table_id and default_table_id in candidates:
            return self._tables[self.default_table_id]
        if len(candidates) == 1:
            return self._tables[next(iter(candidates))]
        return None

    def date_dimension_for(self, table_id: str) -> DimensionDefinition | None:
        self._ensure_loaded()
        return next(
            (
                dimension
                for dimension in self._dimensions.values()
                if dimension.table_id == table_id and dimension.semantic_type == "time"
            ),
            None,
        )

    def join_profile_for(self, profile_id: str | None) -> JoinProfile | None:
        self._ensure_loaded()
        return self._join_profiles.get(profile_id) if profile_id else None

    def metric_bundle_for(self, dimension_ids: tuple[str, ...] | list[str]) -> tuple[str, ...]:
        """Return the catalog-owned KPI bundle for the requested dimensions.

        A dimension bundle is intentionally a list of metric IDs, never SQL.
        With several dimensions, only metrics declared by every dimension are
        retained.  This prevents a first-match bundle from accepting an
        incompatible dimension later in the question.
        """
        self._ensure_loaded()
        bundles: list[tuple[str, ...]] = []
        for dimension_id in dimension_ids:
            dimension = self._dimensions.get(dimension_id)
            if dimension and dimension.metric_bundle:
                bundles.append(
                    tuple(
                        metric_id
                        for metric_id in dimension.metric_bundle
                        if metric_id in self._metrics
                        and self._metrics[metric_id].status == "active"
                    )
                )
        if not bundles:
            return ()
        shared = set(bundles[0])
        for bundle in bundles[1:]:
            shared.intersection_update(bundle)
        return tuple(metric_id for metric_id in bundles[0] if metric_id in shared)

    def dictionary_path(self, dimension: DimensionDefinition) -> Path | None:
        if not dimension.value_dictionary:
            return None
        path = self.rating_dir / dimension.value_dictionary
        return path if path.exists() else None

    def _ensure_loaded(self) -> None:
        if self._loaded:
            return
        self._domain = self._read_yaml(self._source_files["domain"], "domain.yaml")
        table_payload = self._read_yaml(self._source_files["tables"], "table.yaml")

        self._require(bool(self._domain.get("domain")), "domain.yaml must declare domain")

        for table_id, item in dict(table_payload.get("tables", {})).items():
            payload = dict(item or {})
            physical_name = str(payload.get("physical_name", "")).strip()
            self._require(bool(physical_name), f"table {table_id} has no physical_name")
            self._tables[str(table_id)] = TableDefinition(
                id=str(table_id),
                physical_name=physical_name,
                columns=tuple(str(value) for value in payload.get("columns", [])),
                grain=tuple(str(value) for value in payload.get("grain", [])),
                fact_family=(
                    str(payload["fact_family"]).strip()
                    if payload.get("fact_family")
                    else None
                ),
            )
        self._require(bool(self._tables), "table.yaml has no tables")

        metric_payload = self._read_yaml(self._source_files["metrics"], "metrics.yaml")
        dimension_payload = self._read_yaml(self._source_files["dimensions"], "dimensions.yaml")
        raw_metrics = metric_payload.get("metrics", {})
        metric_items = (
            (dict(item or {}) for item in raw_metrics)
            if isinstance(raw_metrics, list)
            else (dict(item or {}) for item in dict(raw_metrics).values())
        )
        for payload in metric_items:
            metric_id = str(payload.get("id", "")).strip()
            self._require(metric_id and metric_id not in self._metrics, "metric id is missing or duplicated")
            status = str(payload.get("status", "active"))
            source_tables = tuple(str(value) for value in payload.get("source_tables", []))
            if status == "active":
                self._require(bool(payload.get("output_alias")), f"metric {metric_id} has no output_alias")
                self._require(bool(source_tables), f"metric {metric_id} has no source_tables")
                self._require(bool(payload.get("recipe")), f"metric {metric_id} has no recipe")
                self._require(bool(payload.get("description")), f"metric {metric_id} has no description")
                self._require(bool(payload.get("fact_family")), f"metric {metric_id} has no fact_family")
                self._require(bool(payload.get("semantic_key")), f"metric {metric_id} has no semantic_key")
            self._require(all(value in self._tables for value in source_tables), f"metric {metric_id} uses unknown table")
            self._metrics[metric_id] = MetricDefinition(
                id=metric_id,
                label=str(payload.get("label", metric_id)),
                description=str(payload.get("description", "")).strip(),
                aliases=tuple(str(value) for value in payload.get("aliases", [])),
                expression=str(payload.get("expression", "")).strip(),
                output_alias=str(payload.get("output_alias", "")).strip(),
                source_tables=source_tables,
                status=status,
                recipe=str(payload.get("recipe", "")).strip(),
                calculation=(str(payload["calculation"]) if payload.get("calculation") else None),
                required_joins=tuple(str(value) for value in payload.get("required_joins", [])),
                required_measures=tuple(str(value) for value in payload.get("required_measures", [])),
                join_profile=(str(payload["join_profile"]) if payload.get("join_profile") else None),
                supported_dimensions=tuple(
                    str(value) for value in payload.get("supported_dimensions", [])
                ),
                required_dimensions=tuple(
                    str(value) for value in payload.get("required_dimensions", [])
                ),
                default_dimensions=tuple(str(value) for value in payload.get("default_dimensions", [])),
                fact_family=str(payload.get("fact_family", "")).strip(),
                semantic_key=str(payload.get("semantic_key", "")).strip(),
                denominator_scope=str(payload.get("denominator_scope", "none")).strip(),
                unit=(str(payload["unit"]).strip() if payload.get("unit") else None),
                disambiguation=(
                    str(payload["disambiguation"]).strip()
                    if payload.get("disambiguation")
                    else None
                ),
            )

        self._load_join_profiles(table_payload.get("join_profiles", {}))
        self._constants = dict(table_payload.get("constants", {}) or {})

        for item in dimension_payload.get("dimensions", []):
            payload = dict(item or {})
            matching_payload = dict(payload.get("matching", {}) or {})
            dimension_id = str(payload.get("id", "")).strip()
            table_id = str(payload.get("table", "")).strip()
            self._require(dimension_id and dimension_id not in self._dimensions, "dimension id is missing or duplicated")
            self._require(table_id in self._tables, f"dimension {dimension_id} uses unknown table")
            column = str(payload.get("column", "")).strip()
            self._require(bool(column), f"dimension {dimension_id} has no column")
            self._dimensions[dimension_id] = DimensionDefinition(
                id=dimension_id,
                table_id=table_id,
                column=column,
                label=str(payload.get("label", dimension_id)),
                aliases=tuple(str(value) for value in payload.get("aliases", [])),
                semantic_type=str(payload.get("semantic_type", "categorical")),
                filterable=bool(payload.get("filterable", True)),
                group_by=bool(payload.get("group_by", True)),
                value_dictionary=(str(payload["value_dictionary"]) if payload.get("value_dictionary") else None),
                free_text=bool(payload.get("free_text", False)),
                metric_bundle=tuple(str(value) for value in payload.get("metric_bundle", payload.get("metrics", [])) or ()),
                matching=DimensionMatchingDefinition(
                    strategy=str(
                        matching_payload.get(
                            "strategy",
                            "fuzzy" if payload.get("value_dictionary") else "exact",
                        )
                    ).strip(),
                    expose_values_to_llm=bool(
                        matching_payload.get("expose_values_to_llm", True)
                    ),
                    top_k=int(matching_payload.get("top_k", 5)),
                    minimum_score=float(matching_payload.get("minimum_score", 0.85)),
                    table=(
                        str(matching_payload["table"]).strip()
                        if matching_payload.get("table")
                        else None
                    ),
                    column=(
                        str(matching_payload["column"]).strip()
                        if matching_payload.get("column")
                        else None
                    ),
                    ngram_size=int(matching_payload.get("ngram_size", 4)),
                ),
            )
        self._require(bool(self._dimensions), "dimensions.yaml has no dimensions")
        self._loaded = True

    def _load_join_profiles(self, payload: Any) -> None:
        """Parse the small declarative JOIN contract from table.yaml."""
        for profile_id, raw_profile in dict(payload or {}).items():
            profile = dict(raw_profile or {})
            fact_table_id = str(profile.get("fact_table", "")).strip()
            self._require(fact_table_id in self._tables, f"join profile {profile_id} uses unknown fact table")
            joins: list[JoinDefinition] = []
            for raw_join in profile.get("joins", []) or []:
                item = dict(raw_join or {})
                name = str(item.get("name", "")).strip()
                table_id = str(item.get("table", "")).strip()
                self._require(bool(name) and table_id in self._tables, f"join profile {profile_id} has invalid join")
                columns = tuple(str(value) for value in item.get("columns", []))
                self._require(bool(columns), f"join {profile_id}.{name} has no selected columns")
                self._require(
                    all(value in self._tables[table_id].columns for value in columns),
                    f"join {profile_id}.{name} selects unknown column",
                )
                raw_on = item.get("on", item.get(True, []))
                join_on = tuple(
                    (str(pair[0]), str(pair[1]))
                    for pair in raw_on
                    if isinstance(pair, (list, tuple)) and len(pair) == 2
                )
                scalar = bool(item.get("scalar", False))
                self._require(bool(join_on) or scalar, f"join {profile_id}.{name} has no join keys")
                self._require(
                    all(
                        fact_column in self._tables[fact_table_id].columns
                        and dep_column in self._tables[table_id].columns
                        for fact_column, dep_column in join_on
                    ),
                    f"join {profile_id}.{name} uses unknown join column",
                )
                filters = tuple(
                    (str(key), str(value))
                    for key, value in dict(item.get("filters", {}) or {}).items()
                )
                self._require(
                    all(column in self._tables[table_id].columns for column, _ in filters),
                    f"join {profile_id}.{name} uses unknown filter column",
                )
                joins.append(JoinDefinition(name, table_id, columns, join_on, filters, scalar))
            self._join_profiles[str(profile_id)] = JoinProfile(str(profile_id), fact_table_id, tuple(joins))

    def _read_yaml(self, filename: str, logical_name: str | None = None) -> dict[str, Any]:
        path = self.rating_dir / filename
        if not path.exists():
            raise SemanticCatalogError(f"rating_semantic_file_not_found:{filename}")
        try:
            payload = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as exc:
            raise SemanticCatalogError(f"invalid_rating_semantic_file:{filename}") from exc
        if not isinstance(payload, dict):
            raise SemanticCatalogError(f"invalid_rating_semantic_file:{filename}")
        return self._normalize_payload(logical_name or filename, payload)

    def _normalize_payload(self, filename: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Adapt the compact Rating YAML contract to the typed internal form."""
        if filename == "metrics.yaml":
            raw_metrics = payload.get("metrics", {})
            if isinstance(raw_metrics, dict):
                normalized_metrics: list[dict[str, Any]] = []
                for name, item in raw_metrics.items():
                    metric = dict(item or {})
                    raw_aliases = metric.get("aliases") or metric.get("output_alias") or ()
                    if isinstance(raw_aliases, str):
                        raw_aliases = (raw_aliases,)
                    raw_sources = metric.get("source_tables") or (
                        (metric["source_table"],) if metric.get("source_table") else ()
                    )
                    if isinstance(raw_sources, str):
                        raw_sources = (raw_sources,)
                    source_tables = tuple(
                        table_id
                        for source in raw_sources
                        for table_id, table in self._tables.items()
                        if str(source) in {table_id, table.physical_name}
                    )
                    metric.update(
                        id=str(metric.get("id") or f"rating.{name}"),
                        label=str(metric.get("label") or str(name).replace("_", " ")),
                        aliases=tuple(str(value) for value in raw_aliases),
                        output_alias=str(metric.get("output_name") or name),
                        source_tables=source_tables,
                        status=str(
                            metric.get("status")
                            or (
                                "active"
                                if source_tables
                                and metric.get("recipe")
                                and (metric.get("expression") or metric.get("calculation"))
                                else "draft"
                            )
                        ),
                    )
                    normalized_metrics.append(metric)
                payload["metrics"] = normalized_metrics

        if filename == "dimensions.yaml":
            raw_dimensions = payload.get("dimensions", {})
            if isinstance(raw_dimensions, dict):
                flat_dimensions: list[dict[str, Any]] = []
                for table_id, items in raw_dimensions.items():
                    for item in items or ():
                        dimension = dict(item or {})
                        raw_id = str(dimension.get("id", "")).strip()
                        dimension["id"] = raw_id if "." in raw_id else f"{table_id}.{raw_id}"
                        dimension["table"] = table_id
                        flat_dimensions.append(dimension)
                payload["dimensions"] = flat_dimensions
        return payload

    @staticmethod
    def normalize(value: str) -> str:
        from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value

        return normalize_lookup_value(value)

    @staticmethod
    def _require(condition: bool, message: str) -> None:
        if not condition:
            raise SemanticCatalogError(message)
