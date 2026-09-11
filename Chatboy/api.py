from __future__ import annotations

import argparse
import asyncio
import csv
import logging
import threading
import time
from collections import deque
from contextlib import asynccontextmanager
from dataclasses import asdict
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from config.doris_config import DorisDatabase
from config.llm_config import LLMClient
from src.core.text_to_sql.d_015_rating_query_pipeline import (
    RatingQueryPipeline,
    RatingQueryPipelineResult,
)
from src.core.text_to_sql.intent_logger import get_intent_logger
from src.core.text_to_sql.request_logger import log_request


# ---------------------------------------------------------
# Rate Limiter (Tối đa 10 requests/phút)
# ---------------------------------------------------------

class RateLimiter:
    """Sliding Window Rate Limiter: Tối đa max_requests trong window_seconds."""

    def __init__(self, max_requests: int = 10, window_seconds: float = 60.0) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: deque[float] = deque()
        self.lock = threading.Lock()

    def acquire(self) -> bool:
        """Kiểm tra và ghi nhận request mới. Trả về True nếu hợp lệ, False nếu vượt quota."""
        now = time.time()
        with self.lock:
            cutoff = now - self.window_seconds
            while self.requests and self.requests[0] <= cutoff:
                self.requests.popleft()

            if len(self.requests) < self.max_requests:
                self.requests.append(now)
                return True
            return False


rate_limiter = RateLimiter(max_requests=10, window_seconds=60.0)


# ---------------------------------------------------------
# Log Cleanup (Tự động xóa log cũ hơn 7 ngày)
# ---------------------------------------------------------

def cleanup_old_logs(log_dir: Path = Path("logs"), max_age_days: int = 7) -> int:
    """Xóa các file log (.log, .jsonl) cũ hơn max_age_days ngày."""
    if not log_dir.exists():
        return 0
    cutoff_time = time.time() - (max_age_days * 86400)
    deleted_count = 0
    for file_path in log_dir.glob("*"):
        if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
            try:
                file_path.unlink()
                deleted_count += 1
                logging.info(f"[LOG_CLEANUP] Đã xóa file log cũ: {file_path.name}")
            except Exception as e:
                logging.warning(f"[LOG_CLEANUP] Không thể xóa file log {file_path.name}: {e}")
    return deleted_count


