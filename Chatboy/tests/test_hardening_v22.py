"""Regressions for the architecture review: assert behavior at the service boundary."""
import copy
import json
import asyncio
from dataclasses import replace
from datetime import datetime
from unittest.mock import patch

import fakeredis
import pytest

from src.core.text_to_sql.runtime.clarification import RedisClarificationStore
from src.core.text_to_sql.runtime.context import MemoryTraceSink
from src.core.text_to_sql.runtime.service import ChatService
from src.evaluation.fixtures import FixedClock, ReplayDoris, ReplayLLM
from src.evaluation.harness import load_cases


@pytest.fixture
def make_service():
    clients = []
    cases = {c['id']: c for c in load_cases('evaluation/cases.jsonl')}
    def make(case_id='fault-10', modify=None, llm_type=ReplayLLM):
        case = copy.deepcopy(cases[case_id])
        case.pop('fault', None)
        if modify:
            modify(case)
        client = fakeredis.FakeRedis()
        clients.append(client)
        service = ChatService(llm=llm_type(case), executor=ReplayDoris(case),
            store=RedisClarificationStore(client), clock=FixedClock(), trace=MemoryTraceSink())
        return service, case
    yield make
    for client in clients:
        client.close()


def ask(service, question):
    return service.handle({'type': 'question', 'question': question})


@pytest.mark.parametrize('scenario', ['omit_all', 'omit_second', 'wrong_metric'])
def test_semantic_mismatch_never_executes_data_query(make_service, scenario):
    def modify(case):
        if scenario == 'omit_all':
            case['extraction']['dimensions'] = []
        elif scenario == 'omit_second':
            case['question'] = 'Lượt xem VTV1 và VTV3 ngày 2026-06-10'
        else:
            case['extraction']['metric_id'] = 'rating.average_reach'
            case['results'] = [{'columns': ['ave_reach'], 'rows': [{'ave_reach': 123}]}]
    service, case = make_service(modify=modify)
    result = ask(service, case['question'])
    assert result.status == 'failed'
    assert result.error['code'] == 'invalid_semantics'
    assert result.meta['repairs'] == 1
    assert service.executor.calls == []


@pytest.mark.parametrize('text,start,end', [
    ('quý này', '2026-10-01', '2026-10-25'),
    ('quý trước', '2026-07-01', '2026-10-01'),
    ('quý I năm 2025', '2025-01-01', '2025-04-01'),
    ('Q3 năm 2025', '2025-07-01', '2025-10-01'),
    ('Q3/2025', '2025-07-01', '2025-10-01'),
    ('quý1 2025', '2025-01-01', '2025-04-01'),
    ('năm2025', '2025-01-01', '2026-01-01'),
    ('năm 2025', '2025-01-01', '2026-01-01'),
    ('năm trước', '2025-01-01', '2026-01-01'),
    ('năm nay', '2026-01-01', '2026-10-25'),
    ('từ quý 2 đến quý 3 năm 2025', '2025-04-01', '2025-10-01'),
    ('từ năm 2024 đến năm 2025', '2024-01-01', '2026-01-01'),
])
def test_calendar_quarters_years(make_service, text, start, end):
    service, _ = make_service()
    result = ask(service, 'Lượt xem VTV1 ' + text)
    assert result.status == 'answered', result.as_v2()
    assert result.evidence['plan']['time_range']['start'] == start
    assert result.evidence['plan']['time_range']['end'] == end
    assert result.evidence['time_resolution']['status'] == 'resolved'


@pytest.mark.parametrize('text', ['ngày 31/02', 'ngày 2025-02-29', 'quý 5 năm 2025', 'tháng 13',
                                  'tháng 6 và 13', 'ngày 9999-12-31'])
def test_invalid_time_is_not_reinterpreted(make_service, text):
    service, _ = make_service()
    result = ask(service, 'Lượt xem VTV1 ' + text)
    assert result.http_status == 422
    assert result.error['code'] == 'invalid_input'
    assert service.executor.calls == []


def test_unknown_time_clarifies_without_defaulting(make_service):
    service, _ = make_service()
    result = ask(service, 'Lượt xem VTV1 dịp Tết')
    assert result.status == 'needs_clarification'
    assert result.clarification['fields'][0]['id'] == 'time_range'
    assert service.executor.calls == []


