"""Request-local budgets, clocks and structured traces shared by all adapters."""
from __future__ import annotations

import contextvars
import hashlib
import json
import logging
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime
from typing import Protocol
from zoneinfo import ZoneInfo

from .errors import WorkflowError


class Clock(Protocol):
    def monotonic(self) -> float: ...
    def now(self) -> datetime: ...
    def sleep(self, seconds: float) -> None: ...


class SystemClock:
    monotonic = staticmethod(time.monotonic)
    sleep = staticmethod(time.sleep)

    def now(self):
        return datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))


@dataclass(frozen=True)
class RuntimeLimits:
    deadline_s: float = 45
    llm_timeout_s: float = 8
    llm_attempts: int = 4
    doris_timeout_s: float = 5
    max_rows: int = 50_000
    concurrency: int = 5
    queue_s: float = 1
    display_rows: int = 100

    def __post_init__(self):
        if any(value <= 0 for value in vars(self).values()):
            raise ValueError("Runtime limits must be positive")


class JsonTraceSink:
    def emit(self, event: dict):
        logging.getLogger("chatboy.trace").info(json.dumps(event, ensure_ascii=False, default=str))


class MemoryTraceSink:
    def __init__(self):
        self.events = []

    def emit(self, event):
        self.events.append(event)


@dataclass
class RequestContext:
    clock: Clock = field(default_factory=SystemClock)
    limits: RuntimeLimits = field(default_factory=RuntimeLimits)
    trace: object = field(default_factory=JsonTraceSink)
    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    versions: dict = field(default_factory=dict)
    reference_time: datetime | None = None
    llm_calls: int = 0
    repairs: int = 0
    retries: int = 0
    rows_used: int = 0
    skills: tuple[str, ...] = ()
    repair_enabled: bool = True

    def __post_init__(self):
        self.started = self.clock.monotonic()
        self.deadline = self.started + self.limits.deadline_s
        self.reference_time = self.reference_time or self.clock.now()

    def remaining(self):
        remaining = self.deadline - self.clock.monotonic()
        if remaining <= 0:
            raise WorkflowError("deadline_exceeded", "Yêu cầu đã hết thời gian xử lý.", retryable=True)
        return remaining

    def llm_attempt(self):
        remaining = self.remaining()
        if self.llm_calls >= self.limits.llm_attempts:
            raise WorkflowError("budget_exceeded", "Đã hết ngân sách gọi mô hình cho yêu cầu này.")
        self.llm_calls += 1
        return min(remaining, self.limits.llm_timeout_s)

    def repair(self):
        self.remaining()
        if not self.repair_enabled or self.repairs >= 1:
            raise WorkflowError("invalid_semantics", "Không xác định được ngữ nghĩa hợp lệ; hãy diễn đạt lại câu hỏi.")
        self.repairs += 1

    def retry(self):
        self.remaining()
        if self.retries >= 1:
            return False
        self.retries += 1
        self.clock.sleep(min(0.1, self.remaining()))
        self.remaining()
        return True

    def consume_rows(self, count):
        self.rows_used += count
        if self.rows_used > self.limits.max_rows:
            raise WorkflowError("resource_exceeded", "Kết quả vượt 50.000 dòng; hãy thu hẹp phạm vi.")

    def emit(self, stage, **values):
        self.trace.emit({"request_id": self.request_id, "stage": stage,
                         "versions": self.versions.copy(), "skills": self.skills,
                         "attempt": self.llm_calls, "error_code": None,
                         "fallback_reason": None, **values})

    @contextmanager
    def stage(self, name, **values):
        self.remaining()
        start = self.clock.monotonic()
        try:
            yield
            self.remaining()
        except Exception as exc:
            self.emit(name, duration_ms=(self.clock.monotonic() - start) * 1000,
                      outcome="failed", **{**values, "error_code": getattr(exc, "code", "internal_error")})
            raise
        else:
            self.emit(name, duration_ms=(self.clock.monotonic() - start) * 1000,
                      outcome="ok", **values)


CURRENT_CONTEXT = contextvars.ContextVar("chatboy_request", default=None)


@contextmanager
def request_scope(context):
    token = CURRENT_CONTEXT.set(context)
    try:
        yield context
    finally:
        CURRENT_CONTEXT.reset(token)


@contextmanager
def stage(name, **values):
    ctx = CURRENT_CONTEXT.get()
    if ctx:
        with ctx.stage(name, **values):
            yield
    else:
        yield


def fingerprint(text):
    return hashlib.sha256(text.encode()).hexdigest()[:16]
