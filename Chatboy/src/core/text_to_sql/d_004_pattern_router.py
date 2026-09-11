"""Workflow 004: classify a resolved question into a catalog-owned pattern."""

from __future__ import annotations

import json
import logging
import re
from collections.abc import Mapping
from typing import Any

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.catalog_models import PatternSpec
from src.core.text_to_sql.input_contracts import (
    ExtractedInput,
    NO_DASHBOARD_VALUE_ERROR,
)
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.semantic_extraction.normalization import (
    contains_lookup_phrase,
    normalize_lookup_value,
)

logger = logging.getLogger(__name__)


class PatternRouter:
    """Use an optional LLM classifier with deterministic fallback."""

    def __init__(
        self,
        llm_client: Any | None = None,
        pattern_catalog: Mapping[str, PatternSpec] | None = None,
        catalog: RatingCatalog | None = None,
    ):
        self._llm = llm_client
        self._catalog = catalog or RatingCatalog.load()
        self._patterns = pattern_catalog or self._catalog.patterns

    def classify(self, extracted: ExtractedInput, components: ResolvedSQLComponents) -> str:
        """Return one registered pattern; never let an LLM outage stop planning."""
        context = self._semantic_context(extracted, components)
        self._log_context(context)
        if not context["has_semantic_evidence"]:
            raise ValueError(NO_DASHBOARD_VALUE_ERROR)

        # Pattern là ý định phân tích. Metric đơn hay metric bundle chỉ được
        # compiler quyết định sau khi pattern đã được chọn.
        if self._llm is not None:
            try:
                pattern = self._llm_classify(extracted, context)
            except Exception as exc:
                pattern = self._rule_classify(extracted, components)
                self._log_decision("rules", pattern, reason="llm_failed", error=exc)
                return pattern
            if not self._pattern_is_compatible(pattern, components):
                rule_pattern = self._rule_classify(
                    extracted,
                    components,
                    allow_fallback=True,
                )
                self._log_decision(
                    "rules",
                    rule_pattern,
                    reason="llm_incompatible",
                    error=ValueError(f"llm_pattern_incompatible:{pattern}"),
                )
                return rule_pattern
            if not self._has_required_context(pattern, components):
                try:
                    rule_pattern = self._rule_classify(
                        extracted,
                        components,
                        allow_fallback=False,
                    )
                except ValueError:
                    # Giữ lại pattern LLM để PatternContextValidator trả đúng
                    # missing fields thay vì hạ xuống metric_lookup.
                    self._log_decision(
                        "llm",
                        pattern,
                        reason="context_validation_deferred",
                    )
                    return pattern
                self._log_decision(
                    "rules",
                    rule_pattern,
                    reason="llm_incompatible",
                    error=ValueError(f"llm_pattern_incompatible:{pattern}"),
                )
                return rule_pattern
            self._log_decision("llm", pattern)
            return pattern

        pattern = self._rule_classify(extracted, components)
        self._log_decision("rules", pattern, reason="llm_not_configured")
        return pattern

    def _pattern_is_compatible(
        self,
        pattern_id: str,
        components: ResolvedSQLComponents,
    ) -> bool:
        """Reject patterns whose current compute contract cannot consume the shape."""
        if pattern_id == "dimension_listing" and components.metric_id is not None:
            return False
        if pattern_id in ("dimension_breakdown", "dimension_listing"):
            filtered_fields = {item.dimension_id for item in components.filters}
            has_unfiltered_dimension = any(
                dimension_id not in filtered_fields
                for dimension_id in components.dimensions
            )
            has_grouped_filter = (
                self._patterns[pattern_id].group_filtered_dimensions
                and any(len(item.values) >= 2 for item in components.filters)
            )
            if not has_unfiltered_dimension and not has_grouped_filter:
                return False
        if pattern_id != "period_comparison":
            return True
        # period_comparison compares two period rows. A non-time GROUP BY adds
        # multiple rows per period, which requires per-group trend computation.
        return all(
            (dimension := self._catalog.get_dimension(dimension_id)) is not None
            and dimension.semantic_type == "time"
            for dimension_id in components.dimensions
        )

    def _has_required_context(
        self,
        pattern_id: str,
        components: ResolvedSQLComponents,
    ) -> bool:
        pattern = self._patterns[pattern_id]
        fields = set(pattern.required_spec_fields)
        if "metric" in fields:
            bundle_context = tuple(
                dict.fromkeys(
                    (*components.dimensions, *(item.dimension_id for item in components.filters))
                )
            )
            if not components.metric_id and not self._catalog.metric_bundle_for(bundle_context):
                return False
        if "filters" in fields and not components.filters:
            return False
        if "dimensions" in fields:
            filtered_fields = {item.dimension_id for item in components.filters}
            has_unfiltered_dimension = any(
                dimension_id not in filtered_fields
                for dimension_id in components.dimensions
            )
            has_grouped_filter = pattern.group_filtered_dimensions and any(
                len(item.values) >= 2
                for item in components.filters
            )
            if (
                not has_unfiltered_dimension
                and not has_grouped_filter
                and not pattern.requires_time_dimension
            ):
                return False
        return True

    @staticmethod
    def _log_decision(
        source: str,
        pattern: str,
        *,
        reason: str | None = None,
        error: Exception | None = None,
    ) -> None:
        """Log one final classification decision with its actual source."""
        details = [f"source={source}", f"pattern={pattern}"]
        if reason:
            details.append(f"reason={reason}")
        if error is not None:
            details.append(f"error={error}")
        message = "[PatternRouter] " + " ".join(details)
        if error is not None:
            logger.warning(message)
        else:
            logger.info(message)

    @staticmethod
    def _log_context(context: dict[str, Any]) -> None:
        logger.info(
            "[PatternRouter] stage=input explicit_metric=%s dimensions=%s filters=%s "
            "filter_values=%s time_expressions=%s bundle_size=%s",
            str(context["explicit_metric"]).lower(),
            len(context["dimensions"]),
            len(context["filter_dimensions"]),
            max(context["filter_value_counts"].values(), default=0),
            len(context["time_expressions"]),
            len(context["metric_bundle"]),
        )

    def _semantic_context(
        self,
        extracted: ExtractedInput,
        components: ResolvedSQLComponents,
    ) -> dict[str, Any]:
        dimensions = tuple(components.dimensions)
        filter_dimensions = tuple(dict.fromkeys(item.dimension_id for item in components.filters))
        filter_value_counts = {
            item.dimension_id: len(item.values)
            for item in components.filters
        }
        bundle_context = tuple(dict.fromkeys((*dimensions, *filter_dimensions)))
        metric_bundle = (
            self._catalog.metric_bundle_for(bundle_context)
            if not components.metric_id and bundle_context
            else ()
        )
        time_expressions = tuple(
            entity.normalized_value
            for entity in extracted.entities
            if entity.kind == "time_expression"
        )
        return {
            "explicit_metric": bool(components.metric_id),
            "metric_id": components.metric_id,
            "dimensions": dimensions,
            "filter_dimensions": filter_dimensions,
            "filter_value_counts": filter_value_counts,
            "time_expressions": time_expressions,
            "metric_bundle": metric_bundle,
            "has_semantic_evidence": bool(components.metric_id or bundle_context),
        }

    def _llm_classify(self, extracted: ExtractedInput, context: dict[str, Any]) -> str:
        patterns_info = {}
        for name, spec in self._patterns.items():
            info: dict[str, Any] = {"description": spec.description}
            if spec.disambiguation:
                info["disambiguation"] = spec.disambiguation
            if spec.examples:
                info["examples"] = list(spec.examples)
            patterns_info[name] = info
        evidence = {
            "explicit_metric": context["explicit_metric"],
            "metric_id": context["metric_id"],
            "dimensions": context["dimensions"],
            "filter_dimensions": context["filter_dimensions"],
            "filter_value_counts": context["filter_value_counts"],
            "time_expressions": context["time_expressions"],
            "metric_bundle_if_needed": context["metric_bundle"],
        }
        prompt = (
            f'Câu hỏi: "{extracted.question}"\n\n'
            f"Semantic evidence đã resolve:\n"
            f"{json.dumps(evidence, ensure_ascii=False, indent=2)}\n\n"
            f"Các pattern phân tích khả dụng:\n"
            f"{json.dumps(patterns_info, ensure_ascii=False, indent=2)}\n\n"
            "Chỉ phân loại ý định phân tích. Không chọn metric; nếu không có metric đơn thì "
            "compiler sẽ sử dụng metric bundle của dimension.\n\n"
            "Trả về đúng một tên pattern từ danh sách, không giải thích."
        )
        response = self._llm.complete_text(
            prompt=prompt,
            system_prompt="Bạn là classifier BI. Chỉ trả về một tên pattern trong danh sách.",
            temperature=0.0,
            max_tokens=512,
        )
        pattern = self._parse_pattern_name(response)
        raw = " ".join(str(response).split())[:200]
        logger.info("[PatternRouter] stage=llm raw=%r parsed=%s", raw, pattern)
        return pattern

    def _parse_pattern_name(self, response: Any) -> str:
        """Extract a registry name from exact, fenced, or truncated LLM text."""
        raw = str(response).strip().strip("`").strip().strip('"').strip("'")
        normalized = raw.lower()
        if normalized in self._patterns:
            return normalized

        for name in sorted(self._patterns, key=len, reverse=True):
            if re.search(rf"(?<![a-z0-9_]){re.escape(name)}(?![a-z0-9_])", normalized):
                return name

        if re.fullmatch(r"[a-z_]+", normalized):
            candidates = [name for name in self._patterns if name.startswith(normalized)]
            if len(candidates) == 1:
                return candidates[0]
        raise ValueError(f"unknown_pattern_from_llm:{raw}")

    def _rule_classify(
        self,
        extracted: ExtractedInput,
        components: ResolvedSQLComponents,
        *,
        allow_fallback: bool = True,
    ) -> str:
        """Evaluate catalog-owned rules without knowing any concrete pattern ID."""
        text = extracted.normalized_question
        filtered_fields = {item.dimension_id for item in components.filters}
        has_dimensions = any(item not in filtered_fields for item in components.dimensions)
        time_expression_count = sum(
            entity.kind == "time_expression"
            for entity in extracted.entities
        )
        maximum_filter_values = max(
            (len(item.values) for item in components.filters),
            default=0,
        )
        matches: list[tuple[int, str]] = []
        fallbacks: list[tuple[int, str]] = []
        for pattern_id, pattern in self._patterns.items():
            for rule_index, rule in enumerate(pattern.routing):
                if rule.fallback:
                    if allow_fallback:
                        fallbacks.append((rule.priority, pattern_id))
                    logger.info(
                        "[PatternRouter] stage=rules pattern=%s rule=%s status=%s priority=%s",
                        pattern_id,
                        rule_index,
                        "fallback" if allow_fallback else "fallback_ignored",
                        rule.priority,
                    )
                    continue
                rejected: list[str] = []
                if rule.requires_metric is not None and bool(components.metric_id) != rule.requires_metric:
                    rejected.append(
                        f"requires_metric={str(rule.requires_metric).lower()}"
                    )
                if (
                    rule.requires_unfiltered_dimensions is not None
                    and has_dimensions != rule.requires_unfiltered_dimensions
                ):
                    rejected.append(
                        "requires_unfiltered_dimensions="
                        f"{str(rule.requires_unfiltered_dimensions).lower()}"
                    )
                if (
                    rule.minimum_time_expressions is not None
                    and time_expression_count < rule.minimum_time_expressions
                ):
                    rejected.append(
                        f"minimum_time_expressions={rule.minimum_time_expressions}"
                    )
                if (
                    rule.maximum_time_expressions is not None
                    and time_expression_count > rule.maximum_time_expressions
                ):
                    rejected.append(
                        f"maximum_time_expressions={rule.maximum_time_expressions}"
                    )
                if (
                    rule.minimum_filter_values is not None
                    and maximum_filter_values < rule.minimum_filter_values
                ):
                    rejected.append(
                        f"minimum_filter_values={rule.minimum_filter_values}"
                    )
                phrase_groups_match = all(
                    any(
                        contains_lookup_phrase(
                            text,
                            normalize_lookup_value(phrase),
                        )
                        for phrase in group
                    )
                    for group in rule.phrase_groups
                )
                if not phrase_groups_match:
                    rejected.append("phrase_groups")
                if rejected:
                    logger.info(
                        "[PatternRouter] stage=rules pattern=%s rule=%s status=rejected reasons=%s",
                        pattern_id,
                        rule_index,
                        ",".join(rejected),
                    )
                    continue
                matches.append((rule.priority, pattern_id))
                logger.info(
                    "[PatternRouter] stage=rules pattern=%s rule=%s status=matched priority=%s",
                    pattern_id,
                    rule_index,
                    rule.priority,
                )

        candidates = matches or fallbacks
        if not candidates:
            raise ValueError("no_matching_pattern_rule")
        highest_priority = max(priority for priority, _pattern_id in candidates)
        selected = {
            pattern_id
            for priority, pattern_id in candidates
            if priority == highest_priority
        }
        if len(selected) != 1:
            raise ValueError(f"ambiguous_pattern_rules:{','.join(sorted(selected))}")
        return next(iter(selected))
