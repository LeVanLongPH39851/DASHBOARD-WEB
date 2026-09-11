from __future__ import annotations

import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
from src.core.text_to_sql.semantic_extraction.context import QuestionContextExtractor


class TestSortIntent(unittest.TestCase):
    def setUp(self):
        self.extractor = QuestionContextExtractor(RatingCatalog.load())
        self.pipeline = RatingQueryPipeline()

    def test_extracts_metric_and_dimension_sorts_in_text_order(self):
        extracted = self.extractor.extract("Lượt xem tăng dần, kênh giảm dần hôm qua")

        self.assertEqual(
            [
                (item.target_kind, item.target_value, item.direction)
                for item in extracted.sort_intents
            ],
            [
                ("metric", "luot xem", "asc"),
                ("dimension", "kenh", "desc"),
            ],
        )

    def test_resolver_binds_sort_targets_to_semantic_ids(self):
        result = self.pipeline.generate("Lượt xem tăng dần, kênh giảm dần hôm qua")
        components = result.resolved_components

        self.assertEqual(
            [(item.field_id, item.direction, item.status) for item in components.sorts],
            [
                ("rating.total_channel_views", "asc", "resolved"),
                ("agg_info_channel.channel", "desc", "resolved"),
            ],
        )

    def test_direction_without_target_remains_unresolved(self):
        result = self.pipeline.generate("Sắp xếp giảm dần")

        self.assertEqual(result.error, "Không có giá trị nào phục vụ dashboard")
        self.assertIsNone(result.resolved_components)

    def test_sort_does_not_borrow_target_across_clause_boundary(self):
        extracted = self.extractor.extract("Lượt xem theo kênh, sắp xếp giảm dần")

        self.assertEqual(len(extracted.sort_intents), 1)
        self.assertIsNone(extracted.sort_intents[0].target_kind)
        self.assertIsNone(extracted.sort_intents[0].target_value)

    def test_sort_metric_aligns_to_program_fact_family(self):
        result = self.pipeline.generate("Thời lượng xem của thể loại nào cao nhất")

        self.assertIsNone(result.error)
        self.assertIsNotNone(result.query_plan)
        self.assertEqual(result.query_plan.primary_metric.id, "program.weighted_view_duration")
        self.assertEqual(
            [(item.field, item.direction) for item in result.query_plan.order_by],
            [("program.weighted_view_duration", "desc")],
        )

    def test_program_sort_with_live_filter_resolves_aligned_metric(self):
        result = self.pipeline.generate(
            "Chương trình nào có thời gian xem trực tiếp cao nhất trên kênh VTV1"
        )

        self.assertIsNone(result.error)
        self.assertIsNotNone(result.query_plan)
        self.assertEqual(result.query_plan.primary_metric.id, "program.weighted_view_duration")
        self.assertEqual(
            [(item.field, item.direction) for item in result.query_plan.order_by],
            [("program.weighted_view_duration", "desc")],
        )


if __name__ == "__main__":
    unittest.main()
