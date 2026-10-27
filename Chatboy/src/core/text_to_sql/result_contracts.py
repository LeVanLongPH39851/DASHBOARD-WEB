"""SQL result contracts independent of database and transport implementations."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class ResultColumn:
    semantic_id: str
    alias: str
    data_type: Literal["number", "date", "string"]
    unit: str | None = None


@dataclass(frozen=True)
class ResultSchema:
    columns: tuple[ResultColumn, ...]

