"""LLM-first semantic extraction constrained by a catalog whitelist."""

from __future__ import annotations

import json
import re
from dataclasses import asdict
from typing import Any

from src.core.text_to_sql.semantic_extraction.catalog_context import CatalogContext
from src.core.text_to_sql.semantic_extraction.contracts import (
    ExtractedDimension,
    ExtractionRole,
    SemanticExtractionResult,
)
from src.core.text_to_sql.semantic_extraction.normalization import (
    contains_lookup_phrase,
    normalize_lookup_value,
)


_ALLOWED_ROLES = frozenset(("filter", "group_by", "sort"))


class LLMSemanticExtractionProvider:
    """Ask an LLM for one flat metric/dimension result and validate its IDs."""

    def __init__(self, llm_client: Any):
        self._llm = llm_client
        self._system_prompt_cache: dict[int, str] = {}

    def extract(self, question: str, context: CatalogContext) -> SemanticExtractionResult:
        response = self._llm.complete_text(
            prompt=self._user_prompt(question),
            system_prompt=self._system_prompt(context),
            temperature=0.0,
            max_tokens=1200,
        )
        payload = self._parse_json(response)
        return self._validate_payload(question, payload, context)

    def _system_prompt(self, context: CatalogContext) -> str:
        cache_key = id(context)
        cached = self._system_prompt_cache.get(cache_key)
        if cached is not None:
            return cached
        metric_payload = [asdict(metric) for metric in context.metrics]
        dimension_payload = [asdict(dimension) for dimension in context.dimensions]
        prompt = (
            "Bạn là semantic extractor cho dashboard Rating. Đọc nguyên văn câu hỏi, "
            "không tự sửa hoặc cắt tên riêng. Chọn tối đa một metric_id và 0..N dimension "
            "từ catalog dưới đây. raw_values phải giữ nguyên nội dung giá trị trong câu hỏi. "
            "Không tạo ID hoặc canonical value mới. Không đưa bất kỳ giá trị thời gian tuyệt đối "
            "hoặc tương đối như '2026-08-02', 'tháng 7', 'hôm qua' vào raw_values; tầng time "
            "xử lý riêng. Chỉ khai báo time dimension với raw_values=[] khi câu hỏi yêu cầu "
            "group_by hoặc sort theo thời gian. roles chỉ được gồm filter, "
            "group_by hoặc sort và phải tuân theo filterable/group_by của dimension. "
            "supported_dimensions giới hạn dimension hợp lệ của metric; required_dimensions "
            "là context bắt buộc nhưng không được tự thêm nếu câu hỏi không nêu.\n\n"
            "Quy tắc quan trọng:\n"
            "- Về thời gian: Các mốc/khoảng thời gian (ví dụ: 'tháng 7', 'hôm qua', 'tuần trước', 'từ 01/08 đến 05/08', 'năm 2026') là BỘ LỌC THỜI GIAN và được tầng time xử lý riêng; TUYỆT ĐỐI KHÔNG khai báo time dimension cho các mốc này. CHỈ khai báo time dimension với raw_values=[] và roles=['group_by'] khi câu hỏi nêu rõ phân rã/nhóm theo thời gian như 'theo ngày', 'theo từng ngày', 'theo tuần', 'theo tháng', 'theo từng tháng', 'diễn biến theo ngày'.\n"
            "- Về danh sách đối tượng vs đếm số lượng:\n"
            "  + Khi câu hỏi yêu cầu LIỆT KÊ/XEM DANH SÁCH các đối tượng (ví dụ: 'các kênh...', 'những kênh...', 'danh sách kênh...', 'các chương trình...', 'những chương trình...', 'danh sách chương trình...', 'các thể loại...'): "
            "PHẢI khai báo dimension của đối tượng cần liệt kê đó với raw_values=[] và roles=['group_by'], đồng thời để metric_id=null (hoặc metric đo lường nếu có nêu rõ). KHÔNG chọn metric đếm (*_count) khi câu hỏi yêu cầu liệt kê danh sách.\n"
            "  + CHỈ chọn metric đếm (*_count như channel_count, program_count, category_count) khi câu hỏi hỏi SỐ LƯỢNG hoặc ĐẾM (ví dụ: 'có bao nhiêu kênh', 'đếm số chương trình', 'tổng số thể loại').\n\n"
            "Schema:\n"
            '{"metric_id": "string|null", "dimensions": '
            '[{"dimension_id": "string", "raw_values": ["string"], '
            '"roles": ["filter|group_by|sort"]}]}\n\n'
            f"Metrics:\n{json.dumps(metric_payload, ensure_ascii=False)}\n\n"
            f"Dimensions:\n{json.dumps(dimension_payload, ensure_ascii=False)}"
        )
        self._system_prompt_cache[cache_key] = prompt
        return prompt

    @staticmethod
    def _user_prompt(question: str) -> str:
        return (
            "Trích xuất semantic input cho đúng một câu hỏi sau. "
            "Nếu không có metric và dimension hợp lệ, trả metric_id=null và dimensions=[].\n"
            f"Câu hỏi nguyên văn: {json.dumps(question, ensure_ascii=False)}"
        )

    @staticmethod
    def _parse_json(response: Any) -> dict[str, Any]:
        text = str(response or "").strip()
        fenced = re.fullmatch(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL | re.IGNORECASE)
        if fenced:
            text = fenced.group(1).strip()
        try:
            payload = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError("semantic_extraction_response_invalid:json") from exc
        if not isinstance(payload, dict):
            raise ValueError("semantic_extraction_response_invalid:object")
        return payload

    @staticmethod
    def _validate_payload(
        question: str,
        payload: dict[str, Any],
        context: CatalogContext,
    ) -> SemanticExtractionResult:
        if set(payload) != {"metric_id", "dimensions"}:
            raise ValueError("semantic_extraction_response_invalid:schema")
        metric_ids = {metric.id for metric in context.metrics}
        dimensions_by_id = {dimension.id: dimension for dimension in context.dimensions}
        dimension_ids = set(dimensions_by_id)
        raw_metric_id = payload.get("metric_id")
        metric_id = str(raw_metric_id).strip() if raw_metric_id else None
        if metric_id is not None and metric_id not in metric_ids:
            raise ValueError(f"semantic_extraction_unknown_metric:{metric_id}")

        raw_dimensions = payload.get("dimensions")
        if not isinstance(raw_dimensions, list):
            raise ValueError("semantic_extraction_response_invalid:dimensions")
        merged: dict[str, tuple[list[str], list[ExtractionRole]]] = {}
        normalized_question = normalize_lookup_value(question)
        for raw_dimension in raw_dimensions:
            if not isinstance(raw_dimension, dict):
                raise ValueError("semantic_extraction_response_invalid:dimension")
            if set(raw_dimension) != {"dimension_id", "raw_values", "roles"}:
                raise ValueError("semantic_extraction_response_invalid:dimension_schema")
            dimension_id = str(raw_dimension.get("dimension_id", "")).strip()
            if dimension_id not in dimension_ids:
                raise ValueError(f"semantic_extraction_unknown_dimension:{dimension_id}")
            raw_values = raw_dimension.get("raw_values", [])
            if raw_values is None:
                raw_values = []
            if not isinstance(raw_values, list):
                raise ValueError("semantic_extraction_response_invalid:raw_values")
            values = [str(value).strip() for value in raw_values if str(value).strip()]
            dimension = dimensions_by_id.get(dimension_id)
            canonical_set = set(dimension.canonical_values) if dimension else set()
            for value in values:
                if (
                    value not in canonical_set
                    and not contains_lookup_phrase(
                        normalized_question,
                        normalize_lookup_value(value),
                    )
                ):
                    raise ValueError(
                        f"semantic_extraction_value_not_in_question:{dimension_id}"
                    )
            raw_roles = raw_dimension.get("roles", ())
            if isinstance(raw_roles, str):
                raw_roles = [raw_roles]
            if not isinstance(raw_roles, list):
                raise ValueError("semantic_extraction_response_invalid:roles")
            roles: list[ExtractionRole] = []
            for role in raw_roles:
                normalized_role = str(role).strip()
                if normalized_role not in _ALLOWED_ROLES:
                    raise ValueError(f"semantic_extraction_unknown_role:{normalized_role}")
                roles.append(normalized_role)  # type: ignore[arg-type]
            if not roles:
                roles.append("filter" if values else "group_by")
            dimension_context = dimensions_by_id[dimension_id]
            if "filter" in roles and not values and dimension_context.semantic_type != "time":
                raise ValueError(
                    f"semantic_extraction_filter_has_no_value:{dimension_id}"
                )
            if "filter" in roles and not dimension_context.filterable:
                raise ValueError(
                    f"semantic_extraction_dimension_not_filterable:{dimension_id}"
                )
            if "group_by" in roles and not dimension_context.group_by:
                raise ValueError(
                    f"semantic_extraction_dimension_not_groupable:{dimension_id}"
                )
            accumulated_values, accumulated_roles = merged.setdefault(dimension_id, ([], []))
            accumulated_values.extend(values)
            accumulated_roles.extend(roles)

        dimensions = tuple(
            ExtractedDimension(
                dimension_id=dimension_id,
                raw_values=tuple(dict.fromkeys(values)),
                roles=tuple(dict.fromkeys(roles)),
            )
            for dimension_id, (values, roles) in merged.items()
        )
        return SemanticExtractionResult(
            question=question,
            metric_id=metric_id,
            dimensions=dimensions,
            source="llm",
        )


__all__ = ("LLMSemanticExtractionProvider",)
