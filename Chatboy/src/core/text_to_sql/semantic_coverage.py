"""Check explicit question requirements independently of the model's extraction.

The inventory is catalog-owned, not another model judgment. Unrecognized KPI
phrases are clarified; known requirements may neither disappear nor conflict.
"""
from dataclasses import replace
import re
import unicodedata

import yaml

from .planning_contracts import SemanticCoverage, SourceEvidence
from .semantic_extraction.normalization import normalize_lookup_value


def normalized_spans(text):
    chars, positions = [], []
    for index, character in enumerate(text):
        chunk = ' percent ' if character == '%' else unicodedata.normalize('NFD', character.casefold()).replace('đ', 'd')
        for item in chunk:
            if unicodedata.category(item) == 'Mn':
                continue
            chars.append(item if item.isascii() and item.isalnum() else ' ')
            positions.append(index)
    tokens = [(m[0], positions[m.start()], positions[m.end() - 1] + 1)
              for m in re.finditer(r'\S+', ''.join(chars))]
    merged, i = [], 0
    while i < len(tokens):
        token, start, end = tokens[i]
        if token == 'phan' and i + 1 < len(tokens) and tokens[i + 1][0] == 'tram':
            token, end = 'percent', tokens[i + 1][2]
            i += 1
        merged.append(('thang' if token == 'thasg' else token, start, end))
        i += 1
    normalized, offsets = '', []
    for token, start, end in merged:
        if normalized:
            normalized += ' '
            offsets.append((start, start))
        normalized += token
        offsets.extend([(start, end)] * len(token))
    return normalized, offsets


def phrase_spans(text, phrase):
    normalized, offsets = normalized_spans(text)
    phrase = normalize_lookup_value(phrase)
    if not phrase:
        return ()
    return tuple((offsets[m.start()][0], offsets[m.end() - 1][1])
                 for m in re.finditer(r'(?<!\w)' + re.escape(phrase) + r'(?!\w)', normalized))