def test_bad_clarification_can_be_corrected_without_spending_round(make_service):
    service, case = make_service('clarification-01')
    initial = ask(service, case['question'])
    clarification = initial.clarification
    request = {'type': 'clarification', 'clarification_id': clarification['id'], 'revision': 1}
    key = service.store.prefix + clarification['id']
    ttl = service.store.client.pttl(key)
    for value in ('abc', 'ngày 31/02', 'ngày 2025-02-29'):
        result = service.handle({**request, 'answers': {'time_range': value}})
        assert result.error['code'] == 'invalid_input'
        assert result.clarification == clarification
        assert result.error['field_errors'][0]['field'] == 'time_range'
        assert service.store.client.pttl(key) <= ttl
    fixed = service.handle({**request, 'answers': {'time_range': 'từ 2026-06-01 đến 2026-06-02'}})
    assert fixed.status == 'answered'
    replay = service.handle({**request, 'answers': {'time_range': 'từ 2026-06-01 đến 2026-06-02'}})
    assert replay.meta['replayed'] is True
    assert len(service.executor.calls) == 1


@pytest.mark.parametrize('target', [
    'src.core.text_to_sql.d_009_rating_plan_compiler.RatingPlanCompiler.compile',
    'src.core.text_to_sql.d_011_rating_sql_renderer.RatingSQLRenderer.render',
    'src.core.text_to_sql.d_013_pattern_compute.PatternCompute.process',
])
@pytest.mark.parametrize('exception', [RuntimeError, ValueError])
def test_unexpected_errors_are_500(make_service, target, exception):
    service, case = make_service()
    with patch(target, side_effect=exception('private-internal-detail')):
        result = ask(service, case['question'])
    assert result.http_status == 500
    assert result.status == 'failed' and result.error['code'] == 'internal_error'
    assert 'private-internal-detail' not in result.reply
    final = service.trace.events[-1]
    assert final['stage'] == 'request' and final['error_code'] == 'internal_error'


def test_missing_period_is_partial(make_service):
    def modify(case):
        case['results'][1]['rows'] = []
    service, case = make_service('data-period_comparison-01', modify)
    result = ask(service, case['question'])
    assert result.status == 'answered'
    assert result.meta['data_status'] == 'partial'
    assert result.as_v2()['evidence']['result_coverage']['missing_period_ids'] == ['b']
    assert result.evidence['analysis']['data']['comparisons'][0]['delta'] is None
    assert result.as_legacy()['data_status'] == 'partial'


def test_zero_baseline_is_complete_but_relative_delta_undefined(make_service):
    def modify(case):
        case['results'][0]['rows'][0]['ave_reach'] = 0
    service, case = make_service('data-period_comparison-01', modify)
    result = ask(service, case['question'])
    assert result.meta['data_status'] == 'available'
    comparison = result.evidence['analysis']['data']['comparisons'][0]
    assert comparison['delta'] == 120 and comparison['delta_pct'] is None


def test_semantic_repair_restores_filter_within_global_budget(make_service):
    class RepairingLLM(ReplayLLM):
        def complete_text(self, **kwargs):
            value = super().complete_text(**kwargs)
            if 'Trích xuất semantic input' in kwargs['prompt'] and self.extractions == 1:
                payload = json.loads(value)
                payload['dimensions'] = []
                return json.dumps(payload)
            return value
    service, case = make_service(llm_type=RepairingLLM)
    result = ask(service, case['question'])
    assert result.status == 'answered'
    assert result.meta['repairs'] == 1 and result.meta['llm_attempts'] == 4
    assert len(service.executor.calls) == 1
    assert result.evidence['plan']['filters'][0]['value'] == 'VTV1'


@pytest.mark.parametrize('change,case_id', [
    ('filters', 'fault-10'), ('dimensions', 'data-dimension_breakdown-01'),
    ('limit', 'data-rank_lookup-01'), ('order_by', 'data-rank_lookup-01'), ('time', 'fault-10'),
])
def test_compiler_cannot_silently_drop_confirmed_requirements(make_service, change, case_id):
    from src.core.text_to_sql.d_009_rating_plan_compiler import RatingPlanCompiler
    original = RatingPlanCompiler.compile
    def tampered(self, *args, **kwargs):
        plan = original(self, *args, **kwargs)
        if change == 'time':
            return replace(plan, time_range=replace(plan.time_range, start='2020-01-01'))
        return replace(plan, **{change: None if change == 'limit' else ()})
    service, case = make_service(case_id)
    with patch.object(RatingPlanCompiler, 'compile', tampered):
        result = ask(service, case['question'])
    assert result.error['code'] in {'internal_error', 'invalid_semantics'}
    assert not service.executor.calls


