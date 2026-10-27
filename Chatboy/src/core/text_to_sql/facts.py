"""Evidence passed to deterministic templates after result validation."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from src.core.text_to_sql.query_plan import RatingQueryPlan


@dataclass(frozen=True)
class Fact:
    metric_id: str | None
    value: Any
    group: dict[str, Any]
    period_id: str | None
    query_id: str
    unit: str | None = None
    denominator_scope: str = "none"


@dataclass(frozen=True)
class FactSet:
    plan: RatingQueryPlan
    facts: tuple[Fact, ...]
    analysis: dict[str, Any]

    @classmethod
    def build(cls, plan, rows, analysis, catalog):
        from .presentation import PresentationCatalog
        presentation = PresentationCatalog(catalog)
        facts = []
        for row in rows:
            group = {}
            for dimension_id in plan.dimensions:
                dim = catalog.get_dimension(dimension_id)
                if plan.comparison_spec and dim.semantic_type == "time":
                    continue
                alias = dimension_id.rsplit(".", 1)[-1]
                group[dimension_id] = row.get(alias, row.get(dim.column))
            for metric in plan.metrics:
                alias = metric.alias or metric.id.rsplit(".", 1)[-1]
                facts.append(Fact(metric.id, row[alias], group, row.get("__period_id"), row.get("__query_id", "primary"),
                                  presentation.metrics[metric.id].unit, plan.denominator_scope))
            if not plan.metrics:
                facts.append(Fact(None, None, group, None, row.get("__query_id", "primary")))
        return cls(plan, tuple(facts), analysis)
