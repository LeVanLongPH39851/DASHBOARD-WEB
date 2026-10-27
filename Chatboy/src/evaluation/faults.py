"""Controlled fault injection used identically during integration/live acceptance."""
from config.doris_config import QueryResult
from src.core.text_to_sql.runtime.context import CURRENT_CONTEXT
from src.core.text_to_sql.runtime.errors import WorkflowError


class FaultLLM:
    def __init__(self, client, fault):
        self.client, self.fault, self.extractions = client, fault, 0

    def complete_text(self, *, prompt, **kwargs):
        ctx = CURRENT_CONTEXT.get()
        if self.fault == "llm_unavailable":
            ctx.llm_attempt()
            raise WorkflowError("dependency_unavailable", "Injected LLM outage", retryable=True)
        if "Trích xuất semantic input" in prompt:
            self.extractions += 1
            if self.fault == "invalid_semantics" or (self.fault == "repair" and self.extractions == 1):
                ctx.llm_attempt()
                ctx.emit("fault_injection", outcome="injected", fault=self.fault)
                return "{invalid json"
        return self.client.complete_text(prompt=prompt, **kwargs)


class FaultDoris:
    def __init__(self, executor, case):
        self.executor, self.case = executor, case

    def execute_result(self, sql, params):
        fault = self.case["fault"]
        ctx = CURRENT_CONTEXT.get()
        ctx.emit("fault_injection", outcome="injected", fault=fault)
        if fault == "doris_unavailable":
            raise WorkflowError("dependency_unavailable", "Injected Doris outage", retryable=True)
        if fault == "oversized":
            ctx.consume_rows(50_001)
        if fault in {"missing_alias", "invalid_number", "null"}:
            fixture = self.case["results"][0]
            ctx.consume_rows(len(fixture["rows"]))
            return QueryResult(tuple(fixture["columns"]), tuple(fixture["rows"]))
        return self.executor.execute_result(sql, params)
