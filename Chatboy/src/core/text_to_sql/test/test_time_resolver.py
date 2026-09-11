from datetime import date
import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_008_time_resolver import RatingTimeResolver
from src.core.text_to_sql.semantic_extraction.context import QuestionContextExtractor


class TestRatingTimeResolver(unittest.TestCase):
    def setUp(self):
        self.extractor = QuestionContextExtractor(RatingCatalog.load())
        self.resolver = RatingTimeResolver(today_provider=lambda: date(2026, 8, 4))

    def resolve(self, question: str):
        return self.resolver.resolve(self.extractor.extract(question))

    def test_yesterday_is_previous_day_until_today(self):
        for q in ("rating hôm qua", "rating ngày qua", "rating 1 ngày qua"):
            with self.subTest(q=q):
                result = self.resolve(q)
                self.assertEqual((result.start, result.end), ("2026-08-03", "2026-08-04"))
                self.assertEqual(RatingTimeResolver.format_display(result), "03/08/2026")

    def test_today_compared_with_yesterday_resolves_two_daily_buckets(self):
        result = self.resolve("rating hôm nay so với hôm qua")

        self.assertEqual((result.start, result.end), ("2026-08-03", "2026-08-05"))
        self.assertEqual(result.grain, "day")

    def test_numbered_day_phrases(self):
        for phrase in ("2 hôm trước", "2 hôm qua", "2 hôm kia", "2 ngày trước", "2 ngày qua", "trong 2 ngày qua"):
            with self.subTest(phrase=phrase):
                result = self.resolve(f"rating {phrase}")
                self.assertEqual((result.start, result.end), ("2026-08-02", "2026-08-04"))
                self.assertEqual(RatingTimeResolver.format_display(result), "02/08/2026 tới 03/08/2026")

    def test_numbered_week_phrases(self):
        for phrase in ("2 tuần trước", "2 tuần qua", "2 tuần kia", "trong 2 tuần qua"):
            with self.subTest(phrase=phrase):
                result = self.resolve(f"rating {phrase}")
                self.assertEqual((result.start, result.end), ("2026-07-21", "2026-08-04"))
                self.assertEqual(RatingTimeResolver.format_display(result), "21/07/2026 tới 03/08/2026")

    def test_week_relative_phrases(self):
        # today is Tuesday 2026-08-04
        this_week = self.resolve("rating tuần này")
        self.assertEqual((this_week.start, this_week.end), ("2026-08-03", "2026-08-05"))
        self.assertEqual(RatingTimeResolver.format_display(this_week), "03/08/2026 tới 04/08/2026")

        for phrase in ("tuần trước", "tuần qua"):
            with self.subTest(phrase=phrase):
                last_week = self.resolve(f"rating {phrase}")
                self.assertEqual((last_week.start, last_week.end), ("2026-07-28", "2026-08-04"))
                self.assertEqual(RatingTimeResolver.format_display(last_week), "28/07/2026 tới 03/08/2026")

        week_before = self.resolve("rating tuần kia")
        self.assertEqual((week_before.start, week_before.end), ("2026-07-21", "2026-08-04"))
        self.assertEqual(RatingTimeResolver.format_display(week_before), "21/07/2026 tới 03/08/2026")

    def test_numbered_month_phrases(self):
        for phrase in ("2 tháng trước", "2 tháng qua", "trong 2 tháng qua"):
            with self.subTest(phrase=phrase):
                result = self.resolve(f"rating {phrase}")
                self.assertEqual((result.start, result.end), ("2026-06-01", "2026-08-04"))
                self.assertEqual(RatingTimeResolver.format_display(result), "01/06/2026 tới 03/08/2026")

    def test_single_day_only(self):
        result = self.resolve("rating ngày 12")
        self.assertEqual((result.start, result.end), ("2026-08-12", "2026-08-13"))
        self.assertEqual(RatingTimeResolver.format_display(result), "12/08/2026")

    def test_day_and_month_variations(self):
        phrases = ("ngày 12 tháng 8", "12/8", "12-8", "12 tháng 8", "12.8", "12/08")
        for phrase in phrases:
            with self.subTest(phrase=phrase):
                result = self.resolve(f"rating {phrase}")
                self.assertEqual((result.start, result.end), ("2026-08-12", "2026-08-13"))
                self.assertEqual(RatingTimeResolver.format_display(result), "12/08/2026")

    def test_single_month(self):
        # Current month (August 2026 when today is 2026-08-04) caps at today
        result_current = self.resolve("rating tháng 8")
        self.assertEqual((result_current.start, result_current.end), ("2026-08-01", "2026-08-05"))
        self.assertEqual(RatingTimeResolver.format_display(result_current), "01/08/2026 tới 04/08/2026")

        # Past month (July 2026) covers the full month
        result_past = self.resolve("rating tháng 7")
        self.assertEqual((result_past.start, result_past.end), ("2026-07-01", "2026-08-01"))
        self.assertEqual(RatingTimeResolver.format_display(result_past), "01/07/2026 tới 31/07/2026")

    def test_explicit_dates_are_normalized_from_common_formats(self):
        questions = (
            "rating từ 2026-08-01 đến 2026-08-03",
            "rating từ 01/08/2026 đến 03/08/2026",
            "rating từ ngày 1 tháng 8 năm 2026 đến ngày 3 tháng 8 năm 2026",
        )
        for question in questions:
            with self.subTest(question=question):
                result = self.resolve(question)
                self.assertEqual((result.start, result.end), ("2026-08-01", "2026-08-04"))
                self.assertEqual(RatingTimeResolver.format_display(result), "01/08/2026 tới 03/08/2026")

    def test_two_explicit_months_use_month_grain_and_current_year(self):
        result = self.resolve("So sánh rating của tháng 6 và thasg 7")

        self.assertEqual((result.start, result.end), ("2026-06-01", "2026-08-01"))
        self.assertEqual(result.grain, "month")
        self.assertEqual(RatingTimeResolver.format_display(result), "01/06/2026 tới 31/07/2026")


    def test_multi_month_list_resolves_month_range(self):
        phrases = (
            "reach của 3 tháng 6,7,8",
            "reach của 3 tháng 6, 7, 8",
            "rating các tháng 6, 7, 8",
            "rating từ tháng 6 đến tháng 8",
            "rating tháng 6-8",
        )
        for q in phrases:
            with self.subTest(q=q):
                result = self.resolve(q)
                self.assertEqual((result.start, result.end), ("2026-06-01", "2026-08-05"))
                self.assertEqual(result.grain, "month")
                self.assertEqual(RatingTimeResolver.format_display(result), "01/06/2026 tới 04/08/2026")


if __name__ == "__main__":
    unittest.main()

