from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal


IntentType = Literal["data_query", "definition", "no_scope"]


@dataclass(frozen=True)
class AgentResponse:
    """
    Format output thống nhất cho toàn bộ intent branches.

    Fields:
        intent  : Nhóm intent đã phân loại ("data_query" | "definition" | "no_scope").
        reply   : Câu trả lời cuối cùng hiển thị lên Chatbot UI. Không bao giờ None.
        success : True nếu pipeline xử lý thành công.
        error   : Mã/mô tả lỗi nội bộ (dùng để log, không hiển thị trực tiếp).
        data    : Payload bổ sung theo từng intent:
                    data_query  → {"pipeline_result": RatingQueryPipelineResult}
                    definition  → {"catalog_refs": list[str]}
                    no_scope    → None
        source  : Nguồn sinh ra reply ("llm" | "deterministic" | "pipeline").
    """

    intent: IntentType
    reply: str
    success: bool
    error: str | None = None
    data: dict[str, Any] | None = None
    source: Literal["llm", "deterministic", "pipeline"] = "pipeline"
