# Servies_v3 — Rating Dashboard Semantic Query Pipeline

`src/core/text_to_sql` là source code active của engine phân tích ngôn ngữ tự nhiên
(NLQ-to-SQL) và trợ lý tri thức nghiệp vụ cho **Rating Dashboard** trên Apache Doris.

Hệ thống được thiết kế theo nguyên tắc:
1. **Top-Level Intent Routing**: Phân loại ý định trước khi xử lý thành 3 mức: `data_query` (tra cứu số liệu), `definition` (định nghĩa/kiến thức nghiệp vụ), và `no_scope` (ngoài phạm vi).
2. **LLM-first semantic extraction, Zero-LLM SQL Generation**: Nhánh `data_query` đọc nguyên câu hỏi và trả đúng một contract phẳng gồm tối đa một metric cùng các dimension/raw value. Canonical binder và resolver deterministic quyết định giá trị chuẩn, compatibility, metric bundle và SQL components.
3. **Knowledge QA từ Catalog Metadata**: Nhánh `definition` trả lời trực tiếp định nghĩa và đơn vị đo lường từ Catalog Metadata mà không cần query database.
4. **Unified Output Format (`AgentResponse`)**: Mọi nhánh đều trả về cùng một format output chuẩn cho Chatbot UI.

---

## 📐 Kiến Trúc Tổng Quan (Pipeline Architecture)

```
                       User Question (Tiếng Việt)
                                  │
                                  ▼
[Tầng 0] ──────── IntentRouter (d_000_intent_router.py / intent_routing/)
                   ├── Phân loại 100% bằng LLM thành 3 intent levels
                   │
                   ├──► [intent = "definition"] ──► SemanticDefinitionAgent (d_016_definition_agent.py)
                   │                                  ├── Đọc Catalog Metadata (description, unit, aliases)
                   │                                  ├── LLM trả lời trực diện định nghĩa & đơn vị đo lường
                   │                                  └── Fallback deterministic template khi không có LLM
                   │
                   ├──► [intent = "no_scope"]   ──► no_scope_response() (hướng dẫn phạm vi hệ thống)
                   │
                   └──► [intent = "data_query"] ──► 15-Stage Text-to-SQL Pipeline (bên dưới):
                                  │
                                  ▼
[Giai đoạn 1] ─── SemanticExtractor (d_001_semantic_extraction.py)
                   ├── Đưa nguyên câu hỏi raw cho LLM, không tokenize tên riêng
                   ├── CatalogContext chỉ expose dictionary nhỏ; program_names ở local memory
                   ├── Output phẳng: 0..1 metric + 0..N dimensions/raw values/roles
                   └── Provider rule dùng làm fallback có log khi LLM thiếu hoặc sai schema
                                  │
                                  ▼
[Giai đoạn 2] ─── CanonicalBinder → SemanticResolver
                   ├── d_002_canonical_binding.py
                   ├── d_003_semantic_resolution.py
                   ├── Normalize chỉ tại lookup; raw value không bị sửa trước extraction
                   ├── Matcher strategy lấy từ dimensions.yaml (exact/fuzzy)
                   ├── Bắt buộc canonical value tồn tại trong Dictionary CSV/JSON
                   ├── Chọn policy metric_only / metric_dimensions / dimension_bundle / missing_context
                   └── Giữ output ResolvedSQLComponents để downstream không bị domino
                                  │
                                  ▼
[Giai đoạn 3] ─── PatternRouter + SemanticSelector
                   ├── d_004_pattern_router.py
                   ├── d_005_semantic_selector.py
                   ├── Không chọn lại metric đã được extraction + resolver xác nhận
                   ├── Mọi metric đi qua PatternRouter chung để chọn query pattern
                   ├── denominator_scope được đọc từ metric metadata
                   ├── Rule-Based Classification khi không có/không gọi được LLM
                   └── d_006_pattern_context_validator.py dừng và gợi ý nếu thiếu context
                                  │
                                  ▼
[Giai đoạn 4] ─── RatingPlanCompiler (d_009_rating_plan_compiler.py)
                   ├── Bind Canonical Filters (d_007_canonical_filter_binder.py)
                   ├── Giải quyết mốc thời gian / TimeRange (d_008_time_resolver.py)
                   └── Xác định ORDER BY, LIMIT & GROUP BY theo PatternSpec
                                  │
                                  ▼
[Giai đoạn 5] ─── RatingQueryPlanValidator (d_010_rating_query_plan_validator.py)
                   ├── Kiểm tra active metric, group_by permission, limit bounds
                   └── Kiểm tra giá trị filter nằm trong từ điển (Canonical dictionary)
                                  │
                                  ▼
[Giai đoạn 6] ─── RatingSQLRenderer (d_011_rating_sql_renderer.py + recipes/)
                   ├── Chọn recipe đóng (direct_aggregate / channel_metric / program_metric)
                   ├── Bundle có thể render nhiều metric trong một SELECT
                   └── Sinh SQL parameterized và bản hoàn chỉnh để gửi Doris
                                  │
                                  ▼
[Giai đoạn 7] ─── Doris Execution
                                  │
                                  ▼
[Giai đoạn 8] ─── RatingResultValidator (d_012_rating_result_validator.py)
                   └── Chặn kết quả rỗng/toàn NULL trước tầng diễn giải
                                  │
                                  ▼
[Giai đoạn 9] ─── PatternCompute (d_013_pattern_compute.py) [Post-Execution]
                   └── Tính rank, share, trend và comparison cho từng metric trong bundle
                                  │
                                  ▼
[Giai đoạn 10] ── RatingAnalysisNarrator (d_014_rating_analysis_narrator.py)
                   ├── Ghép system prompt chung với prompt con theo pattern
                   ├── LLM chỉ diễn giải analysis đã được kiểm chứng
                   └── Fallback deterministic khi LLM lỗi hoặc compute thiếu dữ liệu
                                  │
                                  ▼
                   Output: AgentResponse (intent, reply, success, data, source)
                   Logging: logs/data_query.log | logs/definition.log | logs/no_scope.log
```

