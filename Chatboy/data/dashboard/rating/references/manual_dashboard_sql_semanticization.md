# Hướng dẫn thủ công: chuyển SQL Dashboard thành Rating semantic contract

## 1. Mục đích

Tài liệu này là quy trình thao tác chuẩn để xử lý một SQL export từ Dashboard có cấu trúc
tương tự `program_weight.sql`, sau đó đưa các định nghĩa đã kiểm chứng vào semantic layer
`data/dashboard/rating` và pipeline `src/core/text_to_sql`.

Đầu ra của mỗi lần xử lý phải trả lời được bốn câu hỏi:

1. Fact table và grain thật sự là gì?
2. Metric được tính theo công thức nào, ở grain nào và có mẫu số/phạm vi nào?
3. Dimension, filter cố định, time rule và join nào được phép áp dụng?
4. Chỉ cần sửa metadata hay phải bổ sung recipe/compute/renderer?

Tài liệu này không hướng dẫn sao chép nguyên SQL Dashboard vào source code. Mục tiêu là
tách SQL thành các contract nhỏ, có thể kiểm thử và tái sử dụng cho nhiều câu hỏi.

## 2. Nguyên tắc bắt buộc

### 2.1. Dataset SQL không đồng nghĩa với metric SQL

Một SQL Dashboard thường chỉ tạo virtual dataset. Ví dụ `program_weight.sql` kết thúc bằng:

```sql
SELECT ra.*, we.weight, po.total, co.view_coef, co.user_coef
FROM rating_program ra
...
```

Đoạn này cung cấp dữ liệu đầu vào cho chart, nhưng không định nghĩa đầy đủ Rating,
Reach hay tỷ lệ thời lượng phát. Công thức metric có thể nằm trong Superset metric,
chart configuration hoặc một query khác.

Vì vậy:

- Dùng dataset SQL để xác định table, grain, column, fixed filter, time behavior và join.
- Dùng chart metric expression hoặc business contract đã duyệt để xác định công thức.
- Dùng Doris fixture để kiểm chứng kết quả số.
- Không suy luận công thức chỉ từ tên chart.

### 2.2. Không nhét một use case vào router/compiler

Ưu tiên khai báo trong YAML. Chỉ viết Python khi SQL cần một chiến lược tổng hợp mới mà
recipe hiện tại không biểu diễn được, hoặc pattern cần một phép hậu xử lý mới.

### 2.3. Không bỏ qua xung đột nguồn

Nếu dataset SQL, chart metric expression, DDL và kết quả Doris không thống nhất, ghi xung
đột vào `evidence.md` và dừng metric đó ở trạng thái chưa sẵn sàng. Không tự chọn một
công thức rồi đánh dấu `active`.

## 3. Bộ nguồn tối thiểu cần thu thập

Trước khi sửa metadata, tạo hoặc cập nhật một dòng trong `source-inventory.md` cho các
nguồn đã kiểm tra.

| Nguồn | Dùng để xác định | Bắt buộc |
| --- | --- | --- |
| Dataset SQL export | Fact CTE, grain, filter, join, default time | Có |
| Superset/chart metric expressions | Công thức cuối, unit, output alias | Có đối với metric dẫn xuất |
| Physical schema/DDL | Tên cột, kiểu dữ liệu, key khả dụng | Có |
| Doris fixture | Kết quả kỳ vọng trên một phạm vi nhỏ | Có trước khi production hóa |
| Chart title/description | Alias, cách người dùng gọi metric | Chỉ là nguồn hỗ trợ |
| Business decision | Denominator, scope, ngoại lệ nghiệp vụ | Có nếu SQL không thể hiện đủ |

Mỗi kết luận quan trọng phải được ghi vào `evidence.md` với source path, ngày kiểm tra,
confidence và caveat.

## 4. Workflow xử lý một SQL mới

### Bước 0 — Đăng ký SQL gốc

