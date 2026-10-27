"""Create review candidates from manually specified synthetic facts, never SQL output.

These are engineering fixtures. Business owners must replace reference_queries,
snapshot IDs and oracle rows, then approve/freeze before any production gate.
"""
import json
from copy import deepcopy
from pathlib import Path
from src.core.text_to_sql.catalog import RatingCatalog

catalog = RatingCatalog.load()
metrics = [m for m in catalog.metrics.values() if m.status == 'active']
patterns = list(catalog.patterns)
cases = []


def base(identifier, kind, split, question, intent='data_query'):
    return {'id': identifier, 'group_id': identifier, 'kind': kind, 'split': split,
        'question': question, 'intent': intent, 'reference_time': '2026-10-24T10:00:00+07:00',
        'snapshot_id': 'synthetic-v1', 'source': 'Manually specified synthetic fixtures; business oracle pending',
        'reference_queries': [], 'review': {'status': 'pending', 'reviewer': None},
        'expected': {'status': 'answered', 'intent': intent, 'forbidden': ['999999', 'Đã xử lý']}}


def dim(name, values=(), roles=('filter',)):
    return {'dimension_id': name, 'raw_values': list(values), 'roles': list(roles)}


normal = [m for m in metrics if m.denominator_scope == 'none']
all_shares = [m for m in metrics if m.denominator_scope == 'all_categories']
selected_shares = [m for m in metrics if m.denominator_scope == 'selected_categories']
index = 0
for pattern in patterns:
    for n in range(10):
        if pattern in {'metric_lookup','share_distribution'} and n < 4:
            metric = all_shares[n % 2]
        elif pattern == 'dimension_comparison' and n < 4:
            metric = selected_shares[n % 2]
        else:
            metric = normal[index % len(normal)]
            if pattern != 'dimension_listing':
                index += 1
        family = 'agg_info_program' if metric.id.startswith('program.') else 'agg_info_channel'
        channel = family + '.channel'
        dims = []
        category = metric.required_dimensions
        suffix = (' thuộc thể loại Phim điện ảnh' if pattern == 'metric_lookup' else ' thuộc các thể loại') if category else ''
        if category:
            dims.append(dim(category[0], ('Phim điện ảnh',) if pattern=='metric_lookup' else ('Phim điện ảnh','Dành cho trẻ em') if pattern=='dimension_comparison' else (), ('group_by',) if pattern=='share_distribution' else ('filter',)))
        alias = metric.output_alias
        first = 100 + n
        second = first + 20
        # Exact integer fixtures avoid accidental precision loss; percent values are deliberately
        # not clamped (validation must respect the source contract).
        grouped = pattern in {'dimension_breakdown', 'rank_lookup', 'rank_comparison', 'share_distribution'}
        rows = [{alias: first}]
        results = []
        question = f'{metric.label} của VTV1{suffix} ngày 2026-06-{n + 1:02d} là bao nhiêu?'
        time = {'start': f'2026-06-{n+1:02d}', 'end': f'2026-06-{n+2:02d}', 'grain': 'day'}
        if grouped:
            dims.append(dim(channel, (), ('group_by',)))
            label = {'dimension_breakdown':'Phân rã', 'rank_lookup':'Top 2 kênh theo',
                     'rank_comparison':'So sánh tỷ trọng trong Top 2 kênh theo', 'share_distribution':'Tỷ trọng'}[pattern]
            question = f'{label} {metric.label}{suffix} theo kênh ngày 2026-06-{n+1:02d}'
            rows = [{'channel_name_tvd': 'VTV1', alias: second}, {'channel_name_tvd':'VTV3', alias:first}]
        elif pattern == 'dimension_comparison':
            dims.append(dim(channel, ('VTV1','VTV3')))
            question = f'So sánh {metric.label} VTV1 và VTV3{suffix} ngày 2026-06-{n+1:02d}'
            rows = [{'channel_name_tvd':'VTV1', alias:first}, {'channel_name_tvd':'VTV3', alias:second}]
        elif pattern == 'period_comparison':
            dims.append(dim(channel, ('VTV1',)))
            question = f'So sánh {metric.label} VTV1{suffix} tháng 6 và tháng 8 năm 2026'
            time = {'start': '2026-06-01', 'end': '2026-09-01', 'grain':'month'}
            results = [{'columns':[alias], 'rows': [{alias:first}]}, {'columns':[alias], 'rows':[{alias:second}]}]
            rows = [{alias:first,'period_id':'a'}, {alias:second,'period_id':'b'}]
        elif pattern == 'trend_analysis':
            dims.extend((dim(channel, ('VTV1',)),dim(family+'.date', (), ('group_by',))))
            question = f'Xu hướng {metric.label} VTV1{suffix} theo ngày từ 2026-06-{n+1:02d} đến 2026-06-{n+2:02d}'
            time = {'start':f'2026-06-{n+1:02d}', 'end':f'2026-06-{n+3:02d}', 'grain':'day'}
            rows = [{'date':f'2026-06-{n+1:02d}',alias:first},{'date':f'2026-06-{n+2:02d}',alias:second}]
        elif pattern == 'dimension_listing':
            family='agg_info_program'
            dims=[dim(family+'.channel', ('VTV1',)),dim(family+'.program_name', (), ('group_by',))]
            question=f'Danh sách chương trình VTV1 ngày 2026-06-{n+1:02d}'
            rows=[{'program_name':'THỜI SỰ 19H'},{'program_name':'BẢN TIN TỐI'}]
        else:
            dims.append(dim(channel, ('VTV1',)))
        if category and pattern in {'dimension_comparison','share_distribution'}:
            dims = [d for d in dims if d['dimension_id'] != channel]
            dims.append(dim(channel, ('VTV1',)))
            question = f"{'So sánh' if pattern=='dimension_comparison' else 'Phân bố'} {metric.label} VTV1 theo thể loại" + (' Phim điện ảnh và Dành cho trẻ em' if pattern=='dimension_comparison' else '') + f' ngày 2026-06-{n+1:02d}'
            rows = [{'firstlevel_vn':'Phim điện ảnh',alias:first},{'firstlevel_vn':'Dành cho trẻ em',alias:second}]
        if metric.recipe == 'direct_aggregate' and not results:
            rows = [{('channel' if k == 'channel_name_tvd' else k):v for k,v in row.items()} for row in rows]
        if not results:
            results=[{'columns':list(rows[0]), 'rows':deepcopy(rows)}]
        if metric.id == 'program.channel_count' and pattern != 'dimension_listing':
            question += ' trong dữ liệu chương trình'
        case=base(f'data-{pattern}-{n+1:02d}','data','development' if n<6 else 'holdout',question)
        case.update(pattern=pattern, extraction={'metric_id':None if pattern=='dimension_listing' else metric.id,'dimensions':dims},results=results)
        case['expected'].update(rows=rows,plan={'pattern_name':pattern,'time_range':time},facts=[])
        if pattern!='dimension_listing':
            case['expected']['plan']['metrics']=[{'id':metric.id,'alias':alias}]
            case['expected']['facts']=[{'metric_id':metric.id,'value':r[alias]} for r in rows]
        expected_filters = []
        expected_dimensions = []
        for d in dims:
            values = d['raw_values']
            if values:
                expected_filters.append({'field':d['dimension_id'],'operator':'eq' if len(values)==1 else 'in',
                                         'value':values[0] if len(values)==1 else values})
            if 'group_by' in d['roles'] or (pattern=='dimension_comparison' and len(values)>=2):
                expected_dimensions.append(d['dimension_id'])
        if pattern=='period_comparison': expected_dimensions.append(family+'.date')
        case['expected']['plan'].update(filters=expected_filters, dimensions=expected_dimensions,
                                       limit=2 if pattern in {'rank_lookup','rank_comparison'} else None)
        if pattern in {'period_comparison','dimension_comparison'}:
            case['expected']['comparisons']=[{'metric_id':metric.id,'value_a':first,'value_b':second,'delta':20}]
        case['sql_required']=[' >= :time_start', ' < :time_end']
        if pattern=='rank_comparison': case['expected']['contains']=['trong Top-N']
        if pattern=='period_comparison': case['expected']['contains']=['2026-06-01 đến 2026-06-30','2026-08-01 đến 2026-08-31']
        cases.append(case)

