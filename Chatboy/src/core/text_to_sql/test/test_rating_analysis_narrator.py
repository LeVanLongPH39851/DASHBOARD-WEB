from __future__ import annotations

from unittest.mock import MagicMock
import unittest

from src.core.text_to_sql.query_plan import Filter, MetricRef, RatingQueryPlan, TimeRange
from src.core.text_to_sql.d_014_rating_analysis_narrator import RatingAnalysisNarrator


class TestRatingAnalysisNarrator(unittest.TestCase):
    @staticmethod
    def _plan() -> RatingQueryPlan:
        return RatingQueryPlan(
            domain="RATING",
            metrics=(MetricRef("rating.rating_absolute", "rating"),),
            dimensions=("agg_info_channel.date",),
            filters=(),
            time_range=TimeRange("2026-06-01", "2026-08-01", "month"),
            order_by=(),
            limit=None,
            query_shape="breakdown",
            raw_question="So sánh rating tháng 6 và tháng 7",
            pattern_name="period_comparison",
        )

    @staticmethod
    def _analysis() -> dict:
        return {
            "pattern": "period_comparison",
            "query_shape": "breakdown",
            "raw_row_count": 2,
            "data": {
                "period_a": {"date": "2026-06-01", "rating": 100},
                "period_b": {"date": "2026-07-01", "rating": 120},
                "comparisons": [
                    {
                        "metric_id": "rating.rating_absolute",
                        "metric_alias": "rating",
                        "value_a": 100,
                        "value_b": 120,
                        "delta": 20,
                        "delta_pct": 20.0,
                        "status": "available",
                    }
                ],
                "delta": 20,
                "delta_pct": 20.0,
            },
        }

    def test_llm_only_narrates_validated_analysis(self):
        llm = MagicMock()
        llm.complete_text.return_value = (
            "Rating: tháng 7 đạt 120, tăng 20 (20%) so với tháng 6."
        )

        output = RatingAnalysisNarrator(llm_client=llm).narrate(self._plan(), self._analysis())

        self.assertEqual(output.source, "llm")
        self.assertEqual(
            output.text,
            "Rating: tháng 7 đạt 120, tăng 20 (20%) so với tháng 6.",
        )
        prompt = llm.complete_text.call_args.kwargs["prompt"]
        self.assertIn('"delta_pct": 20.0', prompt)
        self.assertIn("Nêu đầy đủ cả hai kỳ", prompt)
        system_prompt = llm.complete_text.call_args.kwargs["system_prompt"]
        self.assertIn("Không suy đoán nguyên nhân", system_prompt)

    def test_each_pattern_uses_its_own_child_prompt(self):
        llm = MagicMock()
        llm.complete_text.return_value = (
            "Rating tăng từ 100 lên 120 trong hai kỳ quan sát, tương ứng tăng 20%."
        )
        plan = RatingQueryPlan(
            domain="RATING",
            metrics=(MetricRef("rating.rating_absolute", "rating"),),
            dimensions=("agg_info_channel.date",),
            filters=(),
            time_range=TimeRange("2026-06-01", "2026-08-01", "month"),
            order_by=(),
            limit=None,
            query_shape="trend",
            raw_question="Xu hướng rating tháng 6 và tháng 7",
            pattern_name="trend_analysis",
        )
        analysis = {
            "pattern": "trend_analysis",
            "raw_row_count": 2,
            "data": [
                {"date": "2026-06-01", "rating": 100, "mom_change_pct": None},
                {"date": "2026-07-01", "rating": 120, "mom_change_pct": 20.0},
            ],
        }

        output = RatingAnalysisNarrator(llm_client=llm).narrate(plan, analysis)

        self.assertEqual(output.source, "llm")
        prompt = llm.complete_text.call_args.kwargs["prompt"]
        self.assertIn("Phân tích diễn biến metric qua các kỳ liên tiếp", prompt)
        self.assertNotIn("Nêu đầy đủ cả hai kỳ", prompt)

    def test_compute_error_never_reaches_llm(self):
        llm = MagicMock()
        analysis = {
            "pattern": "period_comparison",
            "raw_row_count": 1,
            "data": {"rows": [{"rating": 100}], "error": "insufficient_data"},
        }

        output = RatingAnalysisNarrator(llm_client=llm).narrate(self._plan(), analysis)

        self.assertEqual(output.source, "deterministic")
        self.assertEqual(output.text, "Không đủ dữ liệu để so sánh hai kỳ.")
        llm.complete_text.assert_not_called()

    def test_incomplete_llm_output_is_retried(self):
        llm = MagicMock()
        llm.complete_text.side_effect = [
            "Rating kỳ tháng 7 là 120, giảm",
            "Rating: tháng 7 đạt 120, tăng 20 (20%) so với tháng 6 là 100.",
        ]

        output = RatingAnalysisNarrator(llm_client=llm).narrate(self._plan(), self._analysis())

        self.assertEqual(output.source, "llm")
        self.assertTrue(output.text.endswith("."))
        self.assertEqual(llm.complete_text.call_count, 2)

    def test_repeated_incomplete_llm_output_uses_complete_deterministic_fallback(self):
        llm = MagicMock()
        llm.complete_text.return_value = "Rating kỳ tháng 7 là 120, tăng"

        output = RatingAnalysisNarrator(llm_client=llm).narrate(self._plan(), self._analysis())

        self.assertEqual(output.source, "deterministic")
        self.assertEqual(
            output.text,
            "Rating: tháng 7/2026 đạt 120,00, tăng 20,00 (20,00%) so với tháng 6/2026 (100,00).",
        )
        self.assertEqual(llm.complete_text.call_count, 2)

    @staticmethod
    def _bundle_plan() -> RatingQueryPlan:
        return RatingQueryPlan(
            domain="RATING",
            metrics=(
                MetricRef("rating.rating_absolute", "rating"),
                MetricRef("rating.rating_percent", "rating_percent"),
            ),
            dimensions=("agg_info_channel.date",),
            filters=(),
            time_range=TimeRange("2026-06-01", "2026-08-01", "month"),
            order_by=(),
            limit=None,
            query_shape="breakdown",
            raw_question="VTV1 tháng 7 so với tháng 6 như thế nào?",
            pattern_name="period_comparison",
        )

    @staticmethod
    def _bundle_analysis() -> dict:
        return {
            "pattern": "period_comparison",
            "raw_row_count": 2,
            "data": {
                "period_a": {"date": "2026-06-01", "rating": 100, "rating_percent": 10},
                "period_b": {"date": "2026-07-01", "rating": 120, "rating_percent": 12},
                "comparisons": [
                    {
                        "metric_id": "rating.rating_absolute",
                        "metric_alias": "rating",
                        "value_a": 100,
                        "value_b": 120,
                        "delta": 20,
                        "delta_pct": 20.0,
                        "status": "available",
                    },
                    {
                        "metric_id": "rating.rating_percent",
                        "metric_alias": "rating_percent",
                        "value_a": 10,
                        "value_b": 12,
                        "delta": 2,
                        "delta_pct": 20.0,
                        "status": "available",
                    },
                ],
            },
        }

    def test_bundle_uses_one_llm_prompt_and_requires_one_bullet_per_metric(self):
        llm = MagicMock()
        llm.complete_text.return_value = (
            "So sánh tháng 7 với tháng 6:\n"
            "- Rating: tháng 7 đạt 120, tăng 20 (20%) so với tháng 6.\n"
            "- Rating (%): tháng 7 đạt 12, tăng 2 (20%) so với tháng 6."
        )

        output = RatingAnalysisNarrator(llm_client=llm).narrate(
            self._bundle_plan(),
            self._bundle_analysis(),
        )

        self.assertEqual(output.source, "llm")
        self.assertEqual(llm.complete_text.call_count, 1)
        prompt = llm.complete_text.call_args.kwargs["prompt"]
        self.assertIn('"label": "Rating"', prompt)
        self.assertIn('"label": "Rating (%)"', prompt)

    def test_bundle_missing_bullet_retries_then_uses_deterministic_bullets(self):
        llm = MagicMock()
        llm.complete_text.return_value = (
            "So sánh tháng 7 với tháng 6:\n"
            "- Rating: tháng 7 đạt 120, tăng 20 (20%) so với tháng 6."
        )

        output = RatingAnalysisNarrator(llm_client=llm).narrate(
            self._bundle_plan(),
            self._bundle_analysis(),
        )

        self.assertEqual(output.source, "deterministic")
        self.assertEqual(output.text.count("\n- "), 2)
        self.assertIn("Rating (%)", output.text)
        self.assertEqual(llm.complete_text.call_count, 2)

    @staticmethod
    def _metric_lookup_bundle_plan() -> RatingQueryPlan:
        return RatingQueryPlan(
            domain="RATING",
            metrics=(
                MetricRef("program.rating_absolute", "program_rating"),
                MetricRef("program.rating_percent", "program_rating_percent"),
                MetricRef("program.weighted_view_duration", "program_weighted_view_duration"),
                MetricRef("program.average_reach", "program_ave_reach"),
                MetricRef("program.reach_percent", "program_reach_percent"),
                MetricRef("program.viewing_time_share_percent", "program_viewing_time_share_percent"),
            ),
            dimensions=(),
            filters=(Filter("agg_info_program.program_name", "eq", "THỜI SỰ 19H"),),
            time_range=TimeRange("2026-08-17", "2026-08-18"),
            order_by=(),
            limit=50000,
            query_shape="aggregate",
            raw_question="Thời sự 19H hôm qua như thế nào",
            pattern_name="metric_lookup",
        )

    @staticmethod
    def _metric_lookup_bundle_analysis() -> dict:
        return {
            "pattern": "metric_lookup",
            "query_shape": "aggregate",
            "raw_row_count": 1,
            "data": [
                {
                    "program_rating": 3984431.55,
                    "program_rating_percent": 5.44,
                    "program_weighted_view_duration": 8257734.39,
                    "program_ave_reach": 6085565.2,
                    "program_reach_percent": 8.31,
                    "program_viewing_time_share_percent": 65.47,
                }
            ],
        }

    def test_metric_lookup_bundle_requires_and_renders_every_metric(self):
        llm = MagicMock()
        llm.complete_text.return_value = (
            "- Rating chương trình: 3984431,55.\n"
            "- Rating (%) chương trình: 5,44%.\n"
            "- Thời lượng xem chương trình: 8257734,39 giờ.\n"
            "- Average Reach chương trình: 6085565,20.\n"
            "- Reach (%) chương trình: 8,31%.\n"
            "- Tỷ lệ thời gian xem (%) chương trình: 65,47%."
        )

        output = RatingAnalysisNarrator(llm_client=llm).narrate(
            self._metric_lookup_bundle_plan(),
            self._metric_lookup_bundle_analysis(),
        )

        self.assertEqual(output.source, "llm")
        self.assertEqual(llm.complete_text.call_count, 1)
        self.assertIn("mỗi metric", llm.complete_text.call_args.kwargs["prompt"])

    def test_metric_lookup_bundle_fallback_lists_every_metric(self):
        llm = MagicMock()
        llm.complete_text.return_value = "Kết quả đang được xử lý."

        output = RatingAnalysisNarrator(llm_client=llm).narrate(
            self._metric_lookup_bundle_plan(),
            self._metric_lookup_bundle_analysis(),
        )

        self.assertEqual(output.source, "deterministic")
        self.assertIn("Rating chương trình: 3.984.431,55.", output.text)
        self.assertIn("Rating (%) chương trình: 5,44%.", output.text)
        self.assertIn("Thời lượng xem chương trình: 8.257.734,39 giờ.", output.text)
        self.assertIn("Tỷ lệ thời gian xem (%) chương trình: 65,47%.", output.text)
        self.assertEqual(output.text.count("\n"), 5)

    def test_single_comparison_rejects_heading_and_markdown_bullet(self):
        llm = MagicMock()
        llm.complete_text.return_value = (
            "So sánh giữa tháng 7 và tháng 6:\n\n"
            "* Rating absolute: đạt 120, tăng 20 tương đương 20%."
        )

        output = RatingAnalysisNarrator(llm_client=llm).narrate(
            self._plan(),
            self._analysis(),
        )

        self.assertEqual(output.source, "deterministic")
        self.assertEqual(output.text.count("\n"), 0)
        self.assertTrue(output.text.startswith("Rating:"))

    def test_dimension_comparison_accepts_one_clean_sentence(self):
        llm = MagicMock()
        llm.complete_text.return_value = (
            "Rating: VTV2 đạt 80, giảm 20 (20%) so với VTV1 (100)."
        )
        plan = RatingQueryPlan(
            domain="RATING",
            metrics=(MetricRef("rating.rating_absolute", "rating"),),
            dimensions=("agg_info_channel.channel",),
            filters=(
                Filter(
                    "agg_info_channel.channel",
                    "in",
                    ("VTV1", "VTV2"),
                ),
            ),
            time_range=TimeRange("2026-08-10", "2026-08-11"),
            order_by=(),
            limit=None,
            query_shape="breakdown",
            raw_question="rating VTV1 so với VTV2",
            pattern_name="dimension_comparison",
        )
        analysis = {
            "pattern": "dimension_comparison",
            "raw_row_count": 2,
            "data": {
                "dimension_id": "agg_info_channel.channel",
                "comparisons": [
                    {
                        "metric_id": "rating.rating_absolute",
                        "metric_alias": "rating",
                        "group_a": "VTV1",
                        "group_b": "VTV2",
                        "value_a": 100,
                        "value_b": 80,
                        "delta": -20,
                        "delta_pct": -20.0,
                        "status": "available",
                    }
                ],
            },
        }

        output = RatingAnalysisNarrator(llm_client=llm).narrate(plan, analysis)

        self.assertEqual(output.source, "llm")
        self.assertEqual(output.text, llm.complete_text.return_value)


if __name__ == "__main__":
    unittest.main()
