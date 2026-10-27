"""Doris execution boundary with parameter translation and three-stage dry runs."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Any, Callable

from config.doris_bind_translator import translate_named_to_positional
from src.core.text_to_sql.runtime.context import CURRENT_CONTEXT, stage, fingerprint
from src.core.text_to_sql.runtime.errors import WorkflowError


@dataclass(frozen=True)
class QueryResult:
    """Rows returned by a SELECT, EXPLAIN, or dry-run statement."""

    columns: tuple[str, ...]
    rows: tuple[dict[str, Any], ...]


class DorisExecutionError(RuntimeError):
    """Doris could not validate or execute a generated statement."""


Runner = Callable[[str, tuple[Any, ...], float | None], QueryResult | tuple[list[str], list[dict[str, Any]]]]


class DorisExecutor:
    """Execute read-only Doris SQL through mysql-connector-python's ``%s`` binding."""

    def __init__(
        self,
        runner: Runner | None = None,
        host: str | None = None,
        port: int | None = None,
        database: str | None = None,
        user: str | None = None,
        password: str | None = None,
        cost_guardrail: Callable[[QueryResult], None] | None = None,
    ):
        self.runner = runner
        self.host = host
        self.port = port
        self.database = database
        self.user = user
        self.password = password
        self.cost_guardrail = cost_guardrail or self._default_cost_guardrail

    def dry_run_and_execute(
        self,
        sql: str,
        params: dict[str, Any],
        limit_override: int = 100,
    ) -> QueryResult:
        """EXPLAIN, inspect the plan, then issue a bounded read-only query."""
        if not 1 <= limit_override <= 10_000:
            raise ValueError("limit_override must be between 1 and 10000")
        positional_sql, values = translate_named_to_positional(sql, params)
        self._assert_read_only(positional_sql)

        self._run(f"EXPLAIN {positional_sql}", values)
        explain_plan = self._run(f"EXPLAIN VERBOSE {positional_sql}", values)
        self.cost_guardrail(explain_plan)

        # Never inject a LIMIT that could silently change share/trend calculations.
        return self._run(positional_sql, values, timeout_s=5.0)

    def _run(self, sql: str, values: tuple[Any, ...] = (), timeout_s: float | None = None) -> QueryResult:
        ctx = CURRENT_CONTEXT.get()
        timeout_s = min(timeout_s or 5, ctx.remaining(), ctx.limits.doris_timeout_s) if ctx else min(timeout_s or 5, 5)
        try:
            with stage("doris", query_fingerprint=fingerprint(sql)):
                if self.runner:
                    result = self.runner(sql, values, timeout_s)
                    if not isinstance(result, QueryResult):
                        columns, rows = result
                        result = QueryResult(columns=tuple(columns), rows=tuple(rows))
                else:
                    result = self._run_mysql(sql, values, timeout_s)
                if ctx:
                    ctx.consume_rows(len(result.rows))
                    ctx.emit("doris_rows", outcome="ok", row_count=len(result.rows), query_fingerprint=fingerprint(sql))
                elif len(result.rows) > 50_000:
                    raise WorkflowError("resource_exceeded", "Kết quả quá lớn; hãy thu hẹp phạm vi.")
                return result
        except WorkflowError:
            raise
        except Exception as exc:
            raise WorkflowError("dependency_unavailable", "Không thể thực thi truy vấn Doris.", retryable=True) from exc

    def _run_mysql(self, sql: str, values: tuple[Any, ...], timeout_s: float | None) -> QueryResult:
        try:
            import mysql.connector
        except ImportError as exc:
            raise DorisExecutionError(
                "mysql-connector-python is required for a real Doris connection."
            ) from exc
        if not self.host or not self.database or not self.user:
            raise DorisExecutionError("Missing Doris connection configuration.")
        connection = mysql.connector.connect(
            host=self.host,
            port=self.port or 9030,
            database=self.database,
            user=self.user,
            password=self.password,
            connection_timeout=max(1, int(timeout_s or 5)),
            read_timeout=max(1, int(timeout_s or 5)),
            write_timeout=max(1, int(timeout_s or 5)),
        )
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SET query_timeout = %s", (max(1, int(timeout_s or 5)),))
            ctx = CURRENT_CONTEXT.get()
            if ctx:
                ctx.remaining()
            cursor.execute(sql, values)
            cap = ctx.limits.max_rows - ctx.rows_used if ctx else 50_000
            collected = []
            if cursor.with_rows:
                while True:
                    if ctx:
                        ctx.remaining()
                    batch = cursor.fetchmany(min(1000, cap + 1 - len(collected)))
                    if not batch:
                        break
                    collected.extend(dict(row) for row in batch)
                    if len(collected) > cap:
                        raise WorkflowError("resource_exceeded", "Kết quả vượt giới hạn; hãy thu hẹp phạm vi.")
            rows = tuple(collected)
            columns = tuple(cursor.column_names or ())
            return QueryResult(columns=columns, rows=rows)
        finally:
            connection.close()

    def execute_result(self, sql: str, params: dict[str, Any]) -> QueryResult:
        positional_sql, values = translate_named_to_positional(sql, params)
        self._assert_read_only(positional_sql)
        return self._run(positional_sql, values, timeout_s=5)

    @staticmethod
    def _assert_read_only(sql: str) -> None:
        compact = sql.strip().lower()
        # Generated weighted recipes use a top-level WITH ... SELECT CTE
        # statement, while direct recipes start with SELECT.
        if not (compact.startswith("select") or compact.startswith("with")):
            raise DorisExecutionError("Only SELECT statements may be executed.")
        forbidden = (";", " insert ", " update ", " delete ", " alter ", " drop ", " create ", " grant ")
        if any(token in f" {compact}" for token in forbidden):
            raise DorisExecutionError("Generated SQL contains a forbidden write or DDL token.")

    @staticmethod
    def _default_cost_guardrail(explain_result: QueryResult) -> None:
        """Reject explicit planner evidence that partition pruning is absent.

        Doris EXPLAIN formatting varies by version, so deployments may inject a
        stricter parser/row-scan threshold through ``cost_guardrail``.
        """
        rendered = "\n".join(str(value) for row in explain_result.rows for value in row.values()).upper()
        if "NO PARTITION PRUNING" in rendered or "PARTITION: ALL" in rendered:
            raise DorisExecutionError("Cost guardrail rejected a plan without partition pruning.")


