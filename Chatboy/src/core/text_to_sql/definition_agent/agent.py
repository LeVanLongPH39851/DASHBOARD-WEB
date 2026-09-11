"""Workflow 016: answer knowledge/definition questions using Catalog Metadata."""

from __future__ import annotations

import json
import logging
from typing import Any

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.intent_routing.agent_response import AgentResponse


logger = logging.getLogger(__name__)

_OUT_OF_SCOPE_REPLY = (
    "Tôi chỉ hỗ trợ trả lời các câu hỏi liên quan đến Dashboard Rating. "
    "Bạn có thể hỏi về: ý nghĩa của các chỉ số (Rating, Reach, Lượt xem...), "
    "cách tính, sự khác biệt giữa các chỉ số, "
    "hoặc yêu cầu xem dữ liệu phân tích cụ thể."
)

_NO_SCOPE_SYSTEM_PROMPT = (
    "Bạn là trợ lý AI chuyên về Dashboard Rating TVD (hệ thống đo lường khán giả truyền hình).\n"
    "Người dùng vừa đặt một câu hỏi nằm NGOÀI phạm vi hỗ trợ của hệ thống (ví dụ: hỏi về giá tiền/chi phí phát sóng/quảng cáo, doanh thu, nội dung kịch bản, thời tiết, chào hỏi...).\n"
    "Hãy trả lời người dùng một cách lịch sự, ngắn gọn và hữu ích:\n"
    "1. Giải thích rõ ràng rằng Dashboard Rating TVD chỉ quản lý và phân tích các dữ liệu đo lường khán giả (Rating, Reach, Lượt xem, Thời lượng phát sóng/xem, Kênh, Chương trình, Thể loại, Khung giờ, Tỉnh thành/Khu vực) và KHÔNG có dữ liệu về vấn đề người dùng hỏi (như giá tiền, chi phí quảng cáo, doanh thu, bản quyền...).\n"
    "2. Gợi ý 2-3 câu hỏi hoặc tác vụ liên quan đến đối tượng trong câu hỏi mà hệ thống CÓ THỂ hỗ trợ trên Dashboard (nếu có nhắc đến kênh, chương trình, thể loại...).\n"
    "Trả lời bằng tiếng Việt, thân thiện, súc tích."
)


def no_scope_response(
    question: str = "",
    llm_client: Any | None = None,
) -> AgentResponse:
    """Trả lời câu hỏi ngoài phạm vi, ưu tiên LLM để giải thích rõ ràng và gợi ý tra cứu thay thế."""
    if llm_client is not None and question.strip():
        try:
            text = llm_client.complete_text(
                prompt=f"Câu hỏi của người dùng: {question}",
                system_prompt=_NO_SCOPE_SYSTEM_PROMPT,
                temperature=0.2,
                max_tokens=600,
            )
            text = str(text).strip()
            if text.startswith("{") and "intent" in text:
                return AgentResponse(
                    intent="no_scope",
                    reply=_OUT_OF_SCOPE_REPLY,
                    success=True,
                    source="deterministic",
                    data=None,
                )
            if len(text) > 10:
                return AgentResponse(
                    intent="no_scope",
                    reply=text,
                    success=True,
                    source="llm",
                    data=None,
                )
        except Exception as exc:
            logger.warning("[NoScopeResponse] LLM failed: %s, fallback to deterministic", exc)

    return AgentResponse(
        intent="no_scope",
        reply=_OUT_OF_SCOPE_REPLY,
        success=True,
        source="deterministic",
        data=None,
    )


