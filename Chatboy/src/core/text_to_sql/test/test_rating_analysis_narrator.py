"""Numeric templates consume validated facts and never ask a model to rewrite them."""
from datetime import date
from decimal import Decimal
from unittest.mock import Mock

import fakeredis
import pytest

from src.core.text_to_sql.d_014_rating_analysis_narrator import RatingAnalysisNarrator
from src.core.text_to_sql.d_015_rating_query_pipeline import RatingQueryPipeline
from src.core.text_to_sql.runtime.clarification import RedisClarificationStore
from src.core.text_to_sql.runtime.context import MemoryTraceSink
from src.core.text_to_sql.runtime.errors import WorkflowError
from src.core.text_to_sql.runtime.service import ChatService
from src.evaluation.fixtures import FixedClock, ReplayLLM, ReplayDoris
from src.evaluation.harness import load_cases


def test_narrator_requires_fact_set():
    with pytest.raises(TypeError):
        RatingAnalysisNarrator().narrate(object(), {'data':[{'rating':999999}]})


def test_llm_cannot_change_a_verified_number():
    llm=Mock()
    llm.complete_text.return_value='Lượt xem là 999999 theo kết quả phân tích.'
    pipeline=RatingQueryPipeline(today_provider=lambda:date(2026,10,24))
    pipeline.analysis_narrator=RatingAnalysisNarrator(llm_client=llm,catalog=pipeline.catalog)
    plan=pipeline.generate('Lượt xem VTV1 hôm qua').query_plan
    result=pipeline.process_rows(plan,[{'total_channel_views':123}])
    assert '123 lượt' in result.output.text
    assert '999999' not in result.output.text
    llm.complete_text.assert_not_called()


@pytest.mark.parametrize('pattern',tuple(RatingQueryPipeline().catalog.patterns))
def test_all_patterns_render_evidence(pattern):
    case=next(c for c in load_cases('evaluation/cases.jsonl') if c['kind']=='data' and c['pattern']==pattern)
    service=ChatService(llm=ReplayLLM(case),executor=ReplayDoris(case),clock=FixedClock(),
                        store=RedisClarificationStore(fakeredis.FakeRedis()),trace=MemoryTraceSink())
    result=service.handle({'type':'question','question':case['question']})
    assert result.status=='answered',result.reply
    assert 'Kỳ' in result.reply
    assert 'Đã xử lý' not in result.reply
    assert result.meta['llm_attempts']==3  # route, extract, pattern; no narration call
    assert result.evidence['facts']


def test_bundle_renders_null_zero_negative_without_fabrication():
    pipeline=RatingQueryPipeline(today_provider=lambda:date(2026,10,24))
    plan=pipeline.generate('VTV1 hôm qua').query_plan
    values={'rating':Decimal('-10.555'),'rating_percent':0,'ave_reach':None,'reach_percent':Decimal('3.25'),'minute_per_user_day':20}
    result=pipeline.process_rows(plan,[values])
    assert result.validation.status=='partial'
    assert '-10,56' in result.output.text and '0,00%' in result.output.text
    assert 'chưa có dữ liệu' in result.output.text
    for metric in plan.metrics:
        assert pipeline.catalog.require_metric(metric.id).label in result.output.text


def test_percent_delta_is_percentage_points_and_zero_growth_undefined():
    pipeline=RatingQueryPipeline(today_provider=lambda:date(2026,10,24))
    plan=pipeline.generate('So sánh rating% VTV1 tháng 6 và tháng 8').query_plan
    result=pipeline.process_rows(plan,[{'rating_percent':0,'__period_id':'a'},{'rating_percent':Decimal('12.345'),'__period_id':'b'}])
    assert '12,35 điểm phần trăm' in result.output.text
    assert 'tương đối không xác định' in result.output.text


def test_display_limit_keeps_all_facts():
    pipeline=RatingQueryPipeline(today_provider=lambda:date(2026,10,24))
    plan=pipeline.generate('Lượt xem theo kênh hôm qua').query_plan
    rows=[{'channel':f'Kênh {n}','total_channel_views':n} for n in range(105)]
    result=pipeline.process_rows(plan,rows)
    assert len(result.facts.facts)==105
    assert result.output.text.count('\n- ')==100
    assert '100/105' in result.output.text


def test_compute_failure_stops_rendering():
    pipeline=RatingQueryPipeline(today_provider=lambda:date(2026,10,24))
    plan=pipeline.generate('Lượt xem VTV1 hôm qua').query_plan
    pipeline.pattern_compute=Mock()
    pipeline.pattern_compute.process.return_value={'compute_error':'broken','data':[{'total_channel_views':999999}]}
    with pytest.raises(WorkflowError) as error:
        pipeline.process_rows(plan,[{'total_channel_views':123}])
    assert error.value.code=='invalid_result'
