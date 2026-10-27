"""Catalog-only definition and no-scope workflows, with no numeric generation."""
from src.core.text_to_sql.catalog import RatingCatalog
from src.core.text_to_sql.intent_routing.agent_response import AgentResponse
from src.core.text_to_sql.semantic_extraction.normalization import normalize_lookup_value, contains_lookup_phrase
from src.core.text_to_sql.presentation import PresentationCatalog
from src.core.text_to_sql.semantic_memory import CanonicalMemory

_OUT_OF_SCOPE_REPLY = ("Tôi hỗ trợ số liệu và định nghĩa trong Dashboard Rating. "
    "Bạn có thể hỏi: Rating% là gì? Hoặc: lượt xem VTV1 hôm qua là bao nhiêu?")


def no_scope_response(question="", llm_client=None):
    return AgentResponse(intent="no_scope", reply=_OUT_OF_SCOPE_REPLY, success=True, source="deterministic")


class SemanticDefinitionAgent:
    def __init__(self, llm_client=None, catalog=None):
        self._catalog = catalog or RatingCatalog.load()
        self.presentation = PresentationCatalog(self._catalog)

    def _find_refs(self, question):
        q = normalize_lookup_value(question)
        candidates = []
        for entity in (*self._catalog.metrics.values(), *self._catalog.dimensions.values()):
            matches = [normalize_lookup_value(a) for a in (entity.label, *entity.aliases)
                       if contains_lookup_phrase(q, normalize_lookup_value(a))]
            if matches:
                candidates.append((max(matches, key=len), entity.id))
        # Keep distinct concepts; suppress a generic alias contained in a longer match.
        return [eid for alias, eid in candidates if not any(alias != other and contains_lookup_phrase(other, alias)
                   for other, _ in candidates)]

    def answer(self, question):
        refs = self._find_refs(question)
        parts = []
        for ref in refs:
            metric = self._catalog.metrics.get(ref)
            if metric:
                unit = self.presentation.metrics.get(ref)
                parts.append(f"**{metric.label}** ({ref.split('.')[0]}): {metric.description.strip()}"
                             + (f" Đơn vị: {unit.unit}." if unit else "")
                             + (f" Trạng thái: {metric.status}." if metric.status != "active" else "")
                             + " Nguồn: catalog Dashboard Rating.")
            else:
                dimension = self._catalog.get_dimension(ref)
                values = CanonicalMemory(self._catalog).canonical_values(ref) if dimension.matching.strategy != "doris_ngram" else ()
                parts.append(f"**{dimension.label}** là chiều phân tích của Dashboard Rating."
                             + (" Giá trị: " + ", ".join(values) + "." if values else ""))
        if not parts:
            parts = ["Chưa tìm được định nghĩa tương ứng trong catalog Rating; hãy nêu rõ chỉ số hoặc chiều phân tích."]
        return AgentResponse(intent="definition", reply="\n\n".join(parts), success=bool(refs),
                             source="deterministic", data={"catalog_refs": refs})
