"""Catalog-owned units and decimal formatting; no unit-name heuristics."""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP, localcontext
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field


class MetricPresentation(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)
    kind: Literal["count", "decimal", "percent", "duration", "hour"]
    unit: str
    decimals: int = Field(2, ge=0, le=6)
    scale: Literal["absolute", "percentage_points"] = "absolute"


class PresentationCatalog:
    def __init__(self, catalog):
        path = catalog.project_root / "data/dashboard/rating/presentation.yaml"
        payload = yaml.safe_load(path.read_text(encoding="utf-8"))
        self.metrics = {k: MetricPresentation.model_validate(v) for k, v in payload["metrics"].items()}
        missing = {m.id for m in catalog.metrics.values() if m.status == "active"} - self.metrics.keys()
        if missing:
            raise ValueError(f"missing_metric_presentation:{','.join(sorted(missing))}")

    def format(self, metric_id: str, value, *, delta: bool = False) -> str:
        if value is None:
            return "chưa có dữ liệu"
        spec = self.metrics[metric_id]
        number = Decimal(str(value))
        if not number.is_finite():
            raise ValueError("non_finite_display")
        if spec.kind == "duration":
            sign = "-" if number < 0 else ""
            seconds = int(number.copy_abs().to_integral_value(rounding=ROUND_HALF_UP))
            hours, rest = divmod(seconds, 3600)
            minutes, seconds = divmod(rest, 60)
            parts = ([f"{hours} giờ"] if hours else []) + ([f"{minutes} phút"] if minutes else [])
            if seconds or not parts:
                parts.append(f"{seconds} giây")
            return sign + " ".join(parts)
        unit = "điểm phần trăm" if delta and spec.kind == "percent" else spec.unit
        return f"{format_number(number, spec.decimals)}{'' if unit == '%' else ' '}{unit}".strip()


def format_number(value, decimals: int = 2) -> str:
    number = Decimal(str(value))
    if not number.is_finite():
        raise ValueError("non_finite_display")
    with localcontext() as ctx:
        ctx.prec = max(38, len(number.as_tuple().digits) + max(0, number.adjusted()) + decimals + 2)
        rounded = number.quantize(Decimal(1).scaleb(-decimals), rounding=ROUND_HALF_UP)
    western = f"{rounded:,.{decimals}f}"
    return western.replace(",", "_").replace(".", ",").replace("_", ".")