class DorisDatabase(DorisExecutor):
    """Backward-compatible facade plus the new named-parameter execution API."""

    def __init__(
        self,
        executor: Callable[..., tuple[list[str], list[dict[str, Any]]]] | None = None,
        host: str | None = None,
        port: int | None = None,
        database: str | None = None,
        user: str | None = None,
        password: str | None = None,
        cost_guardrail: Callable[[QueryResult], None] | None = None,
    ):
        self.executor = executor

        def legacy_runner(sql: str, values: tuple[Any, ...], timeout_s: float | None):
            if executor is None:
                raise DorisExecutionError("No mock executor is configured.")
            try:
                return executor(sql, values)
            except TypeError:
                return executor(sql)

        super().__init__(
            runner=legacy_runner if executor else None,
            host=host,
            port=port,
            database=database,
            user=user,
            password=password,
            cost_guardrail=cost_guardrail,
        )

    @classmethod
    def from_env(cls) -> "DorisDatabase":
        return cls(
            host=os.getenv("DORIS_HOST"),
            port=int(os.getenv("DORIS_PORT", "0")) or None,
            database=os.getenv("DORIS_DATABASE"),
            user=os.getenv("DORIS_USER"),
            password=os.getenv("DORIS_PASSWORD"),
        )

    def execute(self, sql: str, params: dict[str, Any] | None = None) -> tuple[list[str], list[dict[str, Any]]]:
        """Execute legacy SQL, or named-parameter SQL when ``params`` is provided."""
        if params is None:
            self._assert_read_only(sql)
            result = self._run(sql)
        else:
            positional_sql, values = translate_named_to_positional(sql, params)
            self._assert_read_only(positional_sql)
            result = self._run(positional_sql, values)
        return list(result.columns), list(result.rows)
