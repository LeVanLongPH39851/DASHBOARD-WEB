"""Typed decisions and evidence shared by planning, transport, and evaluation."""
from dataclasses import dataclass, field
from typing import Literal

from .query_plan import TimeRange


@dataclass(frozen=True)
class SourceEvidence:
    field: str
    value: object
    source: Literal['question', 'clarification', 'catalog_default']
    text: str = ''
    start: int | None = None
    end: int | None = None
    rule_id: str | None = None


@dataclass(frozen=True)
class SemanticCoverage:
    status: Literal['complete', 'ambiguous', 'mismatch', 'unsupported'] = 'complete'
    evidence: tuple[SourceEvidence, ...] = ()
    missing: tuple[str, ...] = ()
    conflicts: tuple[str, ...] = ()
    unresolved: tuple[str, ...] = ()
    candidates: tuple[str, ...] = ()
    reason_code: str | None = None


@dataclass(frozen=True)
class TimeResolution:
    status: Literal['absent', 'resolved', 'ambiguous', 'unsupported', 'invalid']
    reference_time: str
    source: Literal['question', 'clarification', 'catalog_default'] = 'question'
    source_text: str = ''
    resolved_ranges: tuple[TimeRange, ...] = ()
    reason_code: str | None = None


@dataclass(frozen=True)
class PlanningOutcome:
    kind: Literal['ready', 'needs_clarification', 'unsupported']
    reason_code: str | None = None
    fields: tuple[dict, ...] = ()


@dataclass(frozen=True)
class ResultCoverage:
    status: Literal['available', 'partial', 'no_data', 'invalid']
    scope: str = 'query_expectations'
    missing_period_ids: tuple[str, ...] = ()
    missing_groups: tuple[dict, ...] = ()
    null_metrics: tuple[dict, ...] = ()
    reasons: tuple[str, ...] = ()


class UnsupportedRequest(ValueError):
    """A known capability boundary, never a catch-all for programming errors."""
    def __init__(self, reason_code, message='Yêu cầu chưa nằm trong khả năng phân tích hiện tại.'):
        self.reason_code, self.message = reason_code, message
        super().__init__(reason_code)


class TimeInputError(ValueError):
    def __init__(self, resolution):
        self.resolution = resolution
        super().__init__(resolution.reason_code or 'invalid_time')


class InvalidResultError(ValueError):
    """Known result precondition violation, distinct from an unexpected compute bug."""