1. Lưu nguyên bản SQL dưới `data/dashboard/rating/references/`.
2. Không chỉnh sửa SQL gốc để “làm sạch”. Nếu cần bản phân tích, tạo file khác.
3. Ghi tên Dashboard, dataset/chart, thời điểm export và owner nếu biết.
4. Kiểm tra xem nhiều chart có dùng chung một dataset SQL hay không.

Quy ước tên gợi ý:

```text
sql_<fact-family>_<dashboard-or-chart>.sql
```

### Bước 1 — Tách Jinja khỏi SQL nghiệp vụ

Lập bảng cho tất cả biến `filter_values(...)`:

| Biến Jinja | Cột vật lý | Vai trò | Giá trị mặc định | Ghi chú |
| --- | --- | --- | --- | --- |
| `filter_channel` | `channel_name_tvd` | User filter | Không lọc | `remove_filter=True` |
| `filter_date` | `date` | Time filter | Hôm qua | Khoảng thời gian |
| `filter_typo_first` | `firstlevel_vn` | Dimension/filter | Không lọc | Có fixed exclusion |

Phải phân biệt:

- `remove_filter=True`: dataset SQL đã tiêu thụ filter; tránh áp lại lần hai.
- Sentinel như `active`: điều khiển việc SELECT/GROUP BY một cột, không phải canonical value.
- Cột giả như `'Toàn quốc' AS others`: presentation helper, không mặc nhiên là dimension vật lý.
- Điều kiện kiểu cache-buster như `'user_id' <> <value>`: không phải business predicate.

### Bước 2 — Vẽ lại cấu trúc CTE

Với mỗi CTE, ghi rõ một trong các vai trò:

- `fact_base`: đọc fact và gom về grain chuẩn.
- `dimension/join`: weight, coefficient, population hoặc lookup.
- `denominator`: tổng dùng làm mẫu số.
- `final`: chọn dimension và metric output.

Ví dụ từ `program_weight.sql`:

```text
agg_info_program
  -> rating_program        (fact_base, EPG event grain)
  -> dim_weight            (date + province + channel)
  -> dim_coef              (date)
  -> dim_population        (province)
  -> final joined dataset
```

Nếu cùng một join xuất hiện ở nhiều metric, khai báo thành `join_profile`. Nếu chỉ một
metric cần denominator CTE đặc biệt, phần đó thuộc recipe của metric.

### Bước 3 — Xác định fact family và grain

Grain phải được lấy từ `GROUP BY`, join keys và khóa nghiệp vụ, không lấy từ tên table.

Worksheet:

```yaml
fact_family: <channel|program|...>
fact_table: <logical table id>
physical_name: <database.table>
grain:
  - <column 1>
  - <column 2>
base_measures:
  - <measure>
event_key:
  - <key nếu có>
```

Đối với `program_weight.sql`:

- Fact family: `program`.
- Fact table: `agg_info_program`.
- Event evidence: `date`, `channel_name_tvd`, `program_name`, `start_time`, `end_time`,
  `epg_id_hash`.
- `event_duration` được group trong SQL export, nhưng phải kiểm tra xem đây là thuộc tính
  phụ thuộc event key hay một phần grain thật sự.
- `BITMAP_UNION_COUNT(bm_user_id)` và `SUM(duration_view)` được tính tại event grain.

Kiểm tra fan-out: sau mỗi join, một fact row có bị nhân bản không? Nếu có, metric SUM
không được triển khai trước khi sửa join contract hoặc pre-aggregate dimension.

### Bước 4 — Phân loại filter

Mỗi predicate phải thuộc đúng một nhóm:

