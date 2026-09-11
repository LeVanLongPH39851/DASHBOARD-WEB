"""Process-local canonical dictionary memory shared by extraction and binding."""

from __future__ import annotations

import csv
import json
from dataclasses import dataclass

from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value


@dataclass(frozen=True)
class CanonicalValueRecord:
    dimension_id: str
    canonical_value: str
    aliases: tuple[str, ...]


class CanonicalMemory:
    """Load every configured value dictionary once for one pipeline instance."""

    def __init__(self, catalog: RatingCatalog):
        self._catalog = catalog
        self._records: dict[str, tuple[CanonicalValueRecord, ...]] = {}
        self._exact: dict[str, dict[str, tuple[str, ...]]] = {}
        self._load()

    def records_for(self, dimension_id: str) -> tuple[CanonicalValueRecord, ...]:
        return self._records.get(dimension_id, ())

    def exact_matches(self, dimension_id: str, raw_value: str) -> tuple[str, ...]:
        key = normalize_lookup_value(raw_value)
        return self._exact.get(dimension_id, {}).get(key, ())

    def canonical_values(self, dimension_id: str) -> tuple[str, ...]:
        return tuple(
            dict.fromkeys(record.canonical_value for record in self.records_for(dimension_id))
        )

    def _load(self) -> None:
        for dimension in self._catalog.dictionary_dimensions():
            path = self._catalog.dictionary_path(dimension)
            if path is None:
                continue
            raw_records: list[tuple[str, tuple[str, ...]]] = []
            if path.suffix == ".csv":
                with path.open("r", encoding="utf-8", newline="") as stream:
                    for row in csv.DictReader(stream):
                        canonical = str(row.get("canonical_value", "")).strip()
                        if not canonical or normalize_lookup_value(canonical) == "canonical value":
                            continue
                        aliases = tuple(
                            value.strip()
                            for value in str(row.get("alias", "")).split("|")
                            if value.strip()
                        )
                        raw_records.append((canonical, aliases))
            elif path.suffix == ".json":
                payload = json.loads(path.read_text(encoding="utf-8"))
                if isinstance(payload, dict):
                    for canonical, raw_aliases in payload.items():
                        aliases = (
                            tuple(str(value).strip() for value in raw_aliases if str(value).strip())
                            if isinstance(raw_aliases, (list, tuple))
                            else ()
                        )
                        raw_records.append((str(canonical).strip(), aliases))

            merged_records: dict[str, list[str]] = {}
            for canonical, aliases in raw_records:
                if not canonical:
                    continue
                merged_records.setdefault(canonical, []).extend(aliases)

            records: list[CanonicalValueRecord] = []
            exact: dict[str, list[str]] = {}
            for canonical, raw_aliases in merged_records.items():
                aliases = tuple(dict.fromkeys(raw_aliases))
                record = CanonicalValueRecord(dimension.id, canonical, aliases)
                records.append(record)
                for value in (canonical, *aliases):
                    key = normalize_lookup_value(value)
                    if key:
                        exact.setdefault(key, []).append(canonical)
            self._records[dimension.id] = tuple(records)
            self._exact[dimension.id] = {
                key: tuple(dict.fromkeys(values))
                for key, values in exact.items()
            }


__all__ = ("CanonicalMemory", "CanonicalValueRecord")
