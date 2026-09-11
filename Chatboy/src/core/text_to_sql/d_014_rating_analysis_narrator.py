"""Workflow 014: narrate validated analysis with catalog prompts."""

from __future__ import annotations

import json
import logging
import re
import unicodedata
from dataclasses import dataclass
from typing import Any, Literal

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.catalog_models import NarrationPromptDefinition
from src.core.text_to_sql.query_plan import RatingQueryPlan


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RatingAnalysisOutput:
    """One final answer and the source that produced its wording."""

    text: str
    source: Literal["llm", "deterministic"]


class RatingAnalysisNarrator:
    """Let an optional LLM narrate facts already computed by the pipeline."""

    def __init__(
        self,
        llm_client: Any | None = None,
        catalog: RatingCatalog | None = None,
        maximum_rows: int | None = None,
    ):
        self._llm = llm_client
        self._catalog = catalog or RatingCatalog.load()
        defaults = self._catalog.narration.defaults
        self._system_prompt = self._catalog.narration.system_prompt
        self._temperature = defaults.temperature
        self._max_tokens = defaults.max_tokens
        self._maximum_rows = maximum_rows or defaults.maximum_rows
        self._retry_count = defaults.retry_count

    def narrate(
        self,
        plan: RatingQueryPlan,
        analysis: dict[str, Any],
    ) -> RatingAnalysisOutput:
        prompt = self._prompt_for(plan)
        if self._llm is not None and prompt is not None and not self._has_compute_error(analysis):
            try:
                text = self._llm_narrate(plan, analysis, prompt)
                if text:
                    return RatingAnalysisOutput(text=text, source="llm")
            except Exception as exc:
                logger.warning("LLM narration failed; using deterministic output (%s)", exc)
        return RatingAnalysisOutput(
            text=self._deterministic_narration(plan, analysis),
            source="deterministic",
        )

    def _prompt_for(self, plan: RatingQueryPlan) -> NarrationPromptDefinition | None:
        pattern = self._catalog.patterns.get(plan.pattern_name or "")
        if pattern is None:
            return None
        try:
            return self._catalog.require_narration_prompt(pattern.narration_prompt_id)
        except KeyError:
            return None

    def _llm_narrate(
        self,
        plan: RatingQueryPlan,
        analysis: dict[str, Any],
        pattern_prompt: NarrationPromptDefinition,
    ) -> str:
        from src.core.text_to_sql.d_008_time_resolver import RatingTimeResolver

        payload = self._bounded_analysis(analysis, plan)
        time_display = RatingTimeResolver.format_display(plan.time_range)
        metrics = [
            {
                "id": metric.id,
                "label": self._metric_label(metric.id, metric.alias),
                "alias": metric.alias,
                "unit": (
                    self._catalog.metrics[metric.id].unit
                    if metric.id in self._catalog.metrics
                    else None
                ),
            }
            for metric in plan.metrics
        ]
        requirements = "\n".join(
            f"- {requirement}" for requirement in pattern_prompt.output_requirements
        )
        base_prompt = (
            "HƯỚNG DẪN CHO PATTERN\n"
            f"{pattern_prompt.instruction}\n\n"
            "YÊU CẦU ĐẦU RA\n"
            f"- BẮT BUỘC: Câu trả lời PHẢI nêu rõ mốc hoặc khoảng thời gian phân tích: '{time_display}' (ví dụ: 'Trong ngày {time_display}...', 'Trong khoảng thời gian {time_display}...').\n"
            f"{requirements or '- Trả lời bằng một câu tiếng Việt hoàn chỉnh.'}\n\n"
            "NGỮ CẢNH ĐÃ KIỂM CHỨNG\n"
            f'Câu hỏi người dùng: "{plan.raw_question}"\n'
            f"Thời gian phân tích: {time_display}\n"
            f"Metrics:\n{json.dumps(metrics, ensure_ascii=False, indent=2)}\n"
            f"Pattern: {plan.pattern_name}\n"
            f"Khoảng dữ liệu: [{plan.time_range.start}, {plan.time_range.end})\n"
            "Khi payload có trường *_display, dùng đúng giá trị hiển thị đó thay cho số thô.\n"
            f"Kết quả phân tích đã kiểm chứng:\n"
            f"{json.dumps(payload, ensure_ascii=False, default=str, indent=2)}"
        )
        prior = ""
        for attempt in range(self._retry_count):
            retry_instruction = (
                f"\n\nCÂU TRẢ LỜI TRƯỚC CHƯA ĐẠT\n{prior!r}\n"
                f"{pattern_prompt.retry_instruction}"
                if attempt
                else ""
            )
            raw_text = str(
                self._llm.complete_text(
                    prompt=base_prompt + retry_instruction,
                    system_prompt=self._system_prompt,
                    temperature=self._temperature,
                    max_tokens=self._max_tokens,
                )
            )
            text = self._clean_llm_output(raw_text)
            if self._is_complete(text, plan, analysis):
                return text
            prior = text
        raise ValueError("incomplete_llm_narration")

    def _is_complete(
        self,
        text: str,
        plan: RatingQueryPlan,
        analysis: dict[str, Any],
    ) -> bool:
        stripped = text.strip()
        if len(stripped) < 20 or not self._ends_properly(stripped):
            return False
        if plan.pattern_name == "metric_lookup" and len(plan.metrics) > 1:
            return self._all_lookup_metrics_are_complete(text, plan, analysis)
        if plan.pattern_name == "dimension_breakdown":
            return self._all_breakdown_rows_are_complete(text, plan, analysis)
        if plan.pattern_name not in {"period_comparison", "dimension_comparison"}:
            return True
        data = analysis.get("data")
        if not isinstance(data, dict):
            return False
        comparisons = data.get("comparisons")
        if plan.pattern_name == "dimension_comparison":
            return (
                isinstance(comparisons, list)
                and bool(comparisons)
                and self._all_comparisons_are_complete(
                    text,
                    comparisons,
                    require_groups=True,
                )
            )
        first = data.get("period_a")
        second = data.get("period_b")
        if not isinstance(first, dict) or not isinstance(second, dict):
            return False
        normalized = self._normalize_check_text(text)
        if not all(
            self._period_token(row.get("date"), plan.time_range.grain) in normalized
            for row in (first, second)
        ):
            return False
        return (
            isinstance(comparisons, list)
            and bool(comparisons)
            and self._all_comparisons_are_complete(text, comparisons)
        )

    def _all_lookup_metrics_are_complete(
        self,
        text: str,
        plan: RatingQueryPlan,
        analysis: dict[str, Any],
    ) -> bool:
        """Require one labelled line and value for every metric in a bundle."""
        data = analysis.get("data")
        if not isinstance(data, list) or not data:
            return False

        lines = [line.strip() for line in text.splitlines() if line.strip()]
        bullet_lines = [
            line for line in lines if re.match(r"^(?:[-*•]|\d+[.)])\s+", line)
        ]
        if len(bullet_lines) < len(plan.metrics):
            return False

        for metric_ref in plan.metrics:
            label = self._metric_label(metric_ref.id, metric_ref.alias)
            matching_lines = [
                line
                for line in bullet_lines
                if self._line_starts_with_label(line, label)
            ]
            if not matching_lines:
                return False

            alias = metric_ref.alias or metric_ref.id.rsplit(".", 1)[-1]
            values = [row.get(alias) for row in data if isinstance(row, dict)]
            if not values or all(value is None for value in values):
                if not any(
                    "khong co du lieu" in self._normalize_check_text(line)
                    or "chua co du lieu" in self._normalize_check_text(line)
                    for line in matching_lines
                ):
                    return False
                continue

            if not any(
                self._contains_metric_value(line, value, metric_ref.id)
                for line in matching_lines
                for value in values
                if value is not None
            ):
                return False
        return True

    def _contains_metric_value(self, text: str, value: Any, metric_id: str) -> bool:
        normalized = self._normalize_check_text(text)
        metric = self._catalog.metrics.get(metric_id)
        if metric and metric.unit == "second":
            display = self._normalize_check_text(self._format_duration(value))
            if display in normalized:
                return True
        if metric and metric.unit == "percent" and isinstance(value, (int, float)):
            if self._contains_number(normalized, float(value) * 100):
                return True
        return self._contains_number(normalized, value)

    def _all_breakdown_rows_are_complete(
        self,
        text: str,
        plan: RatingQueryPlan,
        analysis: dict[str, Any],
    ) -> bool:
        """Require every returned group and metric value in a breakdown answer."""
        data = analysis.get("data")
        if not isinstance(data, list) or not data or not plan.dimensions:
            return False
        normalized = self._normalize_check_text(text)
        for row in data:
            if not isinstance(row, dict):
                return False
            for dimension_id in plan.dimensions:
                dimension = self._catalog.get_dimension(dimension_id)
                column = dimension.column if dimension else dimension_id.rsplit(".", 1)[-1]
                value = row.get(column)
                if value is None:
                    continue
                if dimension and dimension.semantic_type == "time":
                    unique_time_vals = {
                        str(r.get(column))
                        for r in data
                        if isinstance(r, dict) and r.get(column) is not None
                    }
                    if len(unique_time_vals) <= 1:
                        # Time is already stated in the overall narration header
                        continue
                    date_val = str(value)
                    norm_val = self._normalize_check_text(date_val)
                    if norm_val in normalized:
                        continue
                    token = self._period_token(date_val, plan.time_range.grain)
                    if token in normalized:
                        continue
                    return False
                if self._normalize_check_text(str(value)) not in normalized:
                    return False
            for metric_ref in plan.metrics:
                alias = metric_ref.alias or metric_ref.id.rsplit(".", 1)[-1]
                value = row.get(alias)
                if value is None:
                    if "khong co du lieu" not in normalized and "chua co du lieu" not in normalized:
                        return False
                elif not self._contains_metric_value(text, value, metric_ref.id):
                    return False
        return True

    def _all_comparisons_are_complete(
        self,
        text: str,
        comparisons: list[Any],
        *,
        require_groups: bool = False,
    ) -> bool:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if len(comparisons) > 1:
            bullet_lines = [
                line
                for line in lines
                if re.match(r"^(?:[-*•]|\d+[.)])\s+", line)
            ]
            if len(bullet_lines) < len(comparisons):
                return False
        else:
            if len(lines) != 1 or re.match(r"^(?:[-*•]|\d+[.)])\s+", lines[0]):
                return False
            bullet_lines = lines

        for comparison in comparisons:
            if not isinstance(comparison, dict):
                return False
            label = self._metric_label(
                str(comparison.get("metric_id", "")),
                str(comparison.get("metric_alias", "")) or None,
            )
            matching_lines = [
                line
                for line in bullet_lines
                if self._line_starts_with_label(line, label)
            ]
            if require_groups:
                matching_lines = [
                    line
                    for line in matching_lines
                    if all(
                        self._normalize_check_text(str(comparison.get(key, "")))
                        in self._normalize_check_text(line)
                        for key in ("group_a", "group_b")
                    )
                ]
            matched_line = matching_lines[0] if matching_lines else None
            if matched_line is None:
                return False
            normalized_line = self._normalize_check_text(matched_line)
            if comparison.get("status") != "available":
                if "khong du du lieu" not in normalized_line:
                    return False
                continue
            delta = comparison.get("delta")
            if not isinstance(delta, (int, float)):
                return False
            direction = self._direction_token(float(delta))
            if direction not in normalized_line:
                return False
            for value in (comparison.get("value_b"), abs(float(delta))):
                if not self._contains_number(normalized_line, value):
                    return False
            delta_pct = comparison.get("delta_pct")
            if delta_pct is None:
                if "khong xac dinh" not in normalized_line:
                    return False
            elif not self._contains_number(normalized_line, abs(float(delta_pct))):
                return False
        return True

    @staticmethod
    def _line_starts_with_label(line: str, label: str) -> bool:
        content = re.sub(r"^(?:[-*•]|\d+[.)])\s+", "", line.strip())
        return content.casefold().startswith(label.casefold() + ":")

    @staticmethod
    def _clean_llm_output(value: str) -> str:
        """Normalize presentation only; semantic validation still runs afterwards."""
        text = value.strip().strip("`").strip()
        lines: list[str] = []
        for raw_line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
            line = raw_line.strip()
            if not line:
                continue
            line = re.sub(r"^(?:[*•]|\d+[.)])\s+", "- ", line)
            lines.append(line)
        return "\n".join(lines)

    def _metric_label(self, metric_id: str, alias: str | None) -> str:
        metric = self._catalog.metrics.get(metric_id)
        return metric.label if metric and metric.label else alias or metric_id

    @classmethod
    def _contains_number(cls, normalized_text: str, value: Any) -> bool:
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            return False
        return any(
            re.search(rf"(?<!\d){re.escape(token)}(?!\d)", normalized_text)
            for token in cls._number_check_tokens(abs(float(value)))
        )

    @staticmethod
    def _direction_token(delta: float) -> str:
        if delta < 0:
            return "giam"
        if delta > 0:
            return "tang"
        return "khong doi"

    @staticmethod
    def _ends_properly(text: str) -> bool:
        if not text:
            return False
        if text[-1] in {".", "!", "?", "…", ")", "]", "}", "*", "_", "`", "%", '"', "'"}:
            return True
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if len(lines) > 1:
            last_line = lines[-1]
            if last_line.startswith(("-", "*", "•")) or re.match(r"^\d+[.)]", last_line):
                return len(last_line) >= 3
        return False

    @staticmethod
    def _normalize_check_text(value: str) -> str:
        decomposed = unicodedata.normalize("NFD", value.lower())
        without_accents = "".join(
            character
            for character in decomposed
            if unicodedata.category(character) != "Mn"
        ).replace("đ", "d")
        return " ".join(re.sub(r"[^a-z0-9.,/%]+", " ", without_accents).split())

    @staticmethod
    def _number_check_tokens(value: float) -> set[str]:
        rounded = round(value, 2)
        fixed = f"{rounded:.2f}"
        values = {
            f"{rounded:.2f}".rstrip("0").rstrip("."),
            f"{rounded:.1f}".rstrip("0").rstrip("."),
            str(int(rounded)) if rounded.is_integer() else "",
        }
        tokens = {
            token
            for value_text in values
            if value_text
            for token in (value_text, value_text.replace(".", ","))
        }
        tokens.update((fixed, fixed.replace(".", ",")))
        western = f"{rounded:,.2f}"
        tokens.add(western)
        tokens.add(western.replace(",", "_").replace(".", ",").replace("_", "."))
        return tokens

    @staticmethod
    def _period_token(value: Any, grain: str) -> str:
        matched = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", str(value or ""))
        if not matched:
            return str(value or "").lower()
        year, month, day = matched.groups()
        if grain == "month":
            return f"thang {int(month)}"
        return f"{int(day)}/{int(month)}/{year}"

    @staticmethod
    def _format_period(value: Any, grain: str) -> str:
        matched = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", str(value or ""))
        if not matched:
            return str(value or "kỳ không xác định")
        year, month, day = matched.groups()
        if grain == "month":
            return f"tháng {int(month)}/{year}"
        return f"ngày {int(day):02d}/{int(month):02d}/{year}"

    @staticmethod
    def _format_number(value: Any, *, signed: bool = False) -> str:
        try:
            number = float(value)
        except (TypeError, ValueError):
            return str(value)
        prefix = "+" if signed and number > 0 else ""
        western = f"{abs(number) if not signed else number:,.2f}"
        integer, decimal = western.split(".")
        localized = integer.replace(",", ".") + "," + decimal
        return prefix + localized

    def _bounded_analysis(
        self,
        analysis: dict[str, Any],
        plan: RatingQueryPlan,
    ) -> dict[str, Any]:
        bounded = dict(analysis)
        data = bounded.get("data")
        if isinstance(data, list):
            rows = [dict(row) for row in data[: self._maximum_rows]]
            for row in rows:
                for metric_ref in plan.metrics:
                    metric = self._catalog.metrics.get(metric_ref.id)
                    alias = metric_ref.alias or (
                        metric.output_alias if metric else metric_ref.id.rsplit(".", 1)[-1]
                    )
                    if metric and alias in row:
                        val = row.get(alias)
                        if val is not None:
                            if metric.unit == "second":
                                row[f"{alias}_display"] = self._format_duration(val)
                            elif metric.unit == "percent":
                                row[f"{alias}_display"] = f"{self._format_number(val)}%"
                            elif metric.unit == "hour":
                                row[f"{alias}_display"] = f"{self._format_number(val)} giờ"
                            else:
                                row[f"{alias}_display"] = self._format_number(val)
            bounded["data"] = rows
            if len(data) > self._maximum_rows:
                bounded["truncated_rows"] = len(data) - self._maximum_rows
        return bounded

    @staticmethod
    def _format_duration(value: Any) -> str:
        try:
            total_seconds = max(0, int(round(float(value))))
        except (TypeError, ValueError):
            return str(value)
        hours, remainder = divmod(total_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        parts: list[str] = []
        if hours:
            parts.append(f"{hours} giờ")
        if minutes:
            parts.append(f"{minutes} phút")
        if seconds or not parts:
            parts.append(f"{seconds} giây")
        return " ".join(parts)

    @staticmethod
    def _has_compute_error(analysis: dict[str, Any]) -> bool:
        data = analysis.get("data")
        return bool(analysis.get("compute_error") or (isinstance(data, dict) and data.get("error")))

    def _deterministic_narration(
        self,
        plan: RatingQueryPlan,
        analysis: dict[str, Any],
    ) -> str:
        data = analysis.get("data")
        if isinstance(data, dict) and data.get("error") == "insufficient_data":
            if plan.pattern_name == "dimension_comparison":
                return "Không đủ dữ liệu để so sánh các giá trị dimension."
            return "Không đủ dữ liệu để so sánh hai kỳ."
        if plan.pattern_name == "period_comparison" and isinstance(data, dict):
            comparisons = data.get("comparisons")
            if isinstance(comparisons, list) and comparisons:
                first = data.get("period_a", {})
                second = data.get("period_b", {})
                if not isinstance(first, dict) or not isinstance(second, dict):
                    return "Không đủ dữ liệu để so sánh hai kỳ."
                first_period = self._format_period(first.get("date"), plan.time_range.grain)
                second_period = self._format_period(second.get("date"), plan.time_range.grain)
                statements = [
                    self._comparison_statement(item, first_period, second_period)
                    for item in comparisons
                    if isinstance(item, dict)
                ]
                if len(statements) == 1:
                    return statements[0]
                bullets = "\n".join(f"- {statement}" for statement in statements)
                return f"So sánh {second_period} với {first_period}:\n{bullets}"

            return "Không đủ dữ liệu để so sánh hai kỳ."
        if plan.pattern_name == "dimension_comparison" and isinstance(data, dict):
            comparisons = data.get("comparisons")
            if not isinstance(comparisons, list) or not comparisons:
                return "Không đủ dữ liệu để so sánh các giá trị dimension."
            statements = [
                self._group_comparison_statement(item)
                for item in comparisons
                if isinstance(item, dict)
            ]
            if len(statements) == 1:
                return statements[0]
            bullets = "\n".join(f"- {statement}" for statement in statements)
            return "So sánh các giá trị dimension:\n" + bullets
        if isinstance(data, list) and data:
            if plan.pattern_name == "metric_lookup" and len(plan.metrics) > 1:
                return self._deterministic_metric_lookup(plan, data)
            if plan.pattern_name in {
                "dimension_listing",
                "dimension_breakdown",
                "rank_lookup",
                "rank_comparison",
                "share_distribution",
                "trend_analysis",
            }:
                return self._deterministic_dimension_breakdown(plan, data)
            airtime_metrics = [
                (metric_ref, self._catalog.metrics.get(metric_ref.id))
                for metric_ref in plan.metrics
                if (
                    (metric := self._catalog.metrics.get(metric_ref.id))
                    and metric.fact_family == "program"
                    and metric.semantic_key.startswith("airtime_")
                )
            ]
            if airtime_metrics:
                statements: list[str] = []
                for row in data:
                    group_values = [
                        str(
                            row.get(
                                (
                                    self._catalog.get_dimension(dimension).column
                                    if self._catalog.get_dimension(dimension)
                                    else dimension.rsplit(".", 1)[-1]
                                ),
                                "",
                            )
                        )
                        for dimension in plan.dimensions
                        if row.get(
                            (
                                self._catalog.get_dimension(dimension).column
                                if self._catalog.get_dimension(dimension)
                                else dimension.rsplit(".", 1)[-1]
                            )
                        ) is not None
                    ]
                    prefix = (" / ".join(group_values) + ": ") if group_values else ""
                    for metric_ref, metric in airtime_metrics:
                        alias = metric_ref.alias or metric.output_alias
                        raw_value = row.get(alias)
                        value = (
                            self._format_duration(raw_value)
                            if metric.unit == "second"
                            else f"{self._format_number(raw_value)}%"
                        )
                        statements.append(f"{prefix}{metric.label}: {value}.")
                return "\n".join(statements)
        return f"Đã xử lý {analysis.get('raw_row_count', 0)} dòng cho pattern {plan.pattern_name}."

    def _deterministic_metric_lookup(
        self,
        plan: RatingQueryPlan,
        rows: list[dict[str, Any]],
    ) -> str:
        statements: list[str] = []
        for row in rows:
            for metric_ref in plan.metrics:
                metric = self._catalog.metrics.get(metric_ref.id)
                alias = metric_ref.alias or metric_ref.id.rsplit(".", 1)[-1]
                value = row.get(alias)
                rendered = self._render_metric_value(metric, value)
                label = self._metric_label(metric_ref.id, metric_ref.alias)
                statements.append(f"{label}: {rendered}.")
        return "\n".join(statements)

    def _deterministic_dimension_breakdown(
        self,
        plan: RatingQueryPlan,
        rows: list[dict[str, Any]],
    ) -> str:
        statements: list[str] = []
        for index, row in enumerate(rows, start=1):
            group_values: list[str] = []
            for dimension_id in plan.dimensions:
                dimension = self._catalog.get_dimension(dimension_id)
                column = dimension.column if dimension else dimension_id.rsplit(".", 1)[-1]
                value = row.get(column)
                if value is not None:
                    group_values.append(str(value))
            group = " / ".join(group_values) or "Nhóm không xác định"
            if not plan.metrics:
                statements.append(f"- {group}")
                continue
            for metric_ref in plan.metrics:
                metric = self._catalog.metrics.get(metric_ref.id)
                alias = metric_ref.alias or metric_ref.id.rsplit(".", 1)[-1]
                label = self._metric_label(metric_ref.id, metric_ref.alias)
                rendered = self._render_metric_value(metric, row.get(alias))
                if plan.pattern_name in {"rank_lookup", "rank_comparison"}:
                    statements.append(f"{index}. {group}: {label} {rendered}.")
                else:
                    statements.append(f"{group}: {label} {rendered}.")
        return "\n".join(statements)

    def _render_metric_value(self, metric: Any, value: Any) -> str:
        if value is None:
            return "chưa có dữ liệu"
        if metric and metric.unit == "second":
            return self._format_duration(value)
        if metric and metric.unit == "percent":
            return f"{self._format_number(value)}%"
        if metric and metric.unit == "hour":
            return f"{self._format_number(value)} giờ"
        return self._format_number(value)

    def _comparison_statement(
        self,
        comparison: dict[str, Any],
        first_period: str,
        second_period: str,
    ) -> str:
        label = self._metric_label(
            str(comparison.get("metric_id", "")),
            str(comparison.get("metric_alias", "")) or None,
        ).capitalize()
        if comparison.get("status") != "available":
            return f"{label}: không đủ dữ liệu để so sánh hai kỳ."
        delta = comparison.get("delta")
        try:
            numeric_delta = float(delta)
        except (TypeError, ValueError):
            return f"{label}: không đủ dữ liệu để so sánh hai kỳ."
        if numeric_delta < 0:
            direction = "giảm"
        elif numeric_delta > 0:
            direction = "tăng"
        else:
            direction = "không đổi, chênh lệch"
        delta_pct = comparison.get("delta_pct")
        percentage = (
            f"({self._format_number(delta_pct)}%)"
            if isinstance(delta_pct, (int, float))
            else "(tỷ lệ không xác định do kỳ trước bằng 0)"
        )
        return (
            f"{label}: {second_period} đạt {self._format_number(comparison.get('value_b'))}, "
            f"{direction} {self._format_number(abs(numeric_delta))} {percentage} so với "
            f"{first_period} ({self._format_number(comparison.get('value_a'))})."
        )

    def _group_comparison_statement(self, comparison: dict[str, Any]) -> str:
        label = self._metric_label(
            str(comparison.get("metric_id", "")),
            str(comparison.get("metric_alias", "")) or None,
        ).capitalize()
        group_a = str(comparison.get("group_a", "giá trị thứ nhất"))
        group_b = str(comparison.get("group_b", "giá trị thứ hai"))
        if comparison.get("status") != "available":
            return f"{label}: không đủ dữ liệu để so sánh {group_b} với {group_a}."
        delta = comparison.get("delta")
        try:
            numeric_delta = float(delta)
        except (TypeError, ValueError):
            return f"{label}: không đủ dữ liệu để so sánh {group_b} với {group_a}."
        if numeric_delta < 0:
            direction = "giảm"
        elif numeric_delta > 0:
            direction = "tăng"
        else:
            direction = "không đổi, chênh lệch"
        delta_pct = comparison.get("delta_pct")
        percentage = (
            f"({self._format_number(delta_pct)}%)"
            if isinstance(delta_pct, (int, float))
            else "(tỷ lệ không xác định do giá trị gốc bằng 0)"
        )
        return (
            f"{label}: {group_b} đạt {self._format_number(comparison.get('value_b'))}, "
            f"{direction} {self._format_number(abs(numeric_delta))} {percentage} so với "
            f"{group_a} ({self._format_number(comparison.get('value_a'))})."
        )
