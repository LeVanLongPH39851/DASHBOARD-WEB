"""Reproduce v2.2 behavior with offline fixtures; write every request/response."""
import copy
import json
from pathlib import Path

import fakeredis

from src.core.text_to_sql.runtime.clarification import RedisClarificationStore
from src.core.text_to_sql.runtime.context import MemoryTraceSink
from src.core.text_to_sql.runtime.service import ChatService
from src.evaluation.fixtures import FixedClock, ReplayDoris, ReplayLLM, network_blocked
from src.evaluation.harness import load_cases


def main():
    cases = {case['id']: case for case in load_cases('evaluation/cases.jsonl')}
    output = Path('artifacts/question-flow-v22')
    output.mkdir(parents=True, exist_ok=True)
    examples = [('calendar-quarter', 'fault-10'), ('correct-clarification', 'clarification-01'),
                ('missing-period', 'data-period_comparison-01'), ('wrong-metric', 'fault-10')]
    with network_blocked():
        for name, case_id in examples:
            case = copy.deepcopy(cases[case_id])
            case.pop('fault', None)
            if name == 'calendar-quarter':
                case['question'] = 'Lượt xem VTV1 quý trước'
            elif name == 'missing-period':
                case['results'][1]['rows'] = []
            elif name == 'wrong-metric':
                case['extraction']['metric_id'] = 'rating.average_reach'
            client = fakeredis.FakeRedis()
            try:
                trace = MemoryTraceSink()
                service = ChatService(llm=ReplayLLM(case), executor=ReplayDoris(case),
                    store=RedisClarificationStore(client), clock=FixedClock(case['reference_time']), trace=trace)
                turns = []
                def submit(request):
                    result = service.handle(request)
                    turns.append({'request': request, 'http_status': result.http_status, 'response': result.as_v2()})
                    return result
                result = submit({'type': 'question', 'question': case['question']})
                if name == 'calendar-quarter':
                    assert result.status == 'answered'
                    assert result.evidence['plan']['time_range'] == {
                        'start': '2026-07-01', 'end': '2026-10-01', 'grain': 'month'}
                elif name == 'correct-clarification':
                    original = result.clarification
                    request = {'type': 'clarification', 'clarification_id': original['id'], 'revision': original['revision']}
                    result = submit({**request, 'answers': {'time_range': 'ngày 31/02'}})
                    assert result.http_status == 422 and result.clarification == original
                    assert not service.executor.calls
                    valid = {**request, 'answers': {'time_range': 'từ 2026-06-01 đến 2026-06-02'}}
                    result = submit(valid)
                    assert result.status == 'answered'
                    result = submit(valid)
                    assert result.meta['replayed'] and len(service.executor.calls) == 1
                elif name == 'missing-period':
                    assert result.status == 'answered' and result.meta['data_status'] == 'partial'
                    assert result.evidence['analysis']['data']['comparisons'][0]['delta'] is None
                else:
                    assert result.http_status == 422 and result.error['code'] == 'invalid_semantics'
                    assert result.meta['repairs'] == 1 and not service.executor.calls
                artifact = {'name': name, 'mode': 'offline-fixture', 'reference_time': case['reference_time'],
                            'turns': turns, 'queries': service.executor.calls, 'trace': trace.events}
                path = output / (name + '.json')
                path.write_text(json.dumps(artifact, ensure_ascii=False, indent=2))
                print(name, 'PASS', [turn['http_status'] for turn in turns], path)
            finally:
                client.close()


if __name__ == '__main__':
    main()
