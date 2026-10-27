import argparse
import json
from pathlib import Path

from .harness import load_cases, validate_dataset, run
from src.core.text_to_sql.catalog import RatingCatalog


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["validate", "replay", "integration", "live", "ablation", "gate", "load", "serve"])
    parser.add_argument("--base-url", help="Evaluation HTTP target for load mode")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8011)
    parser.add_argument("--dataset", default="evaluation/cases.jsonl")
    parser.add_argument("--output", default="artifacts/evaluation")
    parser.add_argument("--reports", nargs="*")
    parser.add_argument("--regression-report")
    parser.add_argument("--load-report")
    parser.add_argument("--env-file", help="Explicit evaluation environment file; never use production .env")
    parser.add_argument("--ablation-mode", choices=["replay", "live"], default="replay")
    args = parser.parse_args()
    cases = load_cases(args.dataset)
    errors = validate_dataset(cases, RatingCatalog.load())
    if errors:
        print(json.dumps({"errors": errors}, indent=2))
        return 1
    if args.mode == "validate":
        print(f"Validated {len(cases)} cases; business approval remains separate.")
        return 0
    if args.mode == "gate":
        import hashlib
        from src.core.text_to_sql.runtime.service import ChatService, catalog_version, workflow_version
        from src.core.text_to_sql.runtime.skills import SkillRegistry
        catalog = RatingCatalog.load()
        current = {"workflow": workflow_version(), "catalog": catalog_version(catalog),
                   "skills": SkillRegistry(catalog).version, "prompt": ChatService._prompt_version()}
        dataset_hash = hashlib.sha256(json.dumps(cases, sort_keys=True).encode()).hexdigest()
        reports = [json.loads(Path(p).read_text()) for p in args.reports or []]
        regression = json.loads(Path(args.regression_report).read_text()) if args.regression_report else {}
        load = json.loads(Path(args.load_report).read_text()) if args.load_report else {}
        from .release import release_passes
        passed = release_passes(reports, regression, load, current, dataset_hash)
        print(json.dumps({"release": "pass" if passed else "blocked"}))
        return 0 if passed else 1
    if args.mode == "ablation" and args.ablation_mode == "replay":
        reports = {}
        for label, skills, repair in (("core", False, False), ("skills", True, False), ("skills-repair", True, True)):
            reports[label] = run(cases, Path(args.output) / label, skills=skills, repair=repair)
        print(json.dumps(reports, ensure_ascii=False, indent=2))
        return 0
    if args.mode == "load":
        if not args.base_url:
            parser.error("--base-url must point to an explicitly configured evaluation API")
        from .load import run_http_load
        report = run_http_load(args.base_url, cases, args.output)
        print(json.dumps({k: v for k, v in report.items() if k != "samples"}, indent=2))
        return 0 if report["metadata_consistent"] and report["p95_ms"] <= 20_000 and report["error_rate"] <= .01 else 1
    service = None
    if args.mode in {"integration", "live", "serve"} or (args.mode == "ablation" and args.ablation_mode == "live"):
        if not args.env_file:
            parser.error("An explicit, separate evaluation --env-file is required")
        from .bootstrap import build_evaluation_service
        service = build_evaluation_service(args.env_file, cases, freeze_reference=args.mode == "serve")
    if args.mode == "serve":
        import uvicorn
        from api import create_app
        try:
            uvicorn.run(create_app(service), host=args.host, port=args.port)
        finally:
            service.store.client.close()
        return 0
    if args.mode == "ablation":
        reports = {}
        for label, skills, repair in (("core", False, False), ("skills", True, False), ("skills-repair", True, True)):
            service.skills.enabled, service.repair_enabled = skills, repair
            service.versions.update(skills_enabled=skills, repair_enabled=repair)
            reports[label] = run(cases, Path(args.output) / label, mode="live", live_service=service)
        print(json.dumps(reports, ensure_ascii=False, indent=2))
        return 0
    summary = run(cases, args.output, mode=args.mode, live_service=service)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if summary["passed"] == summary["cases"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
