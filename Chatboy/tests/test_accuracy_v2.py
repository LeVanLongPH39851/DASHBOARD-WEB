from dataclasses import replace
from datetime import date
from decimal import Decimal
import asyncio
import json
import threading
from urllib.error import HTTPError
from unittest.mock import Mock

import fakeredis
import httpx
import pytest

from config.doris_config import DorisExecutor, QueryResult
from config.doris_bind_translator import translate_named_to_positional
from config.llm_config import LLMClient
from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.canonical_binding.matchers.doris_ngram import DorisNgramCanonicalMatcher
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
from src.core.text_to_sql.presentation import PresentationCatalog, format_number
from src.core.text_to_sql.query_plan import Filter, OrderSpec
from src.core.text_to_sql.runtime.context import RequestContext, RuntimeLimits, MemoryTraceSink, request_scope
from src.core.text_to_sql.runtime.clarification import RedisClarificationStore
from src.core.text_to_sql.runtime.contracts import ChatResult
from src.core.text_to_sql.runtime.errors import WorkflowError
from src.core.text_to_sql.runtime.service import ChatService
from src.core.text_to_sql.runtime.skills import SkillRegistry
from src.evaluation.fixtures import FixedClock, ReplayLLM, ReplayDoris
from src.evaluation.harness import load_cases, validate_dataset


@pytest.fixture
def pipeline():
    return RatingQueryPipeline(today_provider=lambda: date(2026,10,24))


def service(rows=None, columns=('total_channel_views',), **kwargs):
    rows = [{'total_channel_views': 123}] if rows is None else rows
    return ChatService(llm=None, executor=DorisExecutor(runner=lambda *args: QueryResult(columns, tuple(rows))),
                       store=RedisClarificationStore(fakeredis.FakeRedis()), clock=FixedClock(), trace=MemoryTraceSink(), **kwargs)


def test_single_kpi_uses_verified_value():
    result=service().handle({'type':'question','question':'Lượt xem VTV1 hôm qua'})
    assert result.status=='answered'
    assert '123 lượt' in result.reply and '2026-10-23' in result.reply and 'VTV1' in result.reply
    assert result.meta['llm_attempts']==0
    assert result.evidence['facts'][0]['value']==123


@pytest.mark.parametrize('value,expected',[(None,'no_data'),(0,'answered'),(Decimal('0.00'),'answered'),(-12,'answered')])
def test_null_zero_negative_are_distinct(value,expected):
    assert service([{'total_channel_views':value}]).handle({'type':'question','question':'Lượt xem VTV1 hôm qua'}).status==expected


@pytest.mark.parametrize('value',[True,'123',float('inf'),float('nan'),Decimal('NaN')])
def test_invalid_numbers_never_render(value):
    result=service([{'total_channel_views':value}]).handle({'type':'question','question':'Lượt xem VTV1 hôm qua'})
    assert result.error['code']=='invalid_result'


def test_empty_missing_alias_is_contract_error():
    result=service([],columns=('wrong',)).handle({'type':'question','question':'Lượt xem VTV1 hôm qua'})
    assert result.error['code']=='invalid_result'


def test_duplicate_groups_rejected(pipeline):
    plan=pipeline.generate('Lượt xem theo kênh hôm qua').query_plan
    validation=pipeline.result_validator.validate(plan,[{'channel':'VTV1','total_channel_views':1}]*2)
    assert validation.status=='invalid' and 'duplicate_group' in validation.errors


def test_june_august_queries_and_reversed_rows(pipeline):
    result=pipeline.generate('So sánh rating VTV1 tháng 6 và tháng 8')
    assert len(result.generated_sql.queries)==2
    a,b=result.generated_sql.queries
    assert (a.period_id,b.period_id)==('a','b')
    assert a.parameters['time_end'].startswith('2026-07-01')
    assert b.parameters['time_start'].startswith('2026-08-01')
    assert "DATE_FORMAT(rating_ott.date" not in a.sql
    processed=pipeline.process_rows(result.query_plan,[{'rating':Decimal('80'),'__period_id':'b'},{'rating':Decimal('100'),'__period_id':'a'}])
    assert processed.analysis['data']['comparisons'][0]['delta']==-20
    assert '-20,00' in processed.output.text


