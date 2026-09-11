"""Workflow 010: validate query plans before SQL rendering."""

from __future__ import annotations

import csv
import json
from collections.abc import Mapping
from dataclasses import dataclass, field

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.catalog_models import PatternSpec
from src.core.text_to_sql.query_plan import RatingQueryPlan
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value


@dataclass(frozen=True)
class ValidationResult:
    errors: tuple[str, ...] = field(default_factory=tuple)
    warnings: tuple[str, ...] = field(default_factory=tuple)

    @property
    def is_valid(self) -> bool:
        return not self.errors


class RatingQueryPlanValidator:
    """Reject plans outside the Rating YAML capabilities before SQL rendering."""

    def __init__(
        self,
        catalog: RatingCatalog | None = None,
        project_root=None,
        pattern_catalog: Mapping[str, PatternSpec] | None = None,
    ):
        self.catalog = catalog or RatingCatalog.load(project_root=project_root)
        self._patterns = pattern_catalog or self.catalog.patterns
        self._canonical_value_cache: dict[str, set[str]] = {}

    def validate(self, plan: RatingQueryPlan) -> ValidationResult:
        errors: list[str] = []
        warnings: list[str] = []
        shape = self.catalog.query_shapes.get(plan.query_shape)
        if shape is None:
            errors.append(f"unknown_query_shape:{plan.query_shape}")
        pattern = None
        if plan.pattern_name:
            pattern = self._patterns.get(plan.pattern_name)
            if pattern is None:
                errors.append(f"unknown_pattern:{plan.pattern_name}")
            elif pattern.query_shape != plan.query_shape:
                errors.append(f"pattern_shape_mismatch:{plan.pattern_name}:{plan.query_shape}")
            elif pattern.needs_limit and plan.limit is None:
                errors.append(f"pattern_limit_required:{plan.pattern_name}")
            if pattern:
                for field in pattern.required_spec_fields:
                    if not self._field_present(plan, field):
                        errors.append(f"pattern_{field}_required:{plan.pattern_name}")
        if plan.domain != self.catalog.domain_id:
            errors.append(f"unknown_domain:{plan.domain}")
            return ValidationResult(tuple(errors), tuple(warnings))

        metrics = tuple(self.catalog.metrics.get(item.id) for item in plan.metrics)
        for metric_ref, metric in zip(plan.metrics, metrics):
            if not metric:
                errors.append(f"unknown_metric:{metric_ref.id}")
                continue
            if metric.status != "active":
                errors.append(f"metric_not_active:{metric.id}")
                continue
            if metric.denominator_scope != plan.denominator_scope:
                errors.append(
                    f"metric_denominator_scope_mismatch:{metric.id}:{plan.denominator_scope}"
                )
            recipe = self.catalog.recipes.get(metric.recipe)
            if recipe is None:
                errors.append(f"unknown_recipe:{metric.recipe}")
                continue
            if recipe.requires_join_profile or metric.required_joins:
                profile = self.catalog.join_profile_for(metric.join_profile)
                if profile is None:
                    errors.append(f"missing_join_profile:{metric.join_profile}")
                elif profile.fact_table_id not in metric.source_tables:
                    errors.append(f"join_fact_table_mismatch:{metric.id}")
                declared_joins = {item.name for item in profile.joins} if profile else set()
                for join_name in metric.required_joins:
                    if join_name not in declared_joins:
                        errors.append(f"missing_required_join:{metric.id}:{join_name}")
            if recipe.fact_contract:
                try:
                    contract = self.catalog.require_fact_contract(recipe.fact_contract)
                except KeyError:
                    errors.append(f"missing_fact_contract:{metric.id}:{recipe.fact_contract}")
                else:
                    if contract.table_id not in metric.source_tables:
                        errors.append(f"metric_fact_contract_table_mismatch:{metric.id}")

        filter_fields = {item.field: item for item in plan.filters}
        for dimension_id in plan.dimensions:
            dimension = self.catalog.get_dimension(dimension_id)
            if not dimension:
                errors.append(f"unknown_dimension:{dimension_id}")
            elif not dimension.group_by:
                errors.append(f"group_by_not_allowed:{dimension_id}")
            elif dimension_id in filter_fields:
                predicate = filter_fields[dimension_id]
                values = predicate.value if isinstance(predicate.value, tuple) else (predicate.value,)
                if len(values) <= 1:
                    warnings.append(f"group_by_redundant_due_to_filter:{dimension_id}")

        selected_order_fields = {
            *(item.id for item in plan.metrics),
            *plan.dimensions,
        }
        order_directions: dict[str, str] = {}
        for item in plan.order_by:
            if item.direction not in {"asc", "desc"}:
                errors.append(f"order_direction_not_allowed:{item.field}:{item.direction}")
            if item.field not in selected_order_fields:
                errors.append(f"order_field_not_selected:{item.field}")
            prior_direction = order_directions.get(item.field)
            if prior_direction and prior_direction != item.direction:
                errors.append(f"ambiguous_order_by:{item.field}")
            elif prior_direction:
                errors.append(f"duplicate_order_by:{item.field}")
            else:
                order_directions[item.field] = item.direction

        for predicate in plan.filters:
            dimension = self.catalog.get_dimension(predicate.field)
            if not dimension:
                errors.append(f"unknown_filter_dimension:{predicate.field}")
                continue
            if not dimension.filterable:
                errors.append(f"filter_not_allowed:{predicate.field}")
            if predicate.operator not in {"eq", "in"}:
                errors.append(f"operator_not_allowed:{predicate.field}:{predicate.operator}")
            if not dimension.value_dictionary and dimension.matching.strategy not in {"doris_ngram", "sql_ngram"}:
                errors.append(f"dictionary_filter_required:{predicate.field}")
            elif dimension.value_dictionary:
                values = predicate.value if isinstance(predicate.value, tuple) else (predicate.value,)
                for value in values:
                    if not self._is_canonical_value(dimension.id, str(value)):
                        errors.append(f"unresolved_filter_value:{predicate.field}:{value}")

        if plan.limit is not None and not 1 <= plan.limit <= self.catalog.maximum_limit:
            errors.append(f"limit_out_of_range:{plan.limit}")
        if shape:
            for field in shape.required_fields:
                if not self._field_present(plan, field):
                    errors.append(f"query_shape_{field}_required:{shape.id}")
            if len(plan.dimensions) < shape.min_dimensions:
                errors.append(shape.dimension_error or f"query_shape_requires_dimensions:{shape.id}")
            if shape.max_dimensions is not None and len(plan.dimensions) > shape.max_dimensions:
                errors.append(f"query_shape_too_many_dimensions:{shape.id}:{len(plan.dimensions)}")
            if shape.requires_order and not plan.order_by:
                errors.append(f"query_shape_requires_order:{shape.id}")
            if shape.requires_limit and plan.limit is None:
                errors.append(f"query_shape_requires_limit:{shape.id}")
        if len(plan.dimensions) > self.catalog.maximum_dimensions:
            errors.append(f"too_many_dimensions:{len(plan.dimensions)}")

        requested = [*plan.dimensions, *(item.field for item in plan.filters)]
        primary_metric_id = plan.primary_metric.id if plan.primary_metric else None
        table = self.catalog.table_for(primary_metric_id, requested)
        if not table:
            errors.append("missing_compatible_table")
        else:
            for dimension_id in requested:
                dimension = self.catalog.get_dimension(dimension_id)
                if dimension and dimension.table_id != table.id:
                    errors.append(f"dimension_not_supported_by_table:{dimension_id}:{table.id}")

        if plan.denominator_scope != "none":
            category_dimension = "agg_info_program.category_level1"
            category_filters = tuple(
                item for item in plan.filters if item.field == category_dimension
            )
            if category_dimension not in plan.dimensions and not category_filters:
                errors.append("airtime_share_requires_category_context")
            selected_values = {
                str(value)
                for item in category_filters
                for value in (
                    item.value if isinstance(item.value, tuple) else (item.value,)
                )
            }
            if plan.denominator_scope == "all_categories":
                if selected_values and (
                    len(selected_values) != 1 or plan.pattern_name != "metric_lookup"
                ):
                    errors.append("airtime_single_share_requires_one_category_lookup")
                if not selected_values and plan.pattern_name != "share_distribution":
                    errors.append("airtime_all_distribution_requires_share_pattern")
            if plan.denominator_scope == "selected_categories":
                if len(selected_values) < 2:
                    errors.append("selected_category_share_requires_multiple_categories")
                if plan.pattern_name != "dimension_comparison":
                    errors.append("selected_category_share_requires_dimension_comparison")

        return ValidationResult(tuple(dict.fromkeys(errors)), tuple(dict.fromkeys(warnings)))

    @staticmethod
    def _field_present(plan: RatingQueryPlan, field: str) -> bool:
        values = {
            "metric": plan.metrics,
            "filters": plan.filters,
            "time_range": plan.time_range,
            "dimensions": plan.dimensions,
            "limit": plan.limit,
        }
        value = values[field]
        return value is not None and (not isinstance(value, tuple) or bool(value))

    def _is_canonical_value(self, dimension_id: str, value: str) -> bool:
        return normalize_lookup_value(value) in self._canonical_values(dimension_id)

    def _canonical_values(self, dimension_id: str) -> set[str]:
        if dimension_id in self._canonical_value_cache:
            return self._canonical_value_cache[dimension_id]
        dimension = self.catalog.get_dimension(dimension_id)
        path = self.catalog.dictionary_path(dimension) if dimension else None
        values: set[str] = set()
        if path and path.suffix == ".csv":
            with path.open("r", encoding="utf-8", newline="") as file:
                for row in csv.DictReader(file):
                    canonical = str(row.get("canonical_value", "")).strip()
                    if canonical and normalize_lookup_value(canonical) != "canonical value":
                        values.add(normalize_lookup_value(canonical))
        elif path and path.suffix == ".json":
            payload = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(payload, dict):
                values.update(normalize_lookup_value(str(item)) for item in payload)
        self._canonical_value_cache[dimension_id] = values
        return values
