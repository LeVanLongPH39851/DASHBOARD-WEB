"""Unit tests for IntentRouter, SemanticDefinitionAgent, and AgentResponse routing."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock

from src.core.text_to_sql.intent_routing import (
    AgentResponse,
    IntentClassificationResult,
    IntentRouter,
)
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
from src.core.text_to_sql.d_016_definition_agent import (
    SemanticDefinitionAgent,
    no_scope_response,
)
from src.core.text_to_sql.intent_logger import get_intent_logger


class TestIntentRouterLLM(unittest.TestCase):
    def _make_router(self, intent: str, confidence: float = 0.95) -> IntentRouter:
        llm = MagicMock()
        llm.complete_text.return_value = (
            f'{{"intent": "{intent}", "confidence": {confidence}}}'
        )
        return IntentRouter(llm_client=llm)

    def test_data_query_intent(self):
        router = self._make_router("data_query")
        res = router.route("Rating của VTV1 hôm qua là bao nhiêu?")
        self.assertIsInstance(res, IntentClassificationResult)
        self.assertEqual(res.intent, "data_query")
        self.assertAlmostEqual(res.confidence, 0.95)

    def test_definition_intent(self):
        router = self._make_router("definition")
        res = router.route("Reach% là gì và khác Rating% như thế nào?")
        self.assertIsInstance(res, IntentClassificationResult)
        self.assertEqual(res.intent, "definition")

    def test_no_scope_intent(self):
        router = self._make_router("no_scope")
        res = router.route("Xin chào bạn, hôm nay thời tiết thế nào?")
        self.assertIsInstance(res, IntentClassificationResult)
        self.assertEqual(res.intent, "no_scope")

    def test_requires_llm_client(self):
        with self.assertRaises(RuntimeError) as ctx:
            IntentRouter(llm_client=None)
        self.assertIn("IntentRouter yêu cầu LLM client", str(ctx.exception))

    def test_invalid_intent_falls_back_to_data_query(self):
        router = self._make_router("unsupported_intent")
        res = router.route("Test question")
        self.assertEqual(res.intent, "data_query")

    def test_malformed_json_falls_back_to_data_query(self):
        llm = MagicMock()
        llm.complete_text.return_value = "Xin chào tôi là bot không có json"
        router = IntentRouter(llm_client=llm)
        res = router.route("Test")
        self.assertEqual(res.intent, "data_query")


class TestSemanticDefinitionAgent(unittest.TestCase):
    def setUp(self):
        self.agent = SemanticDefinitionAgent(llm_client=None)

    def test_returns_agent_response(self):
        res = self.agent.answer("Reach% là gì?")
        self.assertIsInstance(res, AgentResponse)
        self.assertEqual(res.intent, "definition")
        self.assertTrue(res.success)
        self.assertEqual(res.source, "deterministic")
        self.assertIn("Reach", res.reply)
        self.assertTrue(
            any("reach_percent" in ref for ref in res.data.get("catalog_refs", []))
        )

    def test_rating_definition(self):
        res = self.agent.answer("Rating là gì?")
        self.assertEqual(res.intent, "definition")
        self.assertTrue(res.success)
        self.assertIn("Rating", res.reply)

    def test_view_duration_definition(self):
        res = self.agent.answer("Thời lượng xem là gì?")
        self.assertEqual(res.intent, "definition")
        self.assertTrue(res.success)
        self.assertIn("Thời lượng xem", res.reply)

    def test_channel_views_definition(self):
        res = self.agent.answer("Lượt xem là gì?")
        self.assertEqual(res.intent, "definition")
        self.assertTrue(res.success)
        self.assertIn("Lượt xem", res.reply)

    def test_dimension_definition(self):
        res = self.agent.answer("Kênh phát sóng là gì?")
        self.assertEqual(res.intent, "definition")
        self.assertTrue(res.success)
        self.assertTrue(
            any("channel" in ref for ref in res.data.get("catalog_refs", []))
        )

    def test_unknown_term_returns_guidance(self):
        res = self.agent.answer("Chỉ số xyz123 là gì?")
        self.assertEqual(res.intent, "definition")
        self.assertTrue(res.success)
        self.assertIn("Rating", res.reply)

    def test_llm_answer_preferred_when_available(self):
        mock_llm = MagicMock()
        mock_llm.complete_text.return_value = (
            "Reach% là tỉ lệ phần trăm số khán giả duy nhất đã xem kênh trên tổng số dân số mục tiêu."
        )
        agent = SemanticDefinitionAgent(llm_client=mock_llm)
        res = agent.answer("Reach% là gì?")
        self.assertEqual(res.intent, "definition")
        self.assertEqual(res.source, "llm")
        self.assertIn("khán giả duy nhất", res.reply)


class TestNoScopeResponse(unittest.TestCase):
    def test_no_scope_response_format(self):
        res = no_scope_response()
        self.assertIsInstance(res, AgentResponse)
        self.assertEqual(res.intent, "no_scope")
        self.assertTrue(res.success)
        self.assertEqual(res.source, "deterministic")
        self.assertIn("Rating", res.reply)

    def test_no_scope_response_with_llm(self):
        llm = MagicMock()
        llm.complete_text.return_value = "Hệ thống Dashboard Rating không quản lý giá tiền chương trình."
        res = no_scope_response(question="Giá của các chương trình trên vtv1 là bao nhiêu", llm_client=llm)
        self.assertIsInstance(res, AgentResponse)
        self.assertEqual(res.intent, "no_scope")
        self.assertTrue(res.success)
        self.assertEqual(res.source, "llm")
        self.assertIn("Dashboard Rating", res.reply)


class TestIntentLogger(unittest.TestCase):
    def test_logger_creates_file(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = get_intent_logger("data_query", log_dir=tmpdir)
            logger.info("test data query log message")
            log_file = Path(tmpdir) / "data_query.log"
            self.assertTrue(log_file.exists())
            content = log_file.read_text(encoding="utf-8")
            self.assertIn("test data query log message", content)

    def test_logger_per_intent(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            l_def = get_intent_logger("definition", log_dir=tmpdir)
            l_def.info("definition log test")
            l_ns = get_intent_logger("no_scope", log_dir=tmpdir)
            l_ns.info("no scope log test")

            self.assertTrue((Path(tmpdir) / "definition.log").exists())
            self.assertTrue((Path(tmpdir) / "no_scope.log").exists())


class TestPipelineRoute(unittest.TestCase):
    def test_route_no_llm_defaults_to_data_query(self):
        pipeline = RatingQueryPipeline(llm_client=None)
        res = pipeline.route("Rating VTV1")
        self.assertIsInstance(res, AgentResponse)
        self.assertEqual(res.intent, "data_query")

    def test_route_with_llm_definition(self):
        mock_llm = MagicMock()
        mock_llm.complete_text.side_effect = [
            '{"intent": "definition", "confidence": 0.98}',
            "Rating% là chỉ số đo lường tỷ lệ người xem trung bình của một kênh.",
        ]
        pipeline = RatingQueryPipeline(llm_client=mock_llm)
        res = pipeline.route("Rating là gì?")
        self.assertIsInstance(res, AgentResponse)
        self.assertEqual(res.intent, "definition")
        self.assertTrue(res.success)
        self.assertIn("Rating%", res.reply)

    def test_route_with_llm_no_scope(self):
        mock_llm = MagicMock()
        mock_llm.complete_text.return_value = (
            '{"intent": "no_scope", "confidence": 0.99}'
        )
        pipeline = RatingQueryPipeline(llm_client=mock_llm)
        res = pipeline.route("Thời tiết hôm nay thế nào?")
        self.assertIsInstance(res, AgentResponse)
        self.assertEqual(res.intent, "no_scope")
        self.assertTrue(res.success)

    def test_route_with_llm_data_query(self):
        mock_llm = MagicMock()
        # 1st call: intent router -> data_query
        # Subsequent calls: LLM extraction or pattern router
        mock_llm.complete_text.return_value = (
            '{"intent": "data_query", "confidence": 0.95}'
        )
        pipeline = RatingQueryPipeline(llm_client=mock_llm)
        res = pipeline.route("Rating VTV1 ngày 2026-08-01")
        self.assertIsInstance(res, AgentResponse)
        self.assertEqual(res.intent, "data_query")


if __name__ == "__main__":
    unittest.main()
