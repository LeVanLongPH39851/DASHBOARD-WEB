"""Generic high-cardinality matcher: exact first, then ranked fuzzy search."""

from __future__ import annotations

from difflib import SequenceMatcher

from src.core.text_to_sql.canonical_binding.contracts import CanonicalValueBinding
from src.core.text_to_sql.canonical_binding.matchers.exact import ExactCanonicalMatcher
from src.core.text_to_sql.semantic_catalog import DimensionDefinition
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value
from src.core.text_to_sql.semantic_memory import CanonicalMemory


class FuzzyCanonicalMatcher:
    _AMBIGUITY_GAP = 0.02

    def __init__(self, memory: CanonicalMemory):
        self._memory = memory
        self._exact = ExactCanonicalMatcher(memory)

    def match(
        self,
        dimension: DimensionDefinition,
        raw_value: str,
    ) -> CanonicalValueBinding:
        exact = self._exact.match(dimension, raw_value)
        if exact.status != "not_found":
            return exact

        query = normalize_lookup_value(raw_value)
        ranked: list[tuple[float, str]] = []
        for record in self._memory.records_for(dimension.id):
            score = max(
                self._score(query, normalize_lookup_value(value))
                for value in (record.canonical_value, *record.aliases)
                if normalize_lookup_value(value)
            )
            ranked.append((score, record.canonical_value))
        ranked.sort(key=lambda item: (-item[0], item[1]))
        top = tuple(ranked[: dimension.matching.top_k])
        alternatives = tuple(value for _score, value in top)
        if not top or top[0][0] < dimension.matching.minimum_score:
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=None,
                status="not_found",
                match_type="fuzzy",
                score=top[0][0] if top else None,
                alternatives=alternatives,
            )
        if len(top) > 1 and top[0][0] - top[1][0] < self._AMBIGUITY_GAP:
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=None,
                status="ambiguous",
                match_type="fuzzy",
                score=top[0][0],
                alternatives=alternatives,
            )
        return CanonicalValueBinding(
            dimension_id=dimension.id,
            raw_value=raw_value,
            canonical_value=top[0][1],
            status="matched",
            match_type="fuzzy",
            score=top[0][0],
            alternatives=alternatives,
        )

    @staticmethod
    def _score(query: str, candidate: str) -> float:
        if not query or not candidate:
            return 0.0
        sequence = SequenceMatcher(None, query, candidate).ratio()
        query_tokens = set(query.split())
        candidate_tokens = set(candidate.split())
        token_score = (
            len(query_tokens & candidate_tokens) / len(query_tokens | candidate_tokens)
            if query_tokens and candidate_tokens
            else 0.0
        )
        containment = (
            min(len(query), len(candidate)) / max(len(query), len(candidate))
            if query in candidate or candidate in query
            else 0.0
        )
        return round(max(sequence, token_score, containment), 6)


__all__ = ("FuzzyCanonicalMatcher",)
