"""Workflow 015: orchestrate the complete Rating query pipeline."""

from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import date
from pathlib import Path
from typing import Any, Callable

from src.core.text_to_sql.catalog import RatingCatalog
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

    @property
    def rendered_sql(self):
        return self.generated_sql.queries[0] if self.generated_sql else None


@dataclass(frozen=True)
class RatingPostExecutionResult:
    """Kết quả kiểm tra và tính toán sau khi Doris trả dữ liệu."""

    validation: RatingDataValidation
    analysis: dict[str, Any] | None = None
    output: RatingAnalysisOutput | None = None

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
    ):
        self.project_root = Path(project_root or Path(__file__).resolve().parents[3])
        self.catalog = RatingCatalog.load(project_root=self.project_root)
        self.pattern_catalog = self.catalog.patterns
        self.canonical_memory = CanonicalMemory(self.catalog)
        extraction_context = CatalogContextBuilder(
            self.catalog,
            self.canonical_memory,
        ).build()
        fallback_extractor = RuleSemanticExtractionProvider(
            self.catalog,
            self.canonical_memory,
        )
        primary_extractor = (
            LLMSemanticExtractionProvider(llm_client)
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
            CanonicalMatcherRegistry(self.canonical_memory),
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
        self.result_validator = RatingResultValidator()
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

    def generate(self, question: str) -> RatingQueryPipelineResult:
        semantic_extraction = self.semantic_intent_rules.apply(
            self.semantic_extractor.extract(question)
        ).extraction
        context_input = self.context_extractor.extract(semantic_extraction.question)
        if not semantic_extraction.is_valid:
            extracted = replace(
                context_input,
                error=semantic_extraction.error,
                notes=(semantic_extraction.output_text or semantic_extraction.error or "",),
            )
            return RatingQueryPipelineResult(
                extracted_input=extracted,
                resolved_components=None,
                query_plan=None,
                validation=ValidationResult((semantic_extraction.error or "semantic_extraction_failed",)),
                generated_sql=None,
                error=semantic_extraction.error,
                output=RatingAnalysisOutput(
                    text=semantic_extraction.output_text or semantic_extraction.error or "Không thể trích xuất semantic input.",
                    source="deterministic",
                ),
                semantic_extraction=semantic_extraction,
            )

        canonical_binding = self.canonical_binder.bind(semantic_extraction)
        if not canonical_binding.is_valid:
            error = canonical_binding.error or "canonical_binding_failed"
            return RatingQueryPipelineResult(
                extracted_input=context_input,
                resolved_components=None,
                query_plan=None,
                validation=ValidationResult((error,)),
                generated_sql=None,
                error=error,
                output=RatingAnalysisOutput(
                    text=canonical_binding.output_text or error,
                    source="deterministic",
                ),
                semantic_extraction=semantic_extraction,
                canonical_binding=canonical_binding,
            )

        components: ResolvedSQLComponents | None = None
        resolution_policy: str | None = None
        try:
            resolution = self.semantic_resolver.resolve(context_input, canonical_binding)
            validated_input = resolution.extracted_input
            components = resolution.components
            resolution_policy = resolution.policy_name
            selection = self.semantic_selector.select(validated_input, components)
            if selection.pattern_name == "dimension_listing":
                components = replace(
                    components,
                    metric_id=None,
                    metric_ids=(),
                )
            elif selection.metric_ids:
                components = replace(
                    components,
                    metric_id=selection.primary_metric_id,
                    metric_ids=selection.metric_ids,
                )
            pattern_name = selection.pattern_name
            context_validation = self.pattern_context_validator.validate(
                validated_input,
                components,
                pattern_name,
            )
            if not context_validation.is_valid:
                return RatingQueryPipelineResult(
                    extracted_input=validated_input,
                    resolved_components=components,
                    query_plan=None,
                    validation=ValidationResult((MISSING_PATTERN_CONTEXT_ERROR,)),
                    generated_sql=None,
                    error=MISSING_PATTERN_CONTEXT_ERROR,
                    output=RatingAnalysisOutput(
                        text=context_validation.output_text,
                        source="deterministic",
                    ),
                    pattern_context=context_validation,
                    semantic_extraction=semantic_extraction,
                    canonical_binding=canonical_binding,
                    resolution_policy=resolution_policy,
                )
            plan = self.compiler.compile(
                validated_input,
                components,
                pattern_name=pattern_name,
                denominator_scope=selection.denominator_scope,
            )
        except (ValueError, RuntimeError) as exc:
            error = str(exc)
            friendly_text = self._user_friendly_error(error)
            return RatingQueryPipelineResult(
                extracted_input=context_input,
                resolved_components=components,
                query_plan=None,
                validation=ValidationResult((error,)),
                generated_sql=None,
                error=error,
                output=RatingAnalysisOutput(
                    text=friendly_text,
                    source="fallback",
                ),
                semantic_extraction=semantic_extraction,
                canonical_binding=canonical_binding,
                resolution_policy=resolution_policy,
            )

        validation = self.validator.validate(plan)
        if not validation.is_valid:
            error = "query_plan_validation_failed"
            error_details = ", ".join(validation.errors) if validation.errors else error
            return RatingQueryPipelineResult(
                extracted_input=validated_input,
                resolved_components=components,
                query_plan=plan,
                validation=validation,
                generated_sql=None,
                error=error,
                output=RatingAnalysisOutput(
                    text=f"Kế hoạch truy vấn chưa hợp lệ: {error_details}.",
                    source="fallback",
                ),
                semantic_extraction=semantic_extraction,
                canonical_binding=canonical_binding,
                resolution_policy=resolution_policy,
            )
        try:
            sql = self.renderer.render(plan)
        except ValueError as exc:
            error = str(exc)
            return RatingQueryPipelineResult(
                extracted_input=validated_input,
                resolved_components=components,
                query_plan=plan,
                validation=ValidationResult((f"renderer_error:{exc}",)),
                generated_sql=None,
                error=error,
                output=RatingAnalysisOutput(
                    text=f"Không thể tạo câu truy vấn SQL: {error}.",
                    source="fallback",
                ),
                semantic_extraction=semantic_extraction,
                canonical_binding=canonical_binding,
                resolution_policy=resolution_policy,
            )
        return RatingQueryPipelineResult(
            extracted_input=validated_input,
            resolved_components=components,
            query_plan=plan,
            validation=validation,
            generated_sql=sql,
            semantic_extraction=semantic_extraction,
            canonical_binding=canonical_binding,
            resolution_policy=resolution_policy,
        )

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
        validation = self.result_validator.validate(plan, rows)
        if not validation.is_available:
            return RatingPostExecutionResult(
                validation=validation,
                output=RatingAnalysisOutput(
                    text=validation.message or "Chưa có dữ liệu.",
                    source="deterministic",
                ),
            )
        analysis = self.pattern_compute.process(plan, rows)
        return RatingPostExecutionResult(
            validation=validation,
            analysis=analysis,
            output=self.analysis_narrator.narrate(plan, analysis),
        )

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

