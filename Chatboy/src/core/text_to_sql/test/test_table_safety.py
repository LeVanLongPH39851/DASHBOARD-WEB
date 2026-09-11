import unittest

from src.core.text_to_sql.input_contracts import ExtractedEntity, ExtractedInput
from src.core.text_to_sql.rating_resolver import RatingResolveEntities


class TestRatingTableSafety(unittest.TestCase):
    def test_rejects_dimension_not_supported_by_metric_table(self):
        extracted = ExtractedInput(
            question="Tổng lượt xem theo chương trình",
            normalized_question="tong luot xem theo chuong trinh",
            domain_id="RATING",
            entities=(
                ExtractedEntity("metric_term", "tổng lượt xem", "tong luot xem", "tổng lượt xem"),
                ExtractedEntity(
                    "dimension_term",
                    "chương trình",
                    "chuong trinh",
                    "chương trình",
                    dimension_id="agg_info_program.program_name",
                ),
            ),
        )

        result = RatingResolveEntities().resolve(extracted)

        self.assertEqual(result.table, "data_dashboard_rating.agg_info_channel")
        self.assertTrue(
            any(
                item.canonical_id == "agg_info_program.program_name"
                and item.status == "unresolved"
                for item in result.unresolved_entities
            )
        )


if __name__ == "__main__":
    unittest.main()