async def _periodic_log_cleanup() -> None:
    """Background task chạy định kỳ mỗi 24 giờ để dọn dẹp log quá 7 ngày."""
    while True:
        try:
            cleanup_old_logs(max_age_days=7)
        except Exception as e:
            logging.warning(f"[LOG_CLEANUP] Lỗi dọn dẹp log: {e}")
        await asyncio.sleep(24 * 3600)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager: Dọn dẹp log khi khởi động và chạy task định kỳ."""
    cleanup_old_logs(max_age_days=7)
    cleanup_task = asyncio.create_task(_periodic_log_cleanup())
    try:
        yield
    finally:
        cleanup_task.cancel()


# ---------------------------------------------------------
# Pipeline Logging & LLM Initialization
# ---------------------------------------------------------

def _configure_pattern_router_logging() -> None:
    """Cấu hình logging riêng cho các module ngữ nghĩa và router."""
    for logger_name in (
        "src.core.text_to_sql.intent_routing.router",
        "src.core.text_to_sql.definition_agent.agent",
        "src.core.text_to_sql.d_004_pattern_router",
        "src.core.text_to_sql.semantic_extraction.extractor",
        "src.core.text_to_sql.semantic_extraction.intent_rules",
        "src.core.text_to_sql.canonical_binding.binder",
        "src.core.text_to_sql.semantic_resolution.resolver",
    ):
        semantic_logger = logging.getLogger(logger_name)
        semantic_logger.setLevel(logging.INFO)
        if not semantic_logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter("%(message)s"))
            semantic_logger.addHandler(handler)
        semantic_logger.propagate = False


def _load_llm_client(disabled: bool = False):
    """Khởi tạo LLM Client từ biến môi trường (fallback rule nếu không có)."""
    if disabled:
        return None
    if LLMClient is None:
        logging.warning("[LLM] Thiếu dependency cho LLM, dùng rule fallback.")
        return None
    try:
        client = LLMClient.from_env()
        logging.info(f"[LLM] Pattern Router enabled: {getattr(client, 'model', 'configured')}")
        return client
    except Exception as exc:
        logging.warning(f"[LLM] Không bật được LLM, dùng rule fallback: {exc}")
        return None


# ---------------------------------------------------------
# Diagnostics Serialization (Chỉ dùng khi details=True)
# ---------------------------------------------------------

def _semantic_extraction_payload(result: RatingQueryPipelineResult) -> dict | None:
    extraction = result.semantic_extraction
    if extraction is None:
        return None
    return {
        "source": extraction.source,
        "metric_id": extraction.metric_id,
        "dimensions": [asdict(dim) for dim in extraction.dimensions],
        "error": extraction.error,
        "output": extraction.output_text,
    }


def _canonical_binding_payload(result: RatingQueryPipelineResult) -> dict | None:
    binding = result.canonical_binding
    if binding is None:
        return None
    return {
        "status": binding.status,
        "metric_id": binding.metric_id,
        "dimensions": [asdict(dim) for dim in binding.dimensions],
        "value_bindings": [asdict(item) for item in binding.value_bindings],
        "error": binding.error,
        "output": binding.output_text,
    }


def _full_diagnostics_payload(result: RatingQueryPipelineResult) -> dict:
    return {
        "domain": result.extracted_input.domain_id,
        "entities": [asdict(entity) for entity in result.extracted_input.entities],
        "unresolved_terms": result.extracted_input.unresolved_terms,
        "notes": result.extracted_input.notes,
        "input_error": result.extracted_input.error,
        "semantic_extraction": _semantic_extraction_payload(result),
        "canonical_binding": _canonical_binding_payload(result),
        "resolution_policy": result.resolution_policy,
        "resolved_components": asdict(result.resolved_components) if result.resolved_components else None,
        "query_plan": asdict(result.query_plan) if result.query_plan else None,
        "validation": asdict(result.validation),
        "pattern_context": asdict(result.pattern_context) if result.pattern_context else None,
        "generated_sql": [asdict(query) for query in result.generated_sql.queries] if result.generated_sql else [],
        "error": result.error,
        "output": asdict(result.output) if result.output else None,
    }


# ---------------------------------------------------------
# App Initialization & Pipeline Management
# ---------------------------------------------------------

_configure_pattern_router_logging()
project_root = Path(__file__).resolve().parent

_llm_client = _load_llm_client(disabled=False)
pipeline_llm = RatingQueryPipeline(project_root=project_root, llm_client=_llm_client)
pipeline_no_llm = RatingQueryPipeline(project_root=project_root, llm_client=None)

app = FastAPI(
    title="Rating_chatbot_API",
    description="Backend API chuyển đổi câu hỏi tự nhiên thành Doris SQL và thực thi phân tích Rating.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------

class QueryRequest(BaseModel):
    """Schema cho request body (POST /api/query)."""
    question: str = Field(..., description="Câu hỏi phân tích Rating (ví dụ: 'Rating của VTV1 hôm qua')")
    no_llm: bool = Field(False, description="Bỏ qua LLM classification và dùng rule fallback")
    details: bool = Field(False, description="Bao gồm toàn bộ dữ liệu chẩn đoán pipeline (dùng để debug)")


class DictionarySyncRequest(BaseModel):
    """Schema cho request body đồng bộ tên chương trình (POST /api/dictionary/program-names/sync)."""
    programs: list[str] = Field(..., description="Danh sách các program_name cần đồng bộ vào từ điển")


# ---------------------------------------------------------
# Core Intent & Execution Handler
# ---------------------------------------------------------

def _handle_agent_route(
    raw_question: str,
    no_llm: bool = False,
    include_details: bool = False,
) -> JSONResponse:
    # 1. Kiểm tra Rate Limit (tối đa 10 requests/phút)
    if not rate_limiter.acquire():
        intent_logger = get_intent_logger("no_scope")
        intent_logger.warning("Rate limit exceeded (10 req/min) for question: %r", raw_question)
        log_request(
            question=raw_question,
            full_log={"error": "Rate limit exceeded (tối đa 10 requests/phút)"},
            llm_output="Chạm limit",
            intent="no_scope",
            success=False,
            error="Rate limit exceeded",
        )
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "success": False,
                "intent": "no_scope",
                "reply": "Chờ một chút rồi hỏi lại nha, tui chạm limit mất gòi :<<",
                "data": None,
                "error": "Rate limit exceeded. Please retry.",
            },
        )

    pipeline = pipeline_no_llm if no_llm else pipeline_llm

    # 2. Phân loại ý định (Intent Routing)
    try:
        agent_response = pipeline.route(raw_question)
    except Exception as exc:
        logging.exception(f"Lỗi khi chạy agent route: {exc}")
        intent_logger = get_intent_logger("data_query")
        intent_logger.error("question=%r | error=%r", raw_question, exc)
        log_request(
            question=raw_question,
            full_log={"error": str(exc)},
            llm_output="Hệ thống gặp lỗi, vui lòng thử lại sau.",
            intent="data_query",
            success=False,
            error=str(exc),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "intent": "data_query",
                "reply": "Hệ thống gặp lỗi, vui lòng thử lại sau.",
                "data": None,
                "error": f"Agent routing error: {exc}",
            },
        )

    # 3. Ghi log riêng biệt theo từng intent level
    intent_logger = get_intent_logger(agent_response.intent)
    intent_logger.info(
        "question=%r | success=%s | source=%s | error=%r",
        raw_question,
        agent_response.success,
        agent_response.source,
        agent_response.error,
    )

    # 4. Nhánh definition và no_scope: trả về ngay câu trả lời nghiệp vụ/hướng dẫn
    if agent_response.intent in ("definition", "no_scope"):
        full_log = {
            "intent": agent_response.intent,
            "source": agent_response.source,
            "reply": agent_response.reply,
            "data": agent_response.data,
            "error": agent_response.error,
        }
        log_request(
            question=raw_question,
            full_log=full_log,
            llm_output=agent_response.reply,
            intent=agent_response.intent,
            success=agent_response.success,
            error=agent_response.error,
        )
        response_payload: dict[str, Any] = {
            "success": agent_response.success,
            "intent": agent_response.intent,
            "reply": agent_response.reply,
            "data": None,
            "error": agent_response.error,
        }
        if include_details:
            response_payload["diagnostics"] = None
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=response_payload,
        )

    # 5. Nhánh data_query: luôn thực thi SQL trên Doris và trả về dữ liệu tinh gọn
    pipeline_result: RatingQueryPipelineResult = agent_response.data["pipeline_result"]
    queries = pipeline_result.generated_sql.queries if pipeline_result.generated_sql else []
    success = len(queries) > 0
    errors = pipeline_result.validation.errors if pipeline_result.validation else []
    error_msg = pipeline_result.error or (", ".join(errors) if errors else None)

    data_payload = None
    exec_error = None
    reply_override = None

    if success:
        if DorisDatabase is None:
            exec_error = "Thiếu DorisDatabase cấu hình trong config.doris_config."
        else:
            try:
                database = DorisDatabase.from_env()
                all_columns: list[str] = []
                all_rows: list[Any] = []
                for query in queries:
                    columns, rows = database.execute(query.executable_sql)
                    processed = pipeline.process_rows(pipeline_result.query_plan, rows)
                    output_rows = rows if processed.is_available else []
                    all_columns = columns
                    all_rows.extend(output_rows)
                    if processed.output and processed.output.text and not reply_override:
                        reply_override = processed.output.text
                data_payload = {
                    "columns": all_columns,
                    "rows": all_rows,
                    "row_count": len(all_rows),
                }
            except Exception as exc:
                logging.exception(f"Lỗi thực thi Doris: {exc}")
                exec_error = f"Doris execution failed: {exc}"

    bot_reply = reply_override or agent_response.reply
    final_error = exec_error or (error_msg if not success else None)
    is_success = success and (exec_error is None)

    # Ghi log request đầy đủ: Câu hỏi | Full JSON Log | LLM Output
    full_log = _full_diagnostics_payload(pipeline_result)
    full_log["data"] = data_payload
    log_request(
        question=raw_question,
        full_log=full_log,
        llm_output=bot_reply,
        intent="data_query",
        success=is_success,
        error=final_error,
    )

    response_payload = {
        "success": is_success,
        "intent": "data_query",
        "reply": bot_reply,
        "data": data_payload,
        "error": final_error,
    }

    if include_details:
        response_payload["diagnostics"] = _full_diagnostics_payload(pipeline_result)

    status_code = status.HTTP_200_OK if is_success else (
        status.HTTP_500_INTERNAL_SERVER_ERROR if exec_error else status.HTTP_422_UNPROCESSABLE_ENTITY
    )
    return JSONResponse(status_code=status_code, content=response_payload)


# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------

@app.get("/", summary="Root Info", tags=["General"])
async def root_info() -> dict[str, Any]:
    """Thông tin API và hướng dẫn sử dụng."""
    return {
        "service": "Rating Chatbot",
        "status": "online",
        "llm_enabled": _llm_client is not None,
        "docs_url": "/docs",
        "endpoints": {
            "get_query":    "GET /api/query?q=...",
            "post_query":   "POST /api/query (JSON body: {'question': '...'})",
            "health":       "GET /health",
            "sync_dict":    "POST /api/dictionary/program-names/sync",
        },
        "example_requests": [
            'curl -X POST "http://localhost:8010/api/query" -H "Content-Type: application/json" -d \'{"question": "rating của kênh VTV1"}\'',
        ],
    }


@app.get("/health", summary="Health Check", tags=["General"])
async def health_check() -> dict[str, str]:
    """Kiểm tra trạng thái hoạt động của backend service."""
    return {"status": "healthy"}


@app.get("/api/query", summary="Phân tích câu hỏi Rating (GET)", tags=["Query"])
@app.get("/query", summary="Phân tích câu hỏi Rating (GET alias)", tags=["Query"])
async def get_query(
    question: str | None = Query(
        None,
        description="Câu hỏi phân tích Rating (ví dụ: 'Rating của VTV1 hôm qua', 'Top 5 kênh có rating cao nhất tháng 7')",
    ),
    q: str | None = Query(
        None,
        description="Tên viết tắt cho tham số question",
    ),
    no_llm: bool = Query(
        False,
        description="Bỏ qua LLM classification và chỉ sử dụng pattern rule fallback.",
    ),
    details: bool = Query(
        False,
        description="Bao gồm chi tiết toàn bộ các bước chẩn đoán của pipeline (dùng để debug).",
    ),
    diagnostics: bool | None = Query(
        None,
        description="Alias cho details",
    ),
) -> JSONResponse:
    input_query = question or q
    if not input_query or not input_query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Thiếu tham số câu hỏi (hãy truyền qua 'question' hoặc 'q').",
        )

    raw_question = input_query.strip()
    include_details = details if diagnostics is None else (details or diagnostics)

    return await asyncio.to_thread(
        _handle_agent_route,
        raw_question=raw_question,
        no_llm=no_llm,
        include_details=include_details,
    )


@app.post("/api/query", summary="Phân tích câu hỏi Rating (POST)", tags=["Query"])
@app.post("/query", summary="Phân tích câu hỏi Rating (POST alias)", tags=["Query"])
async def post_query(request: QueryRequest) -> JSONResponse:
    """
    Endpoint POST nhận câu hỏi phân tích Rating qua JSON body, luôn phân loại qua Intent Router và thực thi truy vấn.
    """
    raw_question = request.question.strip()
    if not raw_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trường 'question' không được để trống.",
        )

    return await asyncio.to_thread(
        _handle_agent_route,
        raw_question=raw_question,
        no_llm=request.no_llm,
        include_details=request.details,
    )


@app.post("/api/dictionary/program-names/sync", summary="Đồng bộ danh sách chương trình", tags=["Dictionary"])
@app.post("/dictionary/program-names/sync", summary="Đồng bộ danh sách chương trình (alias)", tags=["Dictionary"])


# ---------------------------------------------------------
# CLI Runner
# ---------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Chạy backend API server cho Rating Query Pipeline")
    parser.add_argument("--host", default="0.0.0.0", help="Host lắng nghe (mặc định: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8010, help="Port lắng nghe (mặc định: 8010)")
    parser.add_argument("--reload", action="store_true", help="Tự động reload code khi có thay đổi")
    args = parser.parse_args()

    import uvicorn
    print(f"Khởi chạy Rating Chatbot API tại http://{args.host}:{args.port}")
    print(f"Tài liệu Swagger UI: http://{args.host}:{args.port}/docs")
    uvicorn.run("api:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    main()