| Loại | Ví dụ | Nơi quản lý |
| --- | --- | --- |
| User filter | `channel_name_tvd IN (...)` | Dimension + canonical binder |
| Fixed business filter | Loại `Quảng cáo`, `Quảng bá` | Recipe/fact contract |
| Scope filter | `province = 'Toàn quốc'` | Join profile/compiler scope |
| Default filter | Mặc định hôm qua | Time resolver/domain default |
| Overlap predicate | Giữ event overlap ít nhất 50% | Recipe hoặc predicate handler chuyên biệt |
| Presentation-only | Sentinel `active`, field `others` | Không đưa vào semantic contract nếu không có nghiệp vụ |
| Cache/technical | `user_id` cache-buster | Loại khỏi semantic contract |

Không được biến fixed filter thành filter tùy chọn. Nếu bỏ fixed filter làm thay đổi ý
nghĩa metric, recipe phải luôn áp dụng nó.

### Bước 5 — Chuẩn hóa time contract

Ghi rõ:

- Cột thời gian chính.
- Khoảng đầu vào là đóng hay nửa mở.
- Default range khi người dùng không nêu thời gian.
- Grain hiển thị: day/week/month.
- Predicate overlap nếu có start/end time.

Pipeline Rating dùng `TimeRange.end` theo dạng exclusive. SQL renderer chuyển về cuối
ngày khi dựng `BETWEEN` vật lý. Dimension có `semantic_type: time` không đối sánh qua
canonical dictionary; raw time được giao cho `d_008_time_resolver.py`.

Với overlap trong `program_weight.sql`, business rule hiện tại là:

```text
overlap(event, requested_window) / event_duration >= 0.5
```

Không thay bằng điều kiện `start_time BETWEEN ...` vì hai điều kiện không tương đương.

### Bước 6 — Định nghĩa join contract

Cho mỗi join, ghi:

```yaml
name: <join id>
fact_table: <fact table id>
dependency_table: <table id>
join_keys:
  - [<fact column>, <dependency column>]
fixed_filters: {}
cardinality: <many-to-one|scalar>
required_by_metrics: []
```

Các kiểm tra bắt buộc:

1. Mọi join key tồn tại trong `table.yaml`.
2. Grain của bảng phụ không tạo nhiều row cho một bộ join key.
3. Scope tỉnh/vùng/toàn quốc sử dụng đúng key.
4. Join `ON 1 = 1` chỉ hợp lệ khi bảng phụ đã được lọc về đúng một scalar hoặc được
   aggregate an toàn.
5. Metric không cần weight không được kéo join weight vào chỉ vì dataset SQL có join đó.

Ví dụ Program:

- Airtime dùng `event_duration`: không cần weight, coefficient hoặc population.
- Rating/Reach Program: weight luôn nối theo `date + channel_name_tvd`; province/region
  bổ sung key thị trường tương ứng.

### Bước 7 — Tách base measure khỏi metric

Không gọi mọi cột số là metric hoàn chỉnh.

| Loại | Ví dụ | Ý nghĩa |
| --- | --- | --- |
| Base measure | `duration_view`, `event_duration` | Đầu vào tính toán |
| Pre-aggregate | `distinct_user_by_day` | Giá trị tại fact grain |
| Business metric | Rating, Reach %, airtime share | Công thức có unit/scope |
| Helper | `weight`, `view_coef`, `total` | Thành phần join |

Mỗi metric cần worksheet sau:

```yaml
id: <namespace.metric>
label: <tên hiển thị>
description: <ý nghĩa và khi nào chọn metric>
aliases: []
fact_family: <fact family>
source_table: <physical table>
base_grain: []
formula: <công thức đã có nguồn>
unit: <second|minute|count|percent|...>
recipe: <recipe id>
calculation: <calculation id>
required_measures: []
required_joins: []
join_profile: <profile hoặc null>
supported_dimensions: []
required_dimensions: []
default_dimensions: []
denominator_scope: <none|all_categories|selected_categories|...>
null_behavior: <quy tắc chia 0/không có dữ liệu>
```

### Bước 8 — Kiểm tra mẫu số trước khi viết metric phần trăm

Với metric tỷ lệ, phải trả lời rõ:

