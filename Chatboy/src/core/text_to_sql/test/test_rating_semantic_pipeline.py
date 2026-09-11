from datetime import date
import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline


class TestRatingSemanticPipeline(unittest.TestCase):
    def test_catalog_reads_dashboard_rating_contract(self):
        catalog = RatingCatalog.load()

        self.assertEqual(catalog.domain_id, "RATING")
        self.assertEqual(
            catalog.metrics["rating.total_channel_views"].source_tables,
            ("agg_info_channel",),
        )
        self.assertIn("agg_info_program.program_name", catalog.dimensions)

    def test_modular_pipeline_resolves_one_canonical_result(self):
        pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 8, 4))

        result = pipeline.generate(
            "Tổng lượt xem theo kênh VTV1 từ 2026-07-01 đến 2026-07-02"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.resolution_policy, "metric_dimensions")
        self.assertEqual(result.resolved_components.domain_id, "RATING")
        self.assertEqual(result.resolved_components.metric_id, "rating.total_channel_views")
        self.assertEqual(result.resolved_components.table, "data_dashboard_rating.agg_info_channel")
        self.assertEqual(result.resolved_components.dimensions, ())
        self.assertEqual(
            [(item.dimension_id, item.operator, item.values) for item in result.resolved_components.filters],
            [("agg_info_channel.channel", "=", ("VTV1",))],
        )


if __name__ == "__main__":
    unittest.main()
