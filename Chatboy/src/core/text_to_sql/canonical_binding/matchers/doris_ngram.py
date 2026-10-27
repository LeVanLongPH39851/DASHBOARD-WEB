"""Injected, parameterized name lookup; fuzzy candidates require confirmation."""
from __future__ import annotations

import re
import math
from decimal import Decimal
from dataclasses import replace
from typing import Callable

from src.core.text_to_sql.canonical_binding.contracts import CanonicalValueBinding
from src.core.text_to_sql.canonical_binding.matchers.fuzzy import FuzzyCanonicalMatcher
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value


class DorisNgramCanonicalMatcher:
    def __init__(self, executor: Callable | None = None, memory=None):
        self._executor = executor
        self._memory = memory

    def match(self, dimension, raw_value: str) -> CanonicalValueBinding:
        def result(status, canonical=None, score=None, alternatives=()):
            return CanonicalValueBinding(dimension.id, raw_value, canonical, status,
                "doris_ngram", score, tuple(alternatives))
        if not raw_value.strip():
            return result("not_found")
        if self._executor is None:
            if self._memory is None or not self._memory.records_for(dimension.id):
                return result("unavailable")
            # Explicit catalog-only mode for planning/replay; no network fallback.
            matched = FuzzyCanonicalMatcher(self._memory).match(dimension, raw_value)
            return replace(matched, match_type="doris_ngram",
                alternatives=(matched.canonical_value,) if matched.canonical_value else matched.alternatives)
        table = dimension.matching.table or "data_dashboard_rating.mv_program_info_detail_epg"
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?", table):
            raise ValueError("invalid_lookup_table")
        top_k = min(5, max(1, int(dimension.matching.top_k)))
        ngram_size = max(2, min(8, int(dimension.matching.ngram_size)))
        sql = (f"SELECT program_name, ngram_sim(UPPER(:name), UPPER(program_name), {ngram_size}) AS similarity "
            f"FROM (SELECT DISTINCT program_name FROM {table}) names "
            f"ORDER BY similarity DESC, program_name ASC LIMIT {top_k}")
        try:
            _, rows = self._executor(sql, {"name": raw_value.strip()})
        except Exception as exc:
            from src.core.text_to_sql.runtime.errors import WorkflowError
            if isinstance(exc, WorkflowError) and exc.code != "dependency_unavailable":
                raise
            return result("unavailable")
        if not rows:
            return result("not_found")
        if any(not isinstance(r, dict) or not isinstance(r.get("program_name"), str)
               or not isinstance(r.get("similarity"), (int, float, Decimal))
               or isinstance(r.get("similarity"), bool) or not math.isfinite(r["similarity"]) for r in rows):
            from src.core.text_to_sql.runtime.errors import WorkflowError
            raise WorkflowError("invalid_result", "Danh mục chương trình trả kết quả không hợp lệ.")
        exact = tuple(dict.fromkeys(str(r["program_name"]) for r in rows
            if normalize_lookup_value(str(r["program_name"])) == normalize_lookup_value(raw_value)))
        if len(exact) == 1:
            return result("matched", exact[0], 1.0, exact)
        candidates = tuple(str(r["program_name"]) for r in rows
            if float(r.get("similarity") or 0) >= dimension.matching.minimum_score)
        if exact or candidates:
            return result("ambiguous", alternatives=exact or candidates,
                score=float(rows[0].get("similarity") or 0))
        return result("not_found")


__all__ = ("DorisNgramCanonicalMatcher",)
