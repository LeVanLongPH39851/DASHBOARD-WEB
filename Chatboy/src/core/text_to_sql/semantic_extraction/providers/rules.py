"""Catalog-only fallback when the LLM extractor is unavailable or malformed."""

from __future__ import annotations

import re
from dataclasses import dataclass

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.semantic_extraction.catalog_context import CatalogContext
from src.core.text_to_sql.semantic_extraction.contracts import ExtractedDimension, SemanticExtractionResult
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value
from src.core.text_to_sql.semantic_memory import CanonicalMemory


@dataclass(frozen=True)
class _ValueMatch:
    start: int
    end: int
    dimension_id: str
    raw_value: str


class RuleSemanticExtractionProvider:
    """Deterministic fallback for catalog phrases and known canonical values."""

    def __init__(self, catalog: RatingCatalog, memory: CanonicalMemory):
        self._catalog = catalog
        self._memory = memory

    def extract(self, question: str, context: CatalogContext) -> SemanticExtractionResult:
        normalized = normalize_lookup_value(question)
        term_dimensions = self._dimension_terms(normalized)
        value_matches = self._longest_value_matches(normalized)

        values_by_dimension: dict[str, list[str]] = {}
        for match in value_matches:
            values_by_dimension.setdefault(match.dimension_id, []).append(match.raw_value)
        dimension_ids = tuple(dict.fromkeys((*term_dimensions, *values_by_dimension)))
        metric_id = self._metric_id(
            normalized,
            dimension_ids,
            max((len(values) for values in values_by_dimension.values()), default=0),
        )
        metric_id = self._align_metric_to_dimensions(metric_id, dimension_ids)
        dimensions: list[ExtractedDimension] = []
        for dimension_id in dimension_ids:
            values = tuple(dict.fromkeys(values_by_dimension.get(dimension_id, ())))
            role = "filter" if values else self._dimension_role(normalized, dimension_id)
            dimension = self._catalog.get_dimension(dimension_id)
            if dimension and dimension.free_text and not values and role == "filter":
                return SemanticExtractionResult(
                    question=question,
                    metric_id=metric_id,
                    dimensions=(),
                    source="rules",
                    error=f"semantic_extraction_llm_required:{dimension_id}",
                    output_text=(
                        f'Không thể xác định canonical value cho "{dimension.label}" '
                        "khi LLM extraction không khả dụng."
                    ),
                )
            dimensions.append(
                ExtractedDimension(
                    dimension_id=dimension_id,
                    raw_values=values,
                    roles=(role,),
                )
            )

        if metric_id is None and not dimensions:
            return SemanticExtractionResult(
                question=question,
                metric_id=None,
                dimensions=(),
                source="rules",
                error="Không có giá trị nào phục vụ dashboard",
                output_text="Không có giá trị nào phục vụ dashboard",
            )
        return SemanticExtractionResult(
            question=question,
            metric_id=metric_id,
            dimensions=tuple(dimensions),
            source="rules",
        )

    def _metric_id(
        self,
        normalized_question: str,
        dimension_ids: tuple[str, ...],
        maximum_value_count: int,
    ) -> str | None:
        matches = [
            (len(phrase), phrase, metric_id)
            for phrase, metric_id in self._catalog.metric_terms()
            if self._contains(normalized_question, phrase)
        ]
        exact_metric = max(matches, key=lambda item: (item[0], item[1]))[2] if matches else None
        percentage_requested = any(
            self._contains(normalized_question, phrase)
            for phrase in ("percent", "ty le", "ty trong", "co cau")
        )
        comparison_requested = any(
            self._contains(normalized_question, phrase)
            for phrase in ("so sanh", "so voi", "vs")
        )
        preferred_scope = (
            "selected_categories"
            if comparison_requested and maximum_value_count >= 2
            else "all_categories"
        )
        # Exact metric term mạnh hơn token heuristic, trừ trường hợp câu hỏi
        # chuyển một metric tuyệt đối thành share hoặc yêu cầu đổi denominator
        # từ all_categories sang selected_categories.
        if exact_metric is not None:
            metric = self._catalog.require_metric(exact_metric)
            is_percent_metric = bool(
                metric.unit == "percent"
                or metric.semantic_key.endswith("percent")
            )
            scope_compatible = bool(
                metric.denominator_scope == "none"
                or metric.denominator_scope == preferred_scope
            )
            if not percentage_requested or (is_percent_metric and scope_compatible):
                return exact_metric
        if not percentage_requested:
            return exact_metric

        fact_families = {
            table.fact_family
            for dimension_id in dimension_ids
            if (dimension := self._catalog.get_dimension(dimension_id)) is not None
            and (table := self._catalog.tables.get(dimension.table_id)) is not None
            and table.fact_family
        }
        question_tokens = set(normalized_question.split())
        candidates: list[tuple[int, int, str]] = []
        for metric in self._catalog.metrics.values():
            if metric.status != "active" or metric.unit != "percent":
                continue
            if fact_families and metric.fact_family not in fact_families:
                continue
            phrases = tuple(
                normalize_lookup_value(value)
                for value in (metric.label, *metric.aliases)
            )
            overlap = max(
                (len(question_tokens & set(phrase.split())) for phrase in phrases),
                default=0,
            )
            if overlap < 2:
                continue
            scope_priority = int(metric.denominator_scope == preferred_scope)
            candidates.append((scope_priority, overlap, metric.id))
        if candidates:
            return max(candidates, key=lambda item: (item[0], item[1], item[2]))[2]
        return exact_metric

    def _align_metric_to_dimensions(
        self,
        metric_id: str | None,
        dimension_ids: tuple[str, ...],
    ) -> str | None:
        if metric_id is None:
            return None
        metric = self._catalog.metrics.get(metric_id)
        if metric is None:
            return metric_id
        fact_families = {
            table.fact_family
            for dimension_id in dimension_ids
            if (dimension := self._catalog.get_dimension(dimension_id)) is not None
            and (table := self._catalog.tables.get(dimension.table_id)) is not None
            and table.fact_family
        }
        program_exclusive = {
            "agg_info_program.program_name",
            "agg_info_program.category_level1",
            "agg_info_program.category_level2",
            "agg_info_program.start_time",
            "agg_info_program.end_time",
        }
        if any(d in program_exclusive for d in dimension_ids) and metric.fact_family != "program":
            aligned = self._catalog.metric_for_semantic_key("program", metric.semantic_key)
            return aligned.id if aligned is not None else metric_id

        non_time_dimensions = [
            dim_id
            for dim_id in dimension_ids
            if (dim := self._catalog.get_dimension(dim_id)) and dim.semantic_type != "time"
        ]
        non_time_fact_families = {
            table.fact_family
            for dimension_id in non_time_dimensions
            if (dimension := self._catalog.get_dimension(dimension_id)) is not None
            and (table := self._catalog.tables.get(dimension.table_id)) is not None
            and table.fact_family
        }
        target_families = non_time_fact_families or fact_families
        if metric.fact_family in target_families or len(target_families) != 1:
            return metric_id
        aligned = self._catalog.metric_for_semantic_key(
            next(iter(target_families)),
            metric.semantic_key,
        )
        return aligned.id if aligned is not None else metric_id

    def _dimension_terms(self, normalized_question: str) -> tuple[str, ...]:
        return tuple(
            dict.fromkeys(
                dimension_id
                for phrase, dimension_id in self._catalog.dimension_terms()
                if self._contains(normalized_question, phrase)
            )
        )

    def _longest_value_matches(self, normalized_question: str) -> tuple[_ValueMatch, ...]:
        matches: list[_ValueMatch] = []
        for dimension in self._catalog.dictionary_dimensions():
            for record in self._memory.records_for(dimension.id):
                for raw_value in (record.canonical_value, *record.aliases):
                    phrase = normalize_lookup_value(raw_value)
                    if not phrase:
                        continue
                    for found in re.finditer(
                        r"(?<!\w)" + re.escape(phrase) + r"(?!\w)",
                        normalized_question,
                    ):
                        matches.append(
                            _ValueMatch(
                                found.start(),
                                found.end(),
                                dimension.id,
                                record.canonical_value,
                            )
                        )
        selected: list[_ValueMatch] = []
        for candidate in sorted(
            matches,
            key=lambda item: (-(item.end - item.start), item.start, item.dimension_id),
        ):
            if any(
                existing.start <= candidate.start
                and existing.end >= candidate.end
                and (existing.start, existing.end) != (candidate.start, candidate.end)
                for existing in selected
            ):
                continue
            selected.append(candidate)
        unique = {
            (item.start, item.end, item.dimension_id, item.raw_value): item
            for item in selected
        }
        return tuple(
            sorted(
                unique.values(),
                key=lambda item: (item.start, item.end, item.dimension_id),
            )
        )

    def _dimension_role(self, normalized_question: str, dimension_id: str) -> str:
        dimension = self._catalog.get_dimension(dimension_id)
        if dimension is None:
            return "group_by"
        phrases = tuple(
            normalize_lookup_value(value)
            for value in (dimension.label, *dimension.aliases)
            if normalize_lookup_value(value)
        )
        if any(
            self._contains(normalized_question, f"theo {phrase}")
            or self._contains(normalized_question, f"{phrase} nao")
            or self._contains(normalized_question, f"nhung {phrase} nao")
            or self._contains(normalized_question, f"cac {phrase} nao")
            or self._contains(normalized_question, f"top {phrase}")
            or self._contains(normalized_question, f"xep hang {phrase}")
            for phrase in phrases
        ):
            return "group_by"
        if dimension.semantic_type == "time":
            return "filter"
        return "filter" if dimension.free_text else "group_by"

    @staticmethod
    def _contains(text: str, phrase: str) -> bool:
        return bool(re.search(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", text))


__all__ = ("RuleSemanticExtractionProvider",)