Mọi giai đoạn dùng chung một instance `RatingCatalog`, được validate và đóng băng khi pipeline khởi động. Runtime không duy trì registry riêng cho pattern, query shape hoặc recipe.
`d_015_rating_query_pipeline.py` là orchestrator gọi tuần tự các boundary trên. Package con
`semantic_extraction/`, `canonical_binding/`, `semantic_resolution/` và `recipes/` chứa
implementation/plugin nội bộ nên không dùng prefix workflow.

---

## 🧩 Các Thành Phần Chính (Core Modules)

| File / Module | Vai trò & Trách nhiệm |
|---|---|
| [`d_000_intent_router.py`](./d_000_intent_router.py) / [`intent_routing/`](./intent_routing/) | Tầng gateway 000: Phân loại ý định người dùng (100% LLM) thành `data_query`, `definition`, hoặc `no_scope`. |
| [`intent_routing/agent_response.py`](./intent_routing/agent_response.py) | Định nghĩa dataclass `AgentResponse` thống nhất output cho toàn bộ các nhánh. |
| [`d_016_definition_agent.py`](./d_016_definition_agent.py) / [`definition_agent/`](./definition_agent/) | Tầng tri thức 016: Trả lời định nghĩa/cách tính chỉ số từ Catalog Metadata bằng LLM (có fallback deterministic). |
| [`intent_logger.py`](./intent_logger.py) | Ghi log độc lập theo từng intent level (`data_query.log`, `definition.log`, `no_scope.log`) với `RotatingFileHandler`. |
| [`catalog.py`](./catalog.py) | Catalog Facade duy nhất: load manifest, cross-validate metric/pattern/query shape/recipe/prompt và resolve plugin handler. |
| [`catalog_models.py`](./catalog_models.py) | Typed contracts bất biến cho manifest và metadata runtime. |
| [`query_plan.py`](./query_plan.py) | Định nghĩa các dataclass bất biến đại diện cho Query Plan IR độc lập với SQL (`RatingQueryPlan`, `MetricRef`, `Filter`, `OrderSpec`, `TimeRange`). |
| [`d_001_semantic_extraction.py`](./d_001_semantic_extraction.py) | Entry workflow extraction; export contract phẳng, context cache, LLM/rule provider và time/sort/limit context. |
| [`semantic_memory.py`](./semantic_memory.py) | Nạp canonical dictionary một lần cho mỗi pipeline; không đưa program name high-cardinality vào LLM context. |
| [`d_002_canonical_binding.py`](./d_002_canonical_binding.py) | Entry canonical binding; implementation exact/fuzzy nằm trong `canonical_binding/`. |
| [`d_003_semantic_resolution.py`](./d_003_semantic_resolution.py) | Entry bốn resolution policy; implementation nằm trong `semantic_resolution/`. |
| [`input_contracts.py`](./input_contracts.py) | Contract context bất biến dùng sau semantic extraction. |
| [`rating_resolver.py`](./rating_resolver.py) | Ánh xạ entity vào ID/value chuẩn trong catalog và loại bỏ dimension không tương thích với fact table. |
| [`semantic_catalog.py`](./semantic_catalog.py) | Loader nền cho domain/table/dimension của Rating catalog. |
| [`resolved_entities.py`](./resolved_entities.py) | Contract trung gian cho filter, dimension, metric và sort đã canonicalize trước khi compile. |
| [`d_004_pattern_router.py`](./d_004_pattern_router.py) | Phân loại pattern bằng LLM-first và fallback sang routing rule trong catalog khi LLM thiếu, lỗi hoặc trả pattern không tương thích. |
| [`semantic_selection.py`](./semantic_selection.py) | Contract đóng cho metric IDs, pattern và denominator scope trước khi compiler tạo plan. |
| [`d_005_semantic_selector.py`](./d_005_semantic_selector.py) | Giữ metric IDs đã resolve, gọi PatternRouter chung và đọc denominator scope từ metric metadata; không chọn lại metric. |
| [`d_006_pattern_context_validator.py`](./d_006_pattern_context_validator.py) | Kiểm tra required fields và số time bucket thực tế; tạo lỗi `missing_pattern_context` cùng gợi ý trước khi compile. |
| [`d_007_canonical_filter_binder.py`](./d_007_canonical_filter_binder.py) | Chuyển canonical filters sang query-plan filters. |
| [`d_008_time_resolver.py`](./d_008_time_resolver.py) | Resolve biểu thức thời gian thành khoảng ngày half-open. |
| [`d_009_rating_plan_compiler.py`](./d_009_rating_plan_compiler.py) | Tổng hợp entities, pattern, metric/bundle và time range thành một `RatingQueryPlan` hoàn chỉnh. |
| [`d_010_rating_query_plan_validator.py`](./d_010_rating_query_plan_validator.py) | Tầng kiểm soát an toàn nghiệp vụ, từ chối plan vi phạm quy tắc trước khi render SQL. |
| [`d_011_rating_sql_renderer.py`](./d_011_rating_sql_renderer.py) | Tầng duy nhất được phép render tên bảng/cột vật lý và tạo Doris SQL parameterized. |
| [`recipes/weighted_channel.py`](./recipes/weighted_channel.py) | Shared CTE/JOIN kernel được `channel_metric` và `program_metric` dùng cho các KPI weighted. |
| [`recipes/channel_metric/`](./recipes/channel_metric/) | Facade recipe cho Channel metric: thu thập measure/join/grain từ catalog và chọn aggregate strategy. |
| [`recipes/program_metric/`](./recipes/program_metric/) | Facade recipe cho toàn bộ Program metric: thu thập measure/grain/join từ catalog, validate contract và chọn strategy aggregate hoặc scoped denominator. |
| [`recipes/program_airtime.py`](./recipes/program_airtime.py) | Strategy nội bộ cho Program airtime cần denominator-safe SQL; không còn là recipe ID được catalog đăng ký trực tiếp. |
| [`d_012_rating_result_validator.py`](./d_012_rating_result_validator.py) | Chuyển kết quả rỗng/toàn NULL thành trạng thái `no_data` và thông báo theo khoảng ngày. |
| [`d_013_pattern_compute.py`](./d_013_pattern_compute.py) | Dispatch compute handler được pattern khai báo; đây là boundary giữa raw rows và analysis. |
| [`pattern_computes.py`](./pattern_computes.py) | Các compute plugin tích hợp sẵn cho period/dimension comparison, rank, trend và share. |
| [`d_014_rating_analysis_narrator.py`](./d_014_rating_analysis_narrator.py) | Ghép system prompt + prompt con, kiểm tra output LLM và fallback deterministic nếu output không đạt. |
| [`d_015_rating_query_pipeline.py`](./d_015_rating_query_pipeline.py) | Orchestrator end-to-end từ câu hỏi → routing (`route()`) hoặc trực tiếp tạo SQL (`generate()`). |

