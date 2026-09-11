"""Resolution for the fixed Rating dashboard semantic contract."""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.input_contracts import ExtractedEntity, ExtractedInput, ExtractedSortIntent
from src.core.text_to_sql.resolved_entities import ResolvedEntity, ResolvedFilter, ResolvedSort, ResolvedSQLComponents
from src.core.text_to_sql.semantic_catalog import DimensionDefinition
from src.core.text_to_sql.semantic_extraction.normalization import (
    contains_lookup_phrase,
    normalize_lookup_value,
)


class RatingResolveEntities:
    """Resolve Version 3 entities against ``data/dashboard/rating`` only."""

    def __init__(self, project_root: str | Path | None = None, catalog: Any | None = None):
        self.project_root = Path(project_root or Path(__file__).resolve().parents[3])
        self.catalog = catalog or RatingCatalog.load(project_root=self.project_root)
        self._value_cache: dict[str, dict[str, str]] = {}

    def resolve(self, extracted_input: ExtractedInput) -> ResolvedSQLComponents:
        """Return canonical semantic components for the configured Rating dashboard.

        ``ExtractedInput.domain_id`` is deliberately not used for routing.  The
        dashboard catalog is the single source of truth, so a missing domain in
        an otherwise valid input does not block resolution.
        """
        metric_id: str | None = None
        metric_ids: list[str] = []
        resolved: list[ResolvedEntity] = []
        unresolved: list[ResolvedEntity] = []
        dimension_ids: list[str] = []
        filters: list[ResolvedFilter] = []

        suppressed_metric_terms = self._suppressed_metric_terms(extracted_input)
        for entity in extracted_input.entities:
            # Entity extraction finds both ``rating`` and ``rating tuyệt đối``
            # in the latter phrase.  Keep the longest catalog term so the
            # resolver does not manufacture a false multi-metric ambiguity.
            if entity.kind == "metric_term" and entity.normalized_value in suppressed_metric_terms:
                continue
            result = self._resolve_entity(entity)
            if result.status == "resolved":
                resolved.append(result)
            elif result.status in {"unresolved", "ambiguous"}:
                unresolved.append(result)

            if result.status != "resolved" or not result.canonical_id:
                continue
            if entity.kind == "metric_term":
                if result.canonical_id not in metric_ids:
                    metric_ids.append(result.canonical_id)
            elif entity.kind == "dimension_term":
                dimension_ids.append(result.canonical_id)
            elif entity.kind == "dimension_value" and result.canonical_value is not None:
                dimension = self.catalog.get_dimension(result.canonical_id)
                if dimension:
                    filters.append(
                        ResolvedFilter(
                            dimension_id=dimension.id,
                            physical_column=dimension.column,
                            operator="=",
                            values=(result.canonical_value,),
                            source_text=entity.source_text,
                        )
                    )

        metric_ids = list(self._align_metrics_to_dimension_table(metric_ids, resolved))
        metric_id = metric_ids[0] if metric_ids else None
        table = self.catalog.table_for(metric_id, [*dimension_ids, *(item.dimension_id for item in filters)])
        if table:
            compatible_mentions = {
                (item.source.kind, item.source.normalized_value)
                for item in resolved
                if item.source.kind in {"dimension_term", "dimension_value"}
                and item.canonical_id
                and (dimension := self.catalog.get_dimension(item.canonical_id))
                and dimension.table_id == table.id
            }
            for item in resolved:
                if item.source.kind not in {"dimension_term", "dimension_value"}:
                    continue
                dimension = self.catalog.get_dimension(item.canonical_id or "")
                if not dimension or dimension.table_id == table.id:
                    continue
                if (item.source.kind, item.source.normalized_value) in compatible_mentions:
                    continue
                unresolved.append(
                    ResolvedEntity(
                        source=item.source,
                        canonical_id=item.canonical_id,
                        status="unresolved",
                        reason=f"Dimension {item.canonical_id} is not supported by selected table {table.id}.",
                    )
                )
            dimension_ids = [
                dimension_id
                for dimension_id in dimension_ids
                if (dimension := self.catalog.get_dimension(dimension_id)) and dimension.table_id == table.id
            ]
            filters = [
                item
                for item in filters
                if (dimension := self.catalog.get_dimension(item.dimension_id)) and dimension.table_id == table.id
            ]
        preferred_dimensions = (
            self.catalog.metrics[metric_id].default_dimensions
            if metric_id and metric_id in self.catalog.metrics
            else ()
        )
        filters = self._merge_dimension_filters(
            self._remove_implicit_overlapping_filters(
                filters,
                resolved,
                preferred_dimensions,
            )
        )
        sorts = self._resolve_sort_intents(
            extracted_input.sort_intents,
            metric_id,
            tuple(dimension_ids),
            tuple(item.dimension_id for item in filters),
        )
        notes: list[str] = []
        if metric_id is None:
            if dimension_ids or filters:
                notes.append("Không có metric đơn; compiler sẽ dùng metric bundle của dimension.")
            else:
                notes.append("Không resolve được metric hoặc dimension phục vụ dashboard.")
        if metric_id and not table:
            notes.append("Khong xac dinh duoc table tu metric va dimensions da resolve.")
        if unresolved:
            notes.append("Co entity chua resolve; khong nen render SQL cho den khi duoc xu ly.")
        if any(item.status != "resolved" for item in sorts):
            notes.append("Co sort intent chua resolve; khong nen render SQL cho den khi duoc xu ly.")

        return ResolvedSQLComponents(
            domain_id=self.catalog.domain_id,
            table=table.physical_name if table else None,
            metric_id=metric_id,
            metric_ids=tuple(metric_ids),
            dimensions=tuple(self._dedupe(dimension_ids)),
            filters=tuple(filters),
            resolved_entities=tuple(resolved),
            unresolved_entities=tuple(unresolved),
            notes=tuple(notes),
            sorts=sorts,
        )

    def _align_metrics_to_dimension_table(
        self,
        metric_ids: list[str],
        resolved: list[ResolvedEntity],
    ) -> tuple[str, ...]:
        """Map shared KPI semantics through declared fact-family metadata."""
        if not metric_ids:
            return ()

        tables_by_mention: dict[tuple[str, str], set[str]] = {}
        for item in resolved:
            if item.source.kind not in {"dimension_term", "dimension_value"}:
                continue
            dimension = self.catalog.get_dimension(item.canonical_id or "")
            if dimension is None:
                continue
            key = (item.source.kind, item.source.normalized_value)
            tables_by_mention.setdefault(key, set()).add(dimension.table_id)
        strong_tables = {
            next(iter(table_ids))
            for table_ids in tables_by_mention.values()
            if len(table_ids) == 1
        }
        if len(strong_tables) != 1:
            return tuple(metric_ids)
        target_table = next(iter(strong_tables))
        table = self.catalog.tables.get(target_table)
        target_fact_family = table.fact_family if table else None
        if not target_fact_family:
            return tuple(metric_ids)

        aligned: list[str] = []
        for metric_id in metric_ids:
            metric = self.catalog.metrics.get(metric_id)
            if metric is None or target_table in metric.source_tables:
                aligned.append(metric_id)
                continue
            candidate = self.catalog.metric_for_semantic_key(
                target_fact_family,
                metric.semantic_key,
            )
            aligned.append(candidate.id if candidate else metric_id)
        return tuple(dict.fromkeys(aligned))

    @staticmethod
    def _suppressed_metric_terms(extracted_input: ExtractedInput) -> set[str]:
        terms = {
            entity.normalized_value
            for entity in extracted_input.entities
            if entity.kind == "metric_term" and entity.normalized_value
        }
        return {
            term
            for term in terms
            if any(
                term != other
                and len(other) > len(term)
                and contains_lookup_phrase(other, term)
                for other in terms
            )
        }

    def _resolve_entity(self, entity: ExtractedEntity) -> ResolvedEntity:
        if entity.kind == "metric_term":
            metric_id = self.catalog.find_metric_id(entity.normalized_value)
            return self._result(entity, metric_id, "Rating metric catalog")

        if entity.kind == "dimension_term":
            dimension = self.catalog.get_dimension(entity.dimension_id or "")
            return self._result(entity, dimension.id if dimension else None, "Rating dimension catalog")

        if entity.kind == "dimension_value":
            dimension = self.catalog.get_dimension(entity.dimension_id or "")
            if not dimension:
                return self._unresolved(entity, "Dimension ID is absent from Rating semantic metadata.")
            if dimension.matching.strategy in {"doris_ngram", "sql_ngram"}:
                return ResolvedEntity(
                    source=entity,
                    canonical_id=dimension.id,
                    canonical_value=entity.value,
                    reason="Matched via Doris ngram matcher.",
                )
            dimension_values = self._load_dimension_values(dimension)
            canonical_value = (
                dimension_values.get(normalize_lookup_value(entity.value))
                or dimension_values.get(entity.normalized_value)
            )
            if canonical_value is None:
                return self._unresolved(entity, "Value is absent from this Rating dimension dictionary.")
            return ResolvedEntity(
                source=entity,
                canonical_id=dimension.id,
                canonical_value=canonical_value,
                reason="Matched Rating dimension value dictionary.",
            )

        return ResolvedEntity(entity, None, None, "ignored", "Not a metric or dimension-value entity.")

    def _load_dimension_values(self, dimension: DimensionDefinition) -> dict[str, str]:
        if dimension.id in self._value_cache:
            return self._value_cache[dimension.id]

        values: dict[str, str] = {}
        path = self.catalog.dictionary_path(dimension)
        if path and path.suffix == ".csv":
            with path.open("r", encoding="utf-8", newline="") as file:
                for row in csv.DictReader(file):
                    canonical = str(row.get("canonical_value", "")).strip()
                    if not canonical or normalize_lookup_value(canonical) == "canonical value":
                        continue
                    for value in (canonical, *str(row.get("alias", "")).split("|")):
                        normalized = normalize_lookup_value(value)
                        if normalized:
                            values[normalized] = canonical
        elif path and path.suffix == ".json":
            payload = json.loads(path.read_text(encoding="utf-8"))
            if isinstance(payload, dict):
                for canonical in payload:
                    values[normalize_lookup_value(str(canonical))] = str(canonical)

        self._value_cache[dimension.id] = values
        return values

    def _resolve_sort_intents(
        self,
        intents: tuple[ExtractedSortIntent, ...],
        metric_id: str | None,
        dimension_ids: tuple[str, ...],
        filter_dimension_ids: tuple[str, ...],
    ) -> tuple[ResolvedSort, ...]:
        """Bind extracted sort targets after table-compatible dimensions are known."""
        if not intents:
            return ()

        primary_metric_id = metric_id
        if primary_metric_id is None:
            bundle_context = tuple(dict.fromkeys((*dimension_ids, *filter_dimension_ids)))
            bundle = self.catalog.metric_bundle_for(bundle_context)
            primary_metric_id = bundle[0] if bundle else None

        resolved: list[ResolvedSort] = []
        for intent in intents:
            if intent.target_kind == "metric":
                candidate = (
                    self.catalog.find_metric_id(intent.target_value)
                    if intent.target_value
                    else primary_metric_id
                )
                if candidate and metric_id and candidate != metric_id:
                    candidate_metric = self.catalog.metrics.get(candidate)
                    selected_metric = self.catalog.metrics.get(metric_id)
                    if (
                        candidate_metric
                        and selected_metric
                        and candidate_metric.fact_family != selected_metric.fact_family
                    ):
                        aligned = self.catalog.metric_for_semantic_key(
                            selected_metric.fact_family,
                            candidate_metric.semantic_key,
                        )
                        if aligned and aligned.id == metric_id:
                            candidate = metric_id
                    if selected_metric and intent.target_value and candidate != metric_id:
                        normalized_sort_target = normalize_lookup_value(intent.target_value)
                        selected_phrases = {
                            normalize_lookup_value(p)
                            for p in (selected_metric.id, selected_metric.label, *selected_metric.aliases)
                        }
                        if normalized_sort_target in selected_phrases:
                            candidate = metric_id

                if candidate and metric_id and candidate != metric_id:
                    resolved.append(
                        ResolvedSort(
                            source=intent,
                            field_id=None,
                            direction=intent.direction,
                            status="ambiguous",
                            reason=f"Sort metric {candidate} conflicts with selected metric {metric_id}.",
                            candidates=(metric_id, candidate),
                        )
                    )
                elif candidate:
                    resolved.append(
                        ResolvedSort(
                            source=intent,
                            field_id=candidate,
                            direction=intent.direction,
                            reason="Matched Rating metric sort target.",
                        )
                    )
                else:
                    resolved.append(self._unresolved_sort(intent, "No primary Rating metric matched sort target."))
                continue

            if intent.target_kind == "dimension" and intent.target_value:
                all_candidates = tuple(
                    dict.fromkeys(
                        dimension_id
                        for phrase, dimension_id in self.catalog.dimension_terms()
                        if phrase == intent.target_value
                    )
                )
                candidates = tuple(item for item in all_candidates if item in dimension_ids)
                if len(candidates) == 1:
                    resolved.append(
                        ResolvedSort(
                            source=intent,
                            field_id=candidates[0],
                            direction=intent.direction,
                            reason="Matched selected Rating dimension sort target.",
                        )
                    )
                elif len(candidates) > 1:
                    resolved.append(
                        ResolvedSort(
                            source=intent,
                            field_id=None,
                            direction=intent.direction,
                            status="ambiguous",
                            reason="Multiple selected Rating dimensions matched sort target.",
                            candidates=candidates,
                        )
                    )
                else:
                    resolved.append(
                        self._unresolved_sort(
                            intent,
                            "Sort dimension is not selected by the compatible Rating table.",
                            all_candidates,
                        )
                    )
                continue

            resolved.append(self._unresolved_sort(intent, "Sort direction has no metric or dimension target."))
        return tuple(resolved)

    @staticmethod
    def _unresolved_sort(
        intent: ExtractedSortIntent,
        reason: str,
        candidates: tuple[str, ...] = (),
    ) -> ResolvedSort:
        return ResolvedSort(
            source=intent,
            field_id=None,
            direction=intent.direction,
            status="unresolved",
            reason=reason,
            candidates=candidates,
        )

    @staticmethod
    def _remove_implicit_overlapping_filters(
        filters: list[ResolvedFilter],
        resolved_entities: list[ResolvedEntity],
        preferred_dimensions: tuple[str, ...] = (),
    ) -> list[ResolvedFilter]:
        explicit_dimensions = {
            item.canonical_id
            for item in resolved_entities
            if item.source.kind == "dimension_term" and item.canonical_id
        }
        value_entities = [
            item
            for item in resolved_entities
            if item.source.kind == "dimension_value" and item.canonical_id and item.canonical_value is not None
        ]
        suppressed: set[tuple[str, str]] = set()
        preferred = set(preferred_dimensions)
        values_by_phrase: dict[str, list[ResolvedEntity]] = {}
        for item in value_entities:
            values_by_phrase.setdefault(item.source.normalized_value, []).append(item)
        for matches in values_by_phrase.values():
            preferred_matches = [item for item in matches if item.canonical_id in preferred]
            if not preferred_matches:
                continue
            for item in matches:
                if item.canonical_id not in preferred and item.canonical_value is not None:
                    suppressed.add((item.canonical_id, item.canonical_value))
        for candidate in value_entities:
            if candidate.canonical_id in explicit_dimensions:
                continue
            candidate_text = candidate.source.normalized_value
            for other in value_entities:
                if other.canonical_id == candidate.canonical_id or len(other.source.normalized_value) <= len(candidate_text):
                    continue
                if contains_lookup_phrase(other.source.normalized_value, candidate_text):
                    suppressed.add((candidate.canonical_id, candidate.canonical_value))
                    break
        return [
            item
            for item in filters
            if (item.dimension_id, item.values[0] if item.values else "") not in suppressed
        ]

    @staticmethod
    def _result(entity: ExtractedEntity, canonical_id: str | None, source: str) -> ResolvedEntity:
        if canonical_id:
            return ResolvedEntity(entity, canonical_id, None, "resolved", f"Matched {source} ID.")
        return RatingResolveEntities._unresolved(entity, f"No {source} ID matched.")

    @staticmethod
    def _unresolved(entity: ExtractedEntity, reason: str) -> ResolvedEntity:
        return ResolvedEntity(entity, None, None, "unresolved", reason)

    @staticmethod
    def _dedupe(values: list[str]) -> list[str]:
        return list(dict.fromkeys(values))

    @staticmethod
    def _merge_dimension_filters(filters: list[ResolvedFilter]) -> list[ResolvedFilter]:
        """Gộp nhiều giá trị cùng dimension thành một predicate IN."""
        grouped: dict[str, list[ResolvedFilter]] = {}
        for item in filters:
            grouped.setdefault(item.dimension_id, []).append(item)

        merged: list[ResolvedFilter] = []
        for dimension_id, items in grouped.items():
            values = tuple(
                dict.fromkeys(value for item in items for value in item.values)
            )
            if not values:
                continue
            merged.append(
                ResolvedFilter(
                    dimension_id=dimension_id,
                    physical_column=items[0].physical_column,
                    operator="=" if len(values) == 1 else "IN",
                    values=values,
                    source_text=" và ".join(
                        dict.fromkeys(item.source_text for item in items)
                    ),
                )
            )
        return merged
