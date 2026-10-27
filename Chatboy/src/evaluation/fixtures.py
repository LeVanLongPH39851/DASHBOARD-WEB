from contextlib import contextmanager
from datetime import datetime
from decimal import Decimal
import json
import socket
from unittest.mock import patch

from config.doris_config import QueryResult
from src.core.text_to_sql.runtime.context import CURRENT_CONTEXT
from src.core.text_to_sql.runtime.errors import WorkflowError


class FixedClock:
    def __init__(self, instant="2026-10-24T10:00:00+07:00"):
        self.instant, self.elapsed = datetime.fromisoformat(instant), 0.0

    def now(self):
        return self.instant

    def monotonic(self):
        return self.elapsed

    def sleep(self, seconds):
        self.elapsed += seconds


class ReplayLLM:
    model = "replay-fixture-v1"

    def __init__(self, case):
        self.case = case
        self.extractions = 0

    def complete_text(self, *, prompt, system_prompt="", **kwargs):
        ctx = CURRENT_CONTEXT.get()
        if ctx:
            ctx.llm_attempt()
        fault = self.case.get("fault")
        if fault == "llm_unavailable":
            raise WorkflowError("dependency_unavailable", "Fixture LLM unavailable", retryable=True)
        if fault == "deadline":
            ctx.clock.sleep(46)
            ctx.remaining()
        if fault == "budget":
            ctx.llm_calls = 4
            ctx.llm_attempt()
        if "intent classifier" in system_prompt:
            return json.dumps({"intent": self.case["intent"], "confidence": 1.0})
        if "Trích xuất semantic input" in prompt:
            self.extractions += 1
            if fault == "invalid_semantics" or (fault == "repair" and self.extractions == 1):
                return "{broken json"
            return json.dumps(self.case["extraction"], ensure_ascii=False)
        return self.case.get("pattern", "metric_lookup")


class ReplayDoris:
    def __init__(self, case):
        self.case = case
        self.calls = []
        self.result_index = 0

    def execute_result(self, sql, params):
        ctx = CURRENT_CONTEXT.get()
        with ctx.stage("doris", query_fingerprint=__import__("hashlib").sha256(sql.encode()).hexdigest()[:16]):
            self.calls.append({"sql": sql, "parameters": params})
            fault = self.case.get("fault")
            if fault == "doris_unavailable":
                raise WorkflowError("dependency_unavailable", "Fixture Doris unavailable", retryable=True)
            if "ngram_sim" in sql:
                rows = self.case.get("canonical_rows", [])
                return QueryResult(("program_name", "similarity"), tuple(rows))
            fixtures = self.case.get("results", [])
            if self.result_index >= len(fixtures):
                raise AssertionError("Unexpected extra query")
            fixture = fixtures[self.result_index]
            self.result_index += 1
            rows = [dict(r) for r in fixture["rows"]]
            for row in rows:
                for column in fixture.get("decimal_columns", []):
                    if row.get(column) is not None:
                        row[column] = Decimal(str(row[column]))
            if fault == "oversized":
                ctx.consume_rows(50_001)
            ctx.consume_rows(len(rows))
            return QueryResult(tuple(fixture["columns"]), tuple(rows))


@contextmanager
def network_blocked():
    def blocked(*args, **kwargs):
        raise AssertionError("Network disabled in evaluation replay")
    with patch.object(socket.socket, "connect", blocked), patch.object(socket, "create_connection", blocked):
        yield
