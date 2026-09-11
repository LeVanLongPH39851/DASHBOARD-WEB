"""Modular semantic extraction contracts and providers."""

from src.core.text_to_sql.semantic_extraction.contracts import (
    ExtractedDimension,
    ExtractionRole,
    SemanticExtractionResult,
)
from src.core.text_to_sql.semantic_extraction.extractor import SemanticExtractor
from src.core.text_to_sql.semantic_extraction.intent_rules import (
    SemanticIntentDecision,
    SemanticIntentRuleLayer,
)

__all__ = (
    "ExtractedDimension",
    "ExtractionRole",
    "SemanticExtractionResult",
    "SemanticExtractor",
    "SemanticIntentDecision",
    "SemanticIntentRuleLayer",
)
