"""Workflow 000: Top-level intent classifier. 100% LLM-dependent."""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Literal

from src.core.text_to_sql.intent_routing.agent_response import IntentType


logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class IntentClassificationResult:
    """Kết quả phân loại intent từ câu hỏi thô."""

    intent: IntentType
    confidence: float
    question: str


class IntentRouter:
    """
    Phân loại câu hỏi thành data_query, definition, hoặc no_scope.
    Phụ thuộc 100% vào LLM. Nếu LLM không khả dụng → raise RuntimeError.

    3 intent levels:
        - data_query  : Người dùng muốn xem/so sánh/phân tích số liệu từ database.
        - definition  : Người dùng hỏi về định nghĩa, cách tính, sự khác biệt giữa các chỉ số.
        - no_scope    : Câu hỏi ngoài phạm vi Dashboard Rating.
    """

    _SYSTEM_PROMPT = (
        "Bạn là bộ phân loại ý định (intent classifier) cho chatbot Dashboard Rating TVD.\n"
        "Đọc câu hỏi của người dùng và phân loại vào đúng một trong 3 nhóm:\n\n"
        "- data_query: Người dùng muốn xem, đếm số lượng các đối tượng có trong hệ thống (\"có bao nhiêu kênh...\", \"bao nhiêu thể loại...\"), so sánh, phân tích các chỉ số đo lường khán giả (Rating, Reach, Lượt xem, Thời lượng xem/phát...) hoặc TRA CỨU THUỘC TÍNH RATING HỢP LỆ (thể loại của chương trình, kênh phát sóng, ngày/khung giờ phát sóng...) từ database "
        "(ví dụ: 'chương trình Sao 24H có thể loại là gì?', 'chương trình X phát trên kênh nào?', 'thể loại Phim truyện có những chương trình nào?', 'kênh VTV1 chiếu những gì?', 'rating của VTV1 hôm qua', 'có bao nhiêu kênh', 'có bao nhiêu thể loại', 'top 5 kênh'...). "
        "BẤT CỨ câu hỏi nào tra cứu thuộc tính dữ liệu Rating (kênh, thể loại, chương trình, khung giờ, rating, reach, thời lượng) hoặc đếm số lượng ĐỀU LÀ data_query.\n"
        "- definition: Người dùng hỏi về ĐỊNH NGHĨA KHÁI NIỆM TỔNG QUÁT, ý nghĩa, công thức tính của các chỉ số hoặc danh sách các giá trị hợp lệ trên toàn hệ thống "
        "(ví dụ: 'Rating là gì?', 'Reach% khác Rating% như thế nào?', 'Có những thể loại chương trình gì?', 'Có những kênh nào?', 'Key city gồm những tỉnh nào?'). "
        "CHỈ phân loại definition khi câu hỏi mang tính khái niệm chung, KHÔNG hỏi về một chương trình/nội dung cụ thể và KHÔNG hỏi đếm số lượng.\n"
        "- no_scope: Câu hỏi nằm NGOÀI phạm vi dữ liệu của Dashboard Rating TVD. Dashboard Rating CHỈ quản lý số liệu đo lường khán giả và lịch phát sóng (Rating, Reach, Lượt xem/views, Thời lượng phát/xem, Thể loại, Kênh, Chương trình, Khung giờ, Tỉnh thành/Khu vực). "
        "BẤT KỲ câu hỏi nào hỏi về các thông tin KHÔNG có trong hệ thống như: GIÁ TIỀN, BẢNG GIÁ, GIÁ QUẢNG CÁO, CHI PHÍ SẢN XUẤT, DOANH THU, LỢI NHUẬN, BẢN QUYỀN, DIỄN VIÊN, ĐẠO DIỄN, NỘI DUNG PHIM, THỜI TIẾT, CHÀO HỎI... ĐỀU BẮT BUỘC PHẢI PHÂN LOẠI LÀ no_scope "
        "(ví dụ: 'Giá của các chương trình trên vtv1 là bao nhiêu', 'Bảng giá quảng cáo VTV3', 'Chi phí sản xuất phim X', 'Doanh thu kênh HTV7', 'Diễn viên phim Sao 24H là ai', 'Thời tiết hôm nay').\n\n"
        'Trả về JSON: {"intent": "data_query|definition|no_scope", "confidence": 0.0..1.0}\n'
        "Không giải thích thêm."
    )

    _VALID_INTENTS = frozenset(("data_query", "definition", "no_scope"))

    def __init__(self, llm_client: Any) -> None:
        if llm_client is None:
            raise RuntimeError(
                "IntentRouter yêu cầu LLM client. "
                "Không thể hoạt động ở chế độ no_llm. "
                "Hãy khởi tạo với llm_client != None."
            )
        self._llm = llm_client

    def route(self, question: str) -> IntentClassificationResult:
        """
        Phân loại intent từ câu hỏi thô.
        Nếu LLM response không chứa JSON hoặc lỗi, fallback an toàn về data_query.
        """
        try:
            response = self._llm.complete_text(
                prompt=f"Câu hỏi: {question}",
                system_prompt=self._SYSTEM_PROMPT,
                temperature=0.0,
                max_tokens=500,
            )
            payload = self._parse(response)
            intent = payload.get("intent", "data_query")
            if intent not in self._VALID_INTENTS:
                logger.warning(
                    "[IntentRouter] LLM trả intent không hợp lệ '%s', fallback data_query",
                    intent,
                )
                intent = "data_query"
            confidence = float(payload.get("confidence", 0.9))
        except Exception as exc:
            logger.warning(
                "[IntentRouter] Không parse được intent từ LLM (%s), fallback data_query",
                exc,
            )
            intent = "data_query"
            confidence = 0.5

        result = IntentClassificationResult(
            intent=intent,
            confidence=confidence,
            question=question,
        )
        logger.info(
            "[IntentRouter] %s → intent=%s (conf=%.2f)",
            question[:80],
            result.intent,
            result.confidence,
        )
        return result

    @staticmethod
    def _parse(response: Any) -> dict:
        text = str(response)
        match = re.search(r"\{.*?\}", text, re.DOTALL)
        if not match:
            raise RuntimeError(
                f"IntentRouter: LLM response không chứa JSON hợp lệ: {text!r}"
            )
        try:
            return json.loads(match.group())
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                f"IntentRouter: JSON parse failed: {exc} — raw: {text!r}"
            ) from exc
