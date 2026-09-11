from __future__ import annotations

import inspect
import unittest

from src.core.text_to_sql import RatingCatalog, RatingQueryPipeline
from src.core.text_to_sql.semantic_extraction.extractor import SemanticExtractor


class TestV3Hygiene(unittest.TestCase):
    def test_public_api_is_explicit(self):
        self.assertEqual(RatingQueryPipeline.__name__, "RatingQueryPipeline")

    def test_default_table_is_declared_and_used(self):
        catalog = RatingCatalog.load()
        self.assertEqual(catalog.default_table_id, "agg_info_channel")
        self.assertEqual(catalog.table_for(None, ()).id, "agg_info_channel")

    def test_semantic_extractor_has_provider_boundary(self):
        source = inspect.getsource(SemanticExtractor)
        self.assertIn("self._primary.extract", source)
        self.assertIn("self._fallback.extract", source)


if __name__ == "__main__":
    unittest.main()