---

## 📊 Catalog-Driven Analysis Patterns

Catalog Rating hiện khai báo 8 pattern; có thể thêm pattern bằng metadata mà không sửa router/compiler:

| Pattern Name | Description | Shape | Compute / Post-processing |
|---|---|---|---|
| `metric_lookup` | Tra cứu giá trị 1 metric theo filter cụ thể (không so sánh, không group by). | `aggregate` | Trả về dữ liệu gốc. |
| `dimension_breakdown` | Phân rã metric theo dimension mà không mang ý nghĩa xếp hạng. | `breakdown` | Trả về dữ liệu nhóm theo dimension. |
| `period_comparison` | So sánh chỉ số giữa 2 thời điểm / 2 kỳ (hôm nay vs hôm qua, tháng này vs tháng trước). | `breakdown` | Tính `delta` và `delta_pct` (%) giữa 2 kỳ. |
| `dimension_comparison` | So sánh metric giữa các giá trị của cùng dimension, ví dụ VTV1 với VTV2. | `breakdown` | Giữ dimension filter `IN` trong group-by và tính chênh lệch theo từng metric. |
| `rank_comparison` | So sánh Top-N đối tượng theo metric, tính thứ hạng và chênh lệch với đối tượng dẫn đầu. | `ranking` | Tính `rank`, `pct_of_total` (%) và `gap_vs_leader_pct` (%). |
| `rank_lookup` | Liệt kê Top-N hoặc tìm giá trị cao/thấp nhất mà không cần so sánh sâu. | `ranking` | Trả về dữ liệu đã sắp xếp. |
| `trend_analysis` | Phân tích xu hướng chỉ số qua nhiều kỳ liên tiếp (theo ngày, tuần, tháng). | `trend` | Tính phần trăm biến động qua các kỳ (`mom_change_pct`). |
| `share_distribution` | Tính tỷ trọng, cơ cấu, phần trăm đóng góp của các nhóm trong tổng thể. | `breakdown` | Tính `pct_of_total` cho metric thường; giữ nguyên metric phần trăm canonical đã được SQL tính. |