1. Mẫu số giữ lại filter nào?
2. Mẫu số bỏ filter nào?
3. Mẫu số tính trước hay sau dimension filter?
4. Nhiều giá trị được chọn thì mẫu số là toàn bộ universe hay selected set?
5. Kết quả không có mẫu số trả `NULL`, `0` hay lỗi nghiệp vụ?

Không dùng một công thức chung cho các scope khác nhau.

Ví dụ đã duyệt cho Program airtime:

- `program.airtime_duration`: tổng airtime tuyệt đối, không có mẫu số.
- `program.airtime_share_all_categories_percent`: tử số là category được hỏi; mẫu số là
  tất cả category hợp lệ, nhưng vẫn giữ cùng time/channel/non-category filters.
- `program.airtime_share_selected_categories_percent`: mẫu số chỉ gồm toàn bộ category
  được nêu trong câu hỏi so sánh.

Nếu category được lọc ngay trong fact CTE trước khi tính mẫu số “all categories”, kết quả
sẽ sai thành 100%.

### Bước 9 — Mapping vào Catalog Facade

Thứ tự cập nhật khuyến nghị:

1. `table.yaml`: table, columns, grain, `fact_family`, join profiles.
2. `dimensions.yaml`: semantic dimension, aliases, type, dictionary, matching, bundle.
3. `recipes.yaml`: recipe, calculation, allowed symbols/functions.
4. `metrics_v3.yaml`: metric trỏ đến recipe/calculation và dimension contract.
5. `patterns_v3.yaml`: chỉ khi có analysis pattern mới.
6. `query_shapes.yaml`: chỉ khi shape/constraint hiện có không biểu diễn được.
7. `narration_prompts.yaml`: prompt output theo pattern.

`catalog.yaml` là facade khai báo các file thành phần. Không tạo registry Python song song.

### Bước 10 — Khai báo dimension và canonical value

Mỗi dimension phải xác định:

- Logical ID `<table_id>.<dimension_id>`.
- Physical column.
- `semantic_type`.
- Có được filter/group/sort hay không.
- Dictionary canonical nếu cardinality phù hợp.
- Matcher nếu là high-cardinality.
- `metric_bundle` gồm đúng các metric có ý nghĩa trên dimension đó.

Quy tắc hiện tại:

- Date/time không cần canonical dictionary.
- Program name dùng dictionary local và fuzzy matcher; không nạp toàn bộ tên chương
  trình vào prompt LLM.
- Giá trị filter không bind được canonical phải dừng; không được bỏ filter rồi chạy SQL.
- Dimension từ câu hỏi phải thuộc `supported_dimensions` của metric.
- Mọi `required_dimensions` phải hiện diện trước khi lập plan.

### Bước 11 — Chọn mức triển khai

| Tình huống | Cần sửa |
| --- | --- |
| Metric mới dùng công thức recipe đã có | `metrics_v3.yaml`, có thể thêm bundle |
| Dimension mới dùng matcher đã có | `dimensions.yaml` + dictionary |
| Join scope mới nhưng cùng renderer | `table.yaml` join profile |
| Calculation mới trong recipe hiện có | `recipes.yaml`; handler phải hỗ trợ contract đó |
| CTE/denominator/aggregation strategy mới | Recipe plugin mới dưới `src/core/text_to_sql/recipes/` |
| Pattern mới nhưng dùng compute/shape có sẵn | `patterns_v3.yaml` + narration prompt |
| Compute hậu SQL mới | Plugin/handler compute mới + YAML mapping |
| Constraint query shape mới | Mở rộng model/validator rồi khai báo YAML |

Không thêm nhánh kiểu `if metric_id == ...` vào router, compiler hay pipeline nếu khác biệt
thực chất thuộc recipe.

### Bước 12 — Viết test theo tầng

Tối thiểu cần các nhóm test sau:

1. Catalog load/fail-fast:
   - table, metric, dimension và recipe reference hợp lệ;
   - fact family khớp source table;
   - required dimension là tập con của supported dimensions.
