"""Keep evaluation SQL on an explicitly named, marked Doris snapshot schema."""
import re


class SnapshotExecutor:
    def __init__(self, executor, schema, snapshot_id):
        if not re.fullmatch(r"chatboy_eval_[a-zA-Z0-9_]+", schema or ""):
            raise ValueError("EVAL_DORIS_SCHEMA must start with chatboy_eval_ and contain only identifiers")
        self.executor, self.schema = executor, schema
        marker = executor.execute_result(f"SELECT snapshot_id FROM {schema}.__chatboy_eval_snapshot", {})
        if len(marker.rows) != 1 or marker.rows[0].get("snapshot_id") != snapshot_id:
            raise ValueError("Snapshot marker does not match EVAL_SNAPSHOT_ID")

    def execute_result(self, sql, params):
        # Renderer/reference SQL is repo-owned; user values remain bound parameters.
        sql = re.sub(r"\bdata_dashboard_rating\.", self.schema + ".", sql)
        if re.search(r"\b(?:FROM|JOIN)\s+(?!" + re.escape(self.schema) + r"\.)[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+", sql, re.I):
            raise ValueError("Evaluation query attempted to use a different schema")
        return self.executor.execute_result(sql, params)
