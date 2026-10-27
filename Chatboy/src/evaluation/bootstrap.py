"""Explicit evaluation startup, isolated from production dotenv and wall time."""
import os
from datetime import datetime
from pathlib import Path

from dotenv import dotenv_values


def build_evaluation_service(env_file, cases, *, freeze_reference=False):
    path = Path(env_file).resolve()
    if path.name == '.env' or not path.is_file():
        raise ValueError('A separate evaluation env file is required')
    # No interpolation from inherited production environment variables.
    values = dotenv_values(path, interpolate=False)
    if values.get('CHATBOY_ENV') != 'evaluation' or not values.get('EVAL_SNAPSHOT_ID'):
        raise ValueError('CHATBOY_ENV=evaluation and EVAL_SNAPSHOT_ID are required')
    if {c['snapshot_id'] for c in cases} != {values['EVAL_SNAPSHOT_ID']}:
        raise ValueError('Dataset and evaluation snapshot IDs differ')
    required = ('DORIS_HOST', 'DORIS_PORT', 'DORIS_DATABASE', 'DORIS_USER', 'DORIS_PASSWORD',
                'LLM_API_KEY', 'LLM_MODEL', 'LLM_BASE_URL', 'REDIS_URL', 'EVAL_DORIS_SCHEMA')
    if any(not values.get(key) for key in required):
        raise ValueError('Specify every Doris/LLM/Redis setting in the evaluation env file')
    if values['DORIS_DATABASE'] != values['EVAL_DORIS_SCHEMA']:
        raise ValueError('DORIS_DATABASE must equal EVAL_DORIS_SCHEMA')
    reference = None
    if freeze_reference:
        reference = datetime.fromisoformat(values.get('EVAL_REFERENCE_TIME', ''))
        if reference.tzinfo is None or {c['reference_time'] for c in cases} != {reference.isoformat()}:
            raise ValueError('EVAL_REFERENCE_TIME must include a timezone and match the dataset')
    for key in ('LLM_API_KEYS', *required):
        os.environ[key] = values.get(key) or ''
    from src.core.text_to_sql.runtime.bootstrap import build_service
    from .snapshot import SnapshotExecutor
    service = build_service(load_env=False)
    service.executor = SnapshotExecutor(service.executor, values['EVAL_DORIS_SCHEMA'], values['EVAL_SNAPSHOT_ID'])
    service.reference_time = reference
    service.evaluation_metadata = {'environment': 'evaluation', 'snapshot_id': values['EVAL_SNAPSHOT_ID'],
                                   'reference_time': reference.isoformat() if reference else None}
    return service
