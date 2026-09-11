"""Public API for the fixed, deterministic Rating v3 pipeline."""

from src.core.text_to_sql.catalog import RatingCatalog, RatingCatalogError
from src.core.text_to_sql.d_001_semantic_extraction import (
    ExtractedDimension,
    SemanticExtractionResult,
    SemanticExtractor,
)
from src.core.text_to_sql.d_002_canonical_binding import (
    CanonicalBinder,
    CanonicalBindingResult,
    CanonicalDimension,
    CanonicalValueBinding,
)
from src.core.text_to_sql.d_003_semantic_resolution import SemanticResolver, SemanticResolverResult
from src.core.text_to_sql.query_plan import RatingQueryPlan, TimeRange
from src.core.text_to_sql.d_013_pattern_compute import PatternCompute
from src.core.text_to_sql.d_006_pattern_context_validator import (
    MISSING_PATTERN_CONTEXT_ERROR,
    PatternContextValidation,
    PatternContextValidator,
)
from src.core.text_to_sql.catalog_models import PatternSpec
from src.core.text_to_sql.d_004_pattern_router import PatternRouter
from src.core.text_to_sql.d_014_rating_analysis_narrator import RatingAnalysisNarrator, RatingAnalysisOutput
from src.core.text_to_sql.d_015_rating_query_pipeline import (
    RatingPostExecutionResult,
    RatingQueryPipeline,
    RatingQueryPipelineResult,
)
from src.core.text_to_sql.d_012_rating_result_validator import RatingDataValidation, RatingResultValidator
from src.core.text_to_sql.d_010_rating_query_plan_validator import ValidationResult
from src.core.text_to_sql.d_011_rating_sql_renderer import GeneratedSQL, GeneratedSQLBatch
from src.core.text_to_sql.semantic_selection import SemanticSelection
from src.core.text_to_sql.d_005_semantic_selector import SemanticSelector
from src.core.text_to_sql.intent_routing import (
    AgentResponse,
    IntentClassificationResult,
    IntentRouter,
    IntentType,
)
from src.core.text_to_sql.definition_agent import (
    SemanticDefinitionAgent,
    no_scope_response,
)
from src.core.text_to_sql.intent_logger import get_intent_logger
from src.core.text_to_sql.request_logger import RequestLogger, get_request_logger, log_request

__all__ = (
    "AgentResponse",
    "GeneratedSQL",
    "GeneratedSQLBatch",
    "CanonicalBinder",
    "CanonicalBindingResult",
    "CanonicalDimension",
    "CanonicalValueBinding",
    "ExtractedDimension",
    "IntentClassificationResult",
    "IntentRouter",
    "IntentType",
    "PatternCompute",
    "PatternContextValidation",
    "PatternContextValidator",
    "PatternRouter",
    "PatternSpec",
    "RatingQueryPipeline",
    "RatingQueryPipelineResult",
    "RatingPostExecutionResult",
    "RatingAnalysisNarrator",
    "RatingAnalysisOutput",
    "RatingDataValidation",
    "RatingCatalog",
    "RatingCatalogError",
    "RatingResultValidator",
    "RatingQueryPlan",
    "RequestLogger",
    "SemanticDefinitionAgent",
    "SemanticSelection",
    "SemanticExtractionResult",
    "SemanticExtractor",
    "SemanticResolver",
    "SemanticResolverResult",
    "SemanticSelector",
    "TimeRange",
    "ValidationResult",
    "MISSING_PATTERN_CONTEXT_ERROR",
    "get_intent_logger",
    "get_request_logger",
    "log_request",
    "no_scope_response",
)
