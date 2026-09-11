from __future__ import annotations

import unittest
from unittest.mock import MagicMock

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.input_contracts import ExtractedInput
from src.core.text_to_sql.resolved_entities import ResolvedFilter, ResolvedSQLComponents
from src.core.text_to_sql.d_005_semantic_selector import SemanticSelector


class TestSemanticSelector(unittest.TestCase):
    def setUp(self):
        self.catalog = RatingCatalog.load()

    def test_channel_metric_uses_generic_pattern_router(self):
        router = MagicMock()
        router.classify.return_value = "metric_lookup"
        selector = SemanticSelector(
            catalog=self.catalog,
            pattern_router=router,
        )
        extracted = ExtractedInput(
            question="Rating VTV1 hôm qua",
            normalized_question="rating vtv1 hom qua",
        )
        components = ResolvedSQLComponents(
            domain_id="RATING",
            table="data_dashboard_rating.agg_info_channel",
            metric_id="rating.rating_absolute",
            metric_ids=("rating.rating_absolute",),
        )

        selection = selector.select(extracted, components)

        self.assertEqual(selection.metric_ids, ("rating.rating_absolute",))
        self.assertEqual(selection.pattern_name, "metric_lookup")
        self.assertEqual(selection.source, "pattern_router")
        router.classify.assert_called_once_with(extracted, components)

    def test_program_airtime_uses_generic_router_and_metric_denominator_scope(self):
        router = MagicMock()
        router.classify.return_value = "metric_lookup"
        selector = SemanticSelector(
            catalog=self.catalog,
            pattern_router=router,
        )
        extracted = ExtractedInput(
            question="Thời lượng phát của Phim truyện hôm qua",
            normalized_question="thoi luong phat cua phim truyen hom qua",
        )
        components = ResolvedSQLComponents(
            domain_id="RATING",
            table="data_dashboard_rating.agg_info_program",
            metric_id="program.airtime_duration",
            metric_ids=("program.airtime_duration",),
            filters=(
                ResolvedFilter(
                    dimension_id="agg_info_program.category_level1",
                    physical_column="firstlevel_vn",
                    operator="=",
                    values=("Phim truyện",),
                    source_text="Phim truyện",
                ),
            ),
        )

        selection = selector.select(extracted, components)

        self.assertEqual(selection.metric_ids, ("program.airtime_duration",))
        self.assertEqual(selection.denominator_scope, "none")
        router.classify.assert_called_once_with(extracted, components)

    def test_share_metric_uses_catalog_denominator_scope(self):
        router = MagicMock()
        router.classify.return_value = "metric_lookup"
        selector = SemanticSelector(catalog=self.catalog, pattern_router=router)
        extracted = ExtractedInput(question="share", normalized_question="share")
        components = ResolvedSQLComponents(
            domain_id="RATING",
            table="data_dashboard_rating.agg_info_program",
            metric_id="program.airtime_share_all_categories_percent",
            metric_ids=("program.airtime_share_all_categories_percent",),
        )

        selection = selector.select(extracted, components)

        self.assertEqual(selection.denominator_scope, "all_categories")


if __name__ == "__main__":
    unittest.main()
