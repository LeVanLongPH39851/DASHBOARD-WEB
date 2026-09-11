from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict
from pathlib import Path

from config.llm_config import LLMClient
from config.doris_config import DorisDatabase
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline, RatingQueryPipelineResult
from src.core.text_to_sql.request_logger import log_request


def _configure_pattern_router_logging() -> None:
    """Show semantic decisions without enabling unrelated INFO logs."""
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


def _semantic_extraction_payload(result: RatingQueryPipelineResult) -> dict | None:
    """Serialize the one flat metric/dimension interpretation."""
    extraction = result.semantic_extraction
    if extraction is None:
        return None
    return {
        "source": extraction.source,
        "metric_id": extraction.metric_id,
        "dimensions": [asdict(dimension) for dimension in extraction.dimensions],
        "error": extraction.error,
        "output": extraction.output_text,
    }


def _canonical_binding_payload(result: RatingQueryPipelineResult) -> dict | None:
    """Serialize canonical matches without nesting the extraction payload again."""
    binding = result.canonical_binding
    if binding is None:
        return None
    return {
        "status": binding.status,
        "metric_id": binding.metric_id,
        "dimensions": [asdict(dimension) for dimension in binding.dimensions],
        "value_bindings": [asdict(item) for item in binding.value_bindings],
        "error": binding.error,
        "output": binding.output_text,
    }


def _payload(result: RatingQueryPipelineResult) -> dict:
    """Serialize all v3 planning evidence without executing SQL."""
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


def _log_step(step: int, title: str, payload: object, stream) -> None:
    """Write one pipeline diagnostic step to the selected output stream."""
    print(f"[Bước {step}] {title}", file=stream)
    print(json.dumps(payload, ensure_ascii=False, indent=2, default=str), file=stream)


def _print_pipeline_log(result: RatingQueryPipelineResult, stream) -> None:
    """Print the artifacts produced by every completed pipeline stage."""
    extracted = result.extracted_input
    _log_step(
        1,
        "Trích xuất input",
        {
            "domain": extracted.domain_id,
            **(_semantic_extraction_payload(result) or {}),
            "context_entities": [
                asdict(entity)
                for entity in extracted.entities
                if entity.kind in {"time_expression", "limit"}
            ],
        },
        stream,
    )

    if result.semantic_extraction and not result.semantic_extraction.is_valid:
        return

    if result.canonical_binding and not result.canonical_binding.is_valid:
        _log_step(
            2,
            "Đối sánh canonical thất bại",
            _canonical_binding_payload(result),
            stream,
        )
        return

    if result.resolved_components is None:
        _log_step(2, "Resolve entity thất bại", {"error": result.error}, stream)
        return
    resolved_payload = asdict(result.resolved_components)
    resolved_payload["canonical_binding"] = _canonical_binding_payload(result)
    resolved_payload["resolution_policy"] = result.resolution_policy
    _log_step(2, "Resolve entity", resolved_payload, stream)

    if result.pattern_context and not result.pattern_context.is_valid:
        _log_step(
            3,
            "Thiếu context cho pattern",
            asdict(result.pattern_context),
            stream,
        )
        return

    if result.query_plan is None:
        _log_step(3, "Lập query plan thất bại", {"error": result.error}, stream)
        return
    _log_step(3, "Lập query plan", asdict(result.query_plan), stream)

    _log_step(
        4,
        "Kiểm tra query plan",
        {
            "is_valid": result.validation.is_valid,
            "errors": result.validation.errors,
            "warnings": result.validation.warnings,
        },
        stream,
    )
    _log_step(
        5,
        "Render SQL" if result.generated_sql else "Không render SQL",
        {
            "success": result.generated_sql is not None,
            "error": result.error,
            "output": asdict(result.output) if result.output else None,
        },
        stream,
    )