### Metric bundle cho câu hỏi không nêu chỉ số

Với câu hỏi dạng “Kênh VTV1 hôm nay như thế nào?”, “ra sao?” hoặc “diễn biến như nào?” nhưng không có metric term, pipeline không yêu cầu LLM đoán một metric đơn. Bundle được khai báo trong semantic catalog theo dimension, sau đó compiler đưa nhiều `MetricRef` vào cùng `RatingQueryPlan`. Câu hỏi không có cả metric và dimension sẽ không được dùng bundle mặc định.

Pattern và metric được chọn độc lập: router xác định hình thức phân tích từ câu hỏi,
compiler mới dùng metric đơn được nêu rõ hoặc lấy bundle theo dimension/filter đã resolve.
Ví dụ `VTV1 tháng 7 so với tháng 6` dùng pattern `period_comparison` và toàn bộ bundle
của dimension channel.

Bundle weighted channel hiện gồm:

```text
rating.rating_absolute  -> rating
rating.rating_percent   -> rating_percent
rating.average_reach   -> ave_reach
rating.reach_percent    -> reach_percent
rating.minute_per_user_day -> minute_per_user_day
```

Recipe `channel_metric` hợp nhất các measure/JOIN cần thiết và dùng shared weighted kernel để render nhiều KPI trong cùng một SQL. Khi câu hỏi nêu metric cụ thể, chỉ metric đó được render; bundle không được tự động mở rộng.
Với `period_comparison`, post-processing tạo một comparison cho từng metric và narrator
gọi LLM một lần để trả một bullet cho mỗi metric; output thiếu metric sẽ bị từ chối và fallback deterministic.

