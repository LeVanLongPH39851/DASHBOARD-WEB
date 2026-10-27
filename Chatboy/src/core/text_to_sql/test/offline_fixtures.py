"""Explicit offline program dictionary for planning regression tests."""
import csv
from pathlib import Path

from src.core.text_to_sql.canonical_binding.matchers.doris_ngram import DorisNgramCanonicalMatcher
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value


class OfflinePipeline(RatingQueryPipeline):
    def __init__(self, **kwargs):
        path = Path(__file__).resolve().parents[4] / "data/dashboard/rating/values/program_names.csv"
        with path.open() as stream:
            names = tuple(dict.fromkeys(row["canonical_value"] for row in csv.DictReader(stream)))
        def lookup(sql, parameters):
            raw = normalize_lookup_value(parameters["name"])
            rows = [{"program_name": n, "similarity": 1} for n in names if normalize_lookup_value(n) == raw]
            return ["program_name", "similarity"], rows
        kwargs.setdefault("canonical_matcher", DorisNgramCanonicalMatcher(executor=lookup))
        super().__init__(**kwargs)
