"""Evaluate through ChatService and persist auditable, deterministic artifacts."""
from __future__ import annotations

import csv
import hashlib
import json
import math
import uuid
from collections import Counter, defaultdict
from contextlib import nullcontext
from pathlib import Path
from decimal import Decimal

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.runtime.context import MemoryTraceSink, SystemClock
from src.core.text_to_sql.runtime.service import ChatService
from src.core.text_to_sql.runtime.skills import SkillRegistry
from src.core.text_to_sql.runtime.clarification import RedisClarificationStore
from src.core.text_to_sql.runtime.contracts import wire_value
from .fixtures import FixedClock, ReplayDoris, ReplayLLM, network_blocked


class RecordingExecutor:
    def __init__(self, executor):
        self.executor, self.calls = executor, []

    def execute_result(self, sql, params):
        record = {"sql": sql, "parameters": params}
        self.calls.append(record)
        result = self.executor.execute_result(sql, params)
        record.update(columns=result.columns, row_count=len(result.rows))
        return result


def load_cases(path):
    return [json.loads(line) for line in Path(path).read_text().splitlines() if line.strip()]


def validate_dataset(cases, catalog):
    errors = []
    if len({c["id"] for c in cases}) != len(cases):
        errors.append("duplicate_case_id")
    groups = defaultdict(set)
    questions = defaultdict(set)
    from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value
    for case in cases:
        groups[case["group_id"]].add(case["split"])
        questions[normalize_lookup_value(case["question"])].add(case["split"])
        for field in ("reference_time", "snapshot_id", "review", "expected", "source", "reference_queries"):
            if field not in case:
                errors.append(f"missing:{case['id']}:{field}")
    if any(len(splits) > 1 for splits in groups.values()):
        errors.append("paraphrase_split_leakage")
    if any(len(splits) > 1 for splits in questions.values()):
        errors.append("duplicate_question_split_leakage")
    counts = Counter(c["kind"] for c in cases)
    for kind, minimum in (("data", 90), ("definition", 20), ("no_scope", 10), ("clarification", 20), ("fault", 10)):
        if counts[kind] < minimum:
            errors.append(f"coverage:{kind}:{counts[kind]}/{minimum}")
    for pattern in catalog.patterns:
        count = sum(c["kind"] == "data" and c.get("pattern") == pattern for c in cases)
        if count < 10:
            errors.append(f"pattern_coverage:{pattern}:{count}")
    metrics = Counter(c.get("extraction", {}).get("metric_id") for c in cases if c["kind"] == "data")
    for metric in catalog.metrics.values():
        if metric.status == "active" and metrics[metric.id] < 2:
            errors.append(f"metric_coverage:{metric.id}:{metrics[metric.id]}")
    if Counter(c["split"] for c in cases) != {"development": 100, "holdout": 50}:
        errors.append("split_must_be_100_development_50_holdout")
    return errors


def compare(case, result):
    expected = case["expected"]
    errors = []
    for key in ("status", "intent"):
        if key in expected and getattr(result, key) != expected[key]:
            errors.append(f"{key}: expected {expected[key]}, got {getattr(result, key)}")
    if expected.get("error") != (result.error or {}).get("code"):
        errors.append(f"error: expected {expected.get('error')}, got {result.error}")
    plan = result.evidence.get("plan", {})
    for key, value in expected.get("plan", {}).items():
        if wire_value(plan.get(key)) != value:
            errors.append(f"plan.{key}: expected {value}, got {plan.get(key)}")
    if "rows" in expected:
        actual = wire_value((result.data or {}).get("rows", []))
        if actual != expected["rows"]:
            errors.append(f"rows: expected {expected['rows']}, got {actual}")
    for text in expected.get("contains", []):
        if text not in result.reply:
            errors.append(f"reply missing: {text}")
    for text in expected.get("forbidden", []):
        if text in result.reply:
            errors.append(f"reply forbidden: {text}")
    comparisons = ((result.evidence.get("analysis") or {}).get("data") or {})
    comparisons = comparisons.get("comparisons", []) if isinstance(comparisons, dict) else []
    for required in expected.get("comparisons", []):
        if not any(all((Decimal(str(item.get(key))) == Decimal(str(value)) if key in {"value_a", "value_b", "delta"} and item.get(key) is not None else item.get(key) == value)
                       for key, value in required.items()) for item in comparisons):
            errors.append(f"missing_derived_fact:{required}")
    for required in expected.get("facts", []):
        if not any(all(wire_value(fact.get(key)) == value for key, value in required.items()) for fact in result.evidence.get("facts", [])):
            errors.append(f"missing_fact:{required}")
    return errors