### Program semantic module SQL-first

Program được quản lý tập trung tại `data/dashboard/rating/program/`:

- `fact.yaml`: fact table, EPG grain và fixed predicates.
- `measures.yaml`: các aggregate measure có thể tái sử dụng.
- `calculations.yaml`: công thức, measure/grain/join dependency và execution strategy.
- `metrics_v3.yaml`: semantic ID, label, aliases, dimension compatibility, unit và denominator scope.

Tất cả metric Program dùng recipe facade `program_metric`. Thêm metric có công thức phù hợp
với hai strategy hiện có không cần thêm nhánh theo metric ID trong Python. Recipe hợp nhất
measure/JOIN cần thiết khi một plan render nhiều metric.

Ba metric airtime dùng `event_duration` theo giây và strategy `scoped_denominator`:

- `program.airtime_duration`: tổng tuyệt đối sau khi khử lặp sự kiện EPG.
- `program.airtime_share_all_categories_percent`: một thể loại chia tổng mọi thể loại hợp lệ;
  filter thể loại chỉ được áp dụng sau khi SQL đã tính mẫu số.
- `program.airtime_share_selected_categories_percent`: từng thể loại chia tổng các thể loại
  được nêu trong câu hỏi so sánh; tổng tỷ trọng xấp xỉ 100%.

Fact contract luôn loại `Quảng cáo` và `Quảng bá`. Airtime không join
weight/population/coef; các KPI audience chỉ nạp JOIN được calculation khai báo. “Thể loại”
mặc định là `firstlevel_vn`; overlap khung giờ tối thiểu 50% trong SQL Superset nguồn chưa
được expose trong đợt này. Nguồn và caveat nằm tại `data/dashboard/rating/references/`.

`program_weight.sql` là nguồn fact/join/fixed-filter, `program_metric.sql` là nguồn
công thức Superset và `program_example.sql` là một ví dụ group/filter cụ thể. Công thức
`Phút/người/lượt phát` trong tài liệu hiện bị cắt dở nên chưa được kích hoạt.

### Phân biệt hai loại so sánh

| Câu hỏi | Pattern | Cách lập plan |
|---|---|---|
| `So sánh rating tháng 6 và tháng 7` | `period_comparison` | Group theo date/month rồi so sánh hai kỳ. |
| `Rating VTV1 so với VTV2` | `dimension_comparison` | Filter channel bằng `IN`, đồng thời giữ channel trong `GROUP BY` để tạo hai dòng so sánh. |
| `VTV1 so với VTV2` | `dimension_comparison` | Không đoán metric đơn; dùng `metric_bundle` của channel và so sánh từng metric. |

Ở trường hợp thứ hai, một dimension thường chỉ dùng làm filter sẽ được compiler đưa trở lại
`dimensions` vì pattern khai báo `group_filtered_dimensions: true`. Nếu LLM chọn
`dimension_breakdown` nhưng evidence không có dimension chưa bị filter, router đánh dấu
pattern đó không tương thích và chạy rule fallback để chọn `dimension_comparison`.

### Semantic selection, pattern routing và log quyết định

`SemanticSelector` nhận metric đã được SemanticExtractor chọn và semantic evidence đã
canonicalize. Selector không chọn lại metric. `PatternRouter` chỉ chọn hình thức phân tích;
`denominator_scope` được đọc trực tiếp từ metric metadata.

1. SemanticExtractor parse đúng một metric ID và các dimension ID trong whitelist.
2. CanonicalBinder đối sánh raw values bằng strategy khai báo trên dimension.
3. PatternRouter chọn đúng một pattern ID đã đăng ký.
4. Kiểm tra pattern có đủ context bắt buộc hay không.
5. Nếu classifier trả pattern không tương thích, chỉ thay bằng một rule cụ thể phù hợp hơn;
   không hạ xuống fallback chung. Khi lựa chọn đã rõ nhưng thiếu required context, giữ pattern để
   Step 3 trả clarification.

