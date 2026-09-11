from __future__ import annotations

from datetime import date
from pathlib import Path
import shutil
import tempfile
from types import MappingProxyType
import unittest

import yaml

from src.core.text_to_sql.catalog import RatingCatalog, RatingCatalogError
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline


class TestRatingCatalogFacade(unittest.TestCase):
    def test_catalog_loads_all_registries_and_cross_references(self):
        catalog = RatingCatalog.load()

        self.assertEqual(catalog.domain_id, "RATING")
        self.assertIn("rating.rating_absolute", catalog.metrics)
        self.assertIn("trend_analysis", catalog.patterns)
        self.assertIn("trend", catalog.query_shapes)
        self.assertIn("channel_metric", catalog.recipes)
        self.assertIn("period_comparison", catalog.narration.prompts)
        self.assertEqual(
            catalog.patterns["period_comparison"].narration_prompt_id,
            "period_comparison",
        )
        self.assertIsInstance(catalog.metrics, MappingProxyType)
        with self.assertRaises(TypeError):
            catalog.recipes["channel_metric"].calculations["new"] = None  # type: ignore[index]
        self.assertEqual(
            catalog.metrics["rating.rating_absolute"].required_joins,
            ("weight", "coef", "population"),
        )

    def test_catalog_additions_need_no_existing_registry_change(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = self._copy_dashboard(Path(temp_dir))
            rating_dir = project_root / "data" / "dashboard" / "rating"

            recipes = self._read(rating_dir / "recipes.yaml")
            recipes["recipes"]["direct_clone"] = {
                "handler": "src.core.text_to_sql.test.fixture_recipe_plugin:FixtureRecipePlugin",
                "allowed_functions": ["SUM"],
            }
            self._write(rating_dir / "recipes.yaml", recipes)

            metrics = self._read(rating_dir / "metrics_v3.yaml")
            metrics["metrics"]["clone_views"] = {
                "description": "Metric extension fixture.",
                "aliases": ["clone views"],
                "expression": "SUM(view)",
                "output_name": "clone_views",
                "source_table": "data_dashboard_rating.agg_info_channel",
                "recipe": "direct_clone",
                "fact_family": "channel",
                "semantic_key": "clone_views",
                "supported_dimensions": [
                    "agg_info_channel.date",
                    "agg_info_channel.channel",
                ],
                "required_dimensions": [],
            }
            self._write(rating_dir / "metrics_v3.yaml", metrics)

            shapes = self._read(rating_dir / "query_shapes.yaml")
            shapes["query_shapes"]["spotlight"] = {
                "description": "Extension fixture shape."
            }
            self._write(rating_dir / "query_shapes.yaml", shapes)

            patterns = self._read(rating_dir / "patterns_v3.yaml")
            patterns["patterns"]["spotlight_lookup"] = {
                "description": "Extension fixture pattern.",
                "query_shape": "spotlight",
                "required_fields": ["metric"],
                "default_order": [],
                "limit": {"required": False},
                "compute_handler": None,
                "narration_prompt_id": "spotlight_lookup",
                "routing": [
                    {
                        "priority": 950,
                        "requires_metric": True,
                        "phrase_groups": [["noi bat"]],
                    }
                ],
            }
            self._write(rating_dir / "patterns_v3.yaml", patterns)

            narration = self._read(rating_dir / "narration_prompts.yaml")
            narration["prompts"]["spotlight_lookup"] = {
                "instruction": "Trình bày metric nổi bật từ payload.",
                "output_requirements": ["Nêu đúng metric và giá trị."],
                "retry_instruction": "Hãy viết lại đầy đủ.",
            }
            self._write(rating_dir / "narration_prompts.yaml", narration)

            pipeline = RatingQueryPipeline(
                project_root=project_root,
                today_provider=lambda: date(2026, 8, 11),
            )
            result = pipeline.generate("clone views nổi bật hôm qua")

            self.assertIsNone(result.error)
            self.assertEqual(result.query_plan.pattern_name, "spotlight_lookup")
            self.assertEqual(result.query_plan.query_shape, "spotlight")
            self.assertEqual(result.query_plan.primary_metric.id, "rating.clone_views")
            self.assertIn("SUM(view) AS clone_views", result.rendered_sql.sql)

    def test_catalog_fails_fast_for_unknown_recipe_and_unsafe_formula(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = self._copy_dashboard(Path(temp_dir))
            path = project_root / "data" / "dashboard" / "rating" / "channel" / "metrics.yaml"
            metrics = self._read(path)
            metrics["metrics"]["channel_total_channel_views"]["recipe"] = "missing_recipe"
            self._write(path, metrics)
            with self.assertRaisesRegex(RatingCatalogError, "metric_uses_unknown_recipe"):
                RatingCatalog.load(project_root)

        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = self._copy_dashboard(Path(temp_dir))
            path = project_root / "data" / "dashboard" / "rating" / "channel" / "metrics.yaml"
            metrics = self._read(path)
            metrics["metrics"]["channel_total_channel_views"]["expression"] = "SUM(view); DROP TABLE x"
            self._write(path, metrics)
            with self.assertRaisesRegex(RatingCatalogError, "unsafe_catalog_expression"):
                RatingCatalog.load(project_root)

    def test_catalog_fails_fast_for_unknown_narration_prompt(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = self._copy_dashboard(Path(temp_dir))
            path = project_root / "data" / "dashboard" / "rating" / "patterns_v3.yaml"
            patterns = self._read(path)
            patterns["patterns"]["period_comparison"]["narration_prompt_id"] = "missing_prompt"
            self._write(path, patterns)

            with self.assertRaisesRegex(
                RatingCatalogError,
                "pattern_uses_unknown_narration_prompt:period_comparison:missing_prompt",
            ):
                RatingCatalog.load(project_root)

    @staticmethod
    def _copy_dashboard(temp_root: Path) -> Path:
        project_root = temp_root / "project"
        source = Path(__file__).resolve().parents[4] / "data" / "dashboard" / "rating"
        destination = project_root / "data" / "dashboard" / "rating"
        destination.parent.mkdir(parents=True)
        shutil.copytree(source, destination)
        return project_root

    @staticmethod
    def _read(path: Path) -> dict:
        return yaml.safe_load(path.read_text(encoding="utf-8"))

    @staticmethod
    def _write(path: Path, payload: dict) -> None:
        path.write_text(
            yaml.safe_dump(payload, allow_unicode=True, sort_keys=False),
            encoding="utf-8",
        )


if __name__ == "__main__":
    unittest.main()