def test_unknown_metric_requires_explicit_choice_and_invalid_choice_is_retryable(make_service):
    service, _ = make_service()
    first = ask(service, 'Độ phổ biến của VTV1 hôm qua')
    assert first.status == 'needs_clarification'
    assert first.evidence['semantic_coverage']['status'] == 'ambiguous'
    request = {'type': 'clarification', 'clarification_id': first.clarification['id'], 'revision': 1}
    wrong = service.handle({**request, 'answers': {'metric': 'invented_metric'}})
    assert wrong.http_status == 422 and wrong.clarification == first.clarification
    assert not service.executor.calls
    result = service.handle({**request, 'answers': {'metric': 'rating.total_channel_views'}})
    assert result.status == 'answered'
    assert any(e['field'] == 'metric' and e['source'] == 'clarification'
               for e in result.evidence['semantic_coverage']['evidence'])


def test_named_program_masks_channel_and_time_mentions(make_service):
    name = 'VTV1 năm 2025'
    def modify(case):
        case['extraction'] = {'metric_id': 'program.airtime_duration', 'dimensions': [
            {'dimension_id': 'agg_info_program.program_name', 'raw_values': [name], 'roles': ['filter']}]}
        case['canonical_rows'] = [{'program_name': name, 'similarity': 1}]
        case['results'] = [{'columns': ['program_airtime_duration'], 'rows': [{'program_airtime_duration': 3600}]}]
    service, _ = make_service(modify=modify)
    result = ask(service, f'Thời lượng phát chương trình "{name}"')
    assert result.status == 'answered', result.as_v2()
    assert result.evidence['time_resolution']['status'] == 'absent'
    assert result.evidence['plan']['time_range']['start'] == '2026-10-23'
    assert len(result.evidence['plan']['filters']) == 1


def test_spaced_channel_alias_binds_and_is_not_silently_omitted(make_service):
    def modify(case):
        case['extraction']['dimensions'][0]['raw_values'] = ['VTV 1']
    service, _ = make_service(modify=modify)
    result = ask(service, 'Lượt xem VTV 1 hôm qua')
    assert result.status == 'answered'
    assert result.evidence['plan']['filters'][0]['value'] == 'VTV1'
    service, _ = make_service(modify=lambda c: c['extraction'].update(dimensions=[]))
    result = ask(service, 'Lượt xem VTV 1 hôm qua')
    assert result.error['code'] == 'invalid_semantics' and not service.executor.calls


@pytest.mark.parametrize('question,reason', [
    ('Lượt xem ngoại trừ VTV1 hôm qua', 'unsupported_filter_negation'),
    ('Lượt xem VTV1 theo quý năm 2025', 'unsupported_time_grain'),
    ('Lượt xem và rating VTV1 hôm qua', 'unsupported_multiple_metrics'),
])
def test_known_unsupported_semantics_do_not_execute(make_service, question, reason):
    service, _ = make_service()
    result = ask(service, question)
    assert result.status == 'unsupported' and result.evidence['reason'] == reason
    assert not service.executor.calls


@pytest.mark.parametrize('time_text', ['gần đây', 'đầu tháng 6', 'dịp Tết năm 2025', 'cuối tuần', 'mùa hè'])
def test_partly_recognized_time_is_not_silently_broadened(make_service, time_text):
    service, _ = make_service()
    result = ask(service, 'Lượt xem VTV1 ' + time_text)
    assert result.status == 'needs_clarification'
    assert not service.executor.calls


def test_quarter_comparison_direction_and_cross_year():
    from datetime import date
    from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
    pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 1, 2))
    extraction = pipeline.context_extractor.extract('Lượt xem quý này so với quý trước')
    resolution = pipeline.compiler.time_resolver.inspect(extraction, comparison=True)
    assert resolution.status == 'resolved'
    assert [(r.start, r.end) for r in resolution.resolved_ranges] == [
        ('2025-10-01', '2026-01-01'), ('2026-01-01', '2026-01-03')]


