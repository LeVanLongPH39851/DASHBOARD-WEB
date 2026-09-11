from __future__ import annotations

from datetime import date
import json
import unittest
from unittest.mock import MagicMock

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline


class TestProgramAirtimeSemanticLayer(unittest.TestCase):
    def setUp(self):
        self.pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 8, 12))

    def test_catalog_declares_program_fact_and_three_airtime_metrics(self):
        catalog = RatingCatalog.load()

        self.assertEqual(catalog.tables["agg_info_program"].fact_family, "program")
        self.assertEqual(
            catalog.tables["agg_info_program"].grain,
            ("date", "channel_name_tvd", "program_name", "start_time", "end_time", "epg_id_hash"),
        )
        scopes = {
            metric_id: catalog.metrics[metric_id].denominator_scope
            for metric_id in (
                "program.airtime_duration",
                "program.airtime_share_all_categories_percent",
                "program.airtime_share_selected_categories_percent",
            )
        }
        self.assertEqual(
            scopes,
            {
                "program.airtime_duration": "none",
                "program.airtime_share_all_categories_percent": "all_categories",
                "program.airtime_share_selected_categories_percent": "selected_categories",
            },
        )
        self.assertTrue(
            all(catalog.metrics[metric_id].description for metric_id in scopes)
        )

    def test_absolute_airtime_filters_category_before_aggregation_without_joins(self):
        result = self.pipeline.generate(
            "Thời lượng phát của Phim truyện hôm qua là bao nhiêu"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.primary_metric.id, "program.airtime_duration")
        self.assertEqual(result.query_plan.denominator_scope, "none")
        sql = result.rendered_sql.sql
        self.assertIn("MAX(event_duration) AS event_duration", sql)
        self.assertIn("firstlevel_vn = :filter_0", sql)
        self.assertIn("SUM(airtime_grouped.airtime_duration)", sql)
        self.assertNotIn("dim_weight", sql)
        self.assertNotIn("dim_population", sql)
        self.assertNotIn("dim_coef", sql)

    def test_single_category_share_keeps_denominator_unfiltered(self):
        result = self.pipeline.generate(
            "Thời lượng phát của Phim truyện hôm qua chiếm bao nhiêu %"
        )

        self.assertIsNone(result.error)
        self.assertEqual(
            result.query_plan.primary_metric.id,
            "program.airtime_share_all_categories_percent",
        )
        self.assertEqual(result.query_plan.denominator_scope, "all_categories")
        sql = result.rendered_sql.sql
        fact_sql, outer_sql = sql.split("airtime_grouped AS", 1)
        self.assertNotIn("firstlevel_vn = :filter_0", fact_sql)
        self.assertIn("SUM(airtime_grouped.airtime_duration) AS total_airtime_duration", sql)
        self.assertIn("WHERE airtime_grouped.firstlevel_vn = :share_filter_0", outer_sql)
        self.assertEqual(result.rendered_sql.parameters["share_filter_0"], "Phim truyện")

    def test_non_category_filters_apply_to_numerator_and_denominator(self):
        result = self.pipeline.generate(
            "Thời lượng phát của Phim truyện trên kênh VTV1 hôm qua chiếm bao nhiêu %"
        )

        self.assertIsNone(result.error)
        fact_sql, outer_sql = result.rendered_sql.sql.split("airtime_grouped AS", 1)
        self.assertIn("channel_name_tvd = :filter_0", fact_sql)
        self.assertNotIn("firstlevel_vn =", fact_sql)
        self.assertIn("airtime_grouped.firstlevel_vn = :share_filter_1", outer_sql)
        self.assertEqual(result.rendered_sql.parameters["filter_0"], "VTV1")

    def test_distribution_uses_sql_percentage_without_post_compute_recalculation(self):
        result = self.pipeline.generate("Tỷ lệ thời lượng phát theo thể loại hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "share_distribution")
        self.assertEqual(
            result.query_plan.dimensions,
            ("agg_info_program.category_level1",),
        )
        processed = self.pipeline.process_rows(
            result.query_plan,
            [
                {"firstlevel_vn": "Phim truyện", "program_airtime_share_percent": 60.0},
                {"firstlevel_vn": "Giải trí", "program_airtime_share_percent": 40.0},
            ],
        )
        self.assertEqual(processed.analysis["data"][0]["program_airtime_share_percent"], 60.0)
        self.assertNotIn("pct_of_total", processed.analysis["data"][0])

    def test_airtime_seconds_are_formatted_for_user_output(self):
        result = self.pipeline.generate(
            "Thời lượng phát của Phim truyện hôm qua là bao nhiêu"
        )

        processed = self.pipeline.process_rows(
            result.query_plan,
            [{"program_airtime_duration": 3661}],
        )

        self.assertEqual(processed.output.source, "deterministic")
        self.assertIn("1 giờ 1 phút 1 giây", processed.output.text)

    def test_selected_categories_use_only_selected_group_as_denominator(self):
        result = self.pipeline.generate(
            "So sánh tỷ lệ thời lượng phát của Phim truyện, Giải trí và Thể thao hôm qua"
        )

        self.assertIsNone(result.error)
        self.assertEqual(
            result.query_plan.primary_metric.id,
            "program.airtime_share_selected_categories_percent",
        )
        self.assertEqual(result.query_plan.denominator_scope, "selected_categories")
        self.assertEqual(
            result.query_plan.dimensions,
            ("agg_info_program.category_level1",),
        )
        self.assertEqual(
            result.query_plan.filters[0].value,
            ("Phim truyện", "Giải trí", "Thể thao"),
        )
        self.assertIn(
            "firstlevel_vn IN (:filter_0_0, :filter_0_1, :filter_0_2)",
            result.rendered_sql.sql,
        )
        self.assertNotIn("program_name =", result.rendered_sql.sql)

    def test_llm_selects_closed_airtime_semantics(self):
        llm = MagicMock()
        llm.complete_text.side_effect = (
            json.dumps(
                {
                    "metric_id": "program.airtime_share_all_categories_percent",
                    "dimensions": [
                        {
                            "dimension_id": "agg_info_program.category_level1",
                            "raw_values": ["Phim truyện"],
                            "roles": ["filter"],
                        }
                    ],
                },
                ensure_ascii=False,
            ),
            "metric_lookup",
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Thời lượng phát của Phim truyện hôm qua chiếm bao nhiêu %"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.denominator_scope, "all_categories")
        extraction_call = llm.complete_text.call_args_list[0]
        self.assertIn("Trích xuất semantic input", extraction_call.kwargs["prompt"])
        self.assertIn("program.airtime_share_all_categories_percent", extraction_call.kwargs["system_prompt"])
        self.assertNotIn("TẾT VỚI ĐỒNG BÀO", extraction_call.kwargs["system_prompt"])

    def test_invalid_llm_metric_id_falls_back_to_catalog_rules(self):
        llm = MagicMock()
        llm.complete_text.return_value = json.dumps(
            {
                "metric_id": "program.unknown",
                "dimensions": [],
            }
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Thời lượng phát của Phim truyện hôm qua chiếm bao nhiêu %"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.semantic_extraction.source, "rules")
        self.assertEqual(
            result.query_plan.primary_metric.id,
            "program.airtime_share_all_categories_percent",
        )

    def test_program_metric_alignment_uses_semantic_key(self):
        result = self.pipeline.generate("rating theo thể loại hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.primary_metric.id, "program.rating_absolute")

    def test_catalog_declares_view_duration_metrics(self):
        catalog = RatingCatalog.load()
        scopes = {
            metric_id: catalog.metrics[metric_id].denominator_scope
            for metric_id in (
                "program.view_duration",
                "program.view_duration_share_all_categories_percent",
                "program.view_duration_share_selected_categories_percent",
            )
        }
        self.assertEqual(
            scopes,
            {
                "program.view_duration": "none",
                "program.view_duration_share_all_categories_percent": "all_categories",
                "program.view_duration_share_selected_categories_percent": "selected_categories",
            },
        )

    def test_view_duration_share_all_categories_renders_sql(self):
        llm = MagicMock()
        llm.complete_text.side_effect = (
            json.dumps(
                {
                    "metric_id": "program.view_duration_share_all_categories_percent",
                    "dimensions": [
                        {
                            "dimension_id": "agg_info_program.category_level1",
                            "raw_values": ["Phim dài tập"],
                            "roles": ["filter"],
                        }
                    ],
                },
                ensure_ascii=False,
            ),
            "metric_lookup",
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )
        result = pipeline.generate(
            "Tỷ lệ thời gian xem của Phim dài tập hôm qua chiếm bao nhiêu %"
        )

        self.assertIsNone(result.error)
        self.assertEqual(
            result.query_plan.primary_metric.id,
            "program.view_duration_share_all_categories_percent",
        )
        self.assertEqual(result.query_plan.denominator_scope, "all_categories")
        sql = result.rendered_sql.sql
        self.assertIn("SUM(duration_view) AS duration_view", sql)
        self.assertIn("view_grouped AS (", sql)
        self.assertIn("view_total AS (", sql)
        self.assertIn("total_view_duration", sql)
        self.assertNotIn("dim_weight", sql)


if __name__ == "__main__":
    unittest.main()

