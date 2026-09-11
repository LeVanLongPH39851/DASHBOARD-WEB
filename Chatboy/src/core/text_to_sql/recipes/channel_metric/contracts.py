"""Runtime contracts internal to the Channel metric recipe."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ChannelRequirements:
    fact_contract_id: str
    measures: tuple[str, ...]
    joins: tuple[str, ...]
    grain_keys: tuple[str, ...]
    execution_strategy: str


__all__ = ("ChannelRequirements",)