@pytest.mark.parametrize('grain', [('ngày', 'day'), ('tuần', 'week'), ('tháng', 'month')])
def test_explicit_grain_overrides_calendar_default(grain):
    from datetime import date
    from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
    pipeline = RatingQueryPipeline(today_provider=lambda: date(2026, 1, 2))
    result = pipeline.generate('Xu hướng lượt xem VTV1 năm 2024 theo ' + grain[0])
    assert result.outcome.kind == 'ready'
    assert result.query_plan.time_range.grain == grain[1]
    assert result.query_plan.time_range.end == '2025-01-01'


def test_old_release_token_cannot_release_new_claim():
    from src.core.text_to_sql.runtime.errors import WorkflowError
    client = fakeredis.FakeRedis()
    store = RedisClarificationStore(client)
    try:
        identifier, _ = store.create({'rounds': 0})
        _, _, old_token = store.claim(identifier, 1, {'time': 'bad'})
        store.release_invalid_input(identifier, 1, old_token)
        _, _, token = store.claim(identifier, 1, {'time': 'valid'})
        with pytest.raises(WorkflowError):
            store.release_invalid_input(identifier, 1, old_token)
        store.complete(identifier, 1, token, {'status': 'answered'})
        with pytest.raises(WorkflowError):
            store.release_invalid_input(identifier, 1, token)
        assert store.claim(identifier, 1, {'time': 'valid'})[0] == 'cached'
    finally:
        client.close()


def test_failed_invalid_input_release_never_completes_revision(make_service):
    from src.core.text_to_sql.runtime.errors import WorkflowError
    service, case = make_service('clarification-01')
    first = ask(service, case['question'])
    with patch.object(service.store, 'release_invalid_input', side_effect=WorkflowError('dependency_unavailable')):
        with patch.object(service.store, 'complete') as complete:
            result = service.handle({'type': 'clarification', 'clarification_id': first.clarification['id'],
                                     'revision': 1, 'answers': {'time_range': 'abc'}})
    assert result.http_status == 503 and not complete.called
    assert not service.executor.calls


def test_missing_requested_dimension_is_partial(make_service):
    service, case = make_service('data-dimension_comparison-05',
                                 lambda case: case['results'][0]['rows'].pop())
    result = ask(service, case['question'])
    assert result.meta['data_status'] == 'partial', result.as_v2()
    assert result.evidence['result_coverage']['missing_groups']
    assert result.evidence['analysis']['data']['comparisons'][0]['delta'] is None


@pytest.mark.parametrize('rows', [[], [{'total_channel_views': None}]])
def test_empty_or_all_null_is_no_data(make_service, rows):
    service, case = make_service(modify=lambda c: c['results'][0].update(rows=rows))
    result = ask(service, case['question'])
    assert result.status == 'no_data' and result.meta['data_status'] == 'no_data'


def test_compute_function_bug_is_not_hidden_in_analysis(make_service):
    service, case = make_service('data-period_comparison-01')
    patterns = dict(service.catalog.patterns)
    patterns['period_comparison'] = replace(patterns['period_comparison'],
        compute_fn=lambda *args: (_ for _ in ()).throw(ValueError('private-compute-detail')))
    with patch.object(service.catalog, '_patterns', patterns):
        result = ask(service, case['question'])
    assert result.http_status == 500 and result.error['code'] == 'internal_error'
    assert 'private-compute-detail' not in json.dumps(result.as_v2())


def test_http_invalid_answer_keeps_revision_and_partial_is_public(make_service):
    import httpx
    from api import create_app
    service, case = make_service('clarification-01')
    async def run():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(service)), base_url='http://fixture') as client:
            first = (await client.post('/api/v2/query', json={'type': 'question', 'question': case['question']})).json()
            payload = {'type': 'clarification', 'clarification_id': first['clarification']['id'], 'revision': 1}
            invalid = await client.post('/api/v2/query', json={**payload, 'answers': {'time_range': 'abc'}})
            assert invalid.status_code == 422
            assert invalid.json()['clarification'] == first['clarification']
            assert invalid.json()['error']['field_errors'][0]['field'] == 'time_range'
            valid = await client.post('/api/v2/query', json={**payload, 'answers': {'time_range': 'từ 2026-06-01 đến 2026-06-02'}})
            assert valid.status_code == 200 and valid.json()['status'] == 'answered'
    asyncio.run(run())
