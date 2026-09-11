from __future__ import annotations

from datetime import date
import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.input_contracts import ExtractedInput
from src.core.text_to_sql.d_007_canonical_filter_binder import CanonicalFilterBinder
from src.core.text_to_sql.query_plan import Filter, MetricRef, OrderSpec, RatingQueryPlan, TimeRange
from src.core.text_to_sql.d_009_rating_plan_compiler import RatingPlanCompiler
from src.core.text_to_sql.d_010_rating_query_plan_validator import RatingQueryPlanValidator
from src.core.text_to_sql.resolved_entities import ResolvedFilter, ResolvedSQLComponents
from src.core.text_to_sql.d_008_time_resolver import RatingTimeResolver


class TestRatingPlanSafety(unittest.TestCase):
    def setUp(self):
        self.catalog = RatingCatalog.load()

    def test_draft_metric_cannot_be_compiled(self):
        compiler = RatingPlanCompiler(
            catalog=self.catalog,
            time_resolver=RatingTimeResolver(today_provider=lambda: date(2026, 8, 4)),
        )
        extracted = ExtractedInput("rating hôm qua", "rating hom qua")
        components = ResolvedSQLComponents(
            domain_id="RATING",
            table="data_dashboard_rating.agg_info_channel",
            metric_id="rating.rating",
        )

        with self.assertRaisesRegex(ValueError, "metric_not_active:rating.rating"):
            compiler.compile(extracted, components)

    def test_validator_rejects_filter_value_not_in_dictionary(self):
        plan = RatingQueryPlan(
            domain="RATING",
            metrics=(MetricRef("rating.total_channel_views"),),
            dimensions=(),
            filters=(Filter("agg_info_channel.channel", "eq", "not-a-real-channel"),),
            time_range=TimeRange("2026-07-01", "2026-07-02"),
            order_by=(),
            limit=None,
            query_shape="aggregate",
            raw_question="test",
        )

        validation = RatingQueryPlanValidator(catalog=self.catalog).validate(plan)

        self.assertIn(
            "unresolved_filter_value:agg_info_channel.channel:not-a-real-channel",
            validation.errors,
        )

    def test_validator_rejects_unsafe_order_direction(self):
        with self.assertRaisesRegex(
            ValueError,
            "order_direction_not_allowed:rating.total_channel_views:sideways",
        ):
            OrderSpec("rating.total_channel_views", "sideways")  # type: ignore[arg-type]

    def test_validator_rejects_duplicate_and_unselected_order_fields(self):
        plan = RatingQueryPlan(
            domain="RATING",
            metrics=(MetricRef("rating.total_channel_views"),),
            dimensions=("agg_info_channel.channel",),
            filters=(),
            time_range=TimeRange("2026-07-01", "2026-07-02"),
            order_by=(
                OrderSpec("rating.total_channel_views", "desc"),
                OrderSpec("rating.total_channel_views", "desc"),
                OrderSpec("agg_info_channel.region", "asc"),
            ),
            limit=10,
            query_shape="ranking",
            raw_question="test",
        )

        validation = RatingQueryPlanValidator(catalog=self.catalog).validate(plan)

        self.assertIn("duplicate_order_by:rating.total_channel_views", validation.errors)
        self.assertIn("order_field_not_selected:agg_info_channel.region", validation.errors)

    def test_unsupported_between_filter_fails_closed(self):
        components = ResolvedSQLComponents(
            domain_id="RATING",
            table="data_dashboard_rating.agg_info_channel",
            metric_id="rating.total_channel_views",
            filters=(
                ResolvedFilter(
                    dimension_id="agg_info_channel.date",
                    physical_column="date",
                    operator="BETWEEN",
                    values=("2026-07-01", "2026-07-02"),
                    source_text="2026-07-01 đến 2026-07-02",
                ),
            ),
        )

        with self.assertRaisesRegex(
            ValueError,
            "unsupported_resolved_filter:agg_info_channel.date:BETWEEN",
        ):
            CanonicalFilterBinder.plan_filters(components)

    def test_filter_contract_rejects_unsupported_operator(self):
        with self.assertRaisesRegex(ValueError, "filter_operator_not_allowed:between"):
            Filter(
                "agg_info_channel.channel",
                "between",  # type: ignore[arg-type]
                ("VTV1", "VTV3"),
            )

    def test_plan_contract_rejects_unknown_shape_and_source(self):
        common = {
            "domain": "RATING",
            "metrics": (MetricRef("rating.total_channel_views"),),
            "dimensions": (),
            "filters": (),
            "time_range": TimeRange("2026-07-01", "2026-07-02"),
            "order_by": (),
            "limit": None,
            "raw_question": "test",
        }
        unknown_shape_plan = RatingQueryPlan(
            **common,
            query_shape="unknown",
        )
        validation = RatingQueryPlanValidator(catalog=self.catalog).validate(unknown_shape_plan)
        self.assertIn("unknown_query_shape:unknown", validation.errors)
        with self.assertRaisesRegex(ValueError, "plan_source_not_allowed:llm"):
            RatingQueryPlan(
                **common,
                query_shape="aggregate",
                source="llm",  # type: ignore[arg-type]
            )


if __name__ == "__main__":
    unittest.main()