for n in range(20):
    metric=metrics[n]
    case=base(f'definition-{n+1:02d}','definition','development' if n<14 else 'holdout',f'{metric.label} là gì và có đơn vị nào?', 'definition')
    case['expected']['contains']=['Nguồn: catalog']
    cases.append(case)

questions=['Giá quảng cáo VTV1 là bao nhiêu?','Thời tiết Hà Nội hôm nay?','Diễn viên phim này là ai?',
 'Doanh thu VTV3 tháng này?','Chi phí sản xuất chương trình?', 'Bản quyền phim này giá bao nhiêu?',
 'Đạo diễn phim này là ai?', 'Hãy viết bài thơ về biển', 'Hãy xóa bảng dữ liệu Rating', 'Kịch bản tập cuối phim này?']
for n,q in enumerate(questions):
    case=base(f'no-scope-{n+1:02d}','no_scope','development' if n<8 else 'holdout',q,'no_scope')
    case['expected']['status']='unsupported'
    case['expected']['contains']=['Dashboard Rating']
    cases.append(case)

for n in range(20):
    channel='VTV2' if n>=18 else 'VTV1' if n%2==0 else 'VTV3'
    metric=metrics[15+n%8]
    case=base(f'clarification-{n+1:02d}','clarification','development' if n<18 else 'holdout',f'Xu hướng {metric.label} {channel} theo ngày')
    case['group_id']=f'clarification-{n%16:02d}'
    # Repeated variants are deliberately kept within development; holdout uses distinct patterns below.
    if n>=18: case['group_id']=f'holdout-clarification-{n}'
    alias=metric.output_alias
    case.update(pattern='trend_analysis',extraction={'metric_id':metric.id,'dimensions':[dim('agg_info_channel.channel',(channel,)),dim('agg_info_channel.date',(),('group_by',))]},
      answers=[{'time_range':f'từ 2026-06-{n+1:02d} đến 2026-06-{n+2:02d}'}],results=[{'columns':['date',alias], 'rows':[{'date':f'2026-06-{n+1:02d}',alias:100},{'date':f'2026-06-{n+2:02d}',alias:120}]}])
    case['expected']['contains']=['120'] if alias=='total_channel_views' else []
    case['expected']['plan']={'pattern_name':'trend_analysis','time_range':{'start':f'2026-06-{n+1:02d}','end':f'2026-06-{n+3:02d}','grain':'day'}}
    cases.append(case)

