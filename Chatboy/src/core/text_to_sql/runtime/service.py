"""The application boundary used by API, CLI, replay and live evaluation."""
from __future__ import annotations

import hashlib
import json
import threading
import copy
from dataclasses import asdict, replace
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path

from pydantic import ValidationError

from ..catalog import RatingCatalog
from ..canonical_binding.matchers.doris_ngram import DorisNgramCanonicalMatcher
from ..d_015_rating_query_pipeline import RatingQueryPipeline
from ..input_contracts import ExtractedEntity, ExtractedInput, ExtractedSortIntent
from ..query_plan import TimeRange, ComparisonPeriod, ComparisonSpec
from ..semantic_extraction.contracts import ExtractedDimension, SemanticExtractionResult
from ..semantic_selection import SemanticSelection
from .context import RequestContext, RuntimeLimits, SystemClock, JsonTraceSink, request_scope, stage, fingerprint
from .contracts import ChatResult, REQUEST_ADAPTER, QuestionRequest, wire_value
from .errors import WorkflowError
from .skills import SkillAwareLLM, SkillRegistry


def catalog_version(catalog):
    digest = hashlib.sha256()
    for path in sorted((catalog.project_root / "data/dashboard/rating").rglob("*")):
        if path.is_file():
            digest.update(str(path.relative_to(catalog.project_root)).encode())
            digest.update(path.read_bytes())
    return digest.hexdigest()[:16]


def workflow_version(project_root=None):
    root = Path(project_root or Path(__file__).resolve().parents[4])
    paths = [root / "api.py", root / "main.py", *sorted((root / "config").glob("*.py")),
             *sorted((root / "src/core/text_to_sql").rglob("*.py")),
             *sorted((root / "src/evaluation").glob("*.py"))]
    digest = hashlib.sha256()
    for path in paths:
        if "test" not in path.relative_to(root).parts:
            digest.update(str(path.relative_to(root)).encode())
            digest.update(path.read_bytes())
    return "accuracy-v2.2-" + digest.hexdigest()[:16]


