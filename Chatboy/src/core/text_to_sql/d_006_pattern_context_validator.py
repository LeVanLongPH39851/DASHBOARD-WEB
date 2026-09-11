"""Workflow 006: validate required context for the selected pattern."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.catalog_models import PatternSpec
from src.core.text_to_sql.input_contracts import ExtractedInput
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.d_008_time_resolver import RatingTimeResolver


MISSING_PATTERN_CONTEXT_ERROR = "missing_pattern_context"


@dataclass(frozen=True)
class PatternContextValidation:
    """Kết quả kiểm tra context trước khi tạo ``RatingQueryPlan``."""

    pattern_name: str
    is_valid: bool
    missing_fields: tuple[str, ...] = ()
    message: str = ""
    suggestions: tuple[str, ...] = ()
    error: str | None = None

    @property
    def output_text(self) -> str:
        """Ghép thông báo và ví dụ thành output trực tiếp cho người dùng."""
        if not self.suggestions:
            return self.message
        examples = "\n".join(f"- {item}" for item in self.suggestions)
        return f"{self.message}\nGợi ý:\n{examples}"


class PatternContextValidator:
    """Resolve generic required fields and catalog-owned time requirements."""

    def __init__(
        self,
        catalog: RatingCatalog,
        time_resolver: RatingTimeResolver,
    ):
        self._catalog = catalog
        self._time_resolver = time_resolver

    def validate(
        self,
        extracted: ExtractedInput,
        components: ResolvedSQLComponents,
        pattern_name: str,
    ) -> PatternContextValidation:
        pattern = self._catalog.require_pattern(pattern_name)
        missing = self._missing_required_fields(extracted, components, pattern)
        time_range = self._time_resolver.resolve(extracted)
        has_explicit_time = any(
            entity.kind == "time_expression"
            for entity in extracted.entities
        )
        has_time_band = any(
            dim.endswith(".time_band") or dim == "time_band"
            for dim in (*components.dimensions, *(item.dimension_id for item in components.filters))
        )
        time_context_missing = (
            pattern.context.requires_explicit_time and not has_explicit_time and not has_time_band
        ) or (
            not has_time_band
            and self._time_bucket_count(
                time_range.start,
                time_range.end,
                time_range.grain,
            ) < pattern.context.minimum_time_buckets
        )
        if time_context_missing:
            missing.extend(pattern.context.missing_time_fields)

        missing_fields = tuple(dict.fromkeys(missing))
        if not missing_fields:
            return PatternContextValidation(pattern_name=pattern_name, is_valid=True)

        clarification = pattern.context.clarification or (
            "Hãy bổ sung các thông tin còn thiếu: " + ", ".join(missing_fields) + "."
        )
        return PatternContextValidation(
            pattern_name=pattern_name,
            is_valid=False,
            missing_fields=missing_fields,
            message=f"Thiếu context cho {pattern_name}. {clarification}",
            suggestions=pattern.context.suggestions,
            error=MISSING_PATTERN_CONTEXT_ERROR,
        )

    def _missing_required_fields(
        self,
        extracted: ExtractedInput,
        components: ResolvedSQLComponents,
        pattern: PatternSpec,
    ) -> list[str]:
        missing: list[str] = []
        for field_name in pattern.required_spec_fields:
            if field_name == "metric" and not self._has_metric(components):
                missing.append(field_name)
            elif field_name == "filters" and not components.filters:
                missing.append(field_name)
            elif field_name == "dimensions" and not self._has_dimension(components, pattern):
                missing.append(field_name)
            elif field_name == "limit" and not self._has_limit(extracted, pattern):
                missing.append(field_name)
        return missing

    def _has_metric(self, components: ResolvedSQLComponents) -> bool:
        if components.metric_id:
            return True
        context = tuple(
            dict.fromkeys(
                (*components.dimensions, *(item.dimension_id for item in components.filters))
            )
        )
        return bool(context and self._catalog.metric_bundle_for(context))

    @staticmethod
    def _has_dimension(
        components: ResolvedSQLComponents,
        pattern: PatternSpec,
    ) -> bool:
        filtered_fields = {item.dimension_id for item in components.filters}
        if any(item not in filtered_fields for item in components.dimensions):
            return True
        if pattern.group_filtered_dimensions and any(
            len(item.values) >= 2
            for item in components.filters
        ):
            return True
        # Compiler sẽ thêm date dimension từ fact table cho pattern thời gian.
        return pattern.requires_time_dimension

    @staticmethod
    def _has_limit(extracted: ExtractedInput, pattern: PatternSpec) -> bool:
        return bool(
            any(entity.kind == "limit" for entity in extracted.entities)
            or pattern.default_limit is not None
            or not pattern.needs_limit
        )

    @staticmethod
    def _time_bucket_count(start_value: str, end_value: str, grain: str) -> int:
        start = date.fromisoformat(start_value)
        end = date.fromisoformat(end_value)
        if end <= start:
            return 0
        if grain == "month":
            months = (end.year - start.year) * 12 + end.month - start.month
            if end.day > 1:
                months += 1
            return max(1, months)
        if grain == "week":
            return max(1, ((end - start).days + 6) // 7)
        return (end - start).days
