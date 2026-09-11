"""Canonical matcher protocol."""

from __future__ import annotations

from typing import Protocol

from src.core.text_to_sql.canonical_binding.contracts import CanonicalValueBinding
from src.core.text_to_sql.semantic_catalog import DimensionDefinition


class CanonicalMatcher(Protocol):
    def match(
        self,
        dimension: DimensionDefinition,
        raw_value: str,
    ) -> CanonicalValueBinding:
        """Bind one raw value to at most one canonical value."""


__all__ = ("CanonicalMatcher",)
