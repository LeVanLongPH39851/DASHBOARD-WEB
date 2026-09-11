"""Workflow 016: Definition agent shim.

Implementation lives in definition_agent/ subpackage.
This file preserves the d_NNN_* workflow convention.
"""

from src.core.text_to_sql.definition_agent import (
    SemanticDefinitionAgent,
    no_scope_response,
)

__all__ = (
    "SemanticDefinitionAgent",
    "no_scope_response",
)