def test_comparison_missing_period_not_replaced(pipeline):
    plan=pipeline.generate('So sánh rating VTV1 tháng 6 và tháng 8').query_plan
    post=pipeline.process_rows(plan,[{'rating':100,'__period_id':'b'}])
    item=post.analysis['data']['comparisons'][0]
    assert item['value_a'] is None and item['delta'] is None
    assert 'chưa đủ dữ liệu' in post.output.text


def test_more_than_two_periods_clarifies(pipeline):
    result=pipeline.generate('So sánh rating VTV1 tháng 6 tháng 7 và tháng 8')
    assert result.generated_sql is None
    assert result.pattern_context.missing_fields==('comparison_periods',)


def test_iso_comparison_direction(pipeline):
    plan=pipeline.generate('So sánh rating VTV1 ngày 2026-08-02 so với ngày 2026-06-01').query_plan
    assert plan.comparison_spec.baseline.time_range.start=='2026-06-01'
    assert plan.comparison_spec.target.time_range.start=='2026-08-02'


def test_program_listing_half_open():
    case=next(c for c in load_cases('evaluation/cases.jsonl') if c['id']=='data-dimension_listing-01')
    p=RatingQueryPipeline(llm_client=ReplayLLM(case),today_provider=lambda:date(2026,10,24))
    result=p.generate(case['question'])
    q=result.generated_sql.queries[0]
    assert ' < :time_end' in q.sql
    assert q.parameters['time_end']=='2026-06-02T00:00:00'
    assert 'LIMIT' not in q.sql


def test_trend_desc_uses_prior_chronological_value(pipeline):
    plan=pipeline.generate('Xu hướng lượt xem VTV1 theo ngày tuần trước').query_plan
    plan=replace(plan,order_by=(OrderSpec('agg_info_channel.date','desc'),))
    post=pipeline.process_rows(plan,[{'date':'2026-10-18','total_channel_views':120},{'date':'2026-10-17','total_channel_views':100}])
    assert post.analysis['data'][0]['mom_change_pct']==20
    assert post.analysis['data'][1]['mom_change_pct'] is None


def test_percent_and_duration_metadata(pipeline):
    p=PresentationCatalog(pipeline.catalog)
    assert p.format('rating.rating_percent',Decimal('12.345'))=='12,35%'
    assert p.format('rating.rating_percent',Decimal('-2'),delta=True)=='-2,00 điểm phần trăm'
    assert p.format('program.airtime_duration',3661)=='1 giờ 1 phút 1 giây'
    assert p.format('program.airtime_duration',-61)=='-1 phút 1 giây'
    assert format_number(Decimal('-0.005'))=='-0,01'
    assert len(p.metrics)==23


def test_lookup_failure_never_matches(pipeline):
    matcher=DorisNgramCanonicalMatcher(executor=Mock(side_effect=TimeoutError()))
    assert matcher.match(pipeline.catalog.get_dimension('agg_info_program.program_name'),'abc').status=='unavailable'


def test_fuzzy_requires_confirmation_and_uses_parameters(pipeline):
    execute=Mock(return_value=(['program_name','similarity'],[{'program_name':'THỜI SỰ 19H','similarity':.99}]))
    matcher=DorisNgramCanonicalMatcher(executor=execute)
    result=matcher.match(pipeline.catalog.get_dimension('agg_info_program.program_name'),'THỜI SỰ 19')
    assert result.status=='ambiguous' and result.canonical_value is None
    sql, params=execute.call_args.args
    assert ':name' in sql and params['name']=='THỜI SỰ 19'


