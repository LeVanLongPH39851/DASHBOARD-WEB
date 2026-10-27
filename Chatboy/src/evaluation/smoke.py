"""Isolated image/HTTP/Redis smoke tests. No LLM or Doris credentials are read."""
import argparse
import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path

import redis

from config.doris_config import QueryResult
from src.core.text_to_sql.runtime.clarification import RedisClarificationStore
from src.core.text_to_sql.runtime.context import CURRENT_CONTEXT
from src.core.text_to_sql.runtime.service import ChatService
from .load import request_json, run_http_load

REFERENCE_TIME = '2026-10-24T10:00:00+07:00'
PREFIX = 'chatboy:smoke:v2.2:'
COUNTER = PREFIX + 'queries'


class SmokeExecutor:
    def __init__(self, client):
        self.client = client

    def execute_result(self, sql, params):
        context = CURRENT_CONTEXT.get()
        with context.stage('doris_fixture'):
            self.client.incr(COUNTER)
            # Keep a real concurrent claim window without calling an external DB.
            time.sleep(.15)
            if re.search(r'\bAS date\b', sql):
                rows = ({'date': str(params['time_start'])[:10], 'total_channel_views': 120},)
                columns = ('date', 'total_channel_views')
            else:
                columns = ('total_channel_views',)
                rows = () if str(params['time_start']).startswith('2025-04-01') else ({'total_channel_views': 120},)
            context.consume_rows(len(rows))
            return QueryResult(columns, rows)


def create_smoke_service(client):
    service = ChatService(llm=None, executor=SmokeExecutor(client),
                          store=RedisClarificationStore(client, prefix=PREFIX))
    service.reference_time = datetime.fromisoformat(REFERENCE_TIME)
    service.evaluation_metadata = {'environment': 'smoke', 'snapshot_id': 'synthetic-smoke-v22',
                                   'reference_time': REFERENCE_TIME}
    return service


def verify(urls, client, output, *, load_requests=100, rpm=8):
    assert len(urls) == 2, 'Two replicas are required'
    checks = []
    for url in urls:
        status, payload = request_json('GET', url + '/health')
        assert status == 200 and payload['version'] == '2.2.0'
        status, payload = request_json('GET', url + '/ready')
        assert status == 200 and payload['environment'] == 'smoke'
    checks.append('both_image_replicas_healthy')
    def post(url, payload):
        return request_json('POST', url + '/api/v2/query', payload)
    status, first = post(urls[0], {'type': 'question', 'question': 'Xu hướng lượt xem VTV1'})
    assert status == 200 and first['status'] == 'needs_clarification', first
    clarification = first['clarification']
    key = PREFIX + clarification['id']
    ttl = client.pttl(key)
    payload = {'type': 'clarification', 'clarification_id': clarification['id'], 'revision': 1}
    before = int(client.get(COUNTER) or 0)
    for answer in ('abc', 'ngày 31/02', 'ngày 2025-02-29'):
        status, invalid = post(urls[1], {**payload, 'answers': {'time_range': answer}})
        assert status == 422 and invalid['error']['field_errors']
        assert invalid['clarification'] == clarification
        assert client.pttl(key) <= ttl
        envelope = json.loads(client.get(key))
        assert json.loads(envelope['state'])['rounds'] == 0 and not envelope['claims']
    assert int(client.get(COUNTER) or 0) == before
    checks.append('invalid_input_releases_claim_without_spending_round_or_extending_ttl')
    fixed = {**payload, 'answers': {'time_range': 'từ 2026-06-01 đến 2026-06-02'}}
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = [pool.submit(post, urls[i % 2], fixed) for i in range(5)]
        replies = [future.result() for future in futures]
    assert any(code == 200 and body['status'] == 'answered' for code, body in replies), replies
    assert all(code == 200 and body['status'] == 'answered' or
               code == 409 and body['error']['code'] == 'clarification_conflict' for code, body in replies)
    status, replay = post(urls[1], fixed)
    assert status == 200 and replay['meta']['replayed'] is True
    assert int(client.get(COUNTER) or 0) == before + 1
    assert client.pttl(key) <= ttl
    status, conflict = post(urls[0], {**payload, 'answers': {'time_range': 'quý trước'}})
    assert status == 409 and conflict['error']['code'] == 'clarification_conflict'
    checks.append('two_replica_race_executes_once_then_replays')
    client.pexpire(key, 1)
    time.sleep(.02)
    status, expired = post(urls[1], fixed)
    assert status == 409 and expired['error']['code'] == 'clarification_expired'
    checks.append('redis_expiry_rejects_old_revision')
    status, invalid = post(urls[0], {'type': 'question', 'question': 'Lượt xem VTV1 ngày 31/02'})
    assert status == 422 and invalid['error']['code'] == 'invalid_input'
    question = 'So sánh lượt xem VTV1 quý I năm 2025 và quý II năm 2025'
    status, partial = post(urls[1], {'type': 'question', 'question': question})
    assert status == 200 and partial['meta']['data_status'] == 'partial', partial
    assert partial['evidence']['result_coverage']['missing_period_ids'] == ['b']
    status, legacy = request_json('POST', urls[0] + '/api/query', {'question': question})
    assert status == 200 and legacy['data_status'] == 'partial'
    checks.append('http_v2_and_legacy_expose_partial_coverage')
    case = {'id': 'smoke-calendar', 'kind': 'data', 'question': 'Lượt xem VTV1 quý trước',
            'snapshot_id': 'synthetic-smoke-v22', 'reference_time': REFERENCE_TIME,
            'review': {'status': 'pending'}, 'expected': {'status': 'answered'}}
    report = run_http_load(urls[0], [case], output, requests=load_requests, rpm=rpm,
                           burst=min(5, load_requests), smoke=True)
    assert report['error_rate'] == 0 and report['metadata_consistent'], report
    checks.append('real_http_load_with_fixture_database')
    result = {'checks': checks, 'passed': len(checks), 'transport': 'http', 'redis': 'real',
              'replicas': 2, 'versions': report['versions'], 'release_eligible': False,
              'note': 'Rules and synthetic data; no live LLM/Doris or business acceptance.',
              'load': {k: v for k, v in report.items() if k != 'samples'}}
    Path(output).mkdir(parents=True, exist_ok=True)
    (Path(output) / 'smoke.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['serve', 'verify'])
    parser.add_argument('--urls', nargs=2)
    parser.add_argument('--output', default='/artifacts')
    parser.add_argument('--requests', type=int, default=100)
    parser.add_argument('--rpm', type=float, default=8)
    args = parser.parse_args()
    if os.environ.get('CHATBOY_ENV') != 'smoke':
        parser.error('This entrypoint requires CHATBOY_ENV=smoke')
    client = redis.Redis.from_url(os.environ['REDIS_URL'], socket_connect_timeout=1, socket_timeout=1)
    try:
        if args.mode == 'serve':
            import uvicorn
            from api import create_app
            uvicorn.run(create_app(create_smoke_service(client)), host='0.0.0.0', port=8010)
        else:
            print(json.dumps(verify(args.urls, client, args.output, load_requests=args.requests, rpm=args.rpm), indent=2))
    finally:
        client.close()


if __name__ == '__main__':
    main()
