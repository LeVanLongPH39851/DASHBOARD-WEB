"""Normalization used only for catalog lookup after raw-text extraction."""

from __future__ import annotations

import re
import unicodedata


def normalize_lookup_value(value: str) -> str:
    """Return a stable lookup key without changing the raw user value."""
    value = value.replace("%", " percent ")
    decomposed = unicodedata.normalize("NFD", value.casefold().strip())
    without_accents = "".join(
        character
        for character in decomposed
        if unicodedata.category(character) != "Mn"
    )
    normalized = without_accents.replace("đ", "d")
    normalized = re.sub(r"\bthasg\b", "thang", normalized)
    normalized = re.sub(r"\bphan\s+tram\b", "percent", normalized)
    return " ".join(re.sub(r"[^a-z0-9]+", " ", normalized).split())


def contains_lookup_phrase(text: str, phrase: str) -> bool:
    """Match one normalized phrase at lexical boundaries."""
    if not phrase:
        return False
    return bool(re.search(r"(?<!\w)" + re.escape(phrase) + r"(?!\w)", text))


__all__ = ("contains_lookup_phrase", "normalize_lookup_value")
