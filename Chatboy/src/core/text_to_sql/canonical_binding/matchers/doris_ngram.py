"""Doris ngram similarity matcher for high-cardinality program names."""

from __future__ import annotations

import logging
from typing import Any, Callable

from src.core.text_to_sql.canonical_binding.contracts import CanonicalValueBinding
from src.core.text_to_sql.semantic_catalog import DimensionDefinition

logger = logging.getLogger(__name__)


class DorisNgramCanonicalMatcher:
    _AMBIGUITY_GAP = 0.02

    def __init__(
        self,
        executor: Callable[[str], tuple[list[str], list[dict[str, Any]]]] | None = None,
    ):
        self._executor = executor

    def _get_executor(self) -> Callable[[str], tuple[list[str], list[dict[str, Any]]]] | None:
        if self._executor is not None:
            return self._executor
        try:
            from config.doris_config import DorisDatabase

            db = DorisDatabase.from_env()
            return db.execute
        except Exception as exc:
            logger.warning("DorisDatabase unavailable for ngram matcher: %s", exc)
            return None

    def match(
        self,
        dimension: DimensionDefinition,
        raw_value: str,
    ) -> CanonicalValueBinding:
        execute = self._get_executor()
        if execute is None:
            # Fallback when running offline or without Doris connection
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=raw_value,
                status="matched",
                match_type="doris_ngram",
                score=1.0,
                alternatives=(),
            )

        clean_value = raw_value.strip().replace("'", "''")
        if not clean_value:
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=None,
                status="not_found",
                match_type="doris_ngram",
                score=0.0,
                alternatives=(),
            )

        table_name = getattr(dimension.matching, "table", None) or "data_dashboard_rating.mv_program_info_detail_epg"
        ngram_size = getattr(dimension.matching, "ngram_size", 4)
        top_k = getattr(dimension.matching, "top_k", 5)
        min_score = getattr(dimension.matching, "minimum_score", 0.5)

        sql = f"""SELECT program_name, ngram_sim(UPPER('{clean_value}'), UPPER(program_name), {ngram_size}) AS similarity
                    FROM (
                        SELECT DISTINCT program_name
                        FROM {table_name}
                    ) t
                    ORDER BY similarity DESC
                    LIMIT {top_k}"""

        try:
            _cols, rows = execute(sql)
        except Exception as exc:
            logger.error("Error executing ngram_sim on Doris: %s", exc)
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=raw_value.upper(),
                status="matched",
                match_type="doris_ngram",
                score=1.0,
                alternatives=(),
            )

        if not rows:
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=None,
                status="not_found",
                match_type="doris_ngram",
                score=0.0,
                alternatives=(),
            )

        top_match = rows[0]
        top_score = float(top_match.get("similarity", 0.0))
        top_name = str(top_match.get("program_name", ""))
        alternatives = tuple(str(r.get("program_name", "")) for r in rows)

        if top_score < min_score:
            return CanonicalValueBinding(
                dimension_id=dimension.id,
                raw_value=raw_value,
                canonical_value=None,
                status="not_found",
                match_type="doris_ngram",
                score=top_score,
                alternatives=alternatives,
            )

        if len(rows) > 1:
            second_score = float(rows[1].get("similarity", 0.0))
            if top_score - second_score < self._AMBIGUITY_GAP and top_score < 0.95:
                return CanonicalValueBinding(
                    dimension_id=dimension.id,
                    raw_value=raw_value,
                    canonical_value=None,
                    status="ambiguous",
                    match_type="doris_ngram",
                    score=top_score,
                    alternatives=alternatives,
                )

        return CanonicalValueBinding(
            dimension_id=dimension.id,
            raw_value=raw_value,
            canonical_value=top_name,
            status="matched",
            match_type="doris_ngram",
            score=top_score,
            alternatives=alternatives,
        )


__all__ = ("DorisNgramCanonicalMatcher",)
