import copy
from datetime import datetime
from unittest.mock import patch

import pytest

from src.evaluation.load import run_http_load
from src.evaluation.release import release_passes


def cases():
    return [{'id': 'approved', 'kind': 'data', 'question': 'Lượt xem VTV1 hôm qua',
             'snapshot_id': 'reviewed-v1', 'reference_time': '2026-10-24T10:00:00+07:00',
             'review': {'status': 'approved', 'reviewer': 'fixture-reviewer'},
             'reference_queries': [{'sql': 'SELECT 1'}], 'expected': {'status': 'answered'}}]


def metadata():
    return {'status': 'ready', 'environment': 'evaluation', 'snapshot_id': 'reviewed-v1',
            'reference_time': cases()[0]['reference_time'], 'versions': {'workflow': 'fixture'}}


@pytest.mark.parametrize('key,value', [('environment', 'runtime'), ('snapshot_id', 'wrong'),
                                      ('reference_time', '2026-10-25T10:00:00+07:00')])
def test_http_load_refuses_wrong_target_before_post(tmp_path, key, value):
    meta = {**metadata(), key: value}
    with patch('src.evaluation.load.request_json') as unused:
        def request(method, url, payload=None):
            assert method == 'GET'
            return 200, meta
        with pytest.raises(ValueError):
            run_http_load('http://fixture', cases(), tmp_path, requests=5, request=request)


@pytest.mark.parametrize('body_status,code,error', [('answered', 200, 0), ('unsupported', 200, 1),
                                                 ('needs_clarification', 200, 1), ('failed', 500, 1)])
def test_http_load_counts_expected_status_mismatch(tmp_path, body_status, code, error):
    def request(method, url, payload=None):
        if method == 'GET':
            return 200, metadata()
        return code, {'status': body_status, 'meta': {'versions': metadata()['versions']}}
    result = run_http_load('http://fixture', cases(), tmp_path, requests=5, request=request)
    assert result['transport'] == 'http' and result['client_elapsed'] is True
    assert result['error_rate'] == error
    assert len(result['samples']) == 5
    assert result['metadata_consistent'] is True


def test_http_load_detects_server_rollout_during_run(tmp_path):
    calls = 0
    def request(method, url, payload=None):
        nonlocal calls
        if method == 'GET':
            calls += 1
            return 200, {**metadata(), 'versions': {'workflow': 'new'}} if calls == 2 else metadata()
        return 200, {'status': 'answered', 'meta': {'versions': metadata()['versions']}}
    result = run_http_load('http://fixture', cases(), tmp_path, requests=5, request=request)
    assert not result['metadata_consistent']


def gate_evidence():
    versions = {'workflow': 'current', 'catalog': 'current', 'skills': 'current', 'prompt': 'current'}
    reports = [{'run_id': str(i), 'mode': 'live', 'eligible': True, 'dataset_hash': 'dataset',
                'versions': versions, 'facts_and_render_accuracy': 1, 'snapshot_ids': ['reviewed-v1']}
               for i in range(3)]
    regression = {'passed': 300, 'total': 300, 'exit_status': 0, 'deselected': 0, 'versions': versions}
    load = {'transport': 'http', 'environment': 'evaluation', 'mode': 'live', 'requests': 100,
            'rpm': 8, 'initial_burst': 5, 'client_elapsed': True, 'expected_status_checks': True,
            'metadata_consistent': True, 'reference_time': cases()[0]['reference_time'],
            'dataset_hash': 'dataset', 'versions': versions, 'snapshot_id': 'reviewed-v1',
            'p95_ms': 2000, 'error_rate': 0}
    return reports, regression, load, versions, 'dataset'


def test_release_gate_accepts_complete_matching_evidence():
    assert release_passes(*gate_evidence())


@pytest.mark.parametrize('key,value', [('transport', 'service'), ('environment', 'smoke'), ('mode', 'smoke'),
    ('requests', 99), ('rpm', 800), ('initial_burst', 1), ('metadata_consistent', False),
    ('client_elapsed', False), ('expected_status_checks', False), ('dataset_hash', 'old'),
    ('p95_ms', 20001), ('error_rate', .02)])
def test_release_gate_rejects_inadequate_load_evidence(key, value):
    reports, regression, load, versions, dataset = gate_evidence()
    load[key] = value
    assert not release_passes(reports, regression, load, versions, dataset)


def test_evaluation_bootstrap_never_accepts_production_dotenv(tmp_path):
    from src.evaluation.bootstrap import build_evaluation_service
    path = tmp_path / '.env'
    path.write_text('CHATBOY_ENV=evaluation')
    with patch('src.core.text_to_sql.runtime.bootstrap.build_service') as build:
        with pytest.raises(ValueError):
            build_evaluation_service(path, cases())
        assert not build.called


def test_evaluation_bootstrap_rejects_snapshot_mismatch_before_dependencies(tmp_path):
    from src.evaluation.bootstrap import build_evaluation_service
    path = tmp_path / 'evaluation.env'
    path.write_text('CHATBOY_ENV=evaluation\nEVAL_SNAPSHOT_ID=wrong\n')
    with patch('src.core.text_to_sql.runtime.bootstrap.build_service') as build:
        with pytest.raises(ValueError):
            build_evaluation_service(path, cases())
        assert not build.called


def test_reference_clock_does_not_freeze_runtime_clock():
    import fakeredis
    from src.evaluation.smoke import create_smoke_service, REFERENCE_TIME
    client = fakeredis.FakeRedis()
    try:
        service = create_smoke_service(client)
        ctx = service.new_context()
        assert ctx.reference_time == datetime.fromisoformat(REFERENCE_TIME)
        service.clock.sleep(.002)
        assert service.clock.monotonic() > ctx.started
        assert ctx.deadline - ctx.started == 45
    finally:
        client.close()
