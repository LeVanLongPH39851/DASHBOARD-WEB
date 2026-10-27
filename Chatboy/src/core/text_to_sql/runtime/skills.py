"""Repo-owned skill registry. References cannot escape the catalog directory."""
import hashlib
from pathlib import Path

import yaml

from .context import CURRENT_CONTEXT

SKILL_IDS = ("rating-semantics", "rating-channel", "rating-program", "rating-comparison", "rating-definitions")


class SkillRegistry:
    def __init__(self, catalog, enabled=True):
        self.catalog = catalog
        self.enabled = enabled
        self.root = catalog.project_root / "skills"
        self.metadata = {}
        self._bodies = {}
        digest = hashlib.sha256()
        for name in SKILL_IDS:
            text = (self.root / name / "SKILL.md").read_text(encoding="utf-8")
            _, frontmatter, body = text.split("---", 2)
            metadata = yaml.safe_load(frontmatter)
            if metadata["name"] != name or not metadata.get("description") or not metadata["metadata"].get("version"):
                raise ValueError(f"invalid_skill_metadata:{name}")
            for reference in metadata["metadata"]["catalog_refs"].split(","):
                path = (catalog.project_root / reference.strip()).resolve()
                if not path.is_relative_to((catalog.project_root / "data/dashboard/rating").resolve()) or not path.is_file():
                    raise ValueError(f"invalid_skill_reference:{name}:{reference}")
            self.metadata[name] = metadata
            self._bodies[name] = body.strip()
            digest.update(text.encode())
        self.version = digest.hexdigest()[:16]

    def select(self, intent, metric_id=None, pattern=None):
        if not self.enabled:
            return ()
        if intent == "definition":
            return ("rating-definitions",)
        if intent != "data_query":
            return ()
        selected = ["rating-semantics"]
        if metric_id:
            family = metric_id.split(".")[0]
            selected.append("rating-program" if family == "program" else "rating-channel")
        else:
            # Unknown family must retain both capability sets.
            selected.extend(("rating-channel", "rating-program"))
        if pattern and "comparison" in pattern:
            selected.append("rating-comparison")
        return tuple(selected)

    def activate(self, intent, metric_id=None, pattern=None):
        selected = self.select(intent, metric_id, pattern)
        ctx = CURRENT_CONTEXT.get()
        if ctx:
            ctx.skills = tuple(f"{name}@{self.metadata[name]['metadata']['version']}" for name in selected)
            ctx.emit("skills", outcome="ok")
        return selected

    def body(self, selected):
        return "\n\n".join(self._bodies[name] for name in selected)


class SkillAwareLLM:
    def __init__(self, client, registry):
        self.client, self.registry = client, registry
        self.model = getattr(client, "model", "fixture")

    def complete_text(self, *, system_prompt="", **kwargs):
        ctx = CURRENT_CONTEXT.get()
        names = tuple(s.split("@")[0] for s in ctx.skills) if ctx else ()
        if names:
            system_prompt += "\n\n" + self.registry.body(names)
        return self.client.complete_text(system_prompt=system_prompt, **kwargs)
