"""Workflow 000: Top-level intent router shim.

Implementation lives in intent_routing/ subpackage.
This file preserves the d_NNN_* workflow convention.
"""

from src.core.text_to_sql.intent_routing import (
    AgentResponse,
    IntentClassificationResult,
    IntentRouter,
    IntentType,
)

__all__ = (
    "AgentResponse",
    "IntentClassificationResult",
    "IntentRouter",
    "IntentType",
)
