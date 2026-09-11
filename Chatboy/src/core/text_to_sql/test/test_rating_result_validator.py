from __future__ import annotations

from dataclasses import replace
import unittest

from src.core.text_to_sql.query_plan import MetricRef, RatingQueryPlan, TimeRange
from src.core.text_to_sql.d_012_rating_result_validator import RatingResultValidator


class TestRatingResultValidator(unittest.TestCase):
    def setUp(self):
        self.validator = RatingResultValidator()

    @staticmethod
    def _plan(start: str = "2026-08-10", end: str = "2026-08-11") -> RatingQueryPlan:
        metric = MetricRef("rating.rating_absolute", "rating")
        return RatingQueryPlan(
            domain="RATING",
            metrics=(metric,),
            dimensions=(),
            filters=(),
            time_range=TimeRange(start, end),
            order_by=(),
            limit=50000,
            query_shape="aggregate",
            raw_question="rating hôm nay là bao nhiêu",
            pattern_name="metric_lookup",
        )

    def test_all_null_metric_returns_single_day_no_data_message(self):
        result = self.validator.validate(self._plan(), [{"rating": None}])

        self.assertFalse(result.is_available)
        self.assertEqual(result.status, "no_data")
        self.assertEqual(result.message, "Chưa có dữ liệu của ngày 2026-08-10")

    def test_empty_rows_return_range_no_data_message(self):
        result = self.validator.validate(
            self._plan("2026-08-01", "2026-08-04"),
            [],
        )

        self.assertEqual(
            result.message,
            "Chưa có dữ liệu từ ngày 2026-08-01 đến ngày 2026-08-03",
        )

    def test_zero_is_available_data(self):
        result = self.validator.validate(self._plan(), [{"rating": 0}])

        self.assertTrue(result.is_available)
        self.assertIsNone(result.message)

    def test_one_available_metric_keeps_a_bundle_result_available(self):
        plan = replace(
            self._plan(),
            metrics=(
                MetricRef("rating.rating_absolute", "rating"),
                MetricRef("rating.average_reach", "ave_reach"),
            ),
        )
        result = self.validator.validate(plan, [{"rating": None, "ave_reach": 100}])

        self.assertTrue(result.is_available)


if __name__ == "__main__":
    unittest.main()