def test_hallucinated_catalog_filter_repaired_or_rejected(pipeline):
    case={'intent':'data_query','pattern':'metric_lookup','extraction':{'metric_id':'rating.total_channel_views',
       'dimensions':[{'dimension_id':'agg_info_channel.channel','raw_values':['VTV3'],'roles':['filter']}]}}
    p=RatingQueryPipeline(llm_client=ReplayLLM(case))
    with request_scope(RequestContext(clock=FixedClock(),trace=MemoryTraceSink())) as ctx:
        with pytest.raises(WorkflowError,match='không hợp lệ'):
            p.generate('Lượt xem VTV1 hôm qua')
        assert ctx.repairs==1 and ctx.llm_calls==2


def test_global_physical_call_budget_and_retry():
    calls=[]
    response=Mock()
    response.__enter__=Mock(return_value=response)
    response.__exit__=Mock(return_value=False)
    response.read.return_value=b'{"choices":[{"message":{"content":"ok"}}],"usage":{"total_tokens":7}}'
    def transport(req,timeout):
        calls.append(timeout)
        if len(calls)==1: raise HTTPError('fixture',429,'rate',{},None)
        return response
    client=LLMClient(api_keys=['one','two','three','four','five'],model='fixture',transport=transport)
    ctx=RequestContext(clock=FixedClock(),trace=MemoryTraceSink())
    with request_scope(ctx):
        assert client.complete_text('test')=='ok'
        client.complete_text('test')
        client.complete_text('test')
        with pytest.raises(WorkflowError) as exc: client.complete_text('test')
    assert exc.value.code=='budget_exceeded'
    assert calls==[8,8,8,8] and ctx.retries==1


def test_retry_stops_after_one_even_with_many_keys():
    transport=Mock(side_effect=TimeoutError())
    client=LLMClient(api_keys=['one','two','three'],model='fixture',transport=transport)
    with request_scope(RequestContext(clock=FixedClock(),trace=MemoryTraceSink())):
        with pytest.raises(WorkflowError) as exc: client.complete_text('test')
    assert exc.value.code=='dependency_unavailable' and transport.call_count==2


def test_request_deadline_includes_queue():
    svc=service(limits=RuntimeLimits(concurrency=1,queue_s=.01))
    svc._slots.acquire()
    try:
        result=svc.handle({'type':'question','question':'Lượt xem VTV1'})
        assert result.error['code']=='busy'
    finally: svc._slots.release()
    ctx=svc.new_context()
    ctx.clock.sleep(46)
    assert svc.handle({'type':'question','question':'Lượt xem'},ctx).error['code']=='deadline_exceeded'


def test_resource_limit_without_silent_sql_limit():
    ctx=RequestContext(clock=FixedClock(),trace=MemoryTraceSink(),limits=RuntimeLimits(max_rows=2))
    executor=DorisExecutor(runner=lambda *args:QueryResult(('x',),({'x':1},{'x':2},{'x':3})))
    with request_scope(ctx), pytest.raises(WorkflowError) as exc:
        executor.execute_result('SELECT x FROM table_name',{})
    assert exc.value.code=='resource_exceeded'


def test_bind_translator_preserves_quoted_times_and_comments():
    sql,params=translate_named_to_positional("SELECT '12:30', ':name', x FROM t WHERE a=:name AND b=:name -- :fake",{'name':"O'Reilly"})
    assert sql=="SELECT '12:30', ':name', x FROM t WHERE a=%s AND b=%s -- :fake"
    assert params==("O'Reilly","O'Reilly")


