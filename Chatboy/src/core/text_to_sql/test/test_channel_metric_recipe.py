from __future__ import annotations

import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_011_rating_sql_renderer import RatingSQLRenderer
from src.core.text_to_sql.query_plan import MetricRef, RatingQueryPlan, TimeRange
from src.core.text_to_sql.recipes.channel_metric import ChannelMetricRecipe


class TestChannelMetricRecipe(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = RatingCatalog.load()
        cls.renderer = RatingSQLRenderer(catalog=cls.catalog)

    def _render(self, *metric_ids: str, dimensions=()):
        plan = RatingQueryPlan(
            domain="RATING",
            metrics=tuple(
                MetricRef(metric_id, self.catalog.require_metric(metric_id).output_alias)
                for metric_id in metric_ids
            ),
            dimensions=dimensions,
            filters=(),
            time_range=TimeRange("2026-08-01", "2026-08-02"),
            order_by=(),
            limit=100,
            query_shape="breakdown" if dimensions else "aggregate",
            raw_question="fixture",
            pattern_name="dimension_breakdown" if dimensions else "metric_lookup",
        )
        return self.renderer.render(plan).queries[0].sql

    def test_catalog_loads_channel_module_contract(self):
        contract = self.catalog.require_fact_contract("channel")
        recipe = self.catalog.require_recipe("channel_metric")

        self.assertEqual(contract.table_id, "agg_info_channel")
        self.assertEqual(
            contract.base_grain,
            ("date", "channel_name_tvd", "time_band", "province_name"),
        )
        self.assertIsInstance(self.catalog.recipe_handler("channel_metric"), ChannelMetricRecipe)
        self.assertEqual(recipe.fact_contract, "channel")
        self.assertEqual(set(recipe.measures), {"duration_view", "distinct_user_by_day"})
        self.assertEqual(
            set(recipe.calculations),
            {"rating", "rating_percent", "average_reach", "reach_percent", "minute_per_user_day"},
        )

    def test_channel_metrics_use_module_calculations(self):
        self.assertEqual(
            self.catalog.render_calculation(
                self.catalog.require_metric("rating.rating_absolute")
            ),
            "SUM(rating_ott.duration_view * dim_weight.weight * dim_coef.view_coef) / 60 / (18 * 60 * COUNT(DISTINCT rating_ott.date))",
        )
        self.assertIn(
            "NULLIF(SUM(rating_ott.distinct_user_by_day * dim_weight.weight * dim_coef.user_coef), 0)",
            self.catalog.render_calculation(
                self.catalog.require_metric("rating.minute_per_user_day")
            ),
        )

    def test_channel_recipe_uses_metadata_measures_and_no_program_columns(self):
        sql = self._render("rating.rating_absolute", dimensions=("agg_info_channel.channel",))

        self.assertIn("SUM(duration_view) AS duration_view", sql)
        self.assertIn("BITMAP_UNION_COUNT(bm_user_id) AS distinct_user_by_day", sql)
        self.assertIn("FROM data_dashboard_rating.agg_info_channel", sql)
        self.assertNotIn("event_duration", sql)
        self.assertNotIn("program_name", sql)

    def test_channel_fact_predicates_are_dimension_scoped(self):
        plan = RatingQueryPlan(
            domain="RATING",
            metrics=(MetricRef("rating.rating_absolute", "rating"),),
            dimensions=("agg_info_channel.province",),
            filters=(),
            time_range=TimeRange("2026-08-01", "2026-08-02"),
            order_by=(),
            limit=100,
            query_shape="breakdown",
            raw_question="fixture",
            pattern_name="dimension_breakdown",
        )

        sql = self.renderer.render(plan).queries[0].sql

        self.assertIn("province_name <> :channel_unknown_province", sql)
        self.assertNotIn("key_city IS NOT NULL", sql)


    def test_reach_percent_type_1_date_only_omits_user_coef(self):
        sql = self._render("rating.reach_percent", dimensions=())
        self.assertIn(
            "SUM(rating_ott.distinct_user_by_day * dim_weight.weight) * 100 / (COUNT(DISTINCT rating_ott.date) * SUM(DISTINCT dim_population.total))",
            sql,
        )
        self.assertNotIn("user_coef", sql)
        self.assertNotIn("dim_coef", sql)

    def test_reach_percent_type_2_date_plus_dim_multiplies_user_coef(self):
        sql = self._render("rating.reach_percent", dimensions=("agg_info_channel.channel",))
        self.assertIn(
            "SUM(rating_ott.distinct_user_by_day * dim_weight.weight * dim_coef.user_coef) * 100 / (COUNT(DISTINCT rating_ott.date) * SUM(DISTINCT dim_population.total))",
            sql,
        )
        self.assertIn("dim_coef.user_coef", sql)
        self.assertIn("JOIN dim_coef", sql)


if __name__ == "__main__":
    unittest.main()