CLI hiển thị log để biết quyết định đến từ đâu:

```text
[PatternRouter] stage=input explicit_metric=true dimensions=0 filters=1 filter_values=2 time_expressions=0 bundle_size=0
[PatternRouter] stage=llm raw='dimension_breakdown' parsed=dimension_breakdown
[PatternRouter] source=rules pattern=dimension_comparison reason=llm_incompatible
[SemanticSelector] handler=generic source=pattern_router metric=rating.rating_absolute pattern=dimension_comparison denominator_scope=none
```

`source=llm` nghĩa là lựa chọn do LLM đưa ra và đã qua catalog/context validation;
`source=rules` luôn kèm lý do như `llm_not_configured`, `llm_failed` hoặc `llm_incompatible`.

---

## 🛠️ Semantic Catalog & Metadata Layout

Cấu hình Semantic Catalog cho Rating Dashboard nằm tại `data/dashboard/rating/`:

```
data/dashboard/rating/
├── catalog.yaml           # Manifest và version của Catalog Facade
├── domain.yaml            # Cấu hình database mặc định, limit bounds, allowed statements
├── table.yaml             # Khai báo các bảng OLAP (agg_info_channel, agg_info_program, ...)
├── metrics_v3.yaml        # Base metric manifest; direct metrics nằm trong semantic modules
├── dimensions.yaml        # Ánh xạ dimension, metric_bundle, cột vật lý & từ điển
├── patterns_v3.yaml       # Pattern contract active, default order và routing rules
├── query_shapes.yaml      # Structural contract của query shape
├── recipes.yaml           # SQL plugin, formula và measure/join requirements
├── narration_prompts.yaml # System prompt chung và prompt diễn giải theo pattern
└── values/                # Từ điển dữ liệu chuẩn (Canonical Dictionaries)
    ├── channels.csv       # Danh sách kênh (VTV1, VTV3, HTV7, ...)
    ├── program_names.csv  # Từ điển high-cardinality tên chương trình (2,000+ giá trị)
    ├── provinces.csv      # Tỉnh/Thành phố
    ├── regions.csv        # Vùng miền
    └── time_bands.csv     # Khung giờ
```

`table.yaml` cũng chứa `fact_family` và các `join_profiles` an toàn cho weight, population
và coefficient. Metric khai báo `description`, `fact_family`, `semantic_key`,
`supported_dimensions`, `required_dimensions` và `denominator_scope`; mapping
Channel/Program không dựa vào suffix của metric ID. Dimension khai báo matching strategy,
khả năng expose dictionary vào LLM context và metric bundle. Formula
trong catalog là cấu hình deployment tin cậy, được validate khi khởi động; không có
SQL/Jinja nào được nhận từ câu hỏi hoặc LLM.

### Mở rộng catalog

- Metric mới dùng recipe/calculation hiện có: thêm vào `channel/metrics.yaml` hoặc `program/metrics.yaml` cùng `supported_dimensions`/`required_dimensions`; bổ sung `metric_bundle` trong `dimensions.yaml` nếu metric thuộc bundle.
- Pattern mới: thêm definition và declarative routing rule vào `patterns_v3.yaml`, sau đó khai báo prompt con trong `narration_prompts.yaml`; router, compiler và narrator tự đọc catalog.
- Query shape mới: thêm structural constraints vào `query_shapes.yaml`, sau đó tham chiếu ID từ pattern.
- Recipe mới dùng handler hiện có: thêm vào `recipes.yaml`. Thuật toán SQL mới cần thêm một module plugin thỏa `RecipeRenderer` và khai báo import path `src.core.text_to_sql...:Handler` trong YAML.
- Dimension mới dùng exact matching chỉ cần YAML/dictionary. High-cardinality dimension dùng matcher `fuzzy`; thuật toán matcher mới được thêm như plugin trong `canonical_binding/matchers` và registry.

Catalog được load một lần. Thay đổi YAML có hiệu lực sau khi restart process; reference sai, formula không an toàn hoặc plugin sai contract sẽ làm startup fail-fast.

