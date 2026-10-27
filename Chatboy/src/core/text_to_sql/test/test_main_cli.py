from __future__ import annotations

from datetime import date, timedelta
from io import StringIO
import json
from pathlib import Path
import subprocess
import sys
import unittest
from contextlib import redirect_stdout
from unittest.mock import MagicMock, patch

import main


PROJECT_ROOT = Path(__file__).resolve().parents[4]


class TestMainCLI(unittest.TestCase):
    def test_cli_llm_loader_uses_environment_client(self):
        sentinel = object()
        fake_client = MagicMock()
        fake_client.from_env.return_value = sentinel
        with patch.object(main, "LLMClient", fake_client):
            self.assertIs(main._load_llm_client(), sentinel)
            fake_client.from_env.assert_called_once_with()

        fake_client.reset_mock()
        with patch.object(main, "LLMClient", fake_client):
            self.assertIsNone(main._load_llm_client(disabled=True))
            fake_client.from_env.assert_not_called()

    def test_rating_question_renders_sql(self):
        result = subprocess.run(
            [
                sys.executable,
                "main.py",
                "--no-llm",
                "Top 5 kênh có số lượt xem nhiều nhất trong 1 tuần qua",
            ],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("FROM data_dashboard_rating.agg_info_channel", result.stdout)
        self.assertIn("LIMIT 5", result.stdout)
        self.assertIn(f'"time_start": "{(date.today() - timedelta(days=7)).isoformat()}"', result.stdout)

    def test_question_without_date_defaults_to_yesterday(self):
        result = subprocess.run(
            [sys.executable, "main.py", "--no-llm", "Top 5 kênh có số lượt xem nhiều nhất"],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(f'"time_start": "{(date.today() - timedelta(days=1)).isoformat()}"', result.stdout)
        self.assertIn(f'"time_end": "{date.today().isoformat()}"', result.stdout)

    def test_cli_prints_pipeline_steps(self):
        result = subprocess.run(
            [
                sys.executable,
                "main.py",
                "--no-llm",
                "Top 5 kênh có số lượt xem nhiều nhất trong 1 tuần qua",
            ],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("[Bước 1] Trích xuất input", result.stdout)
        self.assertIn("[Bước 2] Resolve entity", result.stdout)
        self.assertIn("[Bước 3] Lập query plan", result.stdout)
        self.assertIn("[Bước 4] Kiểm tra query plan", result.stdout)
        self.assertIn("[Bước 5] Render SQL", result.stdout)
        self.assertIn("FROM data_dashboard_rating.agg_info_channel", result.stdout)

    def test_irrelevant_question_stops_at_step_one_with_output(self):
        pipeline = main.RatingQueryPipeline(today_provider=lambda: date(2026, 8, 10))
        output = StringIO()

        with redirect_stdout(output):
            success = main._process_question(
                pipeline,
                "hello",
                json_output=False,
                execute_doris=False,
            )

        self.assertFalse(success)
        rendered = output.getvalue()
        self.assertIn('"error": "Không có giá trị nào phục vụ dashboard"', rendered)
        self.assertIn("Output: Không có giá trị nào phục vụ dashboard", rendered)
        self.assertNotIn("[Bước 2]", rendered)
        self.assertNotIn("[Bước 3]", rendered)

    def test_missing_pattern_context_is_displayed_at_step_three(self):
        pipeline = main.RatingQueryPipeline(today_provider=lambda: date(2026, 8, 10))
        output = StringIO()

        with redirect_stdout(output):
            success = main._process_question(
                pipeline,
                "Tăng trưởng của VTV1",
                json_output=False,
                execute_doris=False,
            )

        self.assertFalse(success)
        rendered = output.getvalue()
        self.assertIn("[Bước 1] Trích xuất input", rendered)
        self.assertIn("[Bước 2] Resolve entity", rendered)
        self.assertIn("[Bước 3] Thiếu context cho pattern", rendered)
        self.assertIn('"pattern_name": "trend_analysis"', rendered)
        self.assertIn('"error": "missing_pattern_context"', rendered)
        self.assertIn("Tăng trưởng VTV1 trong 7 ngày qua", rendered)
        self.assertIn("Output: Thiếu context cho trend_analysis", rendered)
        self.assertNotIn("[Bước 4]", rendered)
        self.assertNotIn("[Bước 5]", rendered)

    def test_missing_canonical_value_stops_at_step_two_with_candidate_log(self):
        llm = MagicMock()

        def validate_candidate(**kwargs):
            prompt = kwargs["prompt"]
            if "Trích xuất semantic input" in prompt:
                return json.dumps(
                    {
                        "metric_id": "program.airtime_duration",
                        "dimensions": [
                            {
                                "dimension_id": "agg_info_program.program_name",
                                "raw_values": ["Không Có Thật XYZ12345"],
                                "roles": ["filter"],
                            }
                        ],
                    },
                    ensure_ascii=False,
                )
            return "metric_lookup"

        llm.complete_text.side_effect = validate_candidate
        from src.core.text_to_sql.test.offline_fixtures import OfflinePipeline
        pipeline = OfflinePipeline(
            today_provider=lambda: date(2026, 8, 10),
            llm_client=llm,
        )
        output = StringIO()

        with redirect_stdout(output):
            success = main._process_question(
                pipeline,
                "Thời lượng phát của chương trình Không Có Thật XYZ12345 là bao nhiêu",
                json_output=False,
                execute_doris=False,
                use_router=False,
            )

        self.assertFalse(success)
        rendered = output.getvalue()
        self.assertIn("[Bước 2] Đối sánh canonical thất bại", rendered)
        self.assertIn('"status": "failed"', rendered)
        self.assertIn("canonical_value_not_found", rendered)
        self.assertIn("Không Có Thật XYZ12345", rendered)
        self.assertNotIn("[Bước 3]", rendered)

    def test_execute_converts_all_null_metric_to_no_data_message(self):
        from src.core.text_to_sql.runtime.contracts import ChatResult
        service = MagicMock()
        service.handle.return_value = ChatResult(request_id="fixture",status="no_data",intent="data_query",reply="Chưa có dữ liệu của ngày 2026-08-10")
        output = StringIO()
        with patch("src.core.text_to_sql.runtime.bootstrap.build_service",return_value=service), redirect_stdout(output):
            success = main._process_question(main.RatingQueryPipeline(),"rating hôm nay",json_output=True,execute_doris=True)
        self.assertTrue(success)
        self.assertEqual(json.loads(output.getvalue())["status"],"no_data")
        service.handle.assert_called_once_with({"type":"question","question":"rating hôm nay"})

    def test_execute_outputs_pattern_analysis_for_available_rows(self):
        from src.core.text_to_sql.runtime.contracts import ChatResult
        service = MagicMock()
        service.handle.return_value = ChatResult(request_id="fixture",status="answered",intent="data_query",reply="Hạng 1: VTV1 — 120 lượt; trong Top-N.")
        output = StringIO()
        with patch("src.core.text_to_sql.runtime.bootstrap.build_service",return_value=service), redirect_stdout(output):
            success = main._process_question(main.RatingQueryPipeline(),"Top 2 kênh theo lượt xem",False,True)
        self.assertTrue(success)
        self.assertIn("trong Top-N",output.getvalue())
        service.handle.assert_called_once()

    def test_cli_definition_intent_prints_answer(self):
        llm = MagicMock()
        llm.complete_text.side_effect = [
            '{"intent": "definition", "confidence": 0.98}',
            "Reach% là chỉ số đo lường tỷ lệ người xem duy nhất.",
        ]
        pipeline = main.RatingQueryPipeline(llm_client=llm)
        output = StringIO()

        with redirect_stdout(output):
            success = main._process_question(
                pipeline,
                "Reach% là gì?",
                json_output=False,
                use_router=True,
            )

        self.assertTrue(success)
        rendered = output.getvalue()
        self.assertIn("[Intent] definition", rendered)
        self.assertIn("Reach (%)", rendered)

    def test_cli_definition_intent_json_output(self):
        llm = MagicMock()
        llm.complete_text.side_effect = [
            '{"intent": "definition", "confidence": 0.98}',
            "Reach% là chỉ số đo lường tỷ lệ người xem duy nhất.",
        ]
        pipeline = main.RatingQueryPipeline(llm_client=llm)
        output = StringIO()

        with redirect_stdout(output):
            success = main._process_question(
                pipeline,
                "Reach% là gì?",
                json_output=True,
                use_router=True,
            )

        self.assertTrue(success)
        data = json.loads(output.getvalue())
        self.assertEqual(data["intent"], "definition")
        self.assertEqual(data["success"], True)
        self.assertIn("Reach (%)", data["reply"])

    def test_cli_no_scope_intent_prints_guidance(self):
        llm = MagicMock()
        llm.complete_text.return_value = '{"intent": "no_scope", "confidence": 0.99}'
        pipeline = main.RatingQueryPipeline(llm_client=llm)
        output = StringIO()

        with redirect_stdout(output):
            success = main._process_question(
                pipeline,
                "Xin chào bạn là ai",
                json_output=False,
                use_router=True,
            )

        self.assertTrue(success)
        rendered = output.getvalue()
        self.assertIn("[Intent] no_scope", rendered)
        self.assertIn("Rating", rendered)


if __name__ == "__main__":
    unittest.main()
