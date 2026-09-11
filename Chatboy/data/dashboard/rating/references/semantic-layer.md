# Program Dashboard Semantic Layer

## Quick Reference

- Area: TV/OTT Program Rating.
- Canonical fact: data_dashboard_rating.agg_info_program.
- Dialect: Doris.
- Default date behavior: yesterday when no explicit range is supplied.
- Coverage: airtime và các Program KPI có công thức đầy đủ trong `program_metric.sql` đã executable; metric có công thức bị cắt dở chưa được kích hoạt.
- Source inventory: references/source-inventory.md.
- Last synthesized: 2026-08-12.

## Source Interpretation

Program semantic contract được tổng hợp từ ba loại bằng chứng:

- `references/program_weight.sql`: fact grain, fixed filters và join contract dùng chung.
- `references/program_metric.sql`: công thức metric Superset.
- `references/program_example.sql`: ví dụ truy vấn cụ thể cho group/filter, không phải một công thức tỷ lệ tổng quát.

Các khu vực Dashboard Program dùng chung fact query, nhưng khác metric và cách group/filter:

1. Airtime share by genre.
2. Watch-duration share by genre.
3. Rating and Average Reach by market.
4. Program ranking by KPI.
5. Detailed program KPIs.
6. Program KPIs by Live/TimeShift.

Fact CTE chung được group theo date, channel, program, start/end time và EPG event. Nó luôn loại Advertising và Promotion. Program module dùng `MAX(event_duration)` tại event grain trước khi tổng hợp airtime. Audience metric join weight theo date + channel; airtime không dùng weight, coefficient hoặc population.

Executable metadata nằm trong `data/dashboard/rating/program/`. Mọi Program metric dùng
`ProgramMetricRecipe`; calculation metadata quyết định measure, grain, join dependency và
`execution_strategy`, không có Python branch theo metric ID.

## Key Metrics

| Metric ID | Meaning | Calculation Source | Caveat |
| --- | --- | --- | --- |
| program.airtime_duration | Deduplicated EPG airtime in seconds | Sum event duration after EPG-grain aggregation | Used for absolute “how much airtime” questions |
| program.airtime_share_all_categories_percent | One category's share of all eligible categories | Category airtime / all-category airtime under the same non-category filters | A category filter is applied only after the denominator has been computed |
| program.airtime_share_selected_categories_percent | Each selected category's share of the selected group | Category airtime / total airtime of every category named in the comparison | Requires at least two category values; selected shares should total approximately 100 percent |
| program.weighted_view_duration | Weighted audience watch duration, hour | `SUM(duration_view * weight * view_coef) / 3600` | The share percentage can be computed by `share_distribution` when grouped |
| program.rating_absolute | Program rating | Dashboard IF/cap formula at EPG event grain | Uses `event_duration`, `epg_id_hash`, `user_coef` and the 0.9 cap |
| program.rating_percent | Program rating percent | Program rating / market population | Requires population join |
| program.average_reach | Average program reach | Weighted event audience with user coefficient / EPG play count | Viewers may contribute to multiple events, matching the exported grain |
| program.reach_percent | Program reach percent | Average Reach / population | Requires population join |
| program.viewing_time_share_percent | Program viewing-time share | Dashboard IF/cap expression divided by weighted audience and average event duration | Formula is kept declaratively in module metadata |

`Phút/người/lượt phát` chưa được khai báo active vì công thức số 1 trong
`program_metric.sql` kết thúc ở `SUM(duration_view*weight)*` và không đủ bằng chứng để suy diễn phần còn lại.

## Dimensions

Program semantics support date, OTT date, channel, program name, start/end time, first- and second-level genre, description, province, key city, region, weekday, platform, and Live/TSV viewing category.

## Query Patterns

- Absolute airtime for one genre: `program.airtime_duration` + a `category_level1` filter + `metric_lookup`.
- One genre's share of all genres: `program.airtime_share_all_categories_percent`; keep the category out of the denominator CTE and filter it in the outer query.
- Airtime distribution across all genres: `program.airtime_share_all_categories_percent` + `category_level1` + `share_distribution`; the SQL percentage is canonical and must not be recomputed by `compute_share`.
- Selected-genre comparison: `program.airtime_share_selected_categories_percent` + multiple `category_level1` values + `dimension_comparison`.
- Watch-duration share by genre: program.weighted_view_duration + category_level1 + share_distribution.
- Program KPI ranking: a program KPI + program_name + ranking.
- Market breakdown: a program KPI + province, region, or key_city.
- Live/TimeShift breakdown: a program KPI bundle + event_category.

## Gotchas

- `program_metric.sql` chứa phần lớn Superset metric expressions, nhưng công thức số 1 bị cắt dở. Airtime denominator behavior vẫn là business contract đã duyệt và chưa có Doris result fixture để đối soát số một-một.
- A start/end-time overlap filter in the export retains events with at least 50 percent overlap. The v3 natural-language resolver does not yet expose this specialized predicate.
- The synthetic others field and the user_id cache-buster condition are not physical Program dimensions and are intentionally not modeled.
- Live data was not queried, so formula parity is validated structurally rather than against dashboard result rows.
- “Thể loại” defaults to `firstlevel_vn`; `name_vn` is reserved for an explicit detailed-category request.
- LLM semantic extraction reads the original question and returns at most one metric plus dimension/raw-value records. `program_names.csv` is intentionally excluded from the LLM context and searched locally through the metadata-selected fuzzy matcher.
- Dimensions declared with `semantic_type: time` never require a canonical dictionary value. Absolute and relative time expressions are resolved by the time context/resolver; a time dimension is retained by canonical binding only for explicit grouping or sorting.
- SQL is allowed only when every requested filter value binds to a dictionary canonical value. For example, `Rạng rỡ Việt Nam` is currently absent and returns `canonical_value_not_found`; the filter is never silently removed.
- Metric compatibility is declared with `supported_dimensions` and `required_dimensions`. Questions without an explicit metric use the intersection of every requested dimension's `metric_bundle`.