Pattern thời gian có thể khai báo thêm `context.requires_explicit_time`,
`context.minimum_time_buckets`, `context.missing_time_fields`, thông báo clarification và
các câu hỏi gợi ý. Context được kiểm tra trên `TimeRange` đã resolve, nên “7 ngày qua” hợp
lệ dù chỉ có một time expression, còn khoảng mặc định một ngày không đủ cho tăng trưởng.

### Thêm mới ở đâu?

| Nhu cầu | Nơi khai báo chính | Khi nào cần viết Python |
|---|---|---|
| Thêm Channel metric | `channel/metrics.yaml` + `channel/calculations.yaml` | Chỉ khi cần recipe/calculation engine chưa tồn tại. |
| Thêm Program metric | `program/metrics.yaml` + `program/calculations.yaml` | Không nếu dùng fact contract, dependency và execution strategy hiện có. |
| Thêm Program measure/fixed predicate | `program/measures.yaml` / `program/fact.yaml` | Chỉ khi cần operator hoặc SQL strategy mới. |
| Đưa metric vào bundle | `dimensions.yaml` → `metric_bundle` | Không. |
| Thêm pattern | `patterns_v3.yaml` | Chỉ khi cần phép compute mới. |
| Thêm prompt diễn giải | `narration_prompts.yaml` | Không; pattern tham chiếu bằng `narration_prompt_id`. |
| Thêm query shape | `query_shapes.yaml` | Không nếu chỉ dùng các constraint đã có; constraint mới cần mở rộng model/validator. |
| Thêm recipe/calculation | `recipes.yaml` | Recipe SQL hoàn toàn mới cần handler plugin mới; semantic metric vẫn được chọn ở extraction/catalog, không chọn lại trong recipe. |

Luồng mapping tập trung là:

```text
catalog.yaml
    ├── channel/catalog.yaml
    │    ├── fact.yaml + measures.yaml + calculations.yaml
    │    └── metrics.yaml ── recipe=channel_metric ───────────────┐
    ├── metrics_v3.yaml ── base metric manifest ──────────────────┤
    ├── program/catalog.yaml
    │    ├── fact.yaml + measures.yaml + calculations.yaml
    │    └── metrics.yaml ── recipe=program_metric ───────────────┤
    └── recipes.yaml ────────────────────────────────────────────┘
   ├── patterns_v3.yaml ── query_shape ─────────> query_shapes.yaml
   │                    ├─ compute_handler ─────> pattern_computes.py/plugin
   │                    └─ narration_prompt_id ─> narration_prompts.yaml
   └── dimensions.yaml ── metric_bundle ───────> metric IDs
```

---

## 🚀 Hướng Dẫn Sử Dụng (Usage)

### 1. Sử dụng qua Python API

```python
from config.llm_config import LLMClient
from src.core.text_to_sql import RatingQueryPipeline

# 1. Khởi tạo Pipeline
llm_client = LLMClient.from_env()
pipeline = RatingQueryPipeline(llm_client=llm_client)

# 2. Sử dụng route() để tự động điều hướng 3 intent levels (Khuyên dùng cho Chatbot UI):
response = pipeline.route("Reach% là gì?")
print(f"Intent: {response.intent}")       # "definition"
print(f"Reply : {response.reply}")        # Định nghĩa & đơn vị đo lường
print(f"Source: {response.source}")       # "llm" hoặc "deterministic"

# Hoặc câu hỏi Data Query:
data_resp = pipeline.route("Rating VTV1 hôm qua")
print(f"Intent: {data_resp.intent}")      # "data_query"
print(f"Reply : {data_resp.reply}")       # Tóm tắt SQL hoặc câu trả lời

# 3. Sử dụng generate() để ép chạy trực tiếp Text-to-SQL pipeline:
result = pipeline.generate("Top 5 kênh có lượt xem cao nhất hôm qua")
if result.generated_sql:
    sql_batch = result.generated_sql.queries[0]
    print("SQL Query:", sql_batch.executable_sql)
    print("Parameters:", sql_batch.parameters)
```

### 2. Sử dụng qua Backend API (`api.py`)

Chạy server FastAPI:
```bash
python api.py --port 8020
```