class SemanticDefinitionAgent:
    """
    Trả lời câu hỏi kiến thức nghiệp vụ từ Catalog Metadata.
    Không kết nối database Doris. Không render SQL.

    Nguồn dữ liệu:
        - metrics: id, label, description, unit, disambiguation, aliases
        - dimensions: id, label, aliases
        - patterns: id, name, description

    Thứ tự ưu tiên:
        1. LLM với toàn bộ Catalog Metadata làm system prompt context.
        2. Deterministic template từ Catalog khi không có LLM hoặc LLM thất bại.
    """

    def __init__(
        self,
        llm_client: Any | None = None,
        catalog: RatingCatalog | None = None,
    ) -> None:
        self._llm = llm_client
        self._catalog = catalog or RatingCatalog.load()
        self._knowledge_context: str | None = None  # lazy-built, cached

    def answer(self, question: str) -> AgentResponse:
        """Trả lời câu hỏi định nghĩa nghiệp vụ, trả về AgentResponse."""
        if self._llm is not None:
            try:
                text = self._llm.complete_text(
                    prompt=question,
                    system_prompt=self._system_prompt(),
                    temperature=0.2,
                    max_tokens=800,
                )
                text = str(text).strip()
                if len(text) > 10:
                    logger.info("[DefinitionAgent] LLM answered: %d chars", len(text))
                    return AgentResponse(
                        intent="definition",
                        reply=text,
                        success=True,
                        source="llm",
                        data={"catalog_refs": self._find_refs(question)},
                    )
            except Exception as exc:
                logger.warning(
                    "[DefinitionAgent] LLM thất bại: %s — dùng deterministic fallback", exc
                )

        reply = self._deterministic_answer(question)
        return AgentResponse(
            intent="definition",
            reply=reply,
            success=True,
            source="deterministic",
            data={"catalog_refs": self._find_refs(question)},
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _system_prompt(self) -> str:
        """Build (and cache) system prompt with full Catalog Metadata."""
        if self._knowledge_context is None:
            metrics_info = [
                {
                    "id": m.id,
                    "label": m.label,
                    "description": m.description,
                    "unit": m.unit,
                    "disambiguation": m.disambiguation,
                    "aliases": list(m.aliases),
                }
                for m in self._catalog.metrics.values()
                if m.status == "active"
            ]
            from src.core.text_to_sql.semantic_memory import CanonicalMemory

            canonical_mem = CanonicalMemory(self._catalog)
            dims_info = []
            for d in self._catalog.dimensions.values():
                info = {
                    "id": d.id,
                    "label": d.label,
                    "aliases": list(d.aliases),
                }
                c_vals = canonical_mem.canonical_values(d.id)
                if c_vals and d.matching.strategy != "doris_ngram":
                    info["canonical_values"] = list(c_vals)
                dims_info.append(info)
            patterns_info = [
                {
                    "id": pid,
                    "name": p.name,
                    "description": getattr(p, "description", ""),
                    "disambiguation": getattr(p, "disambiguation", ""),
                }
                for pid, p in self._catalog.patterns.items()
            ]
            self._knowledge_context = json.dumps(
                {
                    "metrics": metrics_info,
                    "dimensions": dims_info,
                    "patterns": patterns_info,
                },
                ensure_ascii=False,
                indent=2,
            )

        return (
            "Bạn là trợ lý nghiệp vụ cho Dashboard Rating TVD.\n"
            "Nhiệm vụ: Giải thích định nghĩa, ý nghĩa, cách tính của các chỉ số và chiều phân tích.\n\n"
            "Quy tắc trả lời:\n"
            "1. Trả lời trực diện, ngắn gọn, súc tích đúng khái niệm người dùng đang hỏi.\n"
            "2. Khi người dùng hỏi có những thể loại/kênh/tỉnh thành/khung giờ/vùng/hình thức xem nào hoặc yêu cầu danh sách các giá trị hợp lệ, hãy liệt kê đầy đủ, chính xác tất cả các giá trị (canonical_values) từ Catalog Metadata.\n"
            "3. Giải thích rõ: bản chất chỉ số đo lường cái gì và đơn vị đo lường (nếu có).\n"
            "4. TUYỆT ĐỐI KHÔNG tự ý chèn thêm phần 'Lưu ý', 'Gợi ý chỉ số khác', hoặc liệt kê các ID kỹ thuật (như rating.rating_percent, program.rating_absolute) vào câu trả lời, trừ khi người dùng chủ động hỏi so sánh giữa các chỉ số.\n"
            "5. Trả lời bằng tiếng Việt chuẩn, tự nhiên cho người dùng cuối (không hiển thị mã ID kỹ thuật dạng code).\n\n"
            f"Catalog Metadata:\n{self._knowledge_context}"
        )

    def _deterministic_answer(self, question: str) -> str:
        """
        Template-based fallback khi LLM không khả dụng.
        Tìm metric/dimension liên quan dựa trên label và aliases.
        """
        q = question.lower()

        # Tìm metric phù hợp
        for m in self._catalog.metrics.values():
            if m.status != "active":
                continue
            triggers = [m.label.lower()] + [a.lower() for a in m.aliases]
            if any(t in q for t in triggers):
                parts = [f"**{m.label}**"]
                if m.description:
                    parts.append(m.description.strip())
                if m.unit:
                    parts.append(f"**Đơn vị đo lường:** {m.unit}")
                return "\n\n".join(parts)

        # Tìm dimension phù hợp
        for d in self._catalog.dimensions.values():
            triggers = [d.label.lower()] + [a.lower() for a in d.aliases]
            if any(t in q for t in triggers):
                return (
                    f"**{d.label}** là một chiều phân tích "
                    f"trong Dashboard Rating TVD."
                )

        return (
            "Tôi chưa tìm được thông tin phù hợp trong catalog Rating. "
            "Các chỉ số hiện có: Rating, Rating (%), Reach (%), Lượt xem, "
            "Average Reach, Thời lượng xem, Phút xem/người/ngày. "
            "Bạn có thể hỏi cụ thể hơn về một trong các chỉ số này."
        )

    def _find_refs(self, question: str) -> list[str]:
        """Trả về danh sách metric/dimension IDs liên quan đến câu hỏi."""
        q = question.lower()
        refs: list[str] = []
        for m in self._catalog.metrics.values():
            if m.status != "active":
                continue
            if any(a.lower() in q for a in (m.label, *m.aliases)):
                refs.append(m.id)
        for d in self._catalog.dimensions.values():
            if any(a.lower() in q for a in (d.label, *d.aliases)):
                refs.append(d.id)
        return refs
