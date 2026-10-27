from __future__ import annotations

import unittest
from unittest.mock import MagicMock

from src.core.text_to_sql.d_004_pattern_router import PatternRouter


class TestPatternRouter(unittest.TestCase):
    def test_router_only_exposes_generic_pattern_classification(self):
        self.assertFalse(hasattr(PatternRouter, "select_intent"))

    def _inputs(
        self,
        question: str,
        normalized: str,
        dimensions=(),
        filters=(),
        time_expression_count: int = 0,
    ):
        extracted = MagicMock()
        extracted.question = question
        extracted.normalized_question = normalized
        extracted.entities = tuple(
            MagicMock(kind="time_expression", normalized_value=f"time-{index}")
            for index in range(time_expression_count)
        )
        components = MagicMock()
        components.metric_id = "rating.total_channel_views"
        components.dimensions = dimensions
        components.filters = filters
        return extracted, components

    def test_ranking_question(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Top 5 kênh lượt xem cao nhất",
            "top 5 kenh luot xem cao nhat",
            dimensions=("agg_info_channel.channel",),
        )
        self.assertEqual(router.classify(extracted, components), "rank_lookup")

    def test_trend_takes_precedence_over_top_keyword(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Top 5 xu hướng lượt xem theo ngày",
            "top 5 xu huong luot xem theo ngay",
        )
        self.assertEqual(router.classify(extracted, components), "trend_analysis")

    def test_share_and_period_comparison(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Tỷ trọng lượt xem theo kênh",
            "ty trong luot xem theo kenh",
            dimensions=("agg_info_channel.channel",),
        )
        self.assertEqual(router.classify(extracted, components), "share_distribution")

        extracted, components = self._inputs(
            "So sánh lượt xem hôm nay vs hôm qua",
            "so sanh luot xem hom nay vs hom qua",
            time_expression_count=2,
        )
        self.assertEqual(router.classify(extracted, components), "period_comparison")

    def test_plain_dimension_query_uses_breakdown(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Lượt xem theo kênh hôm qua",
            "luot xem theo kenh hom qua",
            dimensions=("agg_info_channel.channel",),
        )
        self.assertEqual(router.classify(extracted, components), "dimension_breakdown")

    def test_top_share_query_uses_rank_comparison(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Top 5 kênh theo tỷ trọng lượt xem",
            "top 5 kenh theo ty trong luot xem",
            dimensions=("agg_info_channel.channel",),
        )
        self.assertEqual(router.classify(extracted, components), "rank_comparison")

    def test_percentage_metric_is_not_share_intent(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Rating phần trăm theo kênh",
            "rating phan tram theo kenh",
            dimensions=("agg_info_channel.channel",),
        )
        components.metric_id = "rating.rating_percent"
        self.assertEqual(router.classify(extracted, components), "dimension_breakdown")

    def test_dependency_failure_does_not_change_pattern(self):
        from src.core.text_to_sql.runtime.errors import WorkflowError
        llm = MagicMock()
        llm.complete_text.side_effect = WorkflowError("dependency_unavailable")
        router = PatternRouter(llm_client=llm)
        extracted, components = self._inputs("Tổng lượt xem hôm qua", "tong luot xem hom qua")
        with self.assertRaises(WorkflowError):
            router.classify(extracted,components)
        self.assertEqual(llm.complete_text.call_count,1)

    def test_successful_llm_decision_is_logged(self):
        llm = MagicMock()
        llm.complete_text.return_value = "trend_analysis"
        router = PatternRouter(llm_client=llm)
        extracted, components = self._inputs(
            "Phân tích xu hướng rating theo ngày",
            "phan tich xu huong rating theo ngay",
            dimensions=("agg_info_channel.date",),
        )
        with self.assertLogs("src.core.text_to_sql.d_004_pattern_router", level="INFO") as captured:
            self.assertEqual(router.classify(extracted, components), "trend_analysis")
        self.assertTrue(
            any("source=llm pattern=trend_analysis" in message for message in captured.output)
        )
        self.assertTrue(any("stage=llm" in message for message in captured.output))

    def test_rule_decision_without_llm_is_logged(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Top 3 kênh rating cao nhất",
            "top 3 kenh rating cao nhat",
            dimensions=("agg_info_channel.channel",),
        )
        with self.assertLogs("src.core.text_to_sql.d_004_pattern_router", level="INFO") as captured:
            self.assertEqual(router.classify(extracted, components), "rank_lookup")
        self.assertTrue(
            any(
                "source=rules pattern=rank_lookup reason=llm_not_configured" in message
                for message in captured.output
            )
        )

    def test_llm_classifies_dimension_bundle_without_explicit_metric(self):
        llm = MagicMock()
        llm.complete_text.return_value = "period_comparison"
        router = PatternRouter(llm_client=llm)
        extracted, components = self._inputs(
            "VTV1 tháng 7 so với tháng 6 như thế nào?",
            "vtv1 thang 7 so voi thang 6 nhu the nao",
            time_expression_count=2,
        )
        components.metric_id = None
        components.filters = (MagicMock(dimension_id="agg_info_channel.channel"),)

        self.assertEqual(router.classify(extracted, components), "period_comparison")
        prompt = llm.complete_text.call_args.kwargs["prompt"]
        self.assertIn('"explicit_metric": false', prompt)
        self.assertIn('"rating.rating_absolute"', prompt)

    def test_rules_fallback_detects_comparison_with_dimension_bundle(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "VTV1 tháng 7 so với tháng 6 như thế nào?",
            "vtv1 thang 7 so voi thang 6 nhu the nao",
            time_expression_count=2,
        )
        components.metric_id = None
        components.filters = (MagicMock(dimension_id="agg_info_channel.channel"),)

        self.assertEqual(router.classify(extracted, components), "period_comparison")

    def test_growth_intent_routes_to_trend_before_context_validation(self):
        router = PatternRouter()
        extracted, components = self._inputs(
            "Tăng trưởng của VTV1",
            "tang truong cua vtv1",
        )
        components.metric_id = None
        components.filters = (
            MagicMock(
                dimension_id="agg_info_channel.channel",
                values=("VTV1",),
            ),
        )

        self.assertEqual(router.classify(extracted, components), "trend_analysis")

    def test_llm_growth_intent_is_not_downgraded_to_metric_lookup(self):
        llm = MagicMock()
        llm.complete_text.return_value = "trend_analysis"
        router = PatternRouter(llm_client=llm)
        extracted, components = self._inputs(
            "Tăng trưởng của VTV1",
            "tang truong cua vtv1",
        )
        components.metric_id = None
        components.filters = (
            MagicMock(
                dimension_id="agg_info_channel.channel",
                values=("VTV1",),
            ),
        )

        self.assertEqual(router.classify(extracted, components), "trend_analysis")

    def test_incompatible_pattern_is_repaired_then_rejected(self):
        from src.core.text_to_sql.runtime.errors import WorkflowError
        llm = MagicMock()
        llm.complete_text.return_value = "dimension_breakdown"
        router = PatternRouter(llm_client=llm)
        extracted, components = self._inputs("rating VTV1 so với VTV2", "rating vtv1 so voi vtv2")
        components.filters = (MagicMock(dimension_id="agg_info_channel.channel",values=("VTV1","VTV2")),)
        with self.assertRaises(WorkflowError):
            router.classify(extracted,components)
        self.assertEqual(llm.complete_text.call_count,2)

    def test_pattern_parser_requires_exact_registered_id(self):
        router = PatternRouter()
        self.assertEqual(router._parse_pattern_name("```rank_lookup```"),"rank_lookup")
        for value in ("metric_", '{"pattern":"trend_analysis"}', 'I choose trend_analysis'):
            with self.assertRaises(ValueError):
                router._parse_pattern_name(value)


if __name__ == "__main__":
    unittest.main()
