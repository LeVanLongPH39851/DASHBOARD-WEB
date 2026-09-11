"""Typed contracts owned by the unified Rating catalog facade."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from types import MappingProxyType
from typing import Any, Callable, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


ComputeFn = Callable[[list[dict[str, Any]], Any], Any]


class CatalogModel(BaseModel):
    """Immutable, strict base model for trusted deployment metadata."""

    model_config = ConfigDict(extra="forbid", frozen=True)


class CatalogSources(CatalogModel):
    domain: str = "domain.yaml"
    tables: str = "table.yaml"
    metrics: str = "metrics_v3.yaml"
    dimensions: str = "dimensions.yaml"
    patterns: str = "patterns_v3.yaml"
    query_shapes: str = "query_shapes.yaml"
    recipes: str = "recipes.yaml"
    narration_prompts: str = "narration_prompts.yaml"


class CatalogManifest(CatalogModel):
    version: int = 1
    maximum_dimensions: int = 3
    sources: CatalogSources = Field(default_factory=CatalogSources)
    modules: tuple[str, ...] = ()

    @field_validator("version")
    @classmethod
    def validate_version(cls, value: int) -> int:
        if value != 1:
            raise ValueError(f"unsupported_catalog_version:{value}")
        return value

    @field_validator("maximum_dimensions")
    @classmethod
    def validate_maximum_dimensions(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("maximum_dimensions_must_be_positive")
        return value

    @field_validator("modules")
    @classmethod
    def validate_modules(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        normalized = tuple(item.strip() for item in value)
        if any(not item for item in normalized) or len(normalized) != len(set(normalized)):
            raise ValueError("catalog_modules_are_empty_or_duplicated")
        return normalized


class SemanticModuleSources(CatalogModel):
    fact: str = "fact.yaml"
    measures: str = "measures.yaml"
    calculations: str = "calculations.yaml"
    metrics: str = "metrics.yaml"


class SemanticModuleManifest(CatalogModel):
    """Một module semantic độc lập được Catalog Facade hợp nhất lúc khởi động."""

    version: int = 1
    id: str
    sources: SemanticModuleSources = Field(default_factory=SemanticModuleSources)

    @field_validator("version")
    @classmethod
    def validate_version(cls, value: int) -> int:
        if value != 1:
            raise ValueError(f"unsupported_semantic_module_version:{value}")
        return value

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: str) -> str:
        value = value.strip()
        if not value or not value.replace("_", "").isalnum():
            raise ValueError("semantic_module_id_invalid")
        return value


class DefaultOrderDefinition(CatalogModel):
    target: Literal["primary_metric", "dimension"]
    direction: Literal["asc", "desc"]
    index: int = 0

    @field_validator("index")
    @classmethod
    def validate_index(cls, value: int) -> int:
        if value < 0:
            raise ValueError("default_order_index_must_be_non_negative")
        return value


class PatternLimitDefinition(CatalogModel):
    required: bool = False
    default: int | None = None

    @field_validator("default")
    @classmethod
    def validate_default(cls, value: int | None) -> int | None:
        if value is not None and value <= 0:
            raise ValueError("pattern_default_limit_must_be_positive")
        return value


class PatternContextDefinition(CatalogModel):
    """Điều kiện đầu vào cần có trước khi compiler được phép tạo plan."""

    requires_explicit_time: bool = False
    minimum_time_buckets: int = 1
    missing_time_fields: tuple[str, ...] = ("time_range",)
    clarification: str = ""
    suggestions: tuple[str, ...] = ()

    @field_validator("minimum_time_buckets")
    @classmethod
    def validate_minimum_time_buckets(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("minimum_time_buckets_must_be_positive")
        return value

    @field_validator("missing_time_fields", "suggestions")
    @classmethod
    def validate_non_empty_items(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        if any(not item.strip() for item in value):
            raise ValueError("pattern_context_items_must_not_be_empty")
        return tuple(item.strip() for item in value)


class RoutingRuleDefinition(CatalogModel):
    """One generic deterministic rule; every phrase group must match once."""

    priority: int
    phrase_groups: tuple[tuple[str, ...], ...] = ()
    requires_metric: bool | None = None
    requires_unfiltered_dimensions: bool | None = None
    minimum_time_expressions: int | None = None
    maximum_time_expressions: int | None = None
    minimum_filter_values: int | None = None
    fallback: bool = False

    @field_validator("phrase_groups")
    @classmethod
    def validate_phrase_groups(
        cls,
        value: tuple[tuple[str, ...], ...],
    ) -> tuple[tuple[str, ...], ...]:
        if any(not group or any(not phrase.strip() for phrase in group) for group in value):
            raise ValueError("routing_phrase_groups_must_not_be_empty")
        return value

    @field_validator(
        "minimum_time_expressions",
        "maximum_time_expressions",
        "minimum_filter_values",
    )
    @classmethod
    def validate_minimum_time_expressions(cls, value: int | None) -> int | None:
        if value is not None and value < 0:
            raise ValueError("minimum_time_expressions_must_be_non_negative")
        return value


class PatternDefinition(CatalogModel):
    id: str
    description: str
    disambiguation: str | None = None
    examples: tuple[str, ...] = ()
    query_shape: str
    required_fields: tuple[str, ...] = ()
    default_order: tuple[DefaultOrderDefinition, ...] = ()
    limit: PatternLimitDefinition = Field(default_factory=PatternLimitDefinition)
    compute_handler: str | None = None
    narration_prompt_id: str
    requires_time_dimension: bool = False
    group_filtered_dimensions: bool = False
    context: PatternContextDefinition = Field(default_factory=PatternContextDefinition)
    routing: tuple[RoutingRuleDefinition, ...] = ()

    @field_validator("id", "description", "query_shape", "narration_prompt_id")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("pattern_required_text_is_empty")
        return value

    @field_validator("disambiguation")
    @classmethod
    def validate_disambiguation(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            return None
        return value

    @field_validator("examples")
    @classmethod
    def validate_examples(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        if any(not item.strip() for item in value):
            raise ValueError("pattern_examples_must_not_be_empty")
        return tuple(item.strip() for item in value)


class NarrationDefaults(CatalogModel):
    """Giới hạn gọi LLM dùng chung cho mọi prompt diễn giải."""

    temperature: float = 0.0
    max_tokens: int = 1024
    maximum_rows: int = 100
    retry_count: int = 2

    @field_validator("temperature")
    @classmethod
    def validate_temperature(cls, value: float) -> float:
        if not 0.0 <= value <= 2.0:
            raise ValueError("narration_temperature_out_of_range")
        return value

    @field_validator("max_tokens", "maximum_rows", "retry_count")
    @classmethod
    def validate_positive_limits(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("narration_limit_must_be_positive")
        return value


class NarrationPromptDefinition(CatalogModel):
    """Prompt con quy định cách diễn giải một nhóm pattern."""

    instruction: str
    output_requirements: tuple[str, ...] = ()
    retry_instruction: str = "Hãy viết lại câu trả lời đầy đủ theo các yêu cầu trên."

    @field_validator("instruction", "retry_instruction")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("narration_prompt_text_is_empty")
        return value

    @field_validator("output_requirements")
    @classmethod
    def validate_output_requirements(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        if any(not item.strip() for item in value):
            raise ValueError("narration_output_requirement_is_empty")
        return tuple(item.strip() for item in value)


class NarrationCatalogDefinition(CatalogModel):
    """System prompt và các prompt con được quản lý như deployment metadata."""

    version: int = 1
    defaults: NarrationDefaults = Field(default_factory=NarrationDefaults)
    system_prompt: str
    prompts: Mapping[str, NarrationPromptDefinition]

    @field_validator("version")
    @classmethod
    def validate_version(cls, value: int) -> int:
        if value != 1:
            raise ValueError(f"unsupported_narration_catalog_version:{value}")
        return value

    @field_validator("system_prompt")
    @classmethod
    def validate_system_prompt(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("narration_system_prompt_is_empty")
        return value

    @field_validator("prompts")
    @classmethod
    def freeze_prompts(
        cls,
        value: Mapping[str, NarrationPromptDefinition],
    ) -> Mapping[str, NarrationPromptDefinition]:
        normalized = {str(key).strip(): item for key, item in value.items()}
        if not normalized or any(not key for key in normalized):
            raise ValueError("narration_prompts_are_empty_or_invalid")
        return MappingProxyType(normalized)


class QueryShapeDefinition(CatalogModel):
    id: str
    description: str
    required_fields: tuple[str, ...] = ()
    min_dimensions: int = 0
    max_dimensions: int | None = None
    requires_order: bool = False
    requires_limit: bool = False
    dimension_error: str | None = None

    @field_validator("id", "description")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("query_shape_required_text_is_empty")
        return value

    @field_validator("min_dimensions")
    @classmethod
    def validate_min_dimensions(cls, value: int) -> int:
        if value < 0:
            raise ValueError("query_shape_min_dimensions_must_be_non_negative")
        return value


class CalculationDefinition(CatalogModel):
    expression: str
    required_measures: tuple[str, ...] = ()
    required_joins: tuple[str, ...] = ()
    required_grain_keys: tuple[str, ...] = ()
    execution_strategy: Literal["aggregate", "scoped_denominator"] = "aggregate"

    @field_validator("expression")
    @classmethod
    def validate_expression_present(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("calculation_expression_is_empty")
        return value


class MeasureDefinition(CatalogModel):
    """Cách tạo một measure nền trong fact CTE của recipe."""

    expression: str
    output_alias: str

    @field_validator("expression", "output_alias")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("measure_required_text_is_empty")
        return value


class PredicateDefinition(CatalogModel):
    column: str
    operator: Literal["eq", "ne", "in", "not_in", "is_not_null"]
    values: tuple[str, ...] = ()
    parameter_prefix: str
    when_dimensions: tuple[str, ...] = ()

    @field_validator("column", "parameter_prefix")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("predicate_required_text_is_empty")
        return value

    @field_validator("values")
    @classmethod
    def validate_values(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        if any(not item.strip() for item in value):
            raise ValueError("predicate_value_is_empty")
        return tuple(item.strip() for item in value)


class FactContractDefinition(CatalogModel):
    """Grain và predicate cố định của một fact family."""

    id: str
    table_id: str
    date_column: str = "date"
    base_grain: tuple[str, ...]
    predicates: tuple[PredicateDefinition, ...] = ()

    @field_validator("id", "table_id", "date_column")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("fact_contract_required_text_is_empty")
        return value

    @field_validator("base_grain")
    @classmethod
    def validate_base_grain(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        normalized = tuple(item.strip() for item in value)
        if not normalized or any(not item for item in normalized):
            raise ValueError("fact_contract_base_grain_is_empty")
        return normalized


class RecipeDefinition(CatalogModel):
    id: str
    handler: str
    requires_join_profile: bool = False
    default_limit: int | None = None
    allowed_functions: tuple[str, ...] = ()
    allowed_symbols: tuple[str, ...] = ()
    fact_contract: str | None = None
    measures: Mapping[str, MeasureDefinition] = Field(default_factory=dict)
    calculations: Mapping[str, CalculationDefinition] = Field(default_factory=dict)

    @field_validator("id", "handler")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("recipe_required_text_is_empty")
        return value

    @field_validator("default_limit")
    @classmethod
    def validate_default_limit(cls, value: int | None) -> int | None:
        if value is not None and value <= 0:
            raise ValueError("recipe_default_limit_must_be_positive")
        return value

    @field_validator("calculations")
    @classmethod
    def freeze_calculations(
        cls,
        value: Mapping[str, CalculationDefinition],
    ) -> Mapping[str, CalculationDefinition]:
        return MappingProxyType(dict(value))

    @field_validator("measures")
    @classmethod
    def freeze_measures(
        cls,
        value: Mapping[str, MeasureDefinition],
    ) -> Mapping[str, MeasureDefinition]:
        return MappingProxyType(dict(value))


@dataclass(frozen=True)
class PatternSpec:
    """Runtime pattern contract resolved and validated by ``RatingCatalog``."""

    name: str
    description: str
    query_shape: str
    required_spec_fields: tuple[str, ...]
    default_order: tuple[DefaultOrderDefinition, ...]
    needs_limit: bool = False
    default_limit: int | None = None
    compute_name: str | None = None
    compute_fn: ComputeFn | None = None
    narration_prompt_id: str = ""
    requires_time_dimension: bool = False
    group_filtered_dimensions: bool = False
    context: PatternContextDefinition = field(default_factory=PatternContextDefinition)
    routing: tuple[RoutingRuleDefinition, ...] = ()
    disambiguation: str | None = None
    examples: tuple[str, ...] = ()
