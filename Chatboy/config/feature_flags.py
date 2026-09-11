"""Safe rollout controls for the QueryPlan pipeline."""

from __future__ import annotations

import hashlib
import os
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone


def _env_bool(name: str, default: bool) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


QUERY_PLAN_PIPELINE_ENABLED: dict[str, bool] = {
    "channel": _env_bool("QUERY_PLAN_CHANNEL_ENABLED", True),
    "program": _env_bool("QUERY_PLAN_PROGRAM_ENABLED", False),
    "spot": _env_bool("QUERY_PLAN_SPOT_ENABLED", False),
}
QUERY_PLAN_SHADOW_MODE = _env_bool("QUERY_PLAN_SHADOW_MODE", True)


@dataclass
class QueryPlanFeatureFlags:
    """Domain rollout, shadow mode and in-process circuit-breaker state."""

    enabled: dict[str, bool] = field(default_factory=lambda: dict(QUERY_PLAN_PIPELINE_ENABLED))
    shadow_mode: bool = QUERY_PLAN_SHADOW_MODE
    rollout_percent: int = field(default_factory=lambda: int(os.getenv("QUERY_PLAN_ROLLOUT_PERCENT", "0")))
    failure_threshold: float = field(default_factory=lambda: float(os.getenv("QUERY_PLAN_FAILURE_THRESHOLD", "0.2")))
    minimum_events: int = field(default_factory=lambda: int(os.getenv("QUERY_PLAN_FAILURE_MIN_EVENTS", "20")))
    window_seconds: int = field(default_factory=lambda: int(os.getenv("QUERY_PLAN_FAILURE_WINDOW_SECONDS", "300")))
    _events: dict[str, deque[tuple[datetime, bool]]] = field(default_factory=lambda: defaultdict(deque), init=False)
    _circuit_open: set[str] = field(default_factory=set, init=False)

    def should_shadow(self, domain_id: str) -> bool:
        return bool(self.enabled.get(domain_id, False) and domain_id not in self._circuit_open)

    def should_serve(self, domain_id: str, request_key: str) -> bool:
        if not self.enabled.get(domain_id, False) or self.shadow_mode or domain_id in self._circuit_open:
            return False
        bucket = int(hashlib.sha256(request_key.encode("utf-8")).hexdigest()[:8], 16) % 100
        return bucket < max(0, min(self.rollout_percent, 100))

    def record_outcome(self, domain_id: str, failed: bool) -> None:
        """Open the circuit when reject/timeout failures breach the configured ratio."""
        now = datetime.now(timezone.utc)
        events = self._events[domain_id]
        events.append((now, failed))
        cutoff = now - timedelta(seconds=self.window_seconds)
        while events and events[0][0] < cutoff:
            events.popleft()
        if len(events) < self.minimum_events:
            return
        failure_rate = sum(1 for _, is_failed in events if is_failed) / len(events)
        if failure_rate >= self.failure_threshold:
            self._circuit_open.add(domain_id)

    def reset_circuit(self, domain_id: str) -> None:
        """Manual recovery hook after the rollout issue has been investigated."""
        self._circuit_open.discard(domain_id)