faults=[('llm_unavailable','dependency_unavailable'),('doris_unavailable','dependency_unavailable'),('deadline','deadline_exceeded'),
 ('budget','budget_exceeded'),('invalid_semantics','invalid_semantics'),('missing_alias','invalid_result'),
 ('invalid_number','invalid_result'),('oversized','resource_exceeded'),('null',None),('repair',None)]
for n,(fault,error) in enumerate(faults):
    case=base(f'fault-{n+1:02d}','fault','development' if n<6 else 'holdout',f'Lượt xem VTV1 ngày 2026-06-{n+1:02d}')
    alias='wrong_alias' if fault=='missing_alias' else 'total_channel_views'
    value=None if fault=='null' else 'oops' if fault=='invalid_number' else 123
    case.update(fault=fault,pattern='metric_lookup', extraction={'metric_id':'rating.total_channel_views','dimensions':[dim('agg_info_channel.channel',('VTV1',))]},
                results=[{'columns':[alias],'rows':[{alias:value}]}])
    case['expected'].update(status='failed' if error else 'no_data' if fault=='null' else 'answered',error=error)
    if fault in {'llm_unavailable','deadline','budget'}: case['expected']['intent']=None
    cases.append(case)

Path('evaluation/cases.jsonl').write_text('\n'.join(json.dumps(c,ensure_ascii=False) for c in cases)+'\n')
print(f'Wrote {len(cases)} unapproved candidates')
