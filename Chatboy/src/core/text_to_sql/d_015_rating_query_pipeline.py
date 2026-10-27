"""Workflow 015: orchestrate the complete Rating query pipeline."""

from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import date
from pathlib import Path
from typing import Any, Callable

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.facts import FactSet
from src.core.text_to_sql.planning_contracts import (PlanningOutcome, SemanticCoverage, TimeResolution, ResultCoverage, UnsupportedRequest, InvalidResultError)
from src.core.text_to_sql.semantic_coverage import SemanticCoverageChecker
from src.core.text_to_sql.query_plan import QueryPlanError
from src.core.text_to_sql.runtime.context import stage
from src.core.text_to_sql.runtime.errors import WorkflowError
from src.core.text_to_sql.d_001_semantic_extraction import (
    CatalogContextBuilder,
    LLMSemanticExtractionProvider,
    QuestionContextExtractor,
    RuleSemanticExtractionProvider,
    SemanticExtractionResult,
    SemanticExtractor,
)
from src.core.text_to_sql.d_002_canonical_binding import (
    CanonicalBinder,
    CanonicalBindingResult,
    CanonicalMatcherRegistry,
)
from src.core.text_to_sql.d_003_semantic_resolution import SemanticResolver
from src.core.text_to_sql.input_contracts import ExtractedInput
from src.core.text_to_sql.d_013_pattern_compute import PatternCompute
from src.core.text_to_sql.d_006_pattern_context_validator import (
    MISSING_PATTERN_CONTEXT_ERROR,
    PatternContextValidation,
    PatternContextValidator,
)
from src.core.text_to_sql.query_plan import RatingQueryPlan
from src.core.text_to_sql.d_014_rating_analysis_narrator import RatingAnalysisNarrator, RatingAnalysisOutput
from src.core.text_to_sql.d_009_rating_plan_compiler import RatingPlanCompiler
from src.core.text_to_sql.d_010_rating_query_plan_validator import RatingQueryPlanValidator, ValidationResult
from src.core.text_to_sql.d_012_rating_result_validator import RatingDataValidation, RatingResultValidator
from src.core.text_to_sql.d_011_rating_sql_renderer import GeneratedSQLBatch, RatingSQLRenderer
from src.core.text_to_sql.rating_resolver import RatingResolveEntities
from src.core.text_to_sql.resolved_entities import ResolvedSQLComponents
from src.core.text_to_sql.d_004_pattern_router import PatternRouter
from src.core.text_to_sql.d_005_semantic_selector import SemanticSelector
from src.core.text_to_sql.semantic_memory import CanonicalMemory
from src.core.text_to_sql.d_008_time_resolver import RatingTimeResolver
from src.core.text_to_sql.semantic_extraction.intent_rules import SemanticIntentRuleLayer
from src.core.text_to_sql.intent_routing import AgentResponse, IntentRouter
from src.core.text_to_sql.definition_agent import SemanticDefinitionAgent, no_scope_response


def _in_stage(name, callback, *args, **kwargs):
    with stage(name):
        return callback(*args, **kwargs)


@dataclass(frozen=True)
class RatingQueryPipelineResult:
    extracted_input: ExtractedInput
    resolved_components: ResolvedSQLComponents | None
    query_plan: object | None
    validation: ValidationResult
    generated_sql: GeneratedSQLBatch | None
    error: str | None = None
    output: RatingAnalysisOutput | None = None
    pattern_context: PatternContextValidation | None = None
    semantic_extraction: SemanticExtractionResult | None = None
    canonical_binding: CanonicalBindingResult | None = None
    resolution_policy: str | None = None
    outcome: PlanningOutcome = PlanningOutcome("unsupported", "unclassified_plan")
    semantic_coverage: SemanticCoverage | None = None
    time_resolution: TimeResolution | None = None

    @property
    def rendered_sql(self):
        return self.generated_sql.queries[0] if self.generated_sql else None


@dataclass(frozen=True)
class RatingPostExecutionResult:
    """Kết quả kiểm tra và tính toán sau khi Doris trả dữ liệu."""

    validation: RatingDataValidation
    analysis: dict[str, Any] | None = None
    output: RatingAnalysisOutput | None = None
    facts: FactSet | None = None
    coverage: ResultCoverage | None = None

    @property
    def is_available(self) -> bool:
        return self.validation.is_available