def _oracle_compare(case, result, executor):
    """SQL authored/reviewed independently must target the same fixed snapshot."""
    expected = []
    for reference in case["reference_queries"]:
        query = executor.execute_result(reference["sql"], reference["parameters"])
        expected.extend({**row, **({"period_id": reference["period_id"]} if reference.get("period_id") else {})} for row in query.rows)
    actual = (result.data or {}).get("rows", [])
    sort_key = lambda row: json.dumps(wire_value(row), sort_keys=True)
    # Decimal equality compares exact numeric values; the dataset may declare a tolerance
    # only after review when the source returns floating-point aggregates.
    def normalize(rows):
        numeric = {c["name"] for c in (result.data or {}).get("columns", []) if c["type"] in {"integer", "decimal"}}
        return sorted([{k: Decimal(str(v)) if k in numeric and v is not None else v for k, v in row.items()} for row in rows], key=sort_key)
    return [] if normalize(actual) == normalize(expected) else ["independent_reference_sql_mismatch"]


def run(cases, output, *, mode="replay", live_service=None, skills=True, repair=True):
    output = Path(output)
    output.mkdir(parents=True, exist_ok=True)
    catalog = RatingCatalog.load()
    structural_errors = validate_dataset(cases, catalog)
    if structural_errors:
        raise ValueError("Invalid evaluation dataset: " + ", ".join(structural_errors))
    reports = []
    if mode != "replay":
        if live_service is None:
            raise ValueError("Live/integration modes require an explicitly configured evaluation service")
        if any(c["review"]["status"] != "approved" or not c["review"].get("reviewer") or c["snapshot_id"].startswith("synthetic")
               or (c["kind"] == "data" and not c["reference_queries"]) for c in cases):
            raise ValueError("Approved snapshot cases and independent reference SQL are required")
    with network_blocked() if mode == "replay" else nullcontext():
        for case in cases:
            sink = MemoryTraceSink()
            if mode == "replay":
                import fakeredis
                executor = ReplayDoris(case)
                service = ChatService(llm=ReplayLLM(case), executor=executor,
                    store=RedisClarificationStore(fakeredis.FakeRedis()), catalog=catalog,
                    clock=FixedClock(case["reference_time"]), skills=SkillRegistry(catalog, enabled=skills),
                    repair_enabled=repair, trace=sink)
            else:
                service = live_service
                executor = service.executor
            saved_versions = service.versions
            if mode == "integration":
                service.versions = {**service.versions, "model": ReplayLLM.model}
            ctx = service.new_context()
            ctx.reference_time = __import__("datetime").datetime.fromisoformat(case["reference_time"])
            ctx.trace = sink
            saved_llm, saved_executor = service.llm, service.executor
            recorder = executor if mode == "replay" else RecordingExecutor(service.executor)
            if mode != "replay":
                service.executor = recorder
            if mode == "integration":
                # Real SQL with fixed, audited semantic outputs isolates query correctness.
                from src.core.text_to_sql.runtime.skills import SkillAwareLLM
                service.llm = SkillAwareLLM(ReplayLLM(case), service.skills)
            if mode != "replay" and case.get("fault"):
                from .faults import FaultLLM, FaultDoris
                service.executor = FaultDoris(service.executor, case)
                if mode == "live":
                    service.llm = FaultLLM(service.llm, case["fault"])
                    if case["fault"] == "deadline":
                        ctx.deadline = ctx.started - 1
                    if case["fault"] == "budget":
                        ctx.llm_calls = ctx.limits.llm_attempts
            try:
                result = service.handle({"type": "question", "question": case["question"]}, ctx)
                turns = [result.as_v2()]
                for answer in case.get("answers", []):
                    if not result.clarification:
                        break
                    c = result.clarification
                    payload = answer
                    if answer == "$first_option":
                        field = c["fields"][0]
                        payload = {field["id"]: field["options"][0]["id"]}
                    result = service.handle({"type": "clarification", "clarification_id": c["id"],
                                             "revision": c["revision"], "answers": payload})
                    turns.append(result.as_v2())
                differences = compare(case, result)
                if mode != "replay" and case["kind"] == "data":
                    differences += _oracle_compare(case, result, executor)
                if mode == "replay" and case["kind"] == "data":
                    if executor.result_index != len(case["results"]):
                        differences.append("expected_query_count_mismatch")
                    for fragment in case.get("sql_required", []):
                        if not any(fragment in call["sql"] for call in executor.calls):
                            differences.append(f"missing_sql_fragment:{fragment}")
                report = {"id": case["id"], "split": case["split"], "kind": case["kind"], "pattern": case.get("pattern"),
                          "passed": not differences, "differences": differences, "turns": turns,
                          "queries": wire_value(recorder.calls),
                          "facts_and_render_passed": not any(d.startswith(("rows:", "missing_fact:", "missing_derived_fact:", "reply ", "independent_reference")) for d in differences),
                          "duration_ms": sum(t["meta"].get("duration_ms", 0) for t in turns),
                          "versions": result.meta.get("versions"), "review": case["review"], "snapshot_id": case["snapshot_id"]}
                reports.append(report)
                (output / f"{case['id']}.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
                (output / f"{case['id']}.trace.jsonl").write_text("\n".join(json.dumps(e, ensure_ascii=False, default=str) for e in sink.events))
            finally:
                service.llm, service.executor = saved_llm, saved_executor
                service.versions = saved_versions
    summary = summarize(reports, mode, cases)
    (output / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    (output / "summary.md").write_text(f"# Evaluation {mode}\n\nPassed: {summary['passed']}/{len(reports)}.\n\n"
        f"Business approval: {summary['approved']}/{len(reports)}.\n\nRelease: **{'eligible' if summary['eligible'] else 'blocked'}**.\n\n"
        + "\n".join(f"- {key}: {value}" for key, value in summary["by_pattern"].items()) + "\n")
    with (output / "cases.csv").open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "split", "kind", "pattern", "passed", "duration_ms", "differences"])
        writer.writerows([r[k] for k in ("id", "split", "kind", "pattern", "passed", "duration_ms", "differences")] for r in reports)
    return summary


