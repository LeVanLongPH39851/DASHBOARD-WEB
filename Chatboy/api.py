"""Thin HTTP adapters for the shared ChatService; no global pipeline or connections."""
from __future__ import annotations

import argparse
import asyncio
import logging
from contextlib import asynccontextmanager

import simplejson
from fastapi import FastAPI, Request, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, ConfigDict

from src.core.text_to_sql.runtime.bootstrap import build_service
from src.core.text_to_sql.runtime.contracts import ChatRequest, ChatResult, QuestionText
from src.core.text_to_sql.runtime.errors import WorkflowError


class QueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: QuestionText
    no_llm: bool = False
    details: bool = False


def create_app(service=None):
    @asynccontextmanager
    async def lifespan(app):
        app.state.service = service or build_service()
        app.state.admission = asyncio.Semaphore(app.state.service.limits.concurrency)
        yield
        if service is None:
            app.state.service.store.client.close()

    app = FastAPI(title="Chatboy Rating", version="2.2.0", lifespan=lifespan)
    if service is not None:
        app.state.service = service
        app.state.admission = asyncio.Semaphore(service.limits.concurrency)

    @app.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, exc):
        import uuid
        result = ChatResult(request_id=str(uuid.uuid4()), status="failed", reply="Nội dung request không hợp lệ.",
                            error={"code": "invalid_input", "retryable": False})
        return JSONResponse(result.as_v2(), status_code=422)

    async def run(request: Request, payload):
        svc = request.app.state.service
        ctx = svc.new_context()
        # Runtime checks are repeated inside every blocking dependency. Coroutine cancellation
        # is only the HTTP deadline, never a substitute for Doris's server-side query_timeout.
        acquired = False
        try:
            try:
                await asyncio.wait_for(request.app.state.admission.acquire(), timeout=min(ctx.remaining(), svc.limits.queue_s))
                acquired = True
            except asyncio.TimeoutError:
                return svc._failure(ctx, WorkflowError("busy", "Hệ thống đang bận; hãy thử lại sau.", retryable=True))
            return await asyncio.wait_for(asyncio.to_thread(svc.handle, payload, ctx), timeout=ctx.remaining())
        except asyncio.TimeoutError:
            return svc._failure(ctx, WorkflowError("deadline_exceeded", "Yêu cầu đã hết thời gian xử lý.", retryable=True))
        finally:
            if acquired:
                request.app.state.admission.release()

    @app.post("/api/v2/query")
    async def query_v2(payload: ChatRequest, request: Request):
        result = await run(request, payload)
        return JSONResponse(result.as_v2(), status_code=result.http_status)

    async def legacy(payload, request):
        if payload.no_llm:
            result = request.app.state.service._failure(request.app.state.service.new_context(),
                WorkflowError("invalid_input", "Chế độ offline chỉ được cấu hình khi khởi động hoặc dùng CLI --no-llm."))
        else:
            result = await run(request, {"type": "question", "question": payload.question})
        return Response(simplejson.dumps(result.as_legacy(), ensure_ascii=False, use_decimal=True, allow_nan=False),
                        status_code=result.http_status, media_type="application/json")

    @app.post("/api/query")
    @app.post("/query")
    async def query_legacy(payload: QueryRequest, request: Request):
        return await legacy(payload, request)

    @app.get("/api/query")
    @app.get("/query")
    async def get_query(request: Request, question: str = Query(min_length=1, max_length=4000), no_llm: bool = False, details: bool = False):
        return await legacy(QueryRequest(question=question, no_llm=no_llm, details=details), request)

    @app.get("/health")
    async def health():
        return {"status": "ok", "version": "2.2.0"}

    @app.get("/ready")
    async def ready(request: Request):
        try:
            await asyncio.to_thread(request.app.state.service.store.healthy)
        except WorkflowError:
            return JSONResponse({"status": "degraded", "dependency": "redis"}, status_code=503)
        svc = request.app.state.service
        return {"status": "ready", "versions": svc.versions,
                **getattr(svc, 'evaluation_metadata', {'environment': 'runtime'})}

    @app.post("/api/dictionary/program-names/sync", status_code=410)
    @app.post("/dictionary/program-names/sync", status_code=410)
    async def retired_dictionary_sync():
        return {"error": "dictionary_sync_retired", "reply": "Tên chương trình được xác minh trực tiếp từ Doris."}

    @app.get("/")
    async def root():
        return {"service": "Chatboy Rating", "query": "/api/v2/query", "docs": "/docs"}

    return app


app = create_app()


def main():
    import uvicorn
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8010)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    uvicorn.run(app, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
