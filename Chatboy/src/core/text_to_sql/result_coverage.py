"""Availability against explicit query expectations, not inferred source freshness."""
from .planning_contracts import ResultCoverage


def assess_coverage(plan, rows, validation, catalog):
    if validation.status == 'invalid':
        return ResultCoverage('invalid', reasons=validation.errors)
    missing_periods, missing_groups, nulls = [], [], []
    for row in rows:
        for metric in plan.metrics:
            alias = metric.alias or metric.id.rsplit('.', 1)[-1]
            if row.get(alias) is None:
                nulls.append({'metric_id': metric.id, 'period_id': row.get('__period_id'),
                    'group': {d: row.get(d.rsplit('.', 1)[-1], row.get(catalog.get_dimension(d).column))
                              for d in plan.dimensions if catalog.get_dimension(d).semantic_type != 'time'}})
    if plan.comparison_spec:
        periods = {r.get('__period_id') for r in rows}
        missing_periods = [p.id for p in plan.comparison_spec.periods if p.id not in periods]
        dimensions = [d for d in plan.dimensions if catalog.get_dimension(d).semantic_type != 'time']
        groups = {}
        for row in rows:
            key = tuple(row.get(d.rsplit('.', 1)[-1], row.get(catalog.get_dimension(d).column)) for d in dimensions)
            groups.setdefault(key, set()).add(row.get('__period_id'))
        # Only the observed union; do not fabricate a Cartesian product of filters.
        for key, present in groups.items():
            for period in plan.comparison_spec.periods:
                if period.id not in present:
                    missing_groups.append({'period_id': period.id, 'group': dict(zip(dimensions, key))})
    if plan.pattern_name == 'dimension_comparison':
        requested = next((f for f in plan.filters if f.field in plan.dimensions
                          and isinstance(f.value, tuple) and len(f.value) >= 2), None)
        if requested:
            dim = catalog.get_dimension(requested.field)
            others = [d for d in plan.dimensions if d != requested.field]
            groups = {}
            for row in rows:
                key = tuple(row.get(d.rsplit('.', 1)[-1], row.get(catalog.get_dimension(d).column)) for d in others)
                groups.setdefault(key, set()).add(row.get(requested.field.rsplit('.', 1)[-1], row.get(dim.column)))
            for key, present in groups.items():
                for value in requested.value:
                    if value not in present:
                        missing_groups.append({'group': {**dict(zip(others, key)), requested.field: value}})
    reasons = tuple(name for name, items in (('missing_period', missing_periods), ('missing_group', missing_groups), ('null_metric', nulls)) if items)
    status = 'no_data' if validation.status == 'no_data' else 'partial' if reasons else 'available'
    return ResultCoverage(status, missing_period_ids=tuple(missing_periods), missing_groups=tuple(missing_groups),
                          null_metrics=tuple(nulls), reasons=reasons)
