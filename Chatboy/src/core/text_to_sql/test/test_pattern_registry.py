from __future__ import annotations

import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_013_pattern_compute import PatternCompute
from src.core.text_to_sql.query_plan import MetricRef, OrderSpec, RatingQueryPlan, TimeRange


class TestPatternRegistry(unittest.TestCase):
    def setUp(self):
        self.catalog = RatingCatalog.load()
        self.compute = PatternCompute(catalog=self.catalog)

    def _plan(self, pattern: str, dimensions=("agg_info_channel.channel",), order_by=()):
        return RatingQueryPlan(
            domain="RATING",
            metrics=(MetricRef("rating.total_channel_views", "total_channel_views"),),
            dimensions=dimensions,
            filters=(),
            time_range=TimeRange("2026-08-01", "2026-08-04"),
            order_by=order_by,
            limit=10,
            query_shape=self.catalog.require_pattern(pattern).query_shape,
            raw_question="test",
            pattern_name=pattern,
        )

    def test_all_patterns_have_valid_shapes(self):
        for spec in self.catalog.patterns.values():
            self.assertIn(spec.query_shape, self.catalog.query_shapes)
            self.assertIn(spec.narration_prompt_id, self.catalog.narration.prompts)

    def test_patterns_are_loaded_from_dashboard_yaml(self):
        self.assertEqual(self.catalog.source_path("patterns").name, "patterns_v3.yaml")
        self.assertEqual(
            self.catalog.patterns["rank_lookup"].default_order[0].target,
            "primary_metric",
        )
        self.assertEqual(
            self.catalog.patterns["rank_lookup"].default_order[0].direction,
            "desc",
        )
        self.assertTrue(self.catalog.patterns["rank_lookup"].needs_limit)
        self.assertEqual(self.catalog.patterns["rank_lookup"].default_limit, 10)

    def test_get_unknown_pattern_raises(self):
        with self.assertRaises(KeyError):
            self.catalog.require_pattern("does_not_exist")

    def test_rank_comparison_computes_rank_share_and_gap(self):
        plan = self._plan("rank_comparison")
        result = self.compute.process(
            plan,
            [{"channel": "A", "total_channel_views": 75}, {"channel": "B", "total_channel_views": 25}],
        )
        self.assertNotIn("narrate_template", result)
        self.assertEqual(result["data"][0]["rank"], 1)
        self.assertEqual(result["data"][0]["pct_of_total"], 75.0)
        self.assertEqual(result["data"][1]["gap_vs_leader_pct"], 66.7)

    def test_rank_comparison_respects_explicit_metric_ascending(self):
        plan = self._plan(
            "rank_comparison",
            order_by=(OrderSpec("rating.total_channel_views", "asc"),),
        )
        result = self.compute.process(
            plan,
            [{"channel": "A", "total_channel_views": 75}, {"channel": "B", "total_channel_views": 25}],
        )

        self.assertEqual(result["data"][0]["channel"], "B")
        self.assertEqual(result["data"][0]["rank"], 1)
        self.assertEqual(result["data"][1]["gap_vs_leader_pct"], 200.0)

    def test_trend_computes_period_change(self):
        plan = self._plan("trend_analysis", dimensions=("agg_info_channel.date",))
        result = self.compute.process(
            plan,
            [{"date": "2026-08-02", "total_channel_views": 120}, {"date": "2026-08-01", "total_channel_views": 100}],
        )
        self.assertIsNone(result["data"][0]["mom_change_pct"])
        self.assertEqual(result["data"][1]["mom_change_pct"], 20.0)

    def test_trend_respects_explicit_dimension_descending(self):
        plan = self._plan(
            "trend_analysis",
            dimensions=("agg_info_channel.date",),
            order_by=(OrderSpec("agg_info_channel.date", "desc"),),
        )
        result = self.compute.process(
            plan,
            [{"date": "2026-08-01", "total_channel_views": 100}, {"date": "2026-08-02", "total_channel_views": 120}],
        )

        self.assertEqual(result["data"][0]["date"], "2026-08-02")
        self.assertEqual(result["data"][1]["mom_change_pct"], -16.67)


if __name__ == "__main__":
    unittest.main()
