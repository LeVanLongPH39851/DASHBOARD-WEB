from __future__ import annotations

from dataclasses import asdict
from datetime import date
import json
import unittest

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
from src.core.text_to_sql.semantic_extraction.catalog_context import CatalogContextBuilder
from src.core.text_to_sql.semantic_memory import CanonicalMemory


class _SemanticLLM:
    def __init__(self, extraction: dict):
        self.extraction = extraction
        self.extraction_calls = 0

    def complete_text(self, **kwargs):
        prompt = kwargs["prompt"]
        if "Trích xuất semantic input" in prompt:
            self.extraction_calls += 1
            return json.dumps(self.extraction, ensure_ascii=False)
        if "Metric airtime hợp lệ" in prompt:
            return json.dumps(
                {
                    "metric_id": "program.airtime_duration",
                    "pattern_id": "metric_lookup",
                    "denominator_scope": "none",
                }
            )
        return "metric_lookup"


class TestSemanticExtractionResolution(unittest.TestCase):
    def test_program_name_is_excluded_from_llm_memory(self):
        catalog = RatingCatalog.load()
        memory = CanonicalMemory(catalog)
        context = CatalogContextBuilder(catalog, memory).build()

        program = next(
            item for item in context.dimensions
            if item.id == "agg_info_program.program_name"
        )
        channel = next(
            item for item in context.dimensions
            if item.id == "agg_info_channel.channel"
        )
        self.assertFalse(program.canonical_values)
        self.assertIn("VTV1", channel.canonical_values)

    def test_exact_program_name_does_not_create_partial_free_text(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_duration",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["TẾT VỚI ĐỒNG BÀO"],
                        "roles": ["filter"],
                    }
                ],
            }
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Thời lượng phát của chương trình TẾT VỚI ĐỒNG BÀO là bao nhiêu?"
        )

        self.assertIsNone(result.error)
        self.assertEqual(
            result.semantic_extraction.dimensions[0].raw_values,
            ("TẾT VỚI ĐỒNG BÀO",),
        )
        self.assertEqual(
            result.canonical_binding.value_bindings[0].canonical_value,
            "TẾT VỚI ĐỒNG BÀO",
        )
        self.assertEqual(result.query_plan.filters[0].value, "TẾT VỚI ĐỒNG BÀO")

    def test_overlapping_noncanonical_llm_value_is_ignored_after_exact_match(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_duration",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["TẾT VỚI ĐỒNG BÀO", "TẾT"],
                        "roles": ["filter"],
                    }
                ],
            }
        )
        pipeline = RatingQueryPipeline(llm_client=llm)

        result = pipeline.generate(
            "Thời lượng phát của chương trình TẾT VỚI ĐỒNG BÀO là bao nhiêu?"
        )

        self.assertIsNone(result.error)
        self.assertEqual(
            result.canonical_binding.dimensions[0].canonical_values,
            ("TẾT VỚI ĐỒNG BÀO",),
        )
        self.assertEqual(
            result.canonical_binding.dimensions[0].raw_values,
            ("TẾT VỚI ĐỒNG BÀO",),
        )
        self.assertEqual(
            [item.status for item in result.canonical_binding.value_bindings],
            ["matched", "not_found"],
        )

    def test_unmatched_value_cannot_overlap_a_different_dimension(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.rating_absolute",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.channel",
                        "raw_values": ["VTV1"],
                        "roles": ["filter"],
                    },
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["VTV"],
                        "roles": ["filter"],
                    },
                ],
            }
        )
        pipeline = RatingQueryPipeline(llm_client=llm)

        result = pipeline.generate("Rating kênh VTV1 và chương trình VTV")

        self.assertEqual(
            result.error,
            "canonical_value_not_found:agg_info_program.program_name",
        )
        self.assertIsNone(result.resolved_components)

    def test_llm_receives_raw_question_and_returns_one_flat_result(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_duration",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["TẾT VỚI ĐỒNG BÀO"],
                        "roles": ["filter"],
                    }
                ],
            }
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Thời lượng phát của chương trình TẾT VỚI ĐỒNG BÀO là bao nhiêu?"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.semantic_extraction.source, "llm")
        self.assertEqual(llm.extraction_calls, 1)
        self.assertEqual(result.resolution_policy, "metric_dimensions")
        self.assertEqual(result.query_plan.filters[0].value, "TẾT VỚI ĐỒNG BÀO")

    def test_time_filter_is_delegated_without_canonical_lookup(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_duration",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["TẾT VỚI ĐỒNG BÀO"],
                        "roles": ["filter"],
                    },
                    {
                        "dimension_id": "agg_info_program.date",
                        "raw_values": ["2026-08-02"],
                        "roles": ["filter"],
                    },
                ],
            }
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Thời lượng phát của chương trình TẾT VỚI ĐỒNG BÀO "
            "của ngày 2026-08-02 là bao nhiêu?"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.time_range.start, "2026-08-02")
        self.assertEqual(result.query_plan.time_range.end, "2026-08-03")
        self.assertEqual(result.query_plan.dimensions, ())
        self.assertEqual(
            tuple(item.dimension_id for item in result.canonical_binding.value_bindings),
            ("agg_info_program.program_name",),
        )
        self.assertEqual(
            tuple(item.dimension_id for item in result.canonical_binding.dimensions),
            ("agg_info_program.program_name",),
        )
        self.assertEqual(
            result.rendered_sql.parameters["time_start"],
            "2026-08-02T00:00:00",
        )
        self.assertEqual(
            result.rendered_sql.parameters["time_end"],
            "2026-08-02T23:59:59",
        )

    def test_rule_fallback_does_not_group_a_single_date_filter(self):
        pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 8, 12))

        result = pipeline.generate(
            "Thời lượng xem của kênh VTV1 "
            "của ngày 2026-08-02 là bao nhiêu?"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.semantic_extraction.source, "rules")
        self.assertEqual(result.query_plan.dimensions, ())
        self.assertEqual(result.query_plan.pattern_name, "metric_lookup")
        self.assertEqual(result.query_plan.time_range.start, "2026-08-02")
        self.assertEqual(result.query_plan.time_range.end, "2026-08-03")
        self.assertNotIn("GROUP BY", result.rendered_sql.sql.split("FROM rating_ott")[1])

    def test_time_grouping_is_retained_without_a_canonical_value(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_duration",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.date",
                        "raw_values": ["2026-08-01", "2026-08-02"],
                        "roles": ["filter", "group_by"],
                    }
                ],
            }
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Thời lượng phát theo ngày từ 2026-08-01 đến 2026-08-02"
        )

        self.assertIsNone(result.error)
        self.assertEqual(result.query_plan.dimensions, ("agg_info_program.date",))
        self.assertEqual(result.canonical_binding.value_bindings, ())
        self.assertEqual(
            result.canonical_binding.dimensions[0].canonical_values,
            (),
        )
        self.assertEqual(
            result.canonical_binding.dimensions[0].roles,
            ("group_by",),
        )

    def test_unknown_program_value_stops_before_resolver(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_duration",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["Không Có Thật XYZ12345"],
                        "roles": ["filter"],
                    }
                ],
            }
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate(
            "Thời lượng phát của chương trình Không Có Thật XYZ12345 là bao nhiêu"
        )

        self.assertEqual(
            result.error,
            "canonical_value_not_found:agg_info_program.program_name",
        )
        self.assertIsNone(result.resolved_components)
        self.assertIn("Không Có Thật XYZ12345", result.output.text)
        payload = asdict(result.canonical_binding.value_bindings[0])
        self.assertEqual(payload["status"], "not_found")

    def test_high_cardinality_matcher_ranks_fuzzy_program_names(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_duration",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["THỜI SỰ 19H"],
                        "roles": ["filter"],
                    }
                ],
            }
        )
        pipeline = RatingQueryPipeline(
            today_provider=lambda: date(2026, 8, 12),
            llm_client=llm,
        )

        result = pipeline.generate("Thời lượng phát của chương trình THỜI SỰ 19H")

        self.assertIsNone(result.error)
        binding = result.canonical_binding.value_bindings[0]
        self.assertIn(binding.match_type, {"fuzzy", "doris_ngram"})
        self.assertEqual(binding.canonical_value, "THỜI SỰ 19H")
        self.assertEqual(binding.alternatives[0], "THỜI SỰ 19H")
        self.assertEqual(result.query_plan.filters[0].value, "THỜI SỰ 19H")

    def test_metric_contract_declares_supported_and_required_dimensions(self):
        catalog = RatingCatalog.load()

        duration = catalog.require_metric("program.airtime_duration")
        share = catalog.require_metric("program.airtime_share_all_categories_percent")
        self.assertIn("agg_info_program.program_name", duration.supported_dimensions)
        self.assertEqual(duration.required_dimensions, ())
        self.assertEqual(
            share.required_dimensions,
            ("agg_info_program.category_level1",),
        )

    def test_unsupported_llm_dimension_is_rejected_before_component_builder(self):
        llm = _SemanticLLM(
            {
                "metric_id": "rating.total_channel_views",
                "dimensions": [
                    {
                        "dimension_id": "agg_info_program.program_name",
                        "raw_values": ["TẾT VỚI ĐỒNG BÀO"],
                        "roles": ["filter"],
                    }
                ],
            }
        )
        pipeline = RatingQueryPipeline(llm_client=llm)

        result = pipeline.generate(
            "Lượt xem chương trình TẾT VỚI ĐỒNG BÀO"
        )

        self.assertEqual(
            result.error,
            "metric_unsupported_dimensions:rating.total_channel_views:agg_info_program.program_name",
        )
        self.assertIsNone(result.query_plan)

    def test_required_metric_dimension_cannot_be_omitted(self):
        llm = _SemanticLLM(
            {
                "metric_id": "program.airtime_share_all_categories_percent",
                "dimensions": [],
            }
        )
        pipeline = RatingQueryPipeline(llm_client=llm)

        result = pipeline.generate("Tỷ lệ thời lượng phát là bao nhiêu")

        self.assertEqual(
            result.error,
            "metric_required_dimensions_missing:program.airtime_share_all_categories_percent:agg_info_program.category_level1",
        )
        self.assertIsNone(result.query_plan)

    def test_dimension_only_uses_catalog_bundle_policy(self):
        pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 8, 12))

        result = pipeline.generate("VTV1 hôm qua như thế nào?")

        self.assertIsNone(result.error)
        self.assertEqual(result.resolution_policy, "dimension_bundle")
        self.assertEqual(len(result.query_plan.metrics), 5)

    def test_no_metric_and_no_dimension_stops_at_extraction(self):
        pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 8, 12))

        result = pipeline.generate("hello")

        self.assertEqual(result.error, "Không có giá trị nào phục vụ dashboard")
        self.assertIsNone(result.canonical_binding)
        self.assertIsNone(result.query_plan)


if __name__ == "__main__":
    unittest.main()