class ChatService:
    def __init__(self, *, llm, executor, store, catalog=None, clock=None, skills=None,
                 trace=None, limits=None, pipeline_factory=None, router=None, repair_enabled=True):
        self.catalog = catalog or RatingCatalog.load()
        self.clock, self.trace = clock or SystemClock(), trace or JsonTraceSink()
        self.limits = limits or RuntimeLimits()
        self.skills = skills or SkillRegistry(self.catalog)
        self.llm = SkillAwareLLM(llm, self.skills) if llm else None
        self.executor, self.store, self.router = executor, store, router
        self.pipeline_factory = pipeline_factory
        self.repair_enabled = repair_enabled
        self._slots = threading.BoundedSemaphore(self.limits.concurrency)
        self.versions = {"workflow": workflow_version(), "catalog": catalog_version(self.catalog),
                         "skills": self.skills.version, "model": getattr(llm, "model", "offline-rules"),
                         "prompt": self._prompt_version(), "skills_enabled": self.skills.enabled,
                         "repair_enabled": repair_enabled}

    @staticmethod
    def _prompt_version():
        root = Path(__file__).resolve().parents[1]
        files = ("intent_routing/router.py", "semantic_extraction/providers/llm.py", "d_004_pattern_router.py")
        return fingerprint("".join((root / path).read_text() for path in files))

    def new_context(self):
        return RequestContext(clock=self.clock, trace=self.trace, limits=self.limits,
                              versions=self.versions.copy(), repair_enabled=self.repair_enabled,
                              reference_time=getattr(self, 'reference_time', None))

    def _pipeline(self, ctx):
        if self.pipeline_factory:
            return self.pipeline_factory(ctx)
        def lookup(sql, params):
            result = self.executor.execute_result(sql, params)
            return list(result.columns), list(result.rows)
        return RatingQueryPipeline(catalog=self.catalog, project_root=self.catalog.project_root,
            llm_client=self.llm, today_provider=lambda: ctx.reference_time.date(),
            canonical_matcher=DorisNgramCanonicalMatcher(executor=lookup), skill_registry=self.skills)

    def handle(self, request, context=None):
        ctx = context or self.new_context()
        acquired = False
        intent = None
        with request_scope(ctx):
            try:
                if isinstance(request, dict):
                    request = REQUEST_ADAPTER.validate_python(request)
                with stage("admission"):
                    queue_left = self.limits.queue_s - (ctx.clock.monotonic() - ctx.started)
                    if queue_left <= 0:
                        raise WorkflowError("busy", "Đã hết thời gian chờ xử lý.", retryable=True)
                    acquired = self._slots.acquire(timeout=min(ctx.remaining(), queue_left))
                    if not acquired:
                        raise WorkflowError("busy", "Hệ thống đang bận; hãy thử lại sau.", retryable=True)
                if request.type == "clarification":
                    result = self._resume(request, ctx)
                else:
                    pipeline = self._pipeline(ctx)
                    with stage("route"):
                        if self.router:
                            classified = self.router(request.question)
                            intent = getattr(classified, "intent", classified)
                        elif pipeline.intent_router:
                            intent = pipeline.intent_router.route(request.question).intent
                        else:
                            # Only explicitly injected offline/rule deployments enter this path.
                            intent = "data_query"
                        if intent not in {"definition", "data_query", "no_scope"}:
                            raise WorkflowError("invalid_semantics", "Phân loại yêu cầu không hợp lệ.")
                    self.skills.activate(intent)
                    if intent == "no_scope":
                        from ..definition_agent import no_scope_response
                        result = ChatResult(request_id=ctx.request_id, status="unsupported", intent=intent, reply=no_scope_response().reply)
                    elif intent == "definition":
                        with stage("definition"):
                            response = pipeline.definition_agent.answer(request.question)
                        result = ChatResult(request_id=ctx.request_id, status="answered" if response.success else "unsupported",
                            intent=intent, reply=response.reply, evidence=response.data or {})
                    else:
                        result, _ = self._data(pipeline, request.question, ctx)
                ctx.remaining()
            except ValidationError:
                result = self._failure(ctx, WorkflowError("invalid_input", "Nội dung request không hợp lệ."), intent)
            except WorkflowError as exc:
                result = self._failure(ctx, exc, intent)
            except Exception as exc:
                ctx.emit("workflow_error", outcome="failed", error_code="internal_error", exception_type=type(exc).__name__)
                result = self._failure(ctx, WorkflowError("internal_error", "Không thể hoàn tất yêu cầu."), intent)
            finally:
                if acquired:
                    self._slots.release()
            result.meta.update(versions=ctx.versions, duration_ms=(ctx.clock.monotonic() - ctx.started) * 1000,
                               llm_attempts=ctx.llm_calls, repairs=ctx.repairs, transport_retries=ctx.retries)
            ctx.emit("request", outcome=result.status, error_code=(result.error or {}).get("code"),
                     duration_ms=result.meta["duration_ms"])
            return result

    @staticmethod
    def _failure(ctx, exc, intent="data_query"):
        return ChatResult(request_id=ctx.request_id, status="failed", intent=intent,
                          reply=exc.message, error={"code": exc.code, "retryable": exc.retryable,
                              **({'field_errors': exc.field_errors} if exc.field_errors else {})})

    def _data(self, pipeline, question, ctx, *, state=None):
        overrides = {}
        if state:
            overrides["extraction_override"] = self._load_extraction(state["extraction"])
            overrides["context_override"] = self._load_context(state["context"])
            if state.get("selection"):
                overrides["selection_override"] = SemanticSelection(**state["selection"])
            overrides['confirmed'] = state.get('confirmed_sources', {})
            overrides['name_spans_override'] = state.get('name_spans')
        with stage("plan"):
            planned = pipeline.generate(question, **overrides)
        if planned.outcome.kind != 'ready':
            fields = self._pending_fields(planned, pipeline)
            if planned.outcome.kind == 'unsupported':
                return ChatResult(request_id=ctx.request_id, status="unsupported", intent="data_query",
                                  reply=planned.output.text if planned.output else "Yêu cầu chưa được hỗ trợ.",
                                  evidence={"reason": planned.outcome.reason_code,
                                            'semantic_coverage': asdict(planned.semantic_coverage),
                                            'time_resolution': asdict(planned.time_resolution) if planned.time_resolution else None}), None
            if not fields:
                raise WorkflowError('internal_error', 'Thiếu contract cho yêu cầu làm rõ.')
            pending = {"question": question, "extraction": asdict(planned.semantic_extraction),
                       "context": asdict(planned.extracted_input), "fields": fields,
                       "reference_time": ctx.reference_time.isoformat(), "versions": ctx.versions,
                       "expires_at": (ctx.clock.now() + timedelta(minutes=15)).isoformat(),
                       "confirmed": state.get("confirmed", []) if state else [],
                       "confirmed_sources": state.get('confirmed_sources', {}) if state else {},
                       "name_spans": state['name_spans'] if state else pipeline.coverage_checker.name_spans(planned.semantic_extraction),
                       "schema_version": '2.2'}
            if planned.pattern_context and planned.resolved_components:
                components = planned.resolved_components
                pending["selection"] = {"metric_ids": list(components.metric_ids or ((components.metric_id,) if components.metric_id else ())),
                    "pattern_name": planned.pattern_context.pattern_name}
            if state:
                pending.update(revision=state["revision"] + 1, rounds=state["rounds"] + 1, expires_at=state["expires_at"])
                if pending["rounds"] >= 2:
                    raise WorkflowError("clarification_limit", "Đã dùng hai lượt bổ sung; hãy gửi câu hỏi mới đầy đủ hơn.")
                identifier = state["id"]
            else:
                with stage("clarification_create"):
                    identifier, pending = self.store.create(wire_value(pending))
            reply = planned.output.text if planned.output else "Hãy bổ sung thông tin còn thiếu."
            public_fields = self._public_fields(fields)
            result = ChatResult(request_id=ctx.request_id, status="needs_clarification", intent="data_query", reply=reply,
                clarification={"id": identifier, "revision": pending["revision"], "fields": public_fields,
                               "expires_at": pending["expires_at"]},
                evidence={'semantic_coverage': asdict(planned.semantic_coverage),
                          'time_resolution': asdict(planned.time_resolution) if planned.time_resolution else None})
            return result, pending
        plan = planned.query_plan
        self.skills.activate("data_query", plan.primary_metric.id if plan.primary_metric else None, plan.pattern_name)
        rows, queries = [], []
        for query in planned.generated_sql.queries:
            result = self.executor.execute_result(query.sql, query.parameters)
            with stage("validate_result_schema"):
                validation = pipeline.result_validator.validate(plan, list(result.rows), query.schema, result.columns)
                if validation.status == "invalid":
                    ctx.emit("result_schema", outcome="failed", error_code="invalid_result", validation_errors=validation.errors)
                    raise WorkflowError("invalid_result", "Nguồn dữ liệu trả sai schema hoặc giá trị không hợp lệ.")
            rows.extend({**row, "__query_id": query.query_id, **({"__period_id": query.period_id} if query.period_id else {})} for row in result.rows)
            queries.append({"query_id": query.query_id, "period_id": query.period_id, "fingerprint": fingerprint(query.sql),
                            "parameters": query.parameters, "row_count": len(result.rows)})
        post = pipeline.process_rows(plan, rows)
        if post.validation.status == "invalid":
            raise WorkflowError("invalid_result", "Kết quả thiếu cột hoặc giá trị không hợp lệ.")
        evidence = {"plan": asdict(plan), "queries": queries, "catalog": ctx.versions["catalog"],
                    "filter_sources": [{"field": f.field, "value": f.value,
                        "source": "clarification" if state and f.field in state.get("confirmed", []) else "question"} for f in plan.filters],
                    "facts": asdict(post.facts)["facts"] if post.facts else [],
                    "analysis": post.analysis, "source": "Dashboard Rating / semantic catalog",
                    'semantic_coverage': asdict(planned.semantic_coverage),
                    'time_resolution': {**asdict(planned.time_resolution), 'reference_time': ctx.reference_time.isoformat()},
                    'result_coverage': asdict(post.coverage) if post.coverage else None}
        schema = planned.generated_sql.queries[0].schema
        columns, public_rows = self._data_payload(schema, rows, bool(plan.comparison_spec))
        result = ChatResult(request_id=ctx.request_id, status="answered" if post.is_available else "no_data", intent="data_query",
            reply=post.output.text, data={"columns": columns, "rows": public_rows, "row_count": len(rows)}, evidence=evidence,
            meta={"display_truncated": len(rows) > self.limits.display_rows, "display_limit": self.limits.display_rows,
                  "data_status": post.validation.status})
        return result, None

    @staticmethod
    def _data_payload(schema, rows, comparison):
        columns = []
        public = [{k: v for k, v in row.items() if not k.startswith("__")} for row in rows]
        for column in schema.columns:
            kind = column.data_type
            if kind == "number":
                values = [row[column.alias] for row in rows if row[column.alias] is not None]
                kind = "integer" if values and all(type(v) is int for v in values) else "decimal"
                if kind == "decimal":
                    for row in public:
                        if row[column.alias] is not None:
                            row[column.alias] = Decimal(str(row[column.alias]))
            columns.append({"name": column.alias, "semantic_id": column.semantic_id, "type": kind, "unit": column.unit})
        if comparison:
            columns.append({"name": "period_id", "type": "string"})
            for original, row in zip(rows, public):
                row["period_id"] = original["__period_id"]
        return columns, public

    def _pending_fields(self, result, pipeline):
        if result.outcome.fields:
            return list(result.outcome.fields)
        fields = []
        if result.canonical_binding:
            for index, binding in enumerate(result.canonical_binding.value_bindings):
                if binding.status not in {"ambiguous", "not_found"}:
                    continue
                dimension = self.catalog.get_dimension(binding.dimension_id)
                mapping = {fingerprint(binding.dimension_id + value): value for value in binding.alternatives[:5]}
                fields.append({"id": f"{binding.dimension_id.rsplit('.', 1)[-1]}_{index}", "label": dimension.label,
                    "kind": "canonical", "dimension_id": binding.dimension_id, "raw_value": binding.raw_value,
                    "input": "choice" if mapping else "text", "mapping": mapping,
                    "options": [{"id": k, "label": v} for k, v in mapping.items()]})
        if result.pattern_context:
            missing = result.pattern_context.missing_fields
            if any("time" in field or "period" in field for field in missing):
                comparison = result.pattern_context.pattern_name == "period_comparison"
                fields.append({"id": "comparison_periods" if comparison else "time_range", "label": "Hai kỳ so sánh" if comparison else "Khoảng thời gian",
                               "kind": "comparison" if comparison else "time", "input": "text", "options": []})
            for name in missing:
                if name == "metric":
                    mapping = {m.id: m.id for m in self.catalog.metrics.values() if m.status == "active"}
                    fields.append({"id": "metric", "label": "Chỉ số", "kind": "metric", "input": "choice", "mapping": mapping,
                                   "options": [{"id": k, "label": self.catalog.require_metric(k).label} for k in mapping]})
                elif name == "dimensions":
                    metric = self.catalog.require_metric(result.resolved_components.metric_id) if result.resolved_components.metric_id else None
                    allowed = metric.supported_dimensions if metric else self.catalog.dimensions.keys()
                    mapping = {d: d for d in allowed if self.catalog.get_dimension(d).group_by}
                    fields.append({"id": "dimension", "label": "Chiều phân tích", "kind": "dimension", "input": "choice", "mapping": mapping,
                                   "options": [{"id": d, "label": self.catalog.get_dimension(d).label} for d in mapping]})
                elif name == "filters" and result.resolved_components.dimensions:
                    dimension_id = next((d for d in result.resolved_components.dimensions
                                         if self.catalog.get_dimension(d).semantic_type != "time"), None)
                    if dimension_id:
                        fields.append({"id": "filter_values", "label": self.catalog.get_dimension(dimension_id).label + " (phân cách bằng dấu ;)",
                                       "kind": "filter", "dimension_id": dimension_id, "input": "text", "options": []})
        return fields

    @staticmethod
    def _public_fields(fields):
        return [{k: v for k, v in field.items() if k not in {'dimension_id', 'raw_value', 'kind', 'mapping'}} for field in fields]

    def _resume(self, request, ctx):
        with stage("clarification_claim"):
            kind, state, token = self.store.claim(request.clarification_id, request.revision, request.answers)
        if kind == "cached":
            cached = ChatResult.model_validate(state)
            if cached.meta.get("versions") != ctx.versions:
                raise WorkflowError("clarification_expired", "Catalog hoặc skills đã thay đổi; hãy gửi lại câu hỏi.")
            cached.meta["replayed"] = True
            cached.meta["original_request_id"] = cached.request_id
            cached.request_id = ctx.request_id
            return cached
        next_state = None
        try:
            if state["versions"] != ctx.versions:
                raise WorkflowError("clarification_expired", "Catalog hoặc skills đã thay đổi; hãy gửi lại câu hỏi.")
            if state["rounds"] >= 2:
                raise WorkflowError("clarification_limit", "Đã hết số lượt bổ sung.")
            state["id"] = request.clarification_id
            ctx.reference_time = datetime.fromisoformat(state["reference_time"])
            pipeline = self._pipeline(ctx)
            try:
                # Input validation is pure: no dependencies and no mutation of the saved state.
                applied = self._apply_answers(copy.deepcopy(state), request.answers, pipeline)
            except WorkflowError as exc:
                if exc.code != 'invalid_input':
                    raise
                try:
                    self.store.release_invalid_input(request.clarification_id, request.revision, token)
                except WorkflowError as release_error:
                    # A failed release must never fall through to complete/close.
                    return self._failure(ctx, release_error)
                result = self._failure(ctx, exc)
                result.clarification = {'id': request.clarification_id, 'revision': request.revision,
                    'fields': self._public_fields(state['fields']), 'expires_at': state['expires_at']}
                return result
            state = applied
            result, next_state = self._data(pipeline, state["question"], ctx, state=state)
        except WorkflowError as exc:
            result = self._failure(ctx, exc)
        except Exception as exc:
            ctx.emit('workflow_error', outcome='failed', error_code='internal_error', exception_type=type(exc).__name__)
            result = self._failure(ctx, WorkflowError('internal_error', 'Không thể hoàn tất yêu cầu.'))
        result.meta.update(versions=ctx.versions, llm_attempts=ctx.llm_calls, repairs=ctx.repairs)
        self.store.complete(request.clarification_id, request.revision, token, result.as_v2(), wire_value(next_state))
        return result

    def _apply_answers(self, state, answers, pipeline):
        def invalid(field, code, message):
            return WorkflowError('invalid_input', message,
                field_errors=[{'field': field, 'code': code, 'message': message}])
        pending = {field["id"]: field for field in state["fields"]}
        if not set(answers) <= pending.keys():
            raise invalid(next(iter(set(answers) - pending.keys())), 'unexpected_field', 'Chỉ được bổ sung các trường đang chờ làm rõ.')
        extraction = self._load_extraction(state["extraction"])
        context = self._load_context(state["context"])
        for key, answer in answers.items():
            original_answer = answer
            field = pending[key]
            if field["input"] == "choice":
                if answer not in field["mapping"]:
                    raise invalid(key, 'invalid_option', 'Lựa chọn không nằm trong các phương án đã cung cấp.')
                answer = field["mapping"][answer]
            if field["kind"] == "canonical":
                extraction = replace(extraction, dimensions=tuple(replace(dim, raw_values=tuple(answer if raw == field["raw_value"] else raw for raw in dim.raw_values))
                    if dim.dimension_id == field["dimension_id"] else dim for dim in extraction.dimensions))
                state["confirmed"].append(field["dimension_id"])
            elif field["kind"] in {"time", "comparison"}:
                time_input = pipeline.context_extractor.extract(answer)
                time_resolution = pipeline.compiler.time_resolver.inspect(time_input, comparison=field['kind'] == 'comparison')
                if time_resolution.status != 'resolved':
                    raise invalid(key, time_resolution.reason_code or 'invalid_time', 'Cần nhập kỳ thời gian hợp lệ.')
                if field["kind"] == "time":
                    context = replace(context, time_range_override=pipeline.compiler.time_resolver.resolve(time_input))
                else:
                    context = replace(context, comparison_override=pipeline.compiler.time_resolver.comparison(time_input))
            elif field["kind"] == "metric":
                extraction = replace(extraction, metric_id=answer)
                state.pop("selection", None)
            elif field["kind"] == "dimension":
                extraction = replace(extraction, dimensions=(*extraction.dimensions, ExtractedDimension(answer, (), ("group_by",))))
            elif field["kind"] == "filter":
                values = tuple(v.strip() for v in answer.split(";") if v.strip())
                if not 1 <= len(values) <= 5:
                    raise invalid(key, 'invalid_filter_values', 'Hãy nhập từ 1 đến 5 giá trị phân cách bằng dấu ;.')
                extraction = replace(extraction, dimensions=tuple(replace(d, raw_values=values, roles=tuple(dict.fromkeys((*d.roles, "filter"))))
                    if d.dimension_id == field["dimension_id"] else d for d in extraction.dimensions))
                state["confirmed"].append(field["dimension_id"])
            else:
                raise RuntimeError('unsupported_clarification_kind')
            source_key = field.get('dimension_id', key)
            state.setdefault('confirmed_sources', {})[source_key] = original_answer
        return {**state, "extraction": asdict(extraction), "context": asdict(context)}

    @staticmethod
    def _load_extraction(value):
        return SemanticExtractionResult(**{**value, "dimensions": tuple(ExtractedDimension(d["dimension_id"], tuple(d["raw_values"]), tuple(d["roles"])) for d in value["dimensions"])})

    @staticmethod
    def _load_context(value):
        data = {**value, "entities": tuple(ExtractedEntity(**v) for v in value["entities"]),
                "sort_intents": tuple(ExtractedSortIntent(**v) for v in value["sort_intents"])}
        if data.get("time_range_override"):
            data["time_range_override"] = TimeRange(**data["time_range_override"])
        if data.get("comparison_override"):
            data["comparison_override"] = ComparisonSpec(*(ComparisonPeriod(v["id"], TimeRange(**v["time_range"])) for v in data["comparison_override"].values()))
        return ExtractedInput(**data)
