# Evidence Register

| Fact Or Claim | Source Type | Source Path | Observed | Confidence | Notes |
| --- | --- | --- | --- | --- | --- |
| Program fact is aggregated at EPG event grain | Dashboard export | data/dashboard/rating/references/program_weight.sql | 2026-08-13 | High | date, channel, program, start/end, epg_id_hash, event_duration |
| Airtime uses event_duration rather than duration_view | Dashboard export plus physical schema | data/dashboard/rating/references/program_weight.sql | 2026-08-13 | High | Runtime strategy deduplicates an EPG event with MAX before summing |
| Weight joins always include date and channel | Dashboard export | data/dashboard/rating/references/program_weight.sql | 2026-08-13 | High | Applies to weighted audience KPI, not to airtime calculations |
| Advertising and Promotion are excluded | Dashboard export | data/dashboard/rating/references/program_weight.sql | 2026-08-13 | High | Fixed firstlevel_vn exclusion |
| Program formulas require metric-specific measure and join sets | Superset metric export | data/dashboard/rating/references/program_metric.sql | 2026-08-13 | High | Example: Average Reach does not need duration/population; Reach percent needs population |
| Program rating uses an IF/cap formula at EPG grain | Superset metric export | data/dashboard/rating/references/program_metric.sql | 2026-08-13 | High | Uses event duration, EPG count, user coefficient and 0.9 cap |
| Minutes/person/play formula is incomplete | Superset metric export | data/dashboard/rating/references/program_metric.sql | 2026-08-13 | High | Source ends at `SUM(duration_view*weight)*`; metric is intentionally not active |
| One selected category divides by all eligible categories | Approved business rule | Decision recorded 2026-08-12 | 2026-08-12 | High | Same time/channel/non-category filters apply to numerator and denominator |
| Several compared categories divide by their selected-group total | Approved business rule | Decision recorded 2026-08-12 | 2026-08-12 | High | Each category share is category airtime / sum of all categories named in the comparison |
| Program dependencies are declarative | Executable module and tests | data/dashboard/rating/program; src/core/text_to_sql/recipes/program_metric; src/core/text_to_sql/test/test_program_metric_recipe.py | 2026-08-13 | High | One recipe facade loads fact, measure, calculation, grain and join requirements from metadata |
| Airtime percentage is computed in SQL | Executable strategy and tests | src/core/text_to_sql/recipes/program_airtime.py | 2026-08-13 | High | Avoids the filtered single-category result being recomputed as 100 percent |
| Program-name filters require a canonical dictionary value | Executable binder and dictionary | src/core/text_to_sql/canonical_binding; data/dashboard/rating/values/program_names.csv | 2026-08-12 | High | LLM extracts raw values; local matcher binds the whitelist and cannot create a missing canonical value |
| Time filters do not require canonical values | Executable binder, time resolver and tests | src/core/text_to_sql/canonical_binding/binder.py; src/core/text_to_sql/d_008_time_resolver.py; src/core/text_to_sql/test/test_semantic_extraction_resolution.py | 2026-08-12 | High | `semantic_type: time` delegates raw periods to TimeResolver; only group/sort roles retain the date dimension |
