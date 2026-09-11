"""Translate renderer-owned named bindings for mysql-connector."""

from __future__ import annotations

import re
from typing import Any


_PLACEHOLDER = re.compile(r":(\w+)")


def translate_named_to_positional(
    sql: str,
    params: dict[str, Any],
) -> tuple[str, tuple[Any, ...]]:
    """Replace named placeholders in occurrence order with ``%s`` bindings."""
    ordered_values: list[Any] = []

    def replace(match: re.Match[str]) -> str:
        name = match.group(1)
        if name not in params:
            raise KeyError(f"Missing bind value for placeholder :{name}")
        value = params[name]
        if isinstance(value, (list, tuple)):
            raise ValueError(
                f":{name} is bound to a list; renderer must expand IN values into scalar placeholders."
            )
        ordered_values.append(value)
        return "%s"

    return _PLACEHOLDER.sub(replace, sql), tuple(ordered_values)


__all__ = ("translate_named_to_positional",)
