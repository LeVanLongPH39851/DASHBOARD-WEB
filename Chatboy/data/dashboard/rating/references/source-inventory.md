# Source Inventory

## Coverage

- Coverage level: Airtime và các Program KPI có công thức đầy đủ đã executable; công thức bị cắt dở vẫn bị chặn.
- Sources checked: Program fact/join SQL, Superset metric expressions, query example, approved airtime denominator rules, active Rating v3 catalog, physical Program schema, existing Program domain metadata, and v3 compiler tests.
- Missing high-value lanes: phần còn lại của công thức `Phút/người/lượt phát` và query-result fixture từ Doris.
- Rejected or lower-confidence candidates: chart titles alone are not treated as exact formula definitions.

## Sources

| Source | Type | Locator | Permission Status | Last Checked | Supports | Gaps Or Caveats | Automation Eligible | Update Boundary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Program fact/join SQL | Dashboard query export | data/dashboard/rating/references/program_weight.sql | Read | 2026-08-13 | EPG grain, base measures, fixed filters, optional overlap and audience joins | Superset templating still needs translation into deterministic contracts | Yes, local file | Draft proposed changes when SQL changes |
| Program metric expressions | Superset metric export | data/dashboard/rating/references/program_metric.sql | Read | 2026-08-13 | Rating, Reach, viewing duration and viewing-time-share formulas | Formula 1 is truncated and must not be inferred | Yes, local file | Add only source-complete formulas |
| Program query example | Dashboard query example | data/dashboard/rating/references/program_example.sql | Read | 2026-08-13 | Concrete genre grouping/filter usage | Represents one query shape, not a universal percentage formula | Yes, local file | Use as behavioral evidence only |
| Airtime denominator decision | Approved business rule | Conversation decision on 2026-08-12 | Read | 2026-08-12 | One category uses all eligible categories; multiple compared categories use their selected-group total | Not independently reconciled to a Superset chart expression | No, manual decision | Report conflicts; do not overwrite silently |
| Program physical schema | DDL | data/domains/program/physical_schema/data_dashboard_rating.agg_info_program.sql | Read | 2026-08-11 | Physical columns and Doris types | No freshness or lineage metadata | Yes, local file | May update schema references |
| Existing Program domain | Semantic metadata | data/domains/program | Read | 2026-08-11 | Names, aliases, dimensions, direct aggregates, business rules | Older contract forbids joins and therefore cannot represent dashboard weighting | Yes, local files | Use as supporting evidence only |
| Rating v3 catalog | Executable semantic catalog | data/dashboard/rating | Read/write | 2026-08-13 | Deployment contract plus modular Program fact/measures/calculations/metrics | Live Doris result parity is not yet proven | Yes, local files | Update only with source-backed tests |
| Program name dictionary | Canonical value snapshot | data/dashboard/rating/values/program_names.csv | Read/write | 2026-08-12 | Local exact/fuzzy whitelist for Program `program_name`; intentionally excluded from LLM context | Snapshot does not currently contain every program name, including `Rạng rỡ Việt Nam` | Yes, local file | Add values only from a trusted source export |
| v3 tests | Executable validation | src/core/text_to_sql/test | Read/write | 2026-08-12 | Resolution, denominator placement and SQL rendering behavior | No live Doris result comparison | Yes, local files | May update tests with catalog behavior |
