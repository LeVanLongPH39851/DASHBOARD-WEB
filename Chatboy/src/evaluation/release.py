"""Release evidence must come from three live runs and the actual HTTP boundary."""


def release_passes(reports, regression, load, current, dataset_hash):
    return (len(reports) == 3 and all(r.get('eligible') and r.get('mode') == 'live' for r in reports)
            and len({r.get('run_id') for r in reports}) == 3
            and all(r.get('dataset_hash') == dataset_hash for r in reports)
            and all(all(r.get('versions', {}).get(k) == v for k, v in current.items()) for r in reports)
            and all(r.get('versions') == reports[0].get('versions') for r in reports)
            and all(r.get('facts_and_render_accuracy') == 1 for r in reports)
            and regression.get('passed') == regression.get('total') and regression.get('total', 0) > 0
            and regression.get('exit_status') == 0 and regression.get('deselected') == 0
            and all(regression.get('versions', {}).get(k) == v for k, v in current.items())
            and load.get('transport') == 'http' and load.get('environment') == 'evaluation'
            and load.get('mode') == 'live' and load.get('requests', 0) >= 100
            and load.get('rpm') == 8 and load.get('initial_burst') == 5
            and load.get('client_elapsed') is True and load.get('expected_status_checks') is True
            and load.get('metadata_consistent') is True and bool(load.get('reference_time'))
            and load.get('dataset_hash') == dataset_hash
            and all(load.get('versions') == r.get('versions') for r in reports)
            and all(r.get('snapshot_ids') == [load.get('snapshot_id')] for r in reports)
            and load.get('p95_ms', 1e9) <= 20_000 and load.get('error_rate', 1) <= .01)