def summarize(reports, mode, cases):
    holdout = [r for r in reports if r["split"] == "holdout"]
    ratio = lambda rows: sum(r["passed"] for r in rows) / len(rows) if rows else 0
    by_pattern = {p: ratio([r for r in reports if r["pattern"] == p and r["kind"] == "data"]) for p in sorted({r["pattern"] for r in reports if r["kind"] == "data"})}
    holdout_by_pattern = {p: ratio([r for r in holdout if r["pattern"] == p and r["kind"] == "data"]) for p in by_pattern}
    latencies = sorted(r["duration_ms"] for r in reports if r["kind"] != "fault")
    p95 = latencies[math.ceil(len(latencies) * .95) - 1] if latencies else None
    approved = sum(c["review"]["status"] == "approved" and bool(c["review"].get("reviewer")) for c in cases)
    controls = [r for r in reports if r["kind"] in {"fault", "clarification", "no_scope"}]
    failed_normal = sum(r["turns"][-1]["status"] == "failed" for r in reports if r["kind"] != "fault")
    error_rate = failed_normal / max(1, sum(r["kind"] != "fault" for r in reports))
    return {"run_id": uuid.uuid4().hex, "versions": reports[0]["versions"] if reports else {},
            "facts_and_render_accuracy": sum(r["facts_and_render_passed"] for r in reports) / max(1, len(reports)),
            "mode": mode, "cases": len(reports), "passed": sum(r["passed"] for r in reports), "approved": approved,
            "snapshot_ids": sorted({c["snapshot_id"] for c in cases}),
            "dataset_hash": hashlib.sha256(json.dumps(cases, sort_keys=True).encode()).hexdigest(),
            "holdout_accuracy": ratio(holdout), "by_pattern": by_pattern, "holdout_by_pattern": holdout_by_pattern,
            "p95_ms": p95 if mode != "replay" else None,
            "unexpected_error_rate": error_rate, "control_accuracy": ratio(controls),
            "eligible": mode == "live" and approved == len(cases) and ratio(holdout) >= .95
                        and all(v >= .9 for v in holdout_by_pattern.values()) and ratio(controls) == 1
                        and all(r["facts_and_render_passed"] for r in reports)
                        and p95 is not None and p95 <= 20_000 and error_rate <= .01,
            "note": "Replay uses synthetic, unapproved fixtures; it cannot certify business accuracy or production latency." if mode == "replay" else "Three independent live runs plus regression/load reports are required."}