def test_two_replicas_atomic_claim_replay_and_ttl():
    shared=fakeredis.FakeServer()
    a=RedisClarificationStore(fakeredis.FakeRedis(server=shared))
    b=RedisClarificationStore(fakeredis.FakeRedis(server=shared))
    identifier,state=a.create({'empty':[],'null':None})
    ttl=a.client.pttl(a.prefix+identifier)
    kind,claimed,token=a.claim(identifier,1,{'slot':'a'})
    assert kind=='claimed' and claimed['empty']==[] and claimed['null'] is None
    with pytest.raises(WorkflowError) as conflict: b.claim(identifier,1,{'slot':'b'})
    assert conflict.value.code=='clarification_conflict'
    with pytest.raises(WorkflowError): b.claim(identifier,1,{'slot':'a'})
    a.complete(identifier,1,token,{'rows':[],'nothing':None},{**state,'revision':2})
    assert b.claim(identifier,1,{'slot':'a'})[:2]==('cached',{'rows':[],'nothing':None})
    assert a.client.pttl(a.prefix+identifier)<=ttl
    b.client.delete(b.prefix+identifier)
    with pytest.raises(WorkflowError) as expired: a.claim(identifier,2,{'slot':'a'})
    assert expired.value.code=='clarification_expired'


def clarification_service(case):
    return ChatService(llm=ReplayLLM(case),executor=ReplayDoris(case),clock=FixedClock(),
      store=RedisClarificationStore(fakeredis.FakeRedis()),trace=MemoryTraceSink())


def test_clarification_freezes_original_clock_and_semantics():
    case=next(c for c in load_cases('evaluation/cases.jsonl') if c['id']=='clarification-01')
    case=json.loads(json.dumps(case))
    case['results'][0]['rows'][0]['date']='2026-10-17'
    case['results'][0]['rows'][1]['date']='2026-10-18'
    svc=clarification_service(case)
    first=svc.handle({'type':'question','question':case['question']})
    assert first.status=='needs_clarification'
    assert svc.executor.calls==[]
    svc.clock.instant=__import__('datetime').datetime.fromisoformat('2026-10-25T01:00:00+07:00')
    request={'type':'clarification','clarification_id':first.clarification['id'],'revision':1,
             'answers':{'time_range':'tuần trước'}}
    answer=svc.handle(request)
    assert answer.status=='answered'
    assert answer.evidence['plan']['time_range']=={'start':'2026-10-17','end':'2026-10-24','grain':'day'}
    calls=len(svc.executor.calls)
    again=svc.handle(request)
    assert again.reply==answer.reply and again.meta['replayed']
    assert len(svc.executor.calls)==calls


def test_clarification_rejects_unrequested_fields_and_stale_versions():
    case=next(c for c in load_cases('evaluation/cases.jsonl') if c['id']=='clarification-01')
    for alter in ('answers','version'):
        svc=clarification_service(case)
        first=svc.handle({'type':'question','question':case['question']})
        answers={'time_range':'tuần trước'}
        if alter=='answers': answers['metric']='program.airtime_duration'
        else: svc.versions['catalog']='new-version'
        result=svc.handle({'type':'clarification','clarification_id':first.clarification['id'],'revision':1,'answers':answers})
        assert result.error['code']==('invalid_input' if alter=='answers' else 'clarification_expired')
        assert svc.executor.calls==[]


def test_redis_down_independent_query_still_works():
    svc=service()
    svc.store.client=Mock(set=Mock(side_effect=ConnectionError()))
    assert svc.handle({'type':'question','question':'Lượt xem VTV1 hôm qua'}).status=='answered'


def test_api_decimal_legacy_and_v2():
    from api import create_app
    svc=service([{'total_channel_views':Decimal('9007199254740993.25')}])
    app=create_app(svc)
    async def check():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://fixture') as client:
            v2=await client.post('/api/v2/query',json={'type':'question','question':'Lượt xem VTV1 hôm qua'})
            assert v2.status_code==200
            assert v2.json()['data']['rows'][0]['total_channel_views']=='9007199254740993.25'
            assert v2.json()['data']['columns'][0]['type']=='decimal'
            legacy=await client.post('/api/query',json={'question':'Lượt xem VTV1 hôm qua'})
            assert '9007199254740993.25' in legacy.text
            assert json.loads(legacy.text,parse_float=Decimal)['data']['rows'][0]['total_channel_views']==Decimal('9007199254740993.25')
            invalid=await client.post('/api/v2/query',json={'type':'question','question':'   '})
            assert invalid.status_code==422
            retired=await client.post('/api/dictionary/program-names/sync',json={'programs':[]})
            assert retired.status_code==410
    asyncio.run(check())


