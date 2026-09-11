"""Workflow 011: render validated query plans as safe Doris SQL."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.query_plan import Filter, RatingQueryPlan


@dataclass(frozen=True)
class GeneratedSQL:
    query_id: str
    sql: str
    parameters: dict[str, Any]
    selected_columns: tuple[str, ...]
    # SQL after renderer-owned named-parameter substitution. ``sql`` remains
    # parameterized for diagnostics; ``bound_sql`` is sent to Doris by the CLI.
    bound_sql: str = ""

    @property
    def executable_sql(self) -> str:
        return self.bound_sql or self.sql


@dataclass(frozen=True)
class GeneratedSQLBatch:
    queries: tuple[GeneratedSQL, ...]


class RatingSQLRenderer:
    """Dispatch catalog-selected recipes and own shared SQL safety helpers."""

    _IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")

    def __init__(
        self,
        catalog: RatingCatalog | None = None,
        project_root=None,
    ):
        self.catalog = catalog or RatingCatalog.load(project_root=project_root)

    def render(self, plan: RatingQueryPlan) -> GeneratedSQLBatch:
        requested = [*plan.dimensions, *(item.field for item in plan.filters)]
        if not plan.metrics:
            return self._render_dimension_listing(plan, requested)
        primary_metric = plan.primary_metric
        table = self.catalog.table_for(primary_metric.id, requested)
        if not table:
            raise ValueError("missing_compatible_table")
        metric = self.catalog.metrics.get(primary_metric.id)
        if not metric or metric.status != "active":
            raise ValueError(f"metric_not_active:{primary_metric.id}")
        try:
            recipe = self.catalog.recipe_handler(metric.recipe)
        except KeyError as exc:
            raise ValueError(f"unknown_recipe:{metric.recipe}") from exc
        return recipe.render(plan, table, metric, self)

    def _render_dimension_listing(
        self,
        plan: RatingQueryPlan,
        requested: list[str],
    ) -> GeneratedSQLBatch:
        table = self.catalog.table_for(None, requested)
        if not table:
            raise ValueError("missing_compatible_table")
        select_parts: list[str] = []
        selected_columns: list[str] = []
        aliases: dict[str, str] = {}
        for dimension_id in plan.dimensions:
            dimension = self._dimension(dimension_id, table.id)
            alias = self._alias(dimension_id)
            column = self._identifier(dimension.column)
            expression = (
                self._time_bucket(column, plan.time_range.grain)
                if dimension.semantic_type == "time"
                else column
            )
            select_parts.append(f"{expression} AS {alias}" if expression != alias else expression)
            selected_columns.append(alias)
            aliases[dimension_id] = alias

        date_dimension = self.catalog.date_dimension_for(table.id)
        if not date_dimension:
            raise ValueError(f"missing_time_dimension:{table.id}")

        where_parts: list[str] = []
        parameters: dict[str, Any] = {}

        if table.id == "agg_info_program":
            where_parts.append(f"{self._identifier(date_dimension.column)} BETWEEN :time_start AND :time_end")
            parameters["time_start"] = f"{plan.time_range.start}T00:00:00"
            parameters["time_end"] = f"{plan.time_range.end}T23:59:59"
            where_parts.append("firstlevel_vn NOT IN (:program_excluded_category_0, :program_excluded_category_1)")
            parameters["program_excluded_category_0"] = "Quảng cáo"
            parameters["program_excluded_category_1"] = "Quảng bá"
        else:
            where_parts.append(f"{self._identifier(date_dimension.column)} >= :time_start")
            where_parts.append(f"{self._identifier(date_dimension.column)} < :time_end")
            parameters["time_start"] = plan.time_range.start
            parameters["time_end"] = plan.time_range.end

        for index, predicate in enumerate(plan.filters):
            where_parts.append(self._filter(predicate, table.id, index, parameters))

        sql = [
            "SELECT DISTINCT",
            "  " + ",\n  ".join(select_parts),
            f"FROM {self._qualified_identifier(table.physical_name)}",
            "WHERE " + "\n  AND ".join(where_parts),
        ]
        if plan.order_by:
            clauses = []
            for item in plan.order_by:
                if item.field in aliases:
                    clauses.append(f"{aliases[item.field]} {item.direction.upper()}")
                else:
                    dimension = self._dimension(item.field, table.id)
                    clauses.append(f"{dimension.column} {item.direction.upper()}")
            sql.append("ORDER BY " + ", ".join(clauses))
        if plan.limit is not None:
            sql.append(f"LIMIT {plan.limit}")

        return self._generated_batch(
            "primary",
            "\n".join(sql),
            parameters,
            tuple(selected_columns),
        )

    def _generated_batch(
        self,
        query_id: str,
        sql: str,
        parameters: dict[str, Any],
        selected_columns: tuple[str, ...],
    ) -> GeneratedSQLBatch:
        bound_sql = self._bind_parameters(sql, parameters)
        return GeneratedSQLBatch((GeneratedSQL(query_id, sql, parameters, selected_columns, bound_sql),))

    @staticmethod
    def _bind_parameters(sql: str, parameters: dict[str, Any]) -> str:
        """Inline renderer-owned values into a complete Doris SQL statement.

        Identifiers and SQL fragments never come from parameter values. Values
        are escaped as SQL literals here, after recipes have generated and
        validated the statement shape.
        """
        missing: set[str] = set()

        def replace(match: re.Match[str]) -> str:
            name = match.group(1)
            if name not in parameters:
                missing.add(name)
                return match.group(0)
            return RatingSQLRenderer._sql_literal(parameters[name])

        bound = re.sub(r":([A-Za-z_][A-Za-z0-9_]*)", replace, sql)
        if missing:
            raise ValueError(f"missing_sql_parameters:{','.join(sorted(missing))}")
        return bound

    @staticmethod
    def _sql_literal(value: Any) -> str:
        if value is None:
            return "NULL"
        if isinstance(value, bool):
            return "TRUE" if value else "FALSE"
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            return str(value)
        escaped = str(value).replace("'", "''")
        return f"'{escaped}'"

    def _filter(self, predicate: Filter, table_id: str, index: int, parameters: dict[str, Any]) -> str:
        dimension = self._dimension(predicate.field, table_id)
        column = self._identifier(dimension.column)
        if predicate.operator == "eq":
            name = f"filter_{index}"
            parameters[name] = predicate.value
            return f"{column} = :{name}"
        if predicate.operator == "in":
            values = tuple(predicate.value) if isinstance(predicate.value, tuple) else ()
            if not values:
                raise ValueError(f"empty_in_filter:{predicate.field}")
            names = []
            for value_index, value in enumerate(values):
                name = f"filter_{index}_{value_index}"
                parameters[name] = value
                names.append(f":{name}")
            return f"{column} IN (" + ", ".join(names) + ")"
        raise ValueError(f"unsupported_filter_operator:{predicate.operator}")

    @staticmethod
    def _time_bucket(expression: str, grain: str) -> str:
        """Return a renderer-owned Doris expression for one approved time grain."""
        if grain == "day":
            return f"DATE({expression})"
        if grain == "week":
            return f"DATE_SUB(DATE({expression}), INTERVAL WEEKDAY({expression}) DAY)"
        if grain == "month":
            return f"DATE_FORMAT({expression}, '%Y-%m-01')"
        raise ValueError(f"time_grain_not_allowed:{grain}")

    def _dimension(self, dimension_id: str, table_id: str):
        dimension = self.catalog.get_dimension(dimension_id)
        if not dimension or dimension.table_id != table_id:
            raise ValueError(f"dimension_not_supported_by_table:{dimension_id}:{table_id}")
        return dimension

    def _column_in_table(self, column: str, table_id: str) -> str:
        table = self.catalog.tables.get(table_id)
        if not table or column not in table.columns:
            raise ValueError(f"column_not_supported_by_table:{column}:{table_id}")
        return column

    def _alias(self, dimension_id: str) -> str:
        return self._identifier(dimension_id.rsplit(".", 1)[-1])

    def _identifier(self, value: str) -> str:
        if not self._IDENTIFIER.fullmatch(value):
            raise ValueError(f"unsafe_identifier:{value}")
        return value

    def _qualified_identifier(self, value: str) -> str:
        parts = value.split(".")
        if not parts or any(not self._IDENTIFIER.fullmatch(part) for part in parts):
            raise ValueError(f"unsafe_table_identifier:{value}")
        return value