2. Semantic extraction/resolution:
   - metric + dimension hợp lệ;
   - dimension bundle khi thiếu metric;
   - dimension không tương thích bị từ chối;
   - canonical value không tồn tại bị từ chối.
3. Recipe SQL:
   - grain, fixed filter, join key;
   - denominator placement;
   - `NULLIF` hoặc no-data behavior.
4. End-to-end question:
   - aggregate;
   - breakdown/ranking nếu hỗ trợ;
   - explicit time và default time.
5. Doris fixture:
   - input period/filter cố định;
   - SQL Dashboard và SQL renderer trả kết quả tương đương trong tolerance đã định.

Không chỉ snapshot toàn bộ chuỗi SQL. Nên assert thêm các invariant nghiệp vụ, ví dụ
fixed exclusion có mặt và category filter không lọt vào denominator CTE.

### Bước 13 — Validate và cập nhật tài liệu

Chạy:

```bash
source /home/dhung/Work/repo/XBobo/.venv/bin/activate
python -m unittest discover -s src/core/text_to_sql/test -p 'test_*.py'
python -m compileall -q src main.py api.py config
git diff --check
```

Sau đó cập nhật:

- `source-inventory.md`: nguồn mới, coverage và gap.
- `evidence.md`: kết luận có căn cứ.
- `semantic-layer.md`: metric/dimension/query pattern đã dùng được và caveat.
- `src/core/text_to_sql/README.md`: chỉ khi public workflow hoặc extension point thay đổi.

## 5. Ví dụ phân rã Program SQL

### 5.1. Những gì SQL này xác nhận trực tiếp

- Fact: `data_dashboard_rating.agg_info_program`.
- Program event evidence: date, channel, program, start/end, `epg_id_hash`.
- Base measures: bitmap audience, `duration_view`, `event_duration`.
- Fixed filter: loại `Quảng cáo` và `Quảng bá`.
- Default time: hôm qua.
- Optional user filters: channel, event category, weekday, market, program, description,
  category, start/end time.
- Overlap rule: tối thiểu 50%.
- Weight join: date + channel, thêm province/region theo market scope.
- Coefficient join: date.
- Population join: market scope hoặc scalar toàn quốc.

### 5.2. Những gì SQL này chưa xác nhận

- Công thức cuối của từng Superset chart.
- Metric nào dùng `event_duration`, metric nào dùng `duration_view`.
- Denominator của tỷ lệ nếu chart metric expression không được export.
- Quy tắc làm tròn và format output.
- Kết quả số có khớp dữ liệu Doris hiện tại hay không.

### 5.3. Quyết định triển khai hiện tại

- `program_weight.sql` được chuyển thành fact contract, reusable measures và safe join profile.
- `program_metric.sql` được chuyển thành calculation metadata; chỉ công thức đầy đủ
  mới được kích hoạt.
- `program_example.sql` là ví dụ cách áp dụng dimension/filter, không tạo thêm metric
  chỉ vì query khác filter.
- Mọi Program metric dùng recipe facade `program_metric`. Calculation tự khai báo
  `required_measures`, `required_grain_keys`, `required_joins` và `execution_strategy`.
- Strategy `scoped_denominator` xử lý airtime share; strategy `aggregate` xử lý các
  audience KPI. Không có nhánh Python theo từng metric ID.

## 6. Domino impact khi thay đổi contract

| Thay đổi | Tầng bị ảnh hưởng trực tiếp | Kiểm tra downstream |
| --- | --- | --- |
| Đổi grain/table column | `table.yaml`, recipe | Join fan-out, GROUP BY, renderer tests |
| Thêm/đổi metric | `metrics_v3.yaml`, recipe calculation | Extraction, resolver compatibility, alias output |
| Thêm dimension | `dimensions.yaml` | Canonical binder, bundle, filter/group/sort rendering |
| Đổi fixed filter | Recipe/fact contract | Mọi metric dùng recipe, Doris fixture |
| Đổi denominator | Recipe + metric contract | Share compute, output narration, regression fixtures |
| Đổi join profile | `table.yaml` | Weight scope, population, duplicate rows |
| Thêm pattern | `patterns_v3.yaml` | Router, context validator, compiler, compute, narrator |
| Thêm query-shape constraint | Model/validator + YAML | Compiler và SQL renderer |