def test_api_error_http_mapping():
    from api import create_app
    svc=service([{'wrong':1}],columns=('wrong',))
    async def check():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app(svc)),base_url='http://fixture') as c:
            response=await c.post('/api/v2/query',json={'type':'question','question':'Lượt xem VTV1 hôm qua'})
            assert response.status_code==502 and response.json()['error']['code']=='invalid_result'
    asyncio.run(check())


def test_dataset_coverage_and_skill_references():
    catalog=RatingCatalog.load()
    assert not validate_dataset(load_cases('evaluation/cases.jsonl'),catalog)
    skills=SkillRegistry(catalog)
    assert len(skills.metadata)==5
    assert set(skills.select('data_query'))=={'rating-semantics','rating-channel','rating-program'}


def test_program_channel_count_renders_from_grain():
    case=next(c for c in load_cases('evaluation/cases.jsonl') if c.get('extraction',{}).get('metric_id')=='program.channel_count' and c['kind']=='data')
    pipeline=RatingQueryPipeline(llm_client=ReplayLLM(case),today_provider=lambda:date(2026,10,24))
    result=pipeline.generate(case['question'])
    assert result.error is None
    assert 'COUNT(DISTINCT rating_ott.channel_name_tvd)' in result.rendered_sql.sql


def test_grouped_period_comparison_keeps_missing_group(pipeline):
    plan=pipeline.generate('So sánh rating VTV1 tháng 6 và tháng 8').query_plan
    plan=replace(plan,dimensions=('agg_info_channel.channel',),filters=())
    rows=[{'channel_name_tvd':'VTV1','rating':100,'__period_id':'a'},
          {'channel_name_tvd':'VTV1','rating':120,'__period_id':'b'},
          {'channel_name_tvd':'VTV3','rating':80,'__period_id':'b'}]
    result=pipeline.process_rows(plan,rows)
    comparisons=result.analysis['data']['comparisons']
    assert comparisons[0]['delta']==20
    assert comparisons[1]['value_a'] is None and comparisons[1]['delta'] is None
    assert 'chưa đủ dữ liệu' in result.output.text


def test_missing_dimension_baseline_is_not_substituted(pipeline):
    plan=pipeline.generate('So sánh rating VTV1 và VTV3 hôm qua').query_plan
    post=pipeline.process_rows(plan,[{'channel_name_tvd':'VTV3','rating':100}])
    comparison=post.analysis['data']['comparisons'][0]
    assert comparison['group_a']=='VTV1' and comparison['value_a'] is None
    assert comparison['value_b']==100 and comparison['delta'] is None


def test_fractional_delta_is_not_truncated_by_integer_baseline(pipeline):
    plan=pipeline.generate('So sánh rating% VTV1 tháng 6 và tháng 8').query_plan
    post=pipeline.process_rows(plan,[{'rating_percent':0,'__period_id':'a'}, {'rating_percent':Decimal('12.345'),'__period_id':'b'}])
    assert post.analysis['data']['comparisons'][0]['delta']==Decimal('12.345')


def test_huge_decimal_serializes_without_float():
    value=Decimal('12345678901234567890123456789012345678.25')
    result=service([{'total_channel_views':value}]).handle({'type':'question','question':'Lượt xem VTV1 hôm qua'})
    assert result.status=='answered'
    assert result.as_v2()['data']['rows'][0]['total_channel_views']==str(value)


def test_more_than_two_periods_on_one_side_rejected(pipeline):
    result=pipeline.generate('So sánh rating VTV1 tháng 6 và tháng 7 so với tháng 8')
    assert result.generated_sql is None and result.pattern_context.missing_fields==('comparison_periods',)


