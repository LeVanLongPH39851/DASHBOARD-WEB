"""Registry keeps matching algorithms out of the binder orchestration."""

from __future__ import annotations

from collections.abc import Mapping
from types import MappingProxyType

from src.core.text_to_sql.canonical_binding.matchers.doris_ngram import (
    DorisNgramCanonicalMatcher,
)
from src.core.text_to_sql.canonical_binding.matchers.exact import ExactCanonicalMatcher
from src.core.text_to_sql.canonical_binding.matchers.fuzzy import FuzzyCanonicalMatcher
from src.core.text_to_sql.semantic_memory import CanonicalMemory


class CanonicalMatcherRegistry:
    def __init__(
        self,
        memory: CanonicalMemory,
        doris_matcher: CanonicalMatcher | None = None,
    ):
        doris_ngram = doris_matcher or DorisNgramCanonicalMatcher()
        self._matchers: Mapping[str, CanonicalMatcher] = MappingProxyType(
            {
                "exact": ExactCanonicalMatcher(memory),
                "fuzzy": FuzzyCanonicalMatcher(memory),
                "doris_ngram": doris_ngram,
                "sql_ngram": doris_ngram,
            }
        )

    def require(self, strategy: str) -> CanonicalMatcher:
        try:
            return self._matchers[strategy]
        except KeyError as exc:
            raise KeyError(f"unknown_canonical_matcher:{strategy}") from exc


__all__ = ("CanonicalMatcherRegistry",)
