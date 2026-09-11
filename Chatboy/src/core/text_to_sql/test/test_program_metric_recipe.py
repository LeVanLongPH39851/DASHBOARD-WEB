from __future__ import annotations

import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_011_rating_sql_renderer import RatingSQLRenderer
from src.core.text_to_sql.query_plan import MetricRef, RatingQueryPlan, TimeRange


class TestProgramMetricRecipe(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = RatingCatalog.load()
        cls.renderer = RatingSQLRenderer(catalog=cls.catalog)

    def _render(self, *metric_ids: str) -> str:
        plan = RatingQueryPlan(
            domain="RATING",
            metrics=tuple(
                MetricRef(metric_id, self.catalog.require_metric(metric_id).output_alias)
                for metric_id in metric_ids
            ),
            dimensions=("agg_info_program.category_level1",),
            filters=(),
            time_range=TimeRange("2026-08-01", "2026-08-02"),
            order_by=(),
            limit=100,
            query_shape="breakdown",
            raw_question="fixture",
            pattern_name="dimension_breakdown",
        )
        return self.renderer.render(plan).queries[0].sql

    def test_catalog_loads_program_module_contract(self):
        contract = self.catalog.require_fact_contract("program")
        recipe = self.catalog.require_recipe("program_metric")

        self.assertEqual(contract.table_id, "agg_info_program")
        self.assertIn("epg_id_hash", contract.base_grain)
        self.assertEqual(recipe.fact_contract, "program")
        self.assertEqual(
            set(recipe.measures),
            {"duration_view", "distinct_user_by_day", "event_duration", "program_count", "firstlevel_vn"},
        )
        self.assertIn("program_count", recipe.calculations)
        self.assertIn("viewing_time_share_percent", recipe.calculations)

    def test_weighted_view_duration_selects_only_its_dependencies(self):
        sql = self._render("program.weighted_view_duration")

        self.assertIn("SUM(duration_view) AS duration_view", sql)
        self.assertNotIn("BITMAP_UNION_COUNT", sql)
        self.assertNotIn("MAX(event_duration) AS event_duration", sql)
        self.assertIn("JOIN dim_weight", sql)
        self.assertIn("JOIN dim_coef", sql)
        self.assertNotIn("dim_population AS", sql)
        self.assertIn(
            "SUM(rating_ott.duration_view * dim_weight.weight * dim_coef.view_coef) / 3600",
            sql,
        )

    def test_program_rating_uses_epg_cap_formula_and_required_measures(self):
        sql = self._render("program.rating_absolute")

        self.assertIn("BITMAP_UNION_COUNT(bm_user_id) AS distinct_user_by_day", sql)
        self.assertIn("MAX(event_duration) AS event_duration", sql)
        self.assertIn("COUNT(DISTINCT rating_ott.epg_id_hash)", sql)
        self.assertIn("dim_coef.user_coef", sql)
        self.assertIn("* 0.9", sql)
        self.assertNotIn("dim_population AS", sql)

    def test_percent_metrics_add_population_only_when_formula_requires_it(self):
        rating_sql = self._render("program.rating_percent")
        reach_sql = self._render("program.reach_percent")

        for sql in (rating_sql, reach_sql):
            self.assertIn("dim_population AS", sql)
            self.assertIn("SUM(DISTINCT dim_population.total)", sql)
            self.assertIn("JOIN dim_population ON 1 = 1", sql)

    def test_multi_metric_plan_unions_measure_and_join_requirements(self):
        sql = self._render("program.rating_percent", "program.reach_percent")

        self.assertEqual(sql.count("dim_population AS ("), 1)
        self.assertIn("AS program_rating_percent", sql)
        self.assertIn("AS program_reach_percent", sql)

    def test_airtime_strategy_remains_denominator_safe(self):
        sql = self._render("program.airtime_duration")

        self.assertIn("WITH program_events AS", sql)
        self.assertIn("MAX(event_duration) AS event_duration", sql)
        self.assertNotIn("dim_weight AS", sql)
        self.assertNotIn("dim_coef AS", sql)

    def test_program_count_renders_distinct_program_name(self):
        sql = self._render("program.program_count")

        self.assertIn("COUNT(DISTINCT program_name) AS program_cnt", sql)
        self.assertIn("COUNT(DISTINCT rating_ott.program_name) AS program_count", sql)
        self.assertNotIn("dim_weight AS", sql)
        self.assertNotIn("dim_coef AS", sql)


if __name__ == "__main__":
    unittest.main()