def test_doris_sets_server_timeout_and_closes_on_overflow(monkeypatch):
    import mysql.connector
    connection=Mock()
    cursor=connection.cursor.return_value
    cursor.with_rows=True
    cursor.column_names=('x',)
    cursor.fetchmany.return_value=[{'x':1},{'x':2},{'x':3}]
    connect=Mock(return_value=connection)
    monkeypatch.setattr(mysql.connector,'connect',connect)
    executor=DorisExecutor(host='fixture',database='fixture',user='fixture')
    with request_scope(RequestContext(clock=FixedClock(),trace=MemoryTraceSink(),limits=RuntimeLimits(max_rows=2))):
        with pytest.raises(WorkflowError) as error:
            executor.execute_result('SELECT x FROM t WHERE x > :n',{'n':0})
    assert error.value.code=='resource_exceeded'
    assert cursor.execute.call_args_list[0].args==('SET query_timeout = %s',(5,))
    assert cursor.execute.call_args_list[1].args==('SELECT x FROM t WHERE x > %s',(0,))
    assert connect.call_args.kwargs['read_timeout']==5
    connection.close.assert_called_once()


def test_five_simultaneous_redis_claims_have_one_owner():
    from concurrent.futures import ThreadPoolExecutor
    shared=fakeredis.FakeServer()
    stores=[RedisClarificationStore(fakeredis.FakeRedis(server=shared)) for _ in range(5)]
    identifier,state=stores[0].create({'question':'fixture'})
    barrier=threading.Barrier(5)
    def claim(store):
        barrier.wait()
        try: return store.claim(identifier,1,{'slot':'a'})[0]
        except WorkflowError as exc: return exc.code
    with ThreadPoolExecutor(max_workers=5) as workers:
        results=list(workers.map(claim,stores))
    assert results.count('claimed')==1
    assert results.count('clarification_conflict')==4


def test_fuzzy_clarification_revalidates_program_before_execution():
    case={'intent':'data_query','pattern':'metric_lookup','extraction':{'metric_id':'program.airtime_duration',
         'dimensions':[{'dimension_id':'agg_info_program.program_name','raw_values':['THỜI SỰ 19'],'roles':['filter']}]},
         'canonical_rows':[{'program_name':'THỜI SỰ 19H','similarity':.95}],
         'results':[{'columns':['program_airtime_duration'],'rows':[{'program_airtime_duration':3600}]}]}
    svc=clarification_service(case)
    first=svc.handle({'type':'question','question':'Thời lượng phát chương trình THỜI SỰ 19 hôm qua'})
    assert first.status=='needs_clarification'
    field=first.clarification['fields'][0]
    result=svc.handle({'type':'clarification','clarification_id':first.clarification['id'],'revision':1,
                      'answers':{field['id']:field['options'][0]['id']}})
    assert result.status=='answered',result.reply
    assert len([c for c in svc.executor.calls if 'ngram_sim' in c['sql']])==2
    assert result.evidence['filter_sources'][0]['source']=='clarification'
    assert '1 giờ' in result.reply


def test_clarification_rounds_are_bounded():
    case=next(c for c in load_cases('evaluation/cases.jsonl') if c['id']=='clarification-01')
    svc=clarification_service(case)
    result=svc.handle({'type':'question','question':case['question']})
    for revision in (1,2):
        result=svc.handle({'type':'clarification','clarification_id':result.clarification['id'],
                          'revision':revision,'answers':{'time_range':'hôm qua'}})
        if revision==1: assert result.status=='needs_clarification'
    assert result.error['code']=='clarification_limit'
    assert svc.executor.calls==[]


def test_comparison_crosses_year_boundary(pipeline):
    result=pipeline.generate('So sánh rating VTV1 tháng 12 năm 2025 và tháng 1 năm 2026')
    assert result.query_plan.comparison_spec.baseline.time_range.start=='2025-12-01'
    assert result.query_plan.comparison_spec.target.time_range.end=='2026-02-01'


