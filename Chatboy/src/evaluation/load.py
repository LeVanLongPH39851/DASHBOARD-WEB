"""Run the agreed 100-request evaluation scenario, with an initial burst of five."""
import json
import math
import time
import hashlib
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def run_load(service, cases, output, requests=100, rpm=8, burst=5):
    candidates = [c for c in cases if c["kind"] == "data"]
    if not candidates or any(c["review"]["status"] != "approved" for c in candidates):
        raise ValueError("Approved business cases are required for load evaluation")
    started = time.monotonic()
    futures = []
    with ThreadPoolExecutor(max_workers=burst) as workers:
        for index in range(requests):
            if index >= burst:
                due = started + (index - burst + 1) * 60 / rpm
                time.sleep(max(0, due - time.monotonic()))
            case = candidates[index % len(candidates)]
            context = service.new_context()
            context.reference_time = __import__("datetime").datetime.fromisoformat(case["reference_time"])
            futures.append(workers.submit(service.handle, {"type": "question", "question": case["question"]}, context))
        results = [f.result() for f in futures]
    durations = sorted(r.meta["duration_ms"] for r in results)
    report = {"environment": "evaluation", "transport": "service", "requests": requests, "rpm": rpm, "initial_burst": burst,
              "p95_ms": durations[math.ceil(len(durations) * .95) - 1],
              "error_rate": sum(r.status == "failed" for r in results) / requests,
              "versions": service.versions, "snapshot_id": candidates[0]["snapshot_id"],
              "wall_seconds": time.monotonic() - started}
    path = Path(output) / "load.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2))
    return report


def request_json(method, url, payload=None, timeout=50):
    data = json.dumps(payload).encode() if payload is not None else None
    request = urllib.request.Request(url, data=data, method=method,
                                     headers={'Content-Type': 'application/json'})
    try:
        response = urllib.request.urlopen(request, timeout=timeout)
    except urllib.error.HTTPError as exc:
        response = exc
    with response:
        return response.code, json.loads(response.read())


def run_http_load(base_url, cases, output, *, requests=100, rpm=8, burst=5,
                  request=request_json, monotonic=time.monotonic, sleep=time.sleep, smoke=False):
    """Measure client elapsed time, including HTTP queueing and serialization."""
    if requests < 1 or rpm <= 0 or not 1 <= burst <= requests:
        raise ValueError('Invalid load scenario')
    candidates = [c for c in cases if c['kind'] == 'data']
    if not candidates:
        raise ValueError('Data cases are required')
    if not smoke and any(c['review']['status'] != 'approved' or not c['review'].get('reviewer')
                         or not c.get('reference_queries') or c['snapshot_id'].startswith('synthetic')
                         for c in candidates):
        raise ValueError('Approved business cases and independent reference SQL are required')
    base_url = base_url.rstrip('/')
    status, metadata = request('GET', base_url + '/ready')
    environment = 'smoke' if smoke else 'evaluation'
    if status != 200 or metadata.get('status') != 'ready' or metadata.get('environment') != environment:
        raise ValueError('Load target is not the requested evaluation environment')
    if not metadata.get('versions') or {c['snapshot_id'] for c in candidates} != {metadata.get('snapshot_id')}:
        raise ValueError('Load target snapshot/version mismatch')
    if {c['reference_time'] for c in candidates} != {metadata.get('reference_time')}:
        raise ValueError('Load target reference time mismatch')

    from src.core.text_to_sql.runtime.errors import ERROR_HTTP
    def submit(index):
        case = candidates[index % len(candidates)]
        start = monotonic()
        errors, code, result = [], None, {}
        try:
            code, result = request('POST', base_url + '/api/v2/query',
                                   {'type': 'question', 'question': case['question']})
            if code != ERROR_HTTP.get(case['expected'].get('error'), 200):
                errors.append('http_status')
            if result.get('status') != case['expected']['status']:
                errors.append('status')
            if (result.get('error') or {}).get('code') != case['expected'].get('error'):
                errors.append('error_code')
            if result.get('meta', {}).get('versions') != metadata['versions']:
                errors.append('versions')
        except (OSError, ValueError, TypeError, AttributeError) as exc:
            errors.append(type(exc).__name__)
        return {'index': index, 'case_id': case['id'], 'elapsed_ms': (monotonic() - start) * 1000,
                'http_status': code, 'status': result.get('status') if isinstance(result, dict) else None,
                'errors': errors}

    started, futures = monotonic(), []
    with ThreadPoolExecutor(max_workers=burst) as workers:
        for index in range(requests):
            if index >= burst:
                due = started + (index - burst + 1) * 60 / rpm
                sleep(max(0, due - monotonic()))
            futures.append(workers.submit(submit, index))
        samples = [future.result() for future in futures]
    try:
        final_status, final_metadata = request('GET', base_url + '/ready')
        consistent = final_status == 200 and final_metadata == metadata
    except (OSError, ValueError):
        consistent = False
    durations = sorted(s['elapsed_ms'] for s in samples)
    report = {'transport': 'http', 'mode': 'smoke' if smoke else 'live', 'environment': environment,
              'requests': requests, 'rpm': rpm, 'initial_burst': burst,
              'p95_ms': durations[math.ceil(len(durations) * .95) - 1],
              'error_rate': sum(bool(s['errors']) for s in samples) / requests,
              'metadata_consistent': consistent, 'expected_status_checks': True, 'client_elapsed': True,
              'versions': metadata['versions'], 'snapshot_id': metadata['snapshot_id'],
              'reference_time': metadata['reference_time'],
              'dataset_hash': hashlib.sha256(json.dumps(cases, sort_keys=True).encode()).hexdigest(),
              'wall_seconds': monotonic() - started, 'samples': samples}
    path = Path(output) / 'load.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    return report
