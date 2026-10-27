"""All numeric prose is rendered from a validated FactSet; no model calls."""
from datetime import date, timedelta

from .facts import FactSet
from .presentation import PresentationCatalog, format_number


def period_label(time_range):
    last = date.fromisoformat(time_range.end) - timedelta(days=1)
    return f"{time_range.start} đến {last.isoformat()}"


class RatingTemplates:
    def __init__(self, catalog, display_rows=100):
        self.catalog = catalog
        self.presentation = PresentationCatalog(catalog)
        self.display_rows = display_rows

    def render(self, facts: FactSet):
        plan = facts.plan
        filters = "; ".join(f"{self.catalog.get_dimension(f.field).label}: {', '.join(f.value) if isinstance(f.value, tuple) else f.value}" for f in plan.filters)
        scope = filters or "toàn bộ phạm vi đã chọn"
        if plan.comparison_spec:
            header = (f"{scope}. Kỳ gốc: {period_label(plan.comparison_spec.baseline.time_range)}; "
                      f"kỳ đích: {period_label(plan.comparison_spec.target.time_range)}.")
        else:
            header = f"{scope}. Kỳ: {period_label(plan.time_range)}."
        data = facts.analysis.get("data", [])
        if plan.pattern_name in {"period_comparison", "dimension_comparison"}:
            lines = self._comparisons(data)
        else:
            lines = []
            metric_count = max(1, len(plan.metrics))
            computed = data if isinstance(data, list) else []
            for index in range(0, len(facts.facts), metric_count):
                group_facts = facts.facts[index:index + metric_count]
                first = group_facts[0]
                group = ", ".join(f"{self.catalog.get_dimension(k).label}: {v if v is not None else 'chưa có dữ liệu'}" for k, v in first.group.items())
                values = "; ".join(f"{self.catalog.require_metric(f.metric_id).label}: {self.presentation.format(f.metric_id, f.value)}" for f in group_facts if f.metric_id)
                row_index = index // metric_count
                extra = computed[row_index] if row_index < len(computed) else {}
                if plan.pattern_name in {"rank_lookup", "rank_comparison"}:
                    rank = extra.get("rank", row_index + 1) if first.value is not None else None
                    group = (f"Hạng {rank}" if rank is not None else "Chưa có thứ hạng") + f" — {group}"
                if plan.pattern_name == "rank_comparison":
                    values += f"; tỷ trọng trong Top-N: {self._percent(extra.get('pct_of_total'))}"
                if plan.pattern_name == "share_distribution" and plan.denominator_scope == "none":
                    values += f"; tỷ trọng trong phạm vi truy vấn: {self._percent(extra.get('pct_of_total'))}"
                if plan.pattern_name == "trend_analysis":
                    change = extra.get("mom_change_pct")
                    values += f"; thay đổi so với kỳ liền trước: {self._percent(change)}"
                lines.append(": ".join(part for part in (group, values) if part))
        output = [header] + [f"- {line}" for line in lines[:self.display_rows]]
        if len(lines) > self.display_rows:
            output.append(f"Hiển thị {self.display_rows}/{len(lines)} dòng; các dòng còn lại nằm trong data.")
        return "\n".join(output)

    def _comparisons(self, data):
        lines = []
        for item in data.get("comparisons", []):
            metric = item["metric_id"]
            label = self.catalog.require_metric(metric).label
            group = ", ".join(str(v) for v in item.get("group", {}).values())
            a, b = item.get("group_a", "kỳ gốc"), item.get("group_b", "kỳ đích")
            text = (f"{group + ' — ' if group else ''}{label}: {a} {self.presentation.format(metric, item['value_a'])}; "
                    f"{b} {self.presentation.format(metric, item['value_b'])}")
            if item["delta"] is None:
                text += "; chưa đủ dữ liệu để tính chênh lệch"
            else:
                direction = "tăng" if item["delta"] > 0 else "giảm" if item["delta"] < 0 else "không đổi"
                text += f"; {direction}, chênh lệch {self.presentation.format(metric, item['delta'], delta=True)}; thay đổi tương đối {self._percent(item['delta_pct'])}"
            lines.append(text)
        if not lines:
            lines.append("Chưa đủ dữ liệu cho hai phía so sánh.")
        return lines

    @staticmethod
    def _percent(value):
        return "không xác định" if value is None else format_number(value, 2) + "%"