def test_dataset_rejects_same_question_across_splits():
    cases=load_cases('evaluation/cases.jsonl')
    development=next(c for c in cases if c['split']=='development')
    holdout=next(c for c in cases if c['split']=='holdout')
    holdout['question']=development['question']
    assert 'duplicate_question_split_leakage' in validate_dataset(cases,RatingCatalog.load())


def test_live_fault_injection_has_bounded_repair():
    from src.evaluation.faults import FaultLLM
    client=Mock()
    client.complete_text.return_value='{"metric_id":null,"dimensions":[]}'
    injected=FaultLLM(client,'repair')
    with request_scope(RequestContext(clock=FixedClock(),trace=MemoryTraceSink())) as ctx:
        assert injected.complete_text(prompt='Trích xuất semantic input')=='{invalid json'
        assert 'metric_id' in injected.complete_text(prompt='Trích xuất semantic input')
        assert ctx.llm_calls==1  # only the injected attempt; real LLMClient counts its own calls
    assert client.complete_text.call_count==1


def test_snapshot_adapter_rejects_other_schemas():
    from src.evaluation.snapshot import SnapshotExecutor
    executor=Mock()
    executor.execute_result.return_value=QueryResult(('snapshot_id',),({'snapshot_id':'approved-v1'},))
    snapshot=SnapshotExecutor(executor,'chatboy_eval_v1','approved-v1')
    snapshot.execute_result('SELECT x FROM data_dashboard_rating.t WHERE a=:a',{'a':1})
    assert executor.execute_result.call_args.args[0]=='SELECT x FROM chatboy_eval_v1.t WHERE a=:a'
    with pytest.raises(ValueError): snapshot.execute_result('SELECT x FROM production.t',{})


def test_replay_cannot_open_release_gate(tmp_path,monkeypatch,capsys):
    from src.evaluation.__main__ import main
    path=tmp_path/'replay.json'
    path.write_text(json.dumps({'mode':'replay','eligible':False}))
    monkeypatch.setattr('sys.argv',['evaluation','gate','--reports',str(path),str(path),str(path)])
    assert main()==1
    assert 'blocked' in capsys.readouterr().out


def test_separate_program_mention_is_not_dropped_as_prefix():
    from src.core.text_to_sql.test.offline_fixtures import OfflinePipeline
    case={'intent':'data_query','pattern':'metric_lookup','extraction':{'metric_id':'program.airtime_duration',
          'dimensions':[{'dimension_id':'agg_info_program.program_name','raw_values':['TẾT','TẾT VỚI ĐỒNG BÀO'],'roles':['filter']}]}}
    pipeline=OfflinePipeline(llm_client=ReplayLLM(case))
    result=pipeline.generate('Thời lượng phát chương trình TẾT và TẾT VỚI ĐỒNG BÀO hôm qua')
    assert result.generated_sql is None
    assert result.error=='canonical_value_not_found:agg_info_program.program_name'


def test_trend_missing_bucket_has_no_adjacent_growth(pipeline):
    plan=pipeline.generate('Xu hướng lượt xem VTV1 theo ngày tuần trước').query_plan
    post=pipeline.process_rows(plan,[{'date':'2026-10-17','total_channel_views':100},
                                     {'date':'2026-10-19','total_channel_views':120}])
    assert post.analysis['data'][1]['mom_change_pct'] is None


def test_large_decimal_duration_and_comparison_preserve_precision(pipeline):
    presentation=PresentationCatalog(pipeline.catalog)
    value=Decimal('123456789012345678901234567890.5')
    assert presentation.format('program.airtime_duration',value).endswith('31 giây')
    plan=pipeline.generate('So sánh rating VTV1 tháng 6 và tháng 8').query_plan
    a=Decimal('123456789012345678901234567890.12')
    b=Decimal('223456789012345678901234567890.13')
    post=pipeline.process_rows(plan,[{'rating':a,'__period_id':'a'},{'rating':b,'__period_id':'b'}])
    assert post.analysis['data']['comparisons'][0]['delta']==Decimal('100000000000000000000000000000.01')
