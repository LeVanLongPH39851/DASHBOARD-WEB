"""Single validated source of Rating semantic and analysis metadata."""

from __future__ import annotations

import importlib
import re
from dataclasses import replace
from pathlib import Path
from types import MappingProxyType
from typing import Any, Mapping

import yaml
from pydantic import ValidationError

from src.core.text_to_sql.catalog_models import (
    CalculationDefinition,
    CatalogManifest,
    FactContractDefinition,
    NarrationCatalogDefinition,
    NarrationPromptDefinition,
    PatternDefinition,
    PatternSpec,
    QueryShapeDefinition,
    RecipeDefinition,
    SemanticModuleManifest,
)
from src.core.text_to_sql.semantic_catalog import MetricDefinition, SemanticCatalogBase, SemanticCatalogError


class RatingCatalogError(SemanticCatalogError):
    """Unified Rating catalog is missing, unsafe, or internally inconsistent."""


class RatingCatalog(SemanticCatalogBase):
    """Immutable facade for every metadata registry used by the Rating pipeline."""

    _REQUIRED_FIELDS = frozenset(("metric", "filters", "time_range", "dimensions", "limit"))
    _FORBIDDEN_EXPRESSION = re.compile(
        r";|--|/\*|\*/|\b(?:select|from|join|union|insert|update|delete|drop|alter|create|with)\b",
        re.IGNORECASE,
    )
    _HANDLER_PATH = re.compile(r"^src\.core\.text_to_sql(?:\.[A-Za-z_][A-Za-z0-9_]*)+:[A-Za-z_][A-Za-z0-9_]*$")
    _PLACEHOLDER = re.compile(r"\{([A-Za-z_][A-Za-z0-9_]*)\}")
    _QUALIFIED_SYMBOL = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*\b")
    _WORD = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\b")
    _DENOMINATOR_SCOPES = frozenset(("none", "all_categories", "selected_categories"))
    _MATCHING_STRATEGIES = frozenset(("exact", "fuzzy", "doris_ngram", "sql_ngram"))

    def __init__(self, project_root: str | Path | None = None):
        root = Path(project_root or Path(__file__).resolve().parents[3])
        self._rating_dir = root / "data" / "dashboard" / "rating"
        self._manifest_path = self._rating_dir / "catalog.yaml"
        self._manifest = self._load_manifest(self._manifest_path)
        self._modules = self._load_modules(self._manifest.modules)
        source_files = self._manifest.sources.model_dump()
        self._validate_source_paths(source_files)
        super().__init__(
            project_root=root,
            source_files={
                "domain": source_files["domain"],
                "tables": source_files["tables"],
                "metrics": source_files["metrics"],
                "dimensions": source_files["dimensions"],
            },
        )
        self._catalog_loaded = False
        self._patterns: dict[str, PatternSpec] = {}
        self._query_shapes: dict[str, QueryShapeDefinition] = {}
        self._recipes: dict[str, RecipeDefinition] = {}
        self._recipe_handlers: dict[str, Any] = {}
        self._fact_contracts: dict[str, FactContractDefinition] = {}
        self._narration: NarrationCatalogDefinition | None = None

    @classmethod
    def load(cls, project_root: str | Path | None = None) -> "RatingCatalog":
        catalog = cls(project_root=project_root)
        catalog._ensure_loaded()
        return catalog

    @property
    def manifest_path(self) -> Path:
        return self._manifest_path

    @property
    def maximum_dimensions(self) -> int:
        return self._manifest.maximum_dimensions

    @property
    def patterns(self) -> Mapping[str, PatternSpec]:
        self._ensure_loaded()
        return MappingProxyType(self._patterns)

    @property
    def query_shapes(self) -> Mapping[str, QueryShapeDefinition]:
        self._ensure_loaded()
        return MappingProxyType(self._query_shapes)

    @property
    def recipes(self) -> Mapping[str, RecipeDefinition]:
        self._ensure_loaded()
        return MappingProxyType(self._recipes)

    @property
    def fact_contracts(self) -> Mapping[str, FactContractDefinition]:
        self._ensure_loaded()
        return MappingProxyType(self._fact_contracts)

    @property
    def narration(self) -> NarrationCatalogDefinition:
        self._ensure_loaded()
        if self._narration is None:
            raise RatingCatalogError("narration_catalog_not_loaded")
        return self._narration

    @property
    def metrics(self) -> Mapping[str, MetricDefinition]:
        self._ensure_loaded()
        return MappingProxyType(self._metrics)

    @property
    def tables(self) -> Mapping[str, Any]:
        self._ensure_loaded()
        return MappingProxyType(self._tables)

    @property
    def dimensions(self) -> Mapping[str, Any]:
        self._ensure_loaded()
        return MappingProxyType(self._dimensions)

    @property
    def join_profiles(self) -> Mapping[str, Any]:
        self._ensure_loaded()
        return MappingProxyType(self._join_profiles)

    def require_pattern(self, pattern_id: str) -> PatternSpec:
        self._ensure_loaded()
        try:
            return self._patterns[pattern_id]
        except KeyError as exc:
            raise KeyError(f"unknown_pattern:{pattern_id}") from exc

    def require_query_shape(self, shape_id: str) -> QueryShapeDefinition:
        self._ensure_loaded()
        try:
            return self._query_shapes[shape_id]
        except KeyError as exc:
            raise KeyError(f"unknown_query_shape:{shape_id}") from exc

    def require_recipe(self, recipe_id: str) -> RecipeDefinition:
        self._ensure_loaded()
        try:
            return self._recipes[recipe_id]
        except KeyError as exc:
            raise KeyError(f"unknown_recipe:{recipe_id}") from exc

    def require_fact_contract(self, contract_id: str) -> FactContractDefinition:
        self._ensure_loaded()
        try:
            return self._fact_contracts[contract_id]
        except KeyError as exc:
            raise KeyError(f"unknown_fact_contract:{contract_id}") from exc

    def require_narration_prompt(self, prompt_id: str) -> NarrationPromptDefinition:
        try:
            return self.narration.prompts[prompt_id]
        except KeyError as exc:
            raise KeyError(f"unknown_narration_prompt:{prompt_id}") from exc

    def require_metric(self, metric_id: str) -> MetricDefinition:
        self._ensure_loaded()
        try:
            return self._metrics[metric_id]
        except KeyError as exc:
            raise KeyError(f"unknown_metric:{metric_id}") from exc

    def metric_for_semantic_key(
        self,
        fact_family: str,
        semantic_key: str,
    ) -> MetricDefinition | None:
        """Return the one active metric declared for a fact family and semantic key."""
        self._ensure_loaded()
        matches = tuple(
            metric
            for metric in self._metrics.values()
            if metric.status == "active"
            and metric.fact_family == fact_family
            and metric.semantic_key == semantic_key
        )
        return matches[0] if len(matches) == 1 else None

    def recipe_handler(self, recipe_id: str) -> Any:
        self._ensure_loaded()
        try:
            return self._recipe_handlers[recipe_id]
        except KeyError as exc:
            raise KeyError(f"unknown_recipe_handler:{recipe_id}") from exc

    def calculation_for(self, metric: MetricDefinition) -> CalculationDefinition | None:
        recipe = self.require_recipe(metric.recipe)
        if not metric.calculation:
            return None
        return recipe.calculations.get(metric.calculation)

    def render_calculation(self, metric: MetricDefinition) -> str:
        calculation = self.calculation_for(metric)
        if calculation is None:
            raise RatingCatalogError(f"missing_calculation:{metric.id}:{metric.calculation}")
        expression = calculation.expression
        for name in self._PLACEHOLDER.findall(expression):
            value = self.constant(name)
            if not isinstance(value, (int, float)) or isinstance(value, bool):
                raise RatingCatalogError(f"calculation_constant_must_be_numeric:{metric.id}:{name}")
            expression = expression.replace("{" + name + "}", str(value))
        return expression

    def source_path(self, source: str) -> Path:
        try:
            filename = getattr(self._manifest.sources, source)
        except AttributeError as exc:
            raise KeyError(f"unknown_catalog_source:{source}") from exc
        return self._rating_dir / filename

    def _ensure_loaded(self) -> None:
        if self._catalog_loaded:
            return
        SemanticCatalogBase._ensure_loaded(self)
        self._load_fact_contracts()
        self._load_recipes()
        self._bind_metric_contracts()
        self._load_query_shapes()
        self._load_narration_prompts()
        self._load_patterns()
        self._catalog_loaded = True

    def _load_recipes(self) -> None:
        payload = self._read_catalog_source("recipes")
        raw_recipes = dict(payload.get("recipes") or {})
        for module_id in self._modules:
            calculation_payload = self._read_module_source(module_id, "calculations")
            measure_payload = self._read_module_source(module_id, "measures")
            recipe_id = str(calculation_payload.get("recipe_id", "")).strip()
            self._require(bool(recipe_id), f"semantic_module_has_no_recipe:{module_id}")
            self._require(recipe_id in raw_recipes, f"semantic_module_uses_unknown_recipe:{module_id}:{recipe_id}")
            recipe_payload = dict(raw_recipes[recipe_id] or {})
            self._require(
                not recipe_payload.get("calculations") and not recipe_payload.get("measures"),
                f"semantic_module_recipe_contract_duplicated:{module_id}:{recipe_id}",
            )
            recipe_payload["fact_contract"] = module_id
            recipe_payload["measures"] = dict(measure_payload.get("measures") or {})
            recipe_payload["calculations"] = dict(calculation_payload.get("calculations") or {})
            raw_recipes[recipe_id] = recipe_payload
        self._require(isinstance(raw_recipes, dict) and bool(raw_recipes), "recipes.yaml has no recipes")
        for raw_id, raw_item in raw_recipes.items():
            recipe_id = str(raw_id).strip()
            self._require(recipe_id not in self._recipes, f"duplicate_recipe:{recipe_id}")
            recipe = self._model(
                RecipeDefinition,
                {"id": recipe_id, **dict(raw_item or {})},
                f"invalid_recipe:{recipe_id}",
            )
            self._validate_handler_path(recipe.handler)
            if recipe.fact_contract:
                fact_contract = self._fact_contracts.get(recipe.fact_contract)
                self._require(
                    fact_contract is not None,
                    f"recipe_uses_unknown_fact_contract:{recipe_id}:{recipe.fact_contract}",
                )
                fact_table = self._tables[fact_contract.table_id]
                for measure_id, measure in recipe.measures.items():
                    self._require(
                        bool(self._WORD.fullmatch(measure.output_alias)),
                        f"measure_output_alias_invalid:{recipe_id}:{measure_id}",
                    )
                    self._validate_expression(
                        measure.expression,
                        recipe.allowed_functions,
                        fact_table.columns,
                        f"recipe_measure:{recipe_id}:{measure_id}",
                    )
            for calculation_id, calculation in recipe.calculations.items():
                if recipe.measures:
                    unknown_measures = set(calculation.required_measures) - set(recipe.measures)
                    self._require(
                        not unknown_measures,
                        f"calculation_uses_unknown_measure:{recipe_id}:{calculation_id}:"
                        f"{','.join(sorted(unknown_measures))}",
                    )
                if recipe.fact_contract:
                    fact_contract = self._fact_contracts[recipe.fact_contract]
                    unknown_grain = set(calculation.required_grain_keys) - set(fact_contract.base_grain)
                    self._require(
                        not unknown_grain,
                        f"calculation_uses_unknown_grain_key:{recipe_id}:{calculation_id}:"
                        f"{','.join(sorted(unknown_grain))}",
                    )
                self._validate_expression(
                    calculation.expression,
                    recipe.allowed_functions,
                    recipe.allowed_symbols,
                    f"recipe_calculation:{recipe_id}:{calculation_id}",
                )
            handler_type = self._load_symbol(recipe.handler)
            handler = handler_type() if isinstance(handler_type, type) else handler_type
            self._require(callable(getattr(handler, "render", None)), f"invalid_recipe_handler:{recipe_id}")
            self._require(
                recipe.default_limit is None
                or recipe.default_limit <= int(self._domain.get("maximum_limit", 0)),
                f"recipe_default_limit_out_of_range:{recipe_id}:{recipe.default_limit}",
            )
            validate_definition = getattr(handler, "validate_definition", None)
            if callable(validate_definition):
                try:
                    validate_definition(recipe)
                except ValueError as exc:
                    raise RatingCatalogError(f"invalid_recipe_contract:{recipe_id}:{exc}") from exc
            self._recipes[recipe_id] = recipe
            self._recipe_handlers[recipe_id] = handler

    def _load_fact_contracts(self) -> None:
        for module_id in self._modules:
            payload = self._read_module_source(module_id, "fact")
            raw_contract = dict(payload.get("fact_contract") or {})
            contract = self._model(
                FactContractDefinition,
                {"id": module_id, **raw_contract},
                f"invalid_fact_contract:{module_id}",
            )
            self._require(
                contract.id == module_id,
                f"fact_contract_id_mismatch:{module_id}:{contract.id}",
            )
            self._require(
                contract.table_id in self._tables,
                f"fact_contract_uses_unknown_table:{module_id}:{contract.table_id}",
            )
            table = self._tables[contract.table_id]
            unknown_columns = (
                {contract.date_column, *contract.base_grain}
                | {predicate.column for predicate in contract.predicates}
            ) - set(table.columns)
            self._require(
                not unknown_columns,
                f"fact_contract_uses_unknown_column:{module_id}:{','.join(sorted(unknown_columns))}",
            )
            self._require(
                all(
                    not predicate.when_dimensions
                    or set(predicate.when_dimensions).issubset(self._dimensions)
                    for predicate in contract.predicates
                ),
                f"fact_contract_uses_unknown_dimension:{module_id}",
            )
            self._fact_contracts[module_id] = contract

    def _bind_metric_contracts(self) -> None:
        for dimension_id, dimension in self._dimensions.items():
            self._require(
                dimension.matching.strategy in self._MATCHING_STRATEGIES,
                f"dimension_uses_unknown_matching_strategy:{dimension_id}:{dimension.matching.strategy}",
            )
            self._require(
                dimension.matching.top_k > 0,
                f"dimension_matching_top_k_invalid:{dimension_id}",
            )
            self._require(
                0.0 <= dimension.matching.minimum_score <= 1.0,
                f"dimension_matching_score_invalid:{dimension_id}",
            )
            self._require(
                dimension.matching.strategy in {"exact", "doris_ngram", "sql_ngram"}
                or bool(dimension.value_dictionary),
                f"fuzzy_dimension_has_no_dictionary:{dimension_id}",
            )
        semantic_contracts: set[tuple[str, str]] = set()
        for metric_id, metric in tuple(self._metrics.items()):
            self._require(
                metric.denominator_scope in self._DENOMINATOR_SCOPES,
                f"metric_uses_unknown_denominator_scope:{metric_id}:{metric.denominator_scope}",
            )
            source_families = {
                self._tables[table_id].fact_family
                for table_id in metric.source_tables
                if self._tables[table_id].fact_family
            }
            self._require(
                source_families == {metric.fact_family},
                f"metric_fact_family_mismatch:{metric_id}:{metric.fact_family}",
            )
            self._require(
                all(
                    dimension_id in self._dimensions
                    and self._tables[self._dimensions[dimension_id].table_id].fact_family
                    == metric.fact_family
                    for dimension_id in metric.default_dimensions
                ),
                f"metric_default_dimension_mismatch:{metric_id}",
            )
            self._require(
                bool(metric.supported_dimensions),
                f"metric_has_no_supported_dimensions:{metric_id}",
            )
            self._require(
                all(
                    dimension_id in self._dimensions
                    and self._tables[self._dimensions[dimension_id].table_id].fact_family
                    == metric.fact_family
                    for dimension_id in metric.supported_dimensions
                ),
                f"metric_supported_dimension_mismatch:{metric_id}",
            )
            self._require(
                set(metric.required_dimensions).issubset(metric.supported_dimensions),
                f"metric_required_dimensions_not_supported:{metric_id}",
            )
            self._require(
                set(metric.default_dimensions).issubset(metric.supported_dimensions),
                f"metric_default_dimensions_not_supported:{metric_id}",
            )
            if metric.denominator_scope != "none":
                self._require(
                    metric.unit == "percent" and bool(metric.default_dimensions),
                    f"share_metric_contract_invalid:{metric_id}",
                )
            semantic_contract = (metric.fact_family, metric.semantic_key)
            self._require(
                semantic_contract not in semantic_contracts,
                f"duplicate_metric_semantic_contract:{metric.fact_family}:{metric.semantic_key}",
            )
            semantic_contracts.add(semantic_contract)
            recipe = self._recipes.get(metric.recipe)
            self._require(recipe is not None, f"metric_uses_unknown_recipe:{metric_id}:{metric.recipe}")
            calculation = None
            if metric.calculation:
                calculation = recipe.calculations.get(metric.calculation)
                self._require(
                    calculation is not None,
                    f"metric_uses_unknown_calculation:{metric_id}:{metric.calculation}",
                )
            elif recipe.calculations:
                self._require(False, f"metric_has_no_calculation:{metric_id}:{metric.recipe}")

            needs_join_profile = recipe.requires_join_profile or bool(
                calculation and calculation.required_joins
            )
            if needs_join_profile:
                self._require(bool(metric.join_profile), f"metric_has_no_join_profile:{metric_id}")
                profile = self._join_profiles.get(metric.join_profile or "")
                self._require(profile is not None, f"metric_uses_unknown_join_profile:{metric_id}")
                self._require(
                    profile.fact_table_id in metric.source_tables,
                    f"metric_join_profile_table_mismatch:{metric_id}:{profile.fact_table_id}",
                )
                if calculation:
                    declared_joins = {item.name for item in profile.joins}
                    missing_joins = set(calculation.required_joins) - declared_joins
                    self._require(
                        not missing_joins,
                        f"metric_join_profile_missing_joins:{metric_id}:{','.join(sorted(missing_joins))}",
                    )
            if calculation:
                self._metrics[metric_id] = replace(
                    metric,
                    required_joins=calculation.required_joins,
                    required_measures=calculation.required_measures,
                )
            else:
                self._require(bool(metric.expression), f"metric_has_no_expression:{metric_id}")
                symbols = {
                    column
                    for table_id in metric.source_tables
                    for column in self._tables[table_id].columns
                }
                self._validate_expression(
                    metric.expression,
                    recipe.allowed_functions,
                    tuple(symbols),
                    f"metric_expression:{metric_id}",
                )
        for dimension_id, dimension in self._dimensions.items():
            for metric_id in dimension.metric_bundle:
                metric = self._metrics.get(metric_id)
                self._require(
                    metric is not None and metric.status == "active",
                    f"dimension_bundle_uses_unknown_metric:{dimension_id}:{metric_id}",
                )
                self._require(
                    dimension_id in metric.supported_dimensions,
                    f"dimension_bundle_metric_not_supported:{dimension_id}:{metric_id}",
                )

    def _load_query_shapes(self) -> None:
        payload = self._read_catalog_source("query_shapes")
        raw_shapes = payload.get("query_shapes")
        self._require(isinstance(raw_shapes, dict) and bool(raw_shapes), "query_shapes.yaml has no shapes")
        for raw_id, raw_item in raw_shapes.items():
            shape_id = str(raw_id).strip()
            self._require(shape_id not in self._query_shapes, f"duplicate_query_shape:{shape_id}")
            shape = self._model(
                QueryShapeDefinition,
                {"id": shape_id, **dict(raw_item or {})},
                f"invalid_query_shape:{shape_id}",
            )
            self._require(
                all(field in self._REQUIRED_FIELDS for field in shape.required_fields),
                f"query_shape_uses_unknown_required_field:{shape_id}",
            )
            self._require(
                shape.max_dimensions is None or shape.max_dimensions >= shape.min_dimensions,
                f"query_shape_dimension_bounds_invalid:{shape_id}",
            )
            self._query_shapes[shape_id] = shape

    def _load_patterns(self) -> None:
        payload = self._read_catalog_source("patterns")
        raw_patterns = payload.get("patterns")
        self._require(isinstance(raw_patterns, dict) and bool(raw_patterns), "patterns_v3.yaml has no patterns")
        fallback_count = 0
        for raw_id, raw_item in raw_patterns.items():
            pattern_id = str(raw_id).strip()
            self._require(pattern_id not in self._patterns, f"duplicate_pattern:{pattern_id}")
            definition = self._model(
                PatternDefinition,
                {"id": pattern_id, **dict(raw_item or {})},
                f"invalid_pattern:{pattern_id}",
            )
            self._require(
                definition.query_shape in self._query_shapes,
                f"pattern_uses_unknown_query_shape:{pattern_id}:{definition.query_shape}",
            )
            self._require(
                all(field in self._REQUIRED_FIELDS for field in definition.required_fields),
                f"pattern_uses_unknown_required_field:{pattern_id}",
            )
            self._require(
                self._narration is not None
                and definition.narration_prompt_id in self._narration.prompts,
                f"pattern_uses_unknown_narration_prompt:{pattern_id}:{definition.narration_prompt_id}",
            )
            compute_fn = None
            if definition.compute_handler:
                self._validate_handler_path(definition.compute_handler)
                compute_fn = self._load_symbol(definition.compute_handler)
                self._require(callable(compute_fn), f"invalid_compute_handler:{pattern_id}")
            fallback_count += sum(1 for rule in definition.routing if rule.fallback)
            self._patterns[pattern_id] = PatternSpec(
                name=pattern_id,
                description=definition.description,
                query_shape=definition.query_shape,
                required_spec_fields=definition.required_fields,
                default_order=definition.default_order,
                needs_limit=definition.limit.required,
                default_limit=definition.limit.default,
                compute_name=definition.compute_handler,
                compute_fn=compute_fn,
                narration_prompt_id=definition.narration_prompt_id,
                requires_time_dimension=definition.requires_time_dimension,
                group_filtered_dimensions=definition.group_filtered_dimensions,
                context=definition.context,
                routing=definition.routing,
                disambiguation=definition.disambiguation,
                examples=definition.examples,
            )
        self._require(fallback_count == 1, f"pattern_routing_requires_one_fallback:{fallback_count}")

    def _load_narration_prompts(self) -> None:
        payload = self._read_catalog_source("narration_prompts")
        self._narration = self._model(
            NarrationCatalogDefinition,
            payload,
            "invalid_narration_prompts:narration_prompts.yaml",
        )

    def _read_catalog_source(self, source: str) -> dict[str, Any]:
        path = self.source_path(source)
        if not path.exists():
            raise RatingCatalogError(f"rating_catalog_source_not_found:{source}:{path.name}")
        try:
            payload = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as exc:
            raise RatingCatalogError(f"invalid_rating_catalog_source:{source}:{path.name}") from exc
        if not isinstance(payload, dict):
            raise RatingCatalogError(f"invalid_rating_catalog_source:{source}:{path.name}")
        return payload

    def _read_yaml(self, filename: str, logical_name: str | None = None) -> dict[str, Any]:
        """Đọc source gốc và hợp nhất metric fragments từ các semantic module."""
        payload = super()._read_yaml(filename, logical_name)
        if logical_name != "metrics.yaml" or not self._modules:
            return payload
        merged_metrics = list(payload.get("metrics") or ())
        for module_id in self._modules:
            module_payload = self._read_module_source(module_id, "metrics")
            normalized = self._normalize_payload("metrics.yaml", module_payload)
            merged_metrics.extend(normalized.get("metrics") or ())
        return {**payload, "metrics": merged_metrics}

    def _read_module_source(self, module_id: str, source: str) -> dict[str, Any]:
        manifest_path, manifest = self._modules[module_id]
        try:
            filename = getattr(manifest.sources, source)
        except AttributeError as exc:
            raise KeyError(f"unknown_semantic_module_source:{module_id}:{source}") from exc
        path = manifest_path.parent / filename
        if not path.exists():
            raise RatingCatalogError(
                f"semantic_module_source_not_found:{module_id}:{source}:{path.name}"
            )
        try:
            payload = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as exc:
            raise RatingCatalogError(
                f"invalid_semantic_module_source:{module_id}:{source}:{path.name}"
            ) from exc
        if not isinstance(payload, dict):
            raise RatingCatalogError(
                f"invalid_semantic_module_source:{module_id}:{source}:{path.name}"
            )
        return payload

    @classmethod
    def _load_manifest(cls, path: Path) -> CatalogManifest:
        if not path.exists():
            raise RatingCatalogError("rating_catalog_manifest_not_found:catalog.yaml")
        try:
            payload = yaml.safe_load(path.read_text(encoding="utf-8"))
            return CatalogManifest.model_validate(payload)
        except (yaml.YAMLError, ValidationError, TypeError) as exc:
            raise RatingCatalogError("invalid_rating_catalog_manifest:catalog.yaml") from exc

    def _load_modules(
        self,
        module_files: tuple[str, ...],
    ) -> dict[str, tuple[Path, SemanticModuleManifest]]:
        root = self._rating_dir.resolve()
        modules: dict[str, tuple[Path, SemanticModuleManifest]] = {}
        for filename in module_files:
            relative_path = Path(filename)
            path = (root / relative_path).resolve()
            if relative_path.is_absolute() or not path.is_relative_to(root):
                raise RatingCatalogError(f"catalog_module_outside_rating_dir:{filename}")
            if not path.exists():
                raise RatingCatalogError(f"catalog_module_not_found:{filename}")
            try:
                payload = yaml.safe_load(path.read_text(encoding="utf-8"))
                module = SemanticModuleManifest.model_validate(payload)
            except (yaml.YAMLError, ValidationError, TypeError) as exc:
                raise RatingCatalogError(f"invalid_catalog_module:{filename}") from exc
            if module.id in modules:
                raise RatingCatalogError(f"duplicate_catalog_module:{module.id}")
            for source, source_filename in module.sources.model_dump().items():
                source_path = (path.parent / source_filename).resolve()
                if Path(source_filename).is_absolute() or not source_path.is_relative_to(root):
                    raise RatingCatalogError(
                        f"semantic_module_source_outside_rating_dir:"
                        f"{module.id}:{source}:{source_filename}"
                    )
            modules[module.id] = (path, module)
        return modules

    def _validate_source_paths(self, source_files: dict[str, str]) -> None:
        root = self._rating_dir.resolve()
        for source, filename in source_files.items():
            path = Path(filename)
            if path.is_absolute() or not (root / path).resolve().is_relative_to(root):
                raise RatingCatalogError(f"catalog_source_outside_rating_dir:{source}:{filename}")

    @staticmethod
    def _model(model_type, payload: dict[str, Any], error: str):
        try:
            return model_type.model_validate(payload)
        except ValidationError as exc:
            raise RatingCatalogError(error) from exc

    @classmethod
    def _validate_handler_path(cls, handler: str) -> None:
        if not cls._HANDLER_PATH.fullmatch(handler):
            raise RatingCatalogError(f"untrusted_plugin_handler:{handler}")

    @staticmethod
    def _load_symbol(handler: str) -> Any:
        module_name, symbol_name = handler.split(":", 1)
        try:
            module = importlib.import_module(module_name)
            return getattr(module, symbol_name)
        except (ImportError, AttributeError) as exc:
            raise RatingCatalogError(f"plugin_handler_not_found:{handler}") from exc

    def _validate_expression(
        self,
        expression: str,
        allowed_functions: tuple[str, ...],
        allowed_symbols: tuple[str, ...],
        owner: str,
    ) -> None:
        if self._FORBIDDEN_EXPRESSION.search(expression):
            raise RatingCatalogError(f"unsafe_catalog_expression:{owner}")
        placeholders = set(self._PLACEHOLDER.findall(expression))
        unknown_constants = placeholders - set(self._constants)
        if unknown_constants:
            raise RatingCatalogError(
                f"unknown_catalog_expression_constant:{owner}:{','.join(sorted(unknown_constants))}"
            )
        scrubbed = self._PLACEHOLDER.sub("", expression)
        qualified = set(self._QUALIFIED_SYMBOL.findall(scrubbed))
        unknown_qualified = qualified - set(allowed_symbols)
        if unknown_qualified:
            raise RatingCatalogError(
                f"unknown_catalog_expression_symbol:{owner}:{','.join(sorted(unknown_qualified))}"
            )
        scrubbed = self._QUALIFIED_SYMBOL.sub("", scrubbed)
        function_names = {
            match.group(1)
            for match in re.finditer(r"\b([A-Za-z_][A-Za-z0-9_]*)\s*\(", scrubbed)
        }
        allowed_function_names = {value.upper() for value in allowed_functions}
        unknown_functions = {value for value in function_names if value.upper() not in allowed_function_names}
        if unknown_functions:
            raise RatingCatalogError(
                f"unknown_catalog_expression_function:{owner}:{','.join(sorted(unknown_functions))}"
            )
        scrubbed = re.sub(r"\b[A-Za-z_][A-Za-z0-9_]*\s*\(", "(", scrubbed)
        words = {
            value
            for value in self._WORD.findall(scrubbed)
            if value.upper() not in {"DISTINCT", "NULL", "TRUE", "FALSE"}
        }
        unknown_words = words - set(allowed_symbols)
        if unknown_words:
            raise RatingCatalogError(
                f"unknown_catalog_expression_symbol:{owner}:{','.join(sorted(unknown_words))}"
            )

    @staticmethod
    def _require(condition: bool, message: str) -> None:
        if not condition:
            raise RatingCatalogError(message)