class RatingQueryPipeline:
    """Lập SQL và xử lý các dòng kết quả do tầng thực thi cung cấp."""

    def __init__(
        self,
        project_root: str | Path | None = None,
        today_provider: Callable[[], date] | None = None,
        llm_client=None,
        catalog=None,
        canonical_matcher=None,
        skill_registry=None,
    ):
        self.project_root = Path(project_root or Path(__file__).resolve().parents[3])
        self.catalog = catalog or RatingCatalog.load(project_root=self.project_root)
        self.skill_registry = skill_registry
        self.pattern_catalog = self.catalog.patterns
        self.canonical_memory = CanonicalMemory(self.catalog)
        self.coverage_checker = SemanticCoverageChecker(self.catalog, self.canonical_memory)
        extraction_context = CatalogContextBuilder(
            self.catalog,
            self.canonical_memory,
        ).build()
        fallback_extractor = RuleSemanticExtractionProvider(
            self.catalog,
            self.canonical_memory,
        )
        primary_extractor = (
            LLMSemanticExtractionProvider(llm_client, self.coverage_checker)
            if llm_client is not None
            else None
        )
        self.semantic_extractor = SemanticExtractor(
            context=extraction_context,
            primary=primary_extractor,
            fallback=fallback_extractor,
        )
        self.semantic_intent_rules = SemanticIntentRuleLayer(self.catalog)
        self.context_extractor = QuestionContextExtractor(self.catalog)
        self.extract_input = self.context_extractor
        self.canonical_binder = CanonicalBinder(
            self.catalog,
            CanonicalMatcherRegistry(self.canonical_memory, doris_matcher=canonical_matcher),
        )
        self.resolve_entities = RatingResolveEntities(project_root=self.project_root, catalog=self.catalog)
        self.semantic_resolver = SemanticResolver(self.catalog, self.resolve_entities)
        time_resolver = RatingTimeResolver(today_provider=today_provider)
        self.compiler = RatingPlanCompiler(
            catalog=self.catalog,
            time_resolver=time_resolver,
        )
        self.pattern_context_validator = PatternContextValidator(
            catalog=self.catalog,
            time_resolver=time_resolver,
        )
        self.pattern_router = PatternRouter(llm_client=llm_client, catalog=self.catalog)
        self.semantic_selector = SemanticSelector(
            catalog=self.catalog,
            pattern_router=self.pattern_router,
            llm_client=llm_client,
        )
        self.validator = RatingQueryPlanValidator(
            catalog=self.catalog,
        )
        self.renderer = RatingSQLRenderer(catalog=self.catalog)
        self.result_validator = RatingResultValidator(self.catalog)
        self.pattern_compute = PatternCompute(catalog=self.catalog)
        self.analysis_narrator = RatingAnalysisNarrator(
            llm_client=llm_client,
            catalog=self.catalog,
        )
        self.intent_router = (
            IntentRouter(llm_client=llm_client) if llm_client is not None else None
        )
        self.definition_agent = SemanticDefinitionAgent(
            llm_client=llm_client,
            catalog=self.catalog,
        )

    def generate(self, question: str, *, extraction_override=None, context_override=None,
                 selection_override=None, confirmed=None, name_spans_override=None) -> RatingQueryPipelineResult:
        with stage("extract"):
            extraction = extraction_override or self.semantic_intent_rules.apply(
                self.semantic_extractor.extract(question)).extraction
        context_input = context_override or self.context_extractor.extract(self.coverage_checker.context_question(extraction))
        components = binding = plan = context_validation = time_resolution = None
        coverage = self.coverage_checker.check(extraction, confirmed=confirmed, name_spans=name_spans_override)
        policy = None

        def stopped(kind, reason, reply, fields=()):
            return RatingQueryPipelineResult(extracted_input=context_input, resolved_components=components,
                query_plan=plan, validation=ValidationResult((reason,)), generated_sql=None,
                error=reason, output=RatingAnalysisOutput(text=reply, source="deterministic"),
                pattern_context=context_validation, semantic_extraction=extraction,
                canonical_binding=binding, resolution_policy=policy,
                outcome=PlanningOutcome(kind, reason, tuple(fields)),
                semantic_coverage=coverage, time_resolution=time_resolution)

        if not extraction.is_valid:
            return stopped('unsupported', 'no_semantic_evidence', extraction.output_text or 'Không xác định được yêu cầu Rating.')
        if coverage.status == 'unsupported':
            return stopped('unsupported', coverage.reason_code, 'Yêu cầu có điều kiện hoặc kiểu phân tích chưa được hỗ trợ.')
        if coverage.status == 'mismatch':
            raise WorkflowError('invalid_semantics', 'Ngữ nghĩa chưa khớp đầy đủ với câu hỏi; hãy diễn đạt lại yêu cầu.')
        if coverage.status == 'ambiguous':
            mapping = {m: m for m in coverage.candidates}
            return stopped('needs_clarification', 'ambiguous_metric', 'Bạn muốn phân tích chỉ số nào?', [{
                'id': 'metric', 'label': 'Chỉ số', 'kind': 'metric', 'input': 'choice', 'mapping': mapping,
                'options': [{'id': m, 'label': self.catalog.require_metric(m).label} for m in mapping]}])
        if self.skill_registry:
            comparison = 'comparison' if any(c in context_input.normalized_question for c in ('so sanh', 'so voi', 'chenh lech', 'top ')) else None
            self.skill_registry.activate('data_query', extraction.metric_id, comparison)
        with stage('bind'):
            binding = self.canonical_binder.bind(extraction)
        if any(b.status == 'unavailable' for b in binding.value_bindings):
            raise WorkflowError('dependency_unavailable', 'Không thể xác minh đối tượng trong danh mục.', retryable=True)
        if not binding.is_valid:
            return stopped('needs_clarification', binding.error or 'canonical_binding_failed', binding.output_text or 'Hãy xác nhận đối tượng cần phân tích.')
        try:
            resolution = _in_stage('resolve', self.semantic_resolver.resolve, context_input, binding)
            context_input, components, policy = resolution.extracted_input, resolution.components, resolution.policy_name
            selection = selection_override or _in_stage('select', self.semantic_selector.select, context_input, components)
            if selection.pattern_name == 'dimension_listing':
                components = replace(components, metric_id=None, metric_ids=())
            elif selection.metric_ids:
                components = replace(components, metric_id=selection.primary_metric_id, metric_ids=selection.metric_ids)
            comparison = selection.pattern_name == 'period_comparison'
            with stage('resolve_time'):
                time_resolution = self.compiler.time_resolver.inspect(context_input, comparison=comparison)
            if time_resolution.status == 'invalid':
                raise WorkflowError('invalid_input', 'Ngày hoặc khoảng thời gian không hợp lệ.', field_errors=[{
                    'field': 'comparison_periods' if comparison else 'time_range',
                    'code': time_resolution.reason_code, 'message': 'Hãy nhập ngày và khoảng thời gian hợp lệ.'}])
            if time_resolution.status in {'ambiguous', 'unsupported'}:
                key = 'comparison_periods' if comparison else 'time_range'
                context_validation = PatternContextValidation(selection.pattern_name, False, (key,),
                    'Hãy bổ sung khoảng thời gian hợp lệ.', error=MISSING_PATTERN_CONTEXT_ERROR)
                return stopped('needs_clarification', time_resolution.reason_code,
                    'Hãy nhập rõ hai kỳ so sánh.' if comparison else 'Hãy nhập ngày bắt đầu và ngày kết thúc.', [{
                        'id': key, 'label': 'Hai kỳ so sánh' if comparison else 'Khoảng thời gian',
                        'kind': 'comparison' if comparison else 'time', 'input': 'text', 'options': []}])
            context_validation = _in_stage('validate_context', self.pattern_context_validator.validate,
                context_input, components, selection.pattern_name)
            if not context_validation.is_valid:
                return stopped('needs_clarification', MISSING_PATTERN_CONTEXT_ERROR, context_validation.output_text)
            plan = _in_stage('compile', self.compiler.compile, context_input, components,
                pattern_name=selection.pattern_name, denominator_scope=selection.denominator_scope)
        except UnsupportedRequest as exc:
            return stopped('unsupported', exc.reason_code, exc.message)
        except QueryPlanError as exc:
            if exc.code in {'limit_out_of_range', 'invalid_limit', 'ambiguous_limit'}:
                raise WorkflowError('resource_exceeded', 'Giới hạn kết quả không hợp lệ; hãy thu hẹp yêu cầu.') from exc
            if exc.code in {'unresolved_entities', 'unresolved_order_by', 'missing_metric_bundle',
                            'metric_not_active', 'metric_bundle_recipe_mismatch', 'metric_bundle_table_mismatch',
                            'order_field_not_selected', 'ambiguous_order_by', 'missing_compatible_table'}:
                return stopped('unsupported', exc.code, 'Yêu cầu chưa nằm trong khả năng phân tích hiện tại.')
            raise
        plan = replace(plan, raw_question=question)
        with stage('validate_plan'):
            validation = self.validator.validate(plan)
        if not validation.is_valid:
            raise WorkflowError('invalid_semantics', 'Kế hoạch truy vấn không đáp ứng contract phân tích.')
        with stage('validate_semantic_coverage'):
            coverage = self.coverage_checker.validate_plan(extraction, binding, context_input, plan, coverage, time_resolution)
            if coverage.status != 'complete':
                raise WorkflowError('internal_error', 'Kế hoạch truy vấn không giữ đầy đủ yêu cầu đã xác nhận.')
        sql = _in_stage('render_sql', self.renderer.render, plan)
        return RatingQueryPipelineResult(extracted_input=context_input, resolved_components=components,
            query_plan=plan, validation=validation, generated_sql=sql, semantic_extraction=extraction,
            canonical_binding=binding, resolution_policy=policy, outcome=PlanningOutcome('ready'),
            semantic_coverage=coverage, time_resolution=time_resolution)

    def route(self, question: str) -> AgentResponse:
        """Entry point mới phân loại ý định trước khi xử lý.

        - Nếu no_llm (intent_router is None): chuyển thẳng vào data_query pipeline.
        - Nếu có LLM: phân loại 3 mức intent (data_query, definition, no_scope).
        """
        if self.intent_router is None:
            return self._wrap_data_query(question)

        classification = self.intent_router.route(question)

        if classification.intent == "definition":
            return self.definition_agent.answer(question)
        if classification.intent == "no_scope":
            return no_scope_response(
                question=question,
                llm_client=self.intent_router._llm if self.intent_router else None,
            )
        return self._wrap_data_query(question)

    def _wrap_data_query(self, question: str) -> AgentResponse:
        """Chạy data_query pipeline và bọc kết quả vào format AgentResponse."""
        result = self.generate(question)
        success = result.generated_sql is not None and len(result.generated_sql.queries) > 0
        if result.output and result.output.text:
            reply = result.output.text
        elif success:
            reply = "Đã tạo SQL thành công. Bật 'execute=true' để xem kết quả."
        else:
            reply = result.error or "Không thể xử lý yêu cầu."

        return AgentResponse(
            intent="data_query",
            reply=reply,
            success=success,
            error=result.error,
            source="pipeline",
            data={
                "pipeline_result": result,
            },
        )

    def process_rows(
        self,
        plan: RatingQueryPlan,
        rows: list[dict[str, Any]],
    ) -> RatingPostExecutionResult:
        """Validate Doris rows, then apply the catalog-selected pattern compute."""
        with stage("validate_rows"):
            validation = self.result_validator.validate(plan, rows)
        from .result_coverage import assess_coverage
        with stage('validate_result_coverage'):
            coverage = assess_coverage(plan, rows, validation, self.catalog)
        validation = replace(validation, status=coverage.status)
        if not validation.is_available:
            return RatingPostExecutionResult(
                validation=validation,
                output=RatingAnalysisOutput(
                    text=validation.message or "Chưa có dữ liệu.",
                    source="deterministic",
                ),
                coverage=coverage,
            )
        with stage("compute"):
            try:
                analysis = self.pattern_compute.process(plan, rows)
            except InvalidResultError as exc:
                raise WorkflowError('invalid_result', 'Kết quả không đáp ứng điều kiện tính toán.') from exc
            data = analysis.get("data")
            error = data.get("error") if isinstance(data, dict) else None
            if analysis.get("compute_error") or (error and error != "insufficient_data"):
                raise WorkflowError("invalid_result", "Kết quả không đáp ứng điều kiện tính toán.")
        with stage("build_facts"):
            fact_rows = data if isinstance(data, list) else rows
            facts = FactSet.build(plan, fact_rows, analysis, self.catalog)
        with stage("render_template"):
            output = self.analysis_narrator.narrate(facts)
            if coverage.status == 'partial':
                output = replace(output, text='Dữ liệu chưa đầy đủ cho một số kỳ, nhóm hoặc chỉ số được yêu cầu.\n' + output.text)
        return RatingPostExecutionResult(validation=validation, analysis=analysis, output=output, facts=facts, coverage=coverage)

    _FRIENDLY_ERRORS = {
        "no_dashboard_value_in_question": (
            "Câu hỏi chưa chứa chỉ số hoặc đối tượng phân tích của Dashboard Rating."
        ),
        "missing_pattern_context": (
            "Câu hỏi còn thiếu thông tin bắt buộc để thực hiện phân tích."
        ),
        "canonical_binding_failed": (
            "Không thể xác định các đối tượng (kênh, tỉnh thành, chương trình) trong câu hỏi."
        ),
        "semantic_extraction_failed": (
            "Không thể phân tích cú pháp ngữ nghĩa câu hỏi. Vui lòng thử diễn đạt lại."
        ),
        "query_plan_validation_failed": (
            "Kế hoạch truy vấn chưa hợp lệ trên cấu trúc dữ liệu hiện tại."
        ),
    }

    @classmethod
    def _user_friendly_error(cls, error_code: str) -> str:
        if error_code in cls._FRIENDLY_ERRORS:
            return cls._FRIENDLY_ERRORS[error_code]
        if error_code.startswith("canonical_value_"):
            return "Giá trị đối tượng trong câu hỏi không khớp với danh mục dữ liệu."
        if error_code.startswith("unknown_dimension"):
            return "Chiều phân tích không có trong danh mục của hệ thống."
        return f"Hệ thống chưa thể xử lý yêu cầu: {error_code}."

