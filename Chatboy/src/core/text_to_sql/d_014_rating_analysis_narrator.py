"""Compatibility facade for deterministic, evidence-only templates."""
from dataclasses import dataclass
from .catalog import RatingCatalog
from .facts import FactSet
from .templates import RatingTemplates
from .presentation import format_number


@dataclass(frozen=True)
class RatingAnalysisOutput:
    text: str
    source: str = "deterministic"


class RatingAnalysisNarrator:
    def __init__(self, llm_client=None, catalog=None):
        self.catalog = catalog or RatingCatalog.load()
        self.templates = RatingTemplates(self.catalog)

    def narrate(self, facts: FactSet, analysis=None):
        if not isinstance(facts, FactSet):
            raise TypeError("Numeric templates require a validated FactSet")
        return RatingAnalysisOutput(self.templates.render(facts))
