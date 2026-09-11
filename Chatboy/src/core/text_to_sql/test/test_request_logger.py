import json
import tempfile
import unittest
from pathlib import Path

from src.core.text_to_sql.request_logger import RequestLogger


class TestRequestLogger(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.logger = RequestLogger(log_dir=self.temp_dir.name)

    def tearDown(self):
        self.logger.close()
        self.temp_dir.cleanup()

    def test_log_interaction_writes_per_intent_files(self):
        intents_data = [
            ("data_query", "Rating của VTV1 hôm qua", {"domain": "RATING"}, "Rating VTV1 là 2.5%"),
            ("definition", "Rating là gì?", {"intent": "definition"}, "Rating là tỷ lệ phần trăm khán giả..."),
            ("no_scope", "Thời tiết hôm nay thế nào?", {"intent": "no_scope"}, "Tôi chỉ hỗ trợ số liệu Rating..."),
        ]

        for intent, question, full_log, llm_output in intents_data:
            self.logger.log_interaction(
                question=question,
                full_log=full_log,
                llm_output=llm_output,
                intent=intent,
                success=True,
            )

        log_dir = Path(self.temp_dir.name)

        # 1. Verify separate intent files exist and contain their own logs
        for intent, question, full_log, llm_output in intents_data:
            intent_jsonl = log_dir / f"{intent}.jsonl"
            intent_log = log_dir / f"{intent}.log"

            self.assertTrue(intent_jsonl.exists(), f"{intent}.jsonl should exist")
            self.assertTrue(intent_log.exists(), f"{intent}.log should exist")

            jsonl_lines = intent_jsonl.read_text(encoding="utf-8").strip().split("\n")
            self.assertEqual(len(jsonl_lines), 1)
            record = json.loads(jsonl_lines[0])
            self.assertEqual(record["question"], question)
            self.assertEqual(record["intent"], intent)
            self.assertEqual(record["llm_output"], llm_output)

            log_text = intent_log.read_text(encoding="utf-8")
            self.assertIn(f"QUESTION: {question}", log_text)
            self.assertIn(f"LLM_OUTPUT: {llm_output}", log_text)

        # 2. Verify global requests.jsonl and requests.log contain all 3
        requests_jsonl = log_dir / "requests.jsonl"
        self.assertTrue(requests_jsonl.exists())
        lines = requests_jsonl.read_text(encoding="utf-8").strip().split("\n")
        self.assertEqual(len(lines), 3)


if __name__ == "__main__":
    unittest.main()