Workflow runtime liên quan:

```text
d_001 extraction
  -> d_002 canonical binding
  -> d_003 semantic resolution
  -> d_004 pattern routing
  -> d_005 semantic selection
  -> d_006 context validation
  -> d_007 filter binding
  -> d_008 time resolution
  -> d_009 plan compiler
  -> d_010 plan validation
  -> d_011 SQL renderer/recipe
  -> d_012 result validation
  -> d_013 pattern compute
  -> d_014 narration
  -> d_015 pipeline orchestration
```

Một thay đổi metadata hợp lệ không nên yêu cầu sửa tuần tự cả 15 file. Nếu phải sửa nhiều
tầng chỉ để thêm một metric cùng loại, đó là dấu hiệu contract hoặc extension point đang
thiếu.

## 7. Điều kiện phải dừng và yêu cầu thêm nguồn

Dừng triển khai metric nếu gặp một trong các trường hợp:

- Chỉ có chart title, không có công thức.
- Không xác định được grain trước khi SUM/COUNT.
- Join có nguy cơ many-to-many chưa được kiểm soát.
- Không rõ denominator giữ/bỏ filter nào.
- Unit không rõ hoặc công thức trộn second/minute/hour.
- Dictionary canonical không có nguồn đáng tin cậy.
- SQL Dashboard và fixture Doris không khớp mà chưa tìm được nguyên nhân.
- Fixed filter có vẻ là business rule nhưng chưa được owner xác nhận.

Khi dừng, ghi rõ `blocked`, nguồn còn thiếu và câu hỏi cần owner trả lời trong
`source-inventory.md` hoặc `evidence.md`.

## 8. Checklist bàn giao

### Evidence

- [ ] SQL gốc được lưu nguyên vẹn.
- [ ] Source inventory được cập nhật.
- [ ] Công thức metric có nguồn, không chỉ có tên chart.
- [ ] Grain, unit, time behavior và denominator đã rõ.
- [ ] Conflict/caveat được ghi vào evidence register.

### Semantic contract

- [ ] Table/fact family/columns/grain hợp lệ.
- [ ] Dimension và canonical strategy hợp lệ.
- [ ] Metric có supported/required dimensions.
- [ ] Recipe/calculation/join profile tồn tại.
- [ ] Fixed filter và scope không bị phụ thuộc vào câu hỏi cụ thể.
- [ ] Metric bundle chỉ chứa metric có ý nghĩa với dimension.

### Verification

- [ ] Catalog fail-fast test chạy qua.
- [ ] Resolver test có cả happy path và rejection path.
- [ ] SQL invariant test chạy qua.
- [ ] End-to-end question test chạy qua.
- [ ] Doris fixture đã đối chiếu hoặc gap được ghi rõ.
- [ ] Full unit test, compileall và diff check đều qua.

## 9. Mẫu kết luận cho một SQL mới

Sao chép khối sau vào issue/plan khi bắt đầu một Dashboard SQL mới:

```markdown
### Dashboard SQL intake

- SQL source:
- Dashboard/chart:
- Owner/export date:
- Fact table:
- Fact family:
- Grain:
- Base measures:
- Fixed filters:
- Optional filters:
- Default time:
- Join profiles:
- Candidate metrics:
- Metric formula source:
- Denominator scope:
- Canonical dictionaries:
- Expected Doris fixture:
- YAML-only changes:
- Required plugin changes:
- Open conflicts/blockers:
- Tests to add:
```