def _process_question(
    pipeline: RatingQueryPipeline,
    question: str,
    json_output: bool,
    execute_doris: bool = False,
    use_router: bool = True,
) -> bool:
    """Print a safe SQL plan or definition answer, and optionally execute in Doris."""
    if use_router and pipeline.intent_router is not None:
        agent_response = pipeline.route(question)
        if agent_response.intent in ("definition", "no_scope"):
            full_log = {
                "intent": agent_response.intent,
                "reply": agent_response.reply,
                "source": agent_response.source,
                "data": agent_response.data,
            }
            log_request(
                question=question,
                full_log=full_log,
                llm_output=agent_response.reply,
                intent=agent_response.intent,
                success=agent_response.success,
                error=agent_response.error,
            )
            if json_output:
                print(
                    json.dumps(
                        {
                            "intent": agent_response.intent,
                            "reply": agent_response.reply,
                            "success": agent_response.success,
                            "source": agent_response.source,
                            "data": agent_response.data,
                        },
                        ensure_ascii=False,
                        indent=2,
                        default=str,
                    )
                )
            else:
                print(f"[Intent] {agent_response.intent} (source: {agent_response.source})\n")
                print(f"Output: {agent_response.reply}")
            return agent_response.success

        # intent == data_query
        result = agent_response.data["pipeline_result"]
    else:
        result = pipeline.generate(question)

    # JSON remains machine-readable on stdout; normal CLI output shows logs inline.
    _print_pipeline_log(result, sys.stderr if json_output else sys.stdout)
    if json_output:
        print(json.dumps(_payload(result), ensure_ascii=False, indent=2, default=str))
        log_request(
            question=question,
            full_log=_payload(result),
            llm_output=result.output.text if result.output else None,
            intent="data_query",
            success=result.generated_sql is not None,
            error=result.error,
        )
        return result.generated_sql is not None

    if not result.generated_sql:
        if result.output:
            print(f"Output: {result.output.text}")
            log_request(
                question=question,
                full_log=_payload(result),
                llm_output=result.output.text,
                intent="data_query",
                success=False,
                error=result.error,
            )
            return False
        errors = ", ".join(result.validation.errors) or result.error or "unknown_error"
        print(f"Lỗi: Không thể tạo SQL Rating hợp lệ: {errors}")
        log_request(
            question=question,
            full_log=_payload(result),
            llm_output=None,
            intent="data_query",
            success=False,
            error=errors,
        )
        return False

    full_log_data = _payload(result)
    bot_llm_output = result.output.text if result.output else None

    for index, query in enumerate(result.generated_sql.queries):
        if index:
            print()
        print(query.executable_sql)
        if query.parameters:
            print("\nParameters:")
            print(json.dumps(query.parameters, ensure_ascii=False, indent=2, default=str))

        if execute_doris:
            if DorisDatabase is None:
                print("\n[Doris] Thiếu dependency/config.doris_config.")
                log_request(
                    question=question,
                    full_log=full_log_data,
                    llm_output=bot_llm_output,
                    intent="data_query",
                    success=False,
                    error="missing_doris_config",
                )
                return False
            try:
                database = DorisDatabase.from_env()
                columns, rows = database.execute(query.executable_sql)
                processed = pipeline.process_rows(result.query_plan, rows)
                output_stream = sys.stderr if json_output else sys.stdout
                print("\n[Doris] Kết quả:", file=output_stream)
                output_rows = rows if processed.is_available else []
                execution_info = {
                    "status": processed.validation.status,
                    "message": processed.validation.message,
                    "columns": columns,
                    "rows": output_rows,
                    "analysis": processed.analysis,
                    "output": asdict(processed.output) if processed.output else None,
                }
                print(
                    json.dumps(
                        execution_info,
                        ensure_ascii=False,
                        indent=2,
                        default=str,
                    ),
                    file=output_stream,
                )
                full_log_data["execution"] = execution_info
                if processed.output:
                    bot_llm_output = processed.output.text
            except Exception as exc:
                print(f"\n[Doris] Lỗi thực thi: {exc}", file=sys.stderr if json_output else sys.stdout)
                log_request(
                    question=question,
                    full_log=full_log_data,
                    llm_output=bot_llm_output,
                    intent="data_query",
                    success=False,
                    error=f"doris_error: {exc}",
                )
                return False

    log_request(
        question=question,
        full_log=full_log_data,
        llm_output=bot_llm_output,
        intent="data_query",
        success=True,
    )
    return True


def _load_llm_client(disabled: bool = False):
    """Build the configured classifier client, falling back cleanly offline."""
    if disabled:
        return None
    if LLMClient is None:
        print("[LLM] Thiếu dependency cho LLM, dùng rule fallback.", file=sys.stderr)
        return None
    try:
        client = LLMClient.from_env()
        print(f"[LLM] Pattern Router enabled: {getattr(client, 'model', 'configured')}", file=sys.stderr)
        return client
    except RuntimeError as exc:
        print(f"[LLM] Không bật được LLM, dùng rule fallback: {exc}", file=sys.stderr)
        return None


def main() -> int:
    _configure_pattern_router_logging()
    parser = argparse.ArgumentParser(
        description="Create validated, parameterized Doris SQL for the fixed Rating dashboard.",
    )
    parser.add_argument(
        "question",
        nargs="?",
        help="Câu hỏi phân tích Rating. Bỏ trống để chạy chế độ tương tác.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="In toàn bộ entity, query plan, validation và SQL ở dạng JSON.",
    )
    parser.add_argument(
        "-i",
        "--interactive",
        action="store_true",
        help="Ép chạy chế độ nhập câu hỏi liên tục.",
    )
    parser.add_argument(
        "--no-llm",
        action="store_true",
        help="Tắt LLM classification và luôn dùng pattern rule fallback.",
    )
    parser.add_argument(
        "--no-router",
        action="store_true",
        help="Bỏ qua Intent Router và luôn gửi câu hỏi thẳng vào data_query pipeline.",
    )
    parser.add_argument(
        "--execute",
        "--execute-doris",
        dest="execute_doris",
        action="store_true",
        help="Gửi SQL hoàn chỉnh tới Doris bằng cấu hình DORIS_* trong .env và in kết quả.",
    )
    args = parser.parse_args()

    llm_client = _load_llm_client(disabled=args.no_llm)
    pipeline = RatingQueryPipeline(
        project_root=Path(__file__).resolve().parent,
        llm_client=llm_client,
    )
    use_router = not args.no_router
    if args.question and not args.interactive:
        return 0 if _process_question(pipeline, args.question, args.json, args.execute_doris, use_router=use_router) else 1

    print("=== Rating v3 Terminal ===")
    print("Nhập câu hỏi Rating và nhấn Enter. Gõ 'exit', 'quit' hoặc 'q' để thoát.\n")
    while True:
        try:
            question = input("RatingV3> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nĐã thoát.")
            return 0
        if not question:
            continue
        if question.lower() in {"exit", "quit", "q"}:
            print("Đã thoát.")
            return 0
        _process_question(pipeline, question, args.json, args.execute_doris, use_router=use_router)
        print()


if __name__ == "__main__":
    raise SystemExit(main())