class SemanticCoverageChecker:
    def __init__(self, catalog, memory):
        self.catalog, self.memory = catalog, memory
        policy_path = catalog.project_root / 'data/dashboard/rating/semantic_policies.yaml'
        self.policy = yaml.safe_load(policy_path.read_text())
        if self.policy['default_fact_family'] not in {'channel', 'program'}:
            raise ValueError('invalid_default_fact_family')
        for rule in self.policy.get('category_shares', []):
            for metric_id in (*rule['source_metrics'], rule['all'], rule['selected']):
                catalog.require_metric(metric_id)
        self.metric_phrases = {}
        self.value_phrases = {}
        for metric in catalog.metrics.values():
            if metric.status == 'active':
                for phrase in (metric.label, *metric.aliases):
                    self.metric_phrases.setdefault(normalize_lookup_value(phrase), set()).add(metric.id)
        for dimension in catalog.dimensions.values():
            if dimension.semantic_type == 'time' or dimension.free_text:
                continue
            for record in memory.records_for(dimension.id):
                for phrase in (record.canonical_value, *record.aliases):
                    self.value_phrases.setdefault(normalize_lookup_value(phrase), set()).add((dimension.id, record.canonical_value))

    @staticmethod
    def _mentions(question, phrases, masked=()):
        text, offsets = normalized_spans(question)
        found = []
        for phrase, candidates in phrases.items():
            if not phrase:
                continue
            for match in re.finditer(r'(?<!\w)' + re.escape(phrase) + r'(?!\w)', text):
                start, end = offsets[match.start()][0], offsets[match.end() - 1][1]
                if any(a <= start and end <= b for a, b in masked):
                    continue
                found.append((start, end, candidates))
        return [item for item in found if not any(a <= item[0] and item[1] <= b and (a, b) != item[:2] for a, b, _ in found)]

    def name_spans(self, extraction):
        spans = []
        for dimension in extraction.dimensions:
            definition = self.catalog.get_dimension(dimension.dimension_id)
            if definition and definition.free_text:
                for raw in dimension.raw_values:
                    spans.extend(phrase_spans(extraction.question, raw))
        # Quoted names are independent evidence even if extraction omitted them.
        spans.extend(m.span(1) for m in re.finditer(r'["“]([^"”]+)["”]', extraction.question))
        return tuple(spans)

    def context_question(self, extraction):
        question = extraction.question
        for start, end in self.name_spans(extraction):
            question = question[:start] + ' ' * (end - start) + question[end:]
        return question

    def check(self, extraction, *, confirmed=None, name_spans=None):
        confirmed = confirmed or {}
        question = extraction.question
        masked = self.name_spans(extraction) if name_spans is None else name_spans
        context_question = question
        for start, end in masked:
            context_question = context_question[:start] + ' ' * (end - start) + context_question[end:]
        text = normalize_lookup_value(context_question)
        if any(re.search(r'(?<!\w)' + re.escape(normalize_lookup_value(cue)) + r'(?!\w)', text)
               for cue in self.policy['unsupported_filter_cues']):
            return SemanticCoverage('unsupported', reason_code='unsupported_filter_negation')
        if re.search(r'\btheo\s+(?:tung\s+)?(?:quy|nam)\b', text):
            return SemanticCoverage('unsupported', reason_code='unsupported_time_grain')
        values = self._mentions(question, self.value_phrases, masked)
        program_evidence = bool(masked) or any(
            all(dim.startswith('agg_info_program.') for dim, _ in candidates)
            for _, _, candidates in values)
        family = 'program' if program_evidence or re.search(r'\b(?:chuong trinh|the loai)\b', text) else self.policy['default_fact_family']
        category_values = {value for _, _, candidates in values for dim, value in candidates if dim.endswith('.category_level1')}
        share_requested = bool(re.search(r'\b(?:percent|ty le|ty trong|co cau)\b', text))
        selected_share = len(category_values) >= 2 and bool(re.search(r'\b(?:so sanh|so voi|vs)\b', text))
        mentions = self._mentions(question, self.metric_phrases, masked)
        # An explicit percent suffix disambiguates overlapping aliases such as
        # "biến động rating" and "rating%" at the same mention.
        percent_spans = [(a, b) for a, b, _ in mentions
                         if normalize_lookup_value(question[a:b]).endswith('percent')]
        mentions = [(a, b, values) for a, b, values in mentions
                    if not any(a < end and start < b and b < end for start, end in percent_spans)]
        candidate_sets, evidence = [], []
        for start, end, candidates in mentions:
            in_family = {m for m in candidates if self.catalog.require_metric(m).fact_family == family}
            if in_family:
                candidates = in_family
            else:
                aligned = {m.id for candidate in candidates
                           if (m := self.catalog.metric_for_semantic_key(family, self.catalog.require_metric(candidate).semantic_key))}
                candidates = aligned or candidates
            if share_requested and category_values:
                for rule in self.policy.get('category_shares', []):
                    if candidates & set(rule['source_metrics']):
                        candidates = (candidates - set(rule['source_metrics'])) | {rule['selected' if selected_share else 'all']}
            exact_labels = {m for m in candidates if normalize_lookup_value(self.catalog.require_metric(m).label) == normalize_lookup_value(question[start:end])}
            candidates = exact_labels or candidates
            candidate_sets.append(candidates)
            evidence.append(SourceEvidence('metric', tuple(sorted(candidates)), 'question', question[start:end], start, end))
        metric_candidates = set.intersection(*candidate_sets) if candidate_sets else set()
        if candidate_sets and not metric_candidates:
            return SemanticCoverage('unsupported', tuple(evidence), reason_code='unsupported_multiple_metrics')
        missing, conflicts, unresolved = [], [], []
        if 'metric' in confirmed:
            evidence.append(SourceEvidence('metric', extraction.metric_id, 'clarification', confirmed['metric']))
        elif candidate_sets:
            if extraction.metric_id not in metric_candidates:
                conflicts.append('metric_does_not_match_question')
            elif len(metric_candidates) > 1:
                unresolved.append('metric')
        elif extraction.metric_id:
            unresolved.append('metric')
            metric_candidates = {m.id for m in self.catalog.metrics.values() if m.status == 'active' and m.fact_family == family}
        requested = {d.dimension_id: d for d in extraction.dimensions}
        for start, end, candidates in values:
            family_candidates = {(dim, value) for dim, value in candidates
                                 if self.catalog.tables[self.catalog.get_dimension(dim).table_id].fact_family == family}
            candidates = family_candidates or candidates
            # Equivalent catalog dimensions (e.g. regions) remain alternatives.
            matched = []
            for dim, canonical in candidates:
                actual = requested.get(dim)
                if dim in confirmed:
                    matched.append((dim, canonical))
                elif actual and 'filter' in actual.roles and any(
                    canonical in self.memory.exact_matches(dim, raw) or normalize_lookup_value(raw) == normalize_lookup_value(canonical)
                    for raw in actual.raw_values):
                    matched.append((dim, canonical))
            if not matched:
                missing.append('filter:' + question[start:end])
            for dim, canonical in matched:
                evidence.append(SourceEvidence(dim, canonical, 'clarification' if dim in confirmed else 'question',
                    confirmed.get(dim, question[start:end]), None if dim in confirmed else start, None if dim in confirmed else end))
        if masked and re.search(r'\b(?:chuong trinh|ten)\b', normalize_lookup_value(question)):
            if not any(self.catalog.get_dimension(d.dimension_id).free_text and d.raw_values for d in extraction.dimensions):
                missing.append('program_name')
        for dimension in extraction.dimensions:
            for value in dimension.raw_values:
                if dimension.dimension_id in confirmed:
                    evidence.append(SourceEvidence(dimension.dimension_id, value, 'clarification', confirmed[dimension.dimension_id]))
                else:
                    spans = phrase_spans(question, value)
                    spans += tuple((start, end) for start, end, candidates in values
                                   if (dimension.dimension_id, value) in candidates)
                    if not spans and not dimension.dimension_id.endswith('.time_band'):
                        conflicts.append('ungrounded_filter:' + dimension.dimension_id)
                    for start, end in spans:
                        evidence.append(SourceEvidence(dimension.dimension_id, value, 'question', question[start:end], start, end))
        for match in re.finditer(r'\btheo\s+(?:tung\s+)?(kenh|ngay|tuan|thang|tinh|vung|nen tang|the loai)\b', text):
            suffix = {'kenh':'channel','ngay':'date','tuan':'date','thang':'date','tinh':'province','vung':'region','nen tang':'platform','the loai':'category_level1'}[match[1]]
            if not any(d.dimension_id.endswith('.' + suffix) and 'group_by' in d.roles for d in extraction.dimensions):
                missing.append('group_by:' + suffix)
        status = 'mismatch' if missing or conflicts else 'ambiguous' if unresolved else 'complete'
        return SemanticCoverage(status, tuple(evidence), tuple(dict.fromkeys(missing)), tuple(dict.fromkeys(conflicts)),
                                tuple(unresolved), tuple(sorted(metric_candidates)))

    def validate_plan(self, extraction, binding, context, plan, coverage, time_resolution=None):
        """A valid extraction must survive deterministic compilation unchanged."""
        errors = []
        if extraction.metric_id and extraction.metric_id not in {m.id for m in plan.metrics}:
            errors.append('plan_lost_metric')
        for dimension in binding.dimensions:
            definition = self.catalog.get_dimension(dimension.dimension_id)
            equivalent = {d.id for d in self.catalog.dimensions.values()
                          if (d.column, d.label) == (definition.column, definition.label)}
            if 'filter' in dimension.roles and dimension.canonical_values:
                actual = next((f for f in plan.filters if f.field in equivalent), None)
                actual_values = set(actual.value if isinstance(actual.value, tuple) else (actual.value,)) if actual else set()
                if actual_values != set(dimension.canonical_values):
                    errors.append('plan_changed_filter:' + dimension.dimension_id)
            # A group fixed to one value by the same filter is a constant;
            # the resolver may elide it without combining distinct groups.
            constant_group = 'filter' in dimension.roles and len(dimension.canonical_values) == 1
            if 'group_by' in dimension.roles and not constant_group and not equivalent.intersection(plan.dimensions):
                errors.append('plan_lost_grouping:' + dimension.dimension_id)
        limits = [int(e.value) for e in context.entities if e.kind == 'limit']
        if limits and plan.limit != limits[0]:
            errors.append('plan_lost_limit')
        pattern = self.catalog.patterns[plan.pattern_name]
        if not context.sort_intents:
            for default in pattern.default_order:
                fields = [m.id for m in plan.metrics] if default.target == 'primary_metric' else plan.dimensions
                if default.index < len(fields) and not any(
                        order.field == fields[default.index] and order.direction == default.direction
                        for order in plan.order_by):
                    errors.append('plan_lost_default_order')
        for intent in context.sort_intents:
            targets = set()
            if intent.target_kind == 'metric':
                targets = {m.id for m in plan.metrics}
            elif intent.target_kind == 'dimension':
                targets = {d.id for d in self.catalog.dimensions.values()
                           if normalize_lookup_value(intent.target_value or '') in
                           {normalize_lookup_value(v) for v in (d.label, *d.aliases)}}
            if not any(order.direction == intent.direction and (not targets or order.field in targets)
                       for order in plan.order_by):
                errors.append('plan_lost_order')
        if time_resolution and time_resolution.resolved_ranges:
            expected = time_resolution.resolved_ranges
            actual = tuple(p.time_range for p in plan.comparison_spec.periods) if plan.comparison_spec else (plan.time_range,)
            if actual != expected:
                errors.append('plan_changed_time')
        evidence = list(coverage.evidence)
        if plan.order_by:
            evidence.append(SourceEvidence('order_by', tuple((o.field, o.direction) for o in plan.order_by),
                'question' if context.sort_intents else 'catalog_default',
                text=', '.join(i.source_text for i in context.sort_intents), rule_id='pattern_order'))
        for entity in context.entities:
            if entity.kind == 'limit':
                evidence.append(SourceEvidence('limit', plan.limit, 'question', entity.source_text))
        if not extraction.metric_id and plan.metrics:
            evidence.append(SourceEvidence('metrics', tuple(m.id for m in plan.metrics), 'catalog_default', rule_id='dimension_metric_bundle'))
        evidence.append(SourceEvidence('channel_weight_scope', plan.channel_weight_scope,
            'question' if plan.channel_weight_scope != 'total' else 'catalog_default', rule_id='channel_weight_scope'))
        return replace(coverage, status='mismatch' if errors else coverage.status,
                       conflicts=(*coverage.conflicts, *errors), evidence=tuple(evidence))