Gọi API qua cURL:
```bash
# 1. Câu hỏi tra cứu số liệu (data_query)
curl -X POST "http://0.0.0.0:8020/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Rating của VTV1 hôm qua", "use_router": true, "execute": true}'

# 2. Câu hỏi định nghĩa (definition)
curl -X POST "http://0.0.0.0:8020/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Reach% là gì?", "use_router": true}'

# 3. Câu hỏi ngoài phạm vi (no_scope)
curl -X POST "http://0.0.0.0:8020/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Xin chào bạn là ai", "use_router": true}'
```

### 3. Sử dụng Chế độ CLI Terminal (`main.py`)

Chạy câu hỏi trực tiếp từ dòng lệnh:

```bash
# 1. Chạy câu hỏi Data Query
python main.py "Xu hướng lượt xem VTV1 theo ngày trong tuần qua"

# 2. Chạy câu hỏi Definition
python main.py "Reach% là gì?"

# 3. Chạy xuất định dạng JSON machine-readable
python main.py "Top 10 chương trình lượt xem cao nhất tháng trước" --json

# 4. Tắt LLM để kiểm tra rule-based fallback
python main.py --no-llm "Rating VTV1 so với VTV2"

# 5. Sinh SQL, gửi tới Doris và in kết quả
python main.py --execute "Kênh VTV1 hôm nay như thế nào?"

# 6. Chạy chế độ tương tác (Interactive REPL)
python main.py -i
```

---

## 🧪 Kiểm Thử (Testing)

Hệ thống đi kèm bộ **174 unit tests** bao phủ toàn bộ các module từ router, extraction, resolution, compiler đến renderer và narrator:

```bash
# Chạy toàn bộ test suite
.venv/bin/python -m unittest discover -s src/core/text_to_sql/test -p "test_*.py" -v
```

Các bộ test chính gồm:

- `test_intent_router.py`: Kiểm thử Intent Router 3 levels (`data_query`, `definition`, `no_scope`), Definition Agent (LLM + template fallback), rotating logger, và pipeline `route()`.
- `test_main_cli.py`: Kiểm thử CLI interface cho cả 3 nhánh intent, JSON output, và Doris execution.
- `test_catalog_facade.py`: Manifest, cross-reference và mở rộng metric/pattern/shape/recipe.
- `test_pattern_registry.py`: Pattern contracts và compute dispatch.
- `test_pattern_router.py`: LLM-first, context validation, rule fallback và `dimension_comparison`.
- `test_semantic_selector.py`: Pattern router chung và denominator scope lấy từ metric metadata.
- `test_semantic_extraction_resolution.py`: LLM contract phẳng, context memory, exact/fuzzy canonical binding, bốn resolver policy và missing canonical.
- `test_rating_query_pipeline.py`: Integration cho plan, parameterized SQL, bundle và post-execution.
- `test_program_airtime_semantic_layer.py`: Fact family, EPG deduplication, denominator scope, SQL không join weight và output đổi giây sang giờ/phút.
- `test_rating_analysis_narrator.py`: Prompt lồng, kiểm tra semantic output, retry và deterministic fallback.
- `test_rating_plan_safety.py` và `test_table_safety.py`: Boundary bảo mật, bảng/cột/filter và câu lệnh bị cấm.

---

## 🛡️ Nguyên Tắc An Toàn & Bảo Mật

1. **SQL Injection Defense**: Tất cả filter value được bind dưới dạng Parameterized Query (`:filter_0`, `:time_start`), tuyệt đối không ghép chuỗi SQL.
2. **Identifier Sanitization**: Tên cột, tên bảng được kiểm tra khớp bằng Regex `^[A-Za-z_][A-Za-z0-9_]*$` trước khi đưa vào mệnh đề `SELECT` / `FROM`.
3. **Statement Whitelisting**: Chỉ cho phép câu lệnh `SELECT`, cấm tuyệt đối `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`.
4. **Boundary Guardrails**: Giới hạn tối đa 3 dimensions per query, bắt buộc có limit đối với ranking; giới hạn catalog hiện tại từ 1 đến 50.000.
5. **No Scope & Knowledge Isolation**: Nhánh `definition` và `no_scope` không bao giờ sinh SQL hoặc kết nối tới database Doris.
