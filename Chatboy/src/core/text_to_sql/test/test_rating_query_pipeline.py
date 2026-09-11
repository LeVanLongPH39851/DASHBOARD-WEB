import json
from datetime import date
import unittest
from unittest.mock import MagicMock, patch

from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline


class _MockLLM:
    def __init__(self, payload: dict, pattern: str = "dimension_breakdown"):
        self.payload = payload
        self.pattern = pattern

    def complete_text(self, **kwargs):
        prompt = kwargs.get("prompt", "")
        if "Trích xuất semantic input" in prompt:
            return json.dumps(self.payload, ensure_ascii=False)
        return self.pattern


class TestRatingQueryPipeline(unittest.TestCase):
    def setUp(self):
        self.pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 8, 4))

    def test_ranking_last_completed_week_renders_parameterized_sql(self):
        result = self.pipeline.generate("Top 5 kênh có số lượt xem nhiều nhất trong 1 tuần qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.query_shape, "ranking")
        self.assertEqual(result.query_plan.limit, 5)
        self.assertEqual(result.query_plan.time_range.start, "2026-07-28")
        self.assertEqual(result.query_plan.time_range.end, "2026-08-04")
        self.assertEqual(result.query_plan.dimensions, ("agg_info_channel.channel",))
        self.assertEqual(result.rendered_sql.parameters, {"time_start": "2026-07-28", "time_end": "2026-08-04"})
        self.assertEqual(
            result.rendered_sql.sql,
            "\n".join(
                (
                    "SELECT",
                    "  channel_name_tvd AS channel,",
                    "  SUM(view) AS total_channel_views",
                    "FROM data_dashboard_rating.agg_info_channel",
                    "WHERE date >= :time_start",
                    "  AND date < :time_end",
                    "GROUP BY channel_name_tvd",
                    "ORDER BY total_channel_views DESC",
                    "LIMIT 5",
                )
            ),
        )

    def test_plain_dimension_query_uses_breakdown_pattern(self):
        result = self.pipeline.generate("Lượt xem theo kênh hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "dimension_breakdown")
        self.assertEqual(result.query_plan.query_shape, "breakdown")
        self.assertIn("ORDER BY channel ASC", result.rendered_sql.sql)
        self.assertIn("LIMIT 100", result.rendered_sql.sql)

    def test_dimension_breakdown_fallback_lists_each_group_value(self):
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 19),
            llm_client=_MockLLM({
                "metric_id": "program.rating_absolute",
                "dimensions": [
                    {"dimension_id": "agg_info_program.channel", "raw_values": [], "roles": ["group_by"]},
                    {"dimension_id": "agg_info_program.program_name", "raw_values": ["Thời sự 19h"], "roles": ["filter"]},
                ],
            }),
        )
        result = pipeline.generate(
            "Rating của chương trình Thời sự 19h trong khoảng thời gian "
            "từ ngày 17/08/2026 đến ngày 18/08/2026 theo từng kênh là bao nhiêu ?"
        )

        processed = pipeline.process_rows(
            result.query_plan,
            [
                {"channel_name_tvd": "VTV1", "program_rating": 9205285.859169748},
                {"channel_name_tvd": "VTV10", "program_rating": 130290.67865178997},
                {"channel_name_tvd": "VTV3", "program_rating": 2628029.0112721417},
            ],
        )

        self.assertEqual(processed.output.source, "deterministic")
        self.assertIn("VTV1: Rating chương trình", processed.output.text)
        self.assertIn("VTV10: Rating chương trình", processed.output.text)
        self.assertIn("VTV3: Rating chương trình", processed.output.text)
        self.assertNotIn("Đã xử lý 3 dòng", processed.output.text)

    def test_rating_percentage_alias_resolves_without_share_intent(self):
        result = self.pipeline.generate("Rating phần trăm theo kênh hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.primary_metric.id, "rating.rating_percent")
        self.assertEqual(result.query_plan.pattern_name, "dimension_breakdown")

    def test_dictionary_filter_is_canonical_and_parameterized(self):
        result = self.pipeline.generate("Số lượt xem kênh VTV1 từ 2026-07-01 đến 2026-07-03")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.filters[0].field, "agg_info_channel.channel")
        self.assertEqual(result.query_plan.filters[0].value, "VTV1")
        self.assertIn("channel_name_tvd = :filter_0", result.rendered_sql.sql)
        self.assertEqual(result.rendered_sql.parameters["filter_0"], "VTV1")
        self.assertEqual(result.rendered_sql.parameters["time_end"], "2026-07-04")

    def test_multiple_values_of_one_dimension_use_in_filter(self):
        result = self.pipeline.generate("rating của VTV1 và VTV3 hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(len(result.query_plan.filters), 1)
        self.assertEqual(result.query_plan.filters[0].operator, "in")
        self.assertEqual(result.query_plan.filters[0].value, ("VTV1", "VTV3"))
        self.assertIn(
            "channel_name_tvd IN (:filter_0_0, :filter_0_1)",
            result.rendered_sql.sql,
        )
        self.assertEqual(result.rendered_sql.parameters["filter_0_0"], "VTV1")
        self.assertEqual(result.rendered_sql.parameters["filter_0_1"], "VTV3")

    def test_cross_table_program_dimension_requires_clarification(self):
        result = self.pipeline.generate("Lượt xem theo chương trình trong 1 tuần qua")

        self.assertIsNone(result.generated_sql)
        self.assertEqual(
            result.error,
            "metric_unsupported_dimensions:rating.total_channel_views:agg_info_program.program_name",
        )

    def test_missing_time_range_defaults_to_yesterday(self):
        result = self.pipeline.generate("Top 5 kênh có số lượt xem nhiều nhất")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.time_range.start, "2026-08-03")
        self.assertEqual(result.query_plan.time_range.end, "2026-08-04")
        self.assertIsNotNone(result.generated_sql)

    def test_lowest_ranking_overrides_pattern_with_metric_ascending(self):
        result = self.pipeline.generate("Top 5 kênh có lượt xem thấp nhất hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(
            [(item.field, item.direction) for item in result.query_plan.order_by],
            [("rating.total_channel_views", "asc")],
        )
        self.assertIn("ORDER BY total_channel_views ASC", result.rendered_sql.sql)

    def test_explicit_dimension_descending_overrides_breakdown_default(self):
        result = self.pipeline.generate("Lượt xem theo kênh, kênh giảm dần hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(
            [(item.field, item.direction) for item in result.query_plan.order_by],
            [("agg_info_channel.channel", "desc")],
        )
        self.assertIn("ORDER BY channel DESC", result.rendered_sql.sql)

    def test_multiple_explicit_sorts_preserve_text_order(self):
        result = self.pipeline.generate("Lượt xem tăng dần, kênh giảm dần hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(
            [(item.field, item.direction) for item in result.query_plan.order_by],
            [
                ("rating.total_channel_views", "asc"),
                ("agg_info_channel.channel", "desc"),
            ],
        )
        self.assertIn("ORDER BY total_channel_views ASC, channel DESC", result.rendered_sql.sql)

    def test_pattern_order_rule_remains_fallback_without_explicit_sort(self):
        result = self.pipeline.generate("Top 5 kênh theo lượt xem hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(
            [(item.field, item.direction) for item in result.query_plan.order_by],
            [("rating.total_channel_views", "desc")],
        )

    def test_sort_without_target_fails_before_sql_rendering(self):
        result = self.pipeline.generate("Sắp xếp giảm dần")

        self.assertEqual(result.error, "Không có giá trị nào phục vụ dashboard")
        self.assertIsNone(result.query_plan)
        self.assertIsNone(result.generated_sql)

    def test_conflicting_sorts_for_one_field_are_rejected(self):
        result = self.pipeline.generate("Lượt xem tăng dần, lượt xem giảm dần hôm qua")

        self.assertEqual(result.error, "ambiguous_order_by:rating.total_channel_views")
        self.assertIsNone(result.generated_sql)

    def test_weighted_rating_percent_uses_declared_multi_table_recipe(self):
        result = self.pipeline.generate("rating% theo kênh hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.primary_metric.id, "rating.rating_percent")
        self.assertEqual(result.query_plan.dimensions, ("agg_info_channel.channel",))
        sql = result.rendered_sql.sql
        self.assertNotIn("{%", sql)
        self.assertNotIn("{{", sql)
        self.assertIn("WITH rating_ott AS", sql)
        self.assertIn("FROM data_dashboard_rating.agg_info_channel", sql)
        self.assertIn("FROM data_dashboard_rating.weight_reach_v2", sql)
        self.assertIn("FROM data_dashboard_rating.coef_statistics", sql)
        self.assertIn("FROM data_dashboard_rating.province_statistics", sql)
        self.assertIn("JOIN dim_weight ON rating_ott.date = dim_weight.date", sql)
        self.assertIn("JOIN dim_coef ON rating_ott.date = dim_coef.date", sql)
        self.assertIn("JOIN dim_population ON 1 = 1", sql)
        self.assertIn("SUM(rating_ott.duration_view * dim_weight.weight * dim_coef.view_coef)", sql)
        self.assertEqual(result.rendered_sql.parameters["weight_scope_eq"], "Toàn quốc")
        self.assertEqual(result.rendered_sql.parameters["time_start"], "2026-08-03T00:00:00")
        self.assertEqual(result.rendered_sql.parameters["time_end"], "2026-08-03T23:59:59")
        self.assertNotIn(":time_start", result.rendered_sql.executable_sql)
        self.assertIn("'2026-08-03T00:00:00'", result.rendered_sql.executable_sql)
        self.assertIn("province = 'Toàn quốc'", result.rendered_sql.executable_sql)

    def test_weighted_recipe_supports_explicit_multi_sort(self):
        result = self.pipeline.generate("rating% tăng dần, kênh giảm dần hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(
            [(item.field, item.direction) for item in result.query_plan.order_by],
            [
                ("rating.rating_percent", "asc"),
                ("agg_info_channel.channel", "desc"),
            ],
        )
        self.assertIn("ORDER BY rating_percent ASC, channel_name_tvd DESC", result.rendered_sql.sql)

    def test_weighted_recipe_does_not_inject_missing_dimension(self):
        result = self.pipeline.generate("rating% hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.dimensions, ())
        self.assertNotIn("GROUP BY rating_ott.channel_name_tvd", result.rendered_sql.sql)
        self.assertIn("channel_name_tvd = :weight_channel_eq", result.rendered_sql.sql)

    def test_active_channel_scope_is_extracted_before_sql_recipe(self):
        result = self.pipeline.generate("rating active hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.extracted_input.channel_weight_scope, "active_channels")
        self.assertEqual(result.query_plan.channel_weight_scope, "active_channels")
        self.assertIn(
            "rating_ott.channel_name_tvd = dim_weight.channel_name_tvd",
            result.rendered_sql.sql,
        )
        self.assertNotIn("weight_channel_eq", result.rendered_sql.parameters)

    def test_weighted_recipe_selects_scope_join_from_requested_dimension(self):
        result = self.pipeline.generate("rating% theo vùng hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.dimensions, ("agg_info_channel.region",))
        self.assertIn("rating_ott.regional_name = dim_weight.province", result.rendered_sql.sql)
        self.assertIn("rating_ott.regional_name = dim_population.province", result.rendered_sql.sql)

    def test_rating_and_rating_percent_are_distinct_metrics(self):
        rating = self.pipeline.generate("rating theo kênh và hình thức xem từ 2026-08-01 đến 2026-08-05")
        rating_percent = self.pipeline.generate("rating% theo kênh và hình thức xem từ 2026-08-01 đến 2026-08-05")

        self.assertEqual(rating.query_plan.primary_metric.id, "rating.rating_absolute")
        self.assertEqual(rating_percent.query_plan.primary_metric.id, "rating.rating_percent")
        for result in (rating, rating_percent):
            self.assertNotIn("DATE(rating_ott.date) AS date", result.rendered_sql.sql)
            self.assertIn("rating_ott.channel_name_tvd AS channel_name_tvd", result.rendered_sql.sql)
            self.assertIn("rating_ott.event_category_name AS event_category_name", result.rendered_sql.sql)

    def test_channel_metric_supports_all_declared_calculations(self):
        cases = {
            "rating tuyệt đối theo kênh hôm qua": "AS rating",
            "average reach theo kênh hôm qua": "AS ave_reach",
            "reach% theo kênh hôm qua": "AS reach_percent",
            "minute per user day theo kênh hôm qua": "AS minute_per_user_day",
        }
        for question, output_alias in cases.items():
            with self.subTest(question=question):
                result = self.pipeline.generate(question)
                self.assertIsNone(result.error)
                self.assertIsNotNone(result.rendered_sql)
                self.assertIn(output_alias, result.rendered_sql.sql)
                self.assertIn("GROUP BY rating_ott.channel_name_tvd", result.rendered_sql.sql)

    def test_vague_channel_question_expands_semantic_metric_bundle(self):
        result = self.pipeline.generate("Kênh VTV1 hôm nay như thế nào?")

        self.assertIsNone(result.error)
        self.assertNotIn("metric", result.extracted_input.unresolved_terms)
        self.assertEqual(
            tuple(item.id for item in result.query_plan.metrics),
            (
                "rating.rating_absolute",
                "rating.rating_percent",
                "rating.average_reach",
                "rating.reach_percent",
                "rating.minute_per_user_day",
            ),
        )
        self.assertEqual(
            result.rendered_sql.selected_columns,
            ("rating", "rating_percent", "ave_reach", "reach_percent", "minute_per_user_day"),
        )
        sql = result.rendered_sql.sql
        self.assertIn("AND channel_name_tvd = :filter_0", sql)
        self.assertIn("AS rating", sql)
        self.assertIn("AS rating_percent", sql)
        self.assertIn("AS ave_reach", sql)
        self.assertIn("AS reach_percent", sql)
        self.assertIn("AS minute_per_user_day", sql)

    def test_program_evidence_wins_shared_channel_dimension_alias(self):
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 4),
            llm_client=_MockLLM(
                {
                    "metric_id": None,
                    "dimensions": [
                        {"dimension_id": "agg_info_program.channel", "raw_values": [], "roles": ["group_by"]},
                        {"dimension_id": "agg_info_program.program_name", "raw_values": ["Thời sự 19h"], "roles": ["filter"]},
                    ],
                },
                pattern="dimension_breakdown",
            ),
        )
        result = pipeline.generate("Kênh thời sự 19h hôm qua như thế nào ?")

        self.assertIsNone(result.error)
        self.assertEqual(result.resolved_components.table, "data_dashboard_rating.agg_info_program")
        self.assertEqual(result.query_plan.dimensions, ("agg_info_program.channel",))
        self.assertEqual(
            result.query_plan.filters[0].value,
            "THỜI SỰ 19H",
        )
        self.assertEqual(
            tuple(metric.id for metric in result.query_plan.metrics),
            (
                "program.rating_absolute",
                "program.rating_percent",
                "program.weighted_view_duration",
                "program.average_reach",
                "program.reach_percent",
                "program.viewing_time_share_percent",
            ),
        )

    def test_growth_without_time_stops_with_pattern_context_at_step_three(self):
        result = self.pipeline.generate("Tăng trưởng của VTV1")

        self.assertEqual(result.error, "missing_pattern_context")
        self.assertIsNone(result.query_plan)
        self.assertIsNone(result.generated_sql)
        self.assertIsNotNone(result.pattern_context)
        self.assertEqual(result.pattern_context.pattern_name, "trend_analysis")
        self.assertEqual(
            result.pattern_context.missing_fields,
            ("time_range", "time_grain"),
        )
        self.assertIn("Tăng trưởng VTV1 trong 7 ngày qua", result.pattern_context.suggestions)
        self.assertEqual(result.output.source, "deterministic")
        self.assertIn("Thiếu context cho trend_analysis", result.output.text)
        self.assertIn("Gợi ý:\n- Tăng trưởng VTV1 trong 7 ngày qua", result.output.text)

    def test_llm_growth_without_time_keeps_intent_and_returns_context_error(self):
        llm = MagicMock()
        llm.complete_text.side_effect = (
            '{"metric_id": null, "dimensions": '
            '[{"dimension_id": "agg_info_channel.channel", '
            '"raw_values": ["VTV1"], "roles": ["filter"]}]}',
            "trend_analysis",
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 4),
            llm_client=llm,
        )

        result = pipeline.generate("Tăng trưởng của VTV1")

        self.assertEqual(result.error, "missing_pattern_context")
        self.assertEqual(result.pattern_context.pattern_name, "trend_analysis")
        self.assertIsNone(result.generated_sql)
        self.assertEqual(llm.complete_text.call_count, 2)
        self.assertEqual(result.semantic_extraction.source, "llm")

    def test_growth_with_multi_day_range_builds_trend_bundle(self):
        result = self.pipeline.generate("Tăng trưởng VTV1 trong 7 ngày qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "trend_analysis")
        self.assertEqual(result.query_plan.dimensions, ("agg_info_channel.date",))
        self.assertEqual(result.query_plan.time_range.start, "2026-07-28")
        self.assertEqual(result.query_plan.time_range.end, "2026-08-04")
        self.assertEqual(len(result.query_plan.metrics), 5)
        self.assertIsNotNone(result.generated_sql)

    def test_question_without_metric_or_dimension_does_not_use_default_bundle(self):
        result = self.pipeline.generate("Helo")

        self.assertEqual(result.error, "Không có giá trị nào phục vụ dashboard")
        self.assertIsNone(result.query_plan)
        self.assertIsNone(result.generated_sql)
        self.assertEqual(result.extracted_input.error, "Không có giá trị nào phục vụ dashboard")
        self.assertEqual(result.output.text, "Không có giá trị nào phục vụ dashboard")
        self.assertEqual(result.output.source, "deterministic")
        self.assertIsNone(result.resolved_components)
        self.assertEqual(
            result.extracted_input.notes,
            ("Không có giá trị nào phục vụ dashboard",),
        )

    def test_process_rows_applies_pattern_compute_after_validation(self):
        result = self.pipeline.generate(
            "Phân tích xu hướng lượt xem theo ngày từ 2026-08-01 đến 2026-08-03"
        )
        rows = [
            {"date": "2026-08-01", "total_channel_views": 100},
            {"date": "2026-08-02", "total_channel_views": 120},
            {"date": "2026-08-03", "total_channel_views": 90},
        ]

        processed = self.pipeline.process_rows(result.query_plan, rows)

        self.assertTrue(processed.is_available)
        self.assertEqual(processed.analysis["pattern"], "trend_analysis")
        self.assertEqual(processed.analysis["raw_row_count"], 3)
        self.assertEqual(processed.analysis["data"][0]["mom_change_pct"], None)
        self.assertEqual(processed.analysis["data"][1]["mom_change_pct"], 20.0)
        self.assertEqual(processed.analysis["data"][2]["mom_change_pct"], -25.0)

    def test_process_rows_skips_compute_when_result_has_no_data(self):
        result = self.pipeline.generate("rating hôm nay là bao nhiêu")

        with patch.object(self.pipeline.pattern_compute, "process") as compute:
            processed = self.pipeline.process_rows(result.query_plan, [{"rating": None}])

        self.assertFalse(processed.is_available)
        self.assertIsNone(processed.analysis)
        self.assertEqual(processed.validation.message, "Chưa có dữ liệu của ngày 2026-08-04")
        compute.assert_not_called()

    def test_month_comparison_groups_two_periods_before_compute(self):
        result = self.pipeline.generate("So sánh rating của tháng 6 và thasg 7 \x1b[C")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "period_comparison")
        self.assertEqual(result.query_plan.dimensions, ("agg_info_channel.date",))
        self.assertEqual(result.query_plan.time_range.start, "2026-06-01")
        self.assertEqual(result.query_plan.time_range.end, "2026-08-01")
        self.assertEqual(result.query_plan.time_range.grain, "month")
        self.assertIn("DATE_FORMAT(rating_ott.date, '%Y-%m-01') AS date", result.rendered_sql.sql)

        processed = self.pipeline.process_rows(
            result.query_plan,
            [
                {"date": "2026-06-01", "rating": 100.0},
                {"date": "2026-07-01", "rating": 120.0},
            ],
        )

        self.assertEqual(processed.analysis["data"]["comparisons"][0]["delta"], 20.0)
        self.assertEqual(processed.analysis["data"]["comparisons"][0]["delta_pct"], 20.0)
        self.assertEqual(processed.output.source, "deterministic")
        self.assertIn("tháng 7/2026", processed.output.text)

    def test_today_vs_yesterday_has_two_period_buckets(self):
        result = self.pipeline.generate("Rating VTV1 hôm nay so với hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "period_comparison")
        self.assertEqual(result.query_plan.time_range.start, "2026-08-03")
        self.assertEqual(result.query_plan.time_range.end, "2026-08-05")
        self.assertEqual(result.query_plan.time_range.grain, "day")
        self.assertIsNotNone(result.generated_sql)

    def test_period_comparison_without_explicit_metric_uses_dimension_bundle(self):
        result = self.pipeline.generate("VTV1 của tháng 7 so với tháng 6 như thế nào?")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "period_comparison")
        self.assertEqual(
            tuple(metric.id for metric in result.query_plan.metrics),
            (
                "rating.rating_absolute",
                "rating.rating_percent",
                "rating.average_reach",
                "rating.reach_percent",
                "rating.minute_per_user_day",
            ),
        )

        processed = self.pipeline.process_rows(
            result.query_plan,
            [
                {
                    "date": "2026-06-01",
                    "rating": 100.0,
                    "rating_percent": 10.0,
                    "ave_reach": 1000.0,
                    "reach_percent": 20.0,
                    "minute_per_user_day": 30.0,
                },
                {
                    "date": "2026-07-01",
                    "rating": 120.0,
                    "rating_percent": 12.0,
                    "ave_reach": 900.0,
                    "reach_percent": 18.0,
                    "minute_per_user_day": 30.0,
                },
            ],
        )

        comparisons = processed.analysis["data"]["comparisons"]
        self.assertEqual(len(comparisons), 5)
        self.assertEqual(comparisons[0]["delta_pct"], 20.0)
        self.assertEqual(comparisons[2]["delta_pct"], -10.0)
        self.assertEqual(processed.output.text.count("\n- "), 5)

    def test_bundle_comparison_preserves_missing_values_and_zero_baseline(self):
        result = self.pipeline.generate("VTV1 của tháng 7 so với tháng 6 như thế nào?")

        processed = self.pipeline.process_rows(
            result.query_plan,
            [
                {
                    "date": "2026-06-01",
                    "rating": 0.0,
                    "rating_percent": None,
                    "ave_reach": 1000.0,
                },
                {
                    "date": "2026-07-01",
                    "rating": 120.0,
                    "rating_percent": 12.0,
                    "ave_reach": 900.0,
                },
            ],
        )

        comparisons = {
            item["metric_alias"]: item
            for item in processed.analysis["data"]["comparisons"]
        }
        self.assertEqual(comparisons["rating"]["delta"], 120.0)
        self.assertIsNone(comparisons["rating"]["delta_pct"])
        self.assertEqual(comparisons["rating_percent"]["status"], "insufficient_data")
        self.assertIsNone(comparisons["rating_percent"]["delta"])

    def test_dimension_values_are_grouped_and_compared(self):
        result = self.pipeline.generate("rating VTV1 so với VTV2")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "dimension_comparison")
        self.assertEqual(result.query_plan.dimensions, ("agg_info_channel.channel",))
        self.assertEqual(result.query_plan.filters[0].value, ("VTV1", "VTV2"))
        self.assertEqual(result.validation.warnings, ())
        self.assertIn("GROUP BY rating_ott.channel_name_tvd", result.rendered_sql.sql)

        processed = self.pipeline.process_rows(
            result.query_plan,
            [
                {"channel_name_tvd": "VTV1", "rating": 100.0},
                {"channel_name_tvd": "VTV2", "rating": 80.0},
            ],
        )

        comparison = processed.analysis["data"]["comparisons"][0]
        self.assertEqual(comparison["group_a"], "VTV1")
        self.assertEqual(comparison["group_b"], "VTV2")
        self.assertEqual(comparison["delta"], -20.0)
        self.assertEqual(comparison["delta_pct"], -20.0)
        self.assertEqual(
            processed.output.text,
            "Rating: VTV2 đạt 80,00, giảm 20,00 (20,00%) so với VTV1 (100,00).",
        )

    def test_explicit_all_channel_grouping_phrase_augments_llm_evidence(self):
        llm = MagicMock()
        llm.complete_text.side_effect = (
            '{"metric_id": "rating.rating_percent", "dimensions": '
            '[{"dimension_id": "agg_info_channel.date", "raw_values": [], '
            '"roles": ["group_by"]}]}',
            "trend_analysis",
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 4),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Biến động rating% của toàn bộ các kênh "
            "từ ngày 2026-08-01 đến ngày 2026-08-02"
        )

        self.assertIsNone(result.error)
        self.assertEqual(
            result.query_plan.dimensions,
            ("agg_info_channel.date", "agg_info_channel.channel"),
        )
        self.assertIn(
            "rating_ott.channel_name_tvd = dim_weight.channel_name_tvd",
            result.rendered_sql.sql,
        )
        self.assertNotIn("weight_channel_eq", result.rendered_sql.parameters)

        processed = pipeline.process_rows(
            result.query_plan,
            [
                {"date": "2026-08-01", "channel_name_tvd": "VTV1", "rating_percent": 2.0},
                {"date": "2026-08-02", "channel_name_tvd": "VTV1", "rating_percent": 3.0},
                {"date": "2026-08-01", "channel_name_tvd": "VTV2", "rating_percent": 4.0},
                {"date": "2026-08-02", "channel_name_tvd": "VTV2", "rating_percent": 2.0},
            ],
        )

        changes = {
            (row["channel_name_tvd"], row["date"]): row["mom_change_pct"]
            for row in processed.analysis["data"]
        }
        self.assertIsNone(changes[("VTV1", "2026-08-01")])
        self.assertEqual(changes[("VTV1", "2026-08-02")], 50.0)
        self.assertIsNone(changes[("VTV2", "2026-08-01")])
        self.assertEqual(changes[("VTV2", "2026-08-02")], -50.0)

    def test_grouped_channel_trend_rejects_incompatible_llm_period_pattern(self):
        llm = MagicMock()
        llm.complete_text.side_effect = (
            '{"metric_id": "rating.rating_percent", "dimensions": '
            '[{"dimension_id": "agg_info_channel.date", "raw_values": [], '
            '"roles": ["group_by"]}]}',
            "period_comparison",
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 4),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Biến động rating% của toàn bộ các kênh "
            "từ ngày 2026-08-01 đến ngày 2026-08-02"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "trend_analysis")

    def test_timeband_rating_variation_generates_valid_sql(self):
        result = self.pipeline.generate("Biến động rating theo khung giờ hôm qua")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.primary_metric.id, "rating.rating_absolute")
        self.assertIn("agg_info_channel.time_band", result.query_plan.dimensions)
        self.assertIn("rating_ott.time_band AS time_band", result.rendered_sql.sql)
        self.assertIn("GROUP BY rating_ott.time_band", result.rendered_sql.sql)

    def test_timeband_reach_variation_generates_valid_sql(self):
        result = self.pipeline.generate("Biến động reach tuyệt đối theo khung giờ")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.primary_metric.id, "rating.average_reach")
        self.assertIn("agg_info_channel.time_band", result.query_plan.dimensions)
        self.assertIn("dim_coef.user_coef", result.rendered_sql.sql)
        self.assertIn("GROUP BY rating_ott.time_band", result.rendered_sql.sql)

    def test_program_listing_on_channel_renders_distinct_program_name_sql(self):
        llm = _MockLLM(
            {
                "metric_id": None,
                "dimensions": [
                    {"dimension_id": "agg_info_program.program_name", "raw_values": [], "roles": ["group_by"]},
                    {"dimension_id": "agg_info_program.channel", "raw_values": ["VTV1"], "roles": ["filter"]},
                ],
            },
            "dimension_listing",
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 24),
            llm_client=llm,
        )
        result = pipeline.generate("các chương trình được phát sóng ở kênh VTV1 là")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "dimension_listing")
        self.assertEqual(result.query_plan.metrics, ())
        self.assertEqual(result.query_plan.dimensions, ("agg_info_program.program_name",))
        self.assertEqual(result.rendered_sql.selected_columns, ("program_name",))
        sql = result.rendered_sql.sql
        self.assertTrue(sql.startswith("SELECT DISTINCT"))
        self.assertIn("program_name", sql)
        self.assertIn("FROM data_dashboard_rating.agg_info_program", sql)
        self.assertIn("channel_name_tvd = :filter_0", sql)
        self.assertNotIn("JOIN dim_weight", sql)
        self.assertNotIn("JOIN dim_coef", sql)
        self.assertNotIn("JOIN dim_population", sql)

    def test_channel_listing_in_timeband_renders_distinct_channel_sql(self):
        llm = _MockLLM(
            {
                "metric_id": None,
                "dimensions": [
                    {"dimension_id": "agg_info_channel.channel", "raw_values": [], "roles": ["group_by"]},
                    {"dimension_id": "agg_info_channel.time_band", "raw_values": ["18h - 19h", "19h - 20h"], "roles": ["filter"]},
                ],
            },
            "dimension_listing",
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 24),
            llm_client=llm,
        )
        result = pipeline.generate("các kênh được phát trong thời gian từ 18h-20h")

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.pattern_name, "dimension_listing")
        self.assertEqual(result.query_plan.metrics, ())
        self.assertEqual(result.query_plan.dimensions, ("agg_info_channel.channel",))
        self.assertEqual(result.rendered_sql.selected_columns, ("channel",))
        sql = result.rendered_sql.sql
        self.assertTrue(sql.startswith("SELECT DISTINCT"))
        self.assertIn("channel_name_tvd AS channel", sql)
        self.assertIn("FROM data_dashboard_rating.agg_info_channel", sql)
        self.assertIn("time_band IN (:filter_0_0, :filter_0_1)", sql)
        self.assertNotIn("JOIN dim_weight", sql)
        self.assertNotIn("JOIN dim_coef", sql)
        self.assertNotIn("JOIN dim_population", sql)


    def test_multi_month_metric_lookup_queries(self):
        llm = _MockLLM(
            {
                "metric_id": "rating.rating_absolute",
                "dimensions": [],
            },
            "dimension_breakdown",  # LLM initially misclassifies, should safely fall back to metric_lookup
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 24),
            llm_client=llm,
        )
        for q, start, end in (
            ("rating của tháng 4, 5 là bao nhiêu", "2026-04-01", "2026-06-01"),
            ("rating của tháng 4 và 6 là bao nhiêu", "2026-04-01", "2026-07-01"),
        ):
            with self.subTest(q=q):
                result = pipeline.generate(q)
                self.assertIsNone(result.error)
                self.assertEqual(result.query_plan.pattern_name, "metric_lookup")
                self.assertEqual(result.query_plan.time_range.start, start)
                self.assertEqual(result.query_plan.time_range.end, end)
                self.assertIn("SUM(rating_ott.duration_view * dim_weight.weight * dim_coef.view_coef)", result.rendered_sql.sql)


if __name__ == "__main__":
    unittest.main()


