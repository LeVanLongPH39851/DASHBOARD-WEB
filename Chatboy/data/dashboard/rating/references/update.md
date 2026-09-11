LLM sẽ có thêm nhiệm vụ hiểu câu hỏi và đề xuất filter và metrics. Các metric, công thức, denominator, join và fixed filter vẫn phải được định nghĩa cố định trong semantic layer.

  ## Kiến trúc đề xuất

  Câu hỏi người dùng
          ↓
  Rule + LLM semantic extraction
          ↓
  {
    metric_id,
    dimensions,
    filter values,
    group_by,
    sort,
    time range
  }
          ↓
  Deterministic validator
          ↓
  Canonical binder
          ↓
  Metric recipe cố định
          ↓
  SQL compiler deterministic

  LLM tuyệt đối không được:

  - Viết SQL.
  - Chọn expression SQL.
  - Thay đổi join.
  - Tự xác định công thức tính.
  - Tự thay đổi denominator scope.
  - Bỏ qua fixed filter.
  - Sử dụng dimension không được metric hỗ trợ.

  ## Không nên tạo metric theo từng câu query

  Không nên biến mỗi biến thể filter thành một metric riêng.

  Ví dụ không cần tạo:

  program.view_duration_by_category
  program.view_duration_by_channel
  program.view_duration_by_program
  program.view_duration_by_category_and_channel
  program.view_duration_by_category_and_province

  Các metric này đều có cùng công thức:

  SUM(duration_view * weight * view_coef) / 3600

  Khác nhau chỉ ở dimension và filter. Vì vậy chỉ cần một metric:

  id: program.weighted_view_duration
  recipe: program_metric
  calculation: weighted_view_duration
  supported_dimensions:
    - agg_info_program.category_level1
    - agg_info_program.category_name
    - agg_info_program.program_name
    - agg_info_program.channel
    - agg_info_program.province
    - agg_info_program.region
    - agg_info_program.date

  Sau đó compiler sử dụng dimension theo câu hỏi:

  “Thời lượng xem của thể loại Phim truyện”
  → metric: program.weighted_view_duration
  → category_level1 = "Phim truyện"

  “Thời lượng xem của VTV1”
  → metric: program.weighted_view_duration
  → channel = "VTV1"

  “Thời lượng xem các thể loại trên VTV1”
  → metric: program.weighted_view_duration
  → group_by category_level1
  → channel = "VTV1"

  ## Khi nào thực sự cần tạo metric mới?

  Chỉ tạo metric mới khi có ít nhất một thay đổi về ý nghĩa nghiệp vụ hoặc công thức.

   Câu hỏi                                                                Metric
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Thời lượng xem là bao nhiêu?                                           program.weighted_view_duration
  ─────────────────────────────────────────────────────────────────────  ────────────────────────────────────────────
   Thời lượng xem của thể loại A chiếm bao nhiêu trên tất cả thể loại?    program.weighted_view_share_all
  ─────────────────────────────────────────────────────────────────────  ────────────────────────────────────────────
   So sánh tỷ trọng thời lượng xem của A và B trong chính nhóm A+B        program.weighted_view_share_selected
  ─────────────────────────────────────────────────────────────────────  ────────────────────────────────────────────
   Thời lượng phát là bao nhiêu?                                          program.airtime_duration
  ─────────────────────────────────────────────────────────────────────  ────────────────────────────────────────────
   Tỷ lệ thời lượng phát trên tất cả thể loại                             program.airtime_share_all_categories_perce
                                                                          nt

  Các metric trên cần tách vì:

  - Tử số khác nhau.
  - Mẫu số khác nhau.
  - Unit khác nhau.
  - Có hoặc không sử dụng weight, view_coef.
  - Cách đặt filter trước hay sau khi tính denominator khác nhau.

  ## Làm sao giảm lỗi LLM?

  ### 1. Rule xử lý trường hợp rõ ràng

  Các cụm từ ổn định nên dùng rule:

  “thời lượng phát”
  → program.airtime_duration

  “thời lượng xem”
  → program.weighted_view_duration

  “chiếm bao nhiêu % trên tất cả thể loại”
  → program.weighted_view_share_all

  “trong các thể loại được chọn”
  → program.weighted_view_share_selected

  Rule nên được khai báo trong YAML qua aliases, description, semantic_key và denominator_scope, không hard-code
  thành nhiều hàm trong router.

  ### 2. LLM xử lý ngôn ngữ linh hoạt

  LLM dùng khi câu hỏi không khớp trực tiếp với rule:

  “Thể loại phim đóng góp bao nhiêu vào tổng thời gian khán giả xem?”

  LLM chỉ được trả về cấu trúc đóng:

  {
    "metric_id": "program.weighted_view_share_all",
    "dimensions": [
      {
        "dimension_id": "agg_info_program.category_level1",
        "role": "filter",
        "raw_values": ["Phim truyện"]
      }
    ]
  }

  metric_id, dimension_id và role phải nằm trong danh sách semantic catalog cung cấp.

  ### 3. Validate lại toàn bộ output của LLM

  Sau khi LLM trả kết quả, hệ thống phải kiểm tra:

  metric có tồn tại không?
  dimension có tồn tại không?
  metric có hỗ trợ dimension này không?
  dimension có được phép filter/group/sort không?
  value có khớp canonical không?
  metric có yêu cầu dimension bắt buộc không?
  denominator scope có hợp lệ không?

  Nếu sai, không render SQL.

  Ví dụ:

  LLM chọn airtime_duration nhưng lại dùng province không được hỗ trợ
  → metric_unsupported_dimension

  LLM chọn share_all nhưng không có category
  → metric_required_dimension_missing

  LLM trả category “Tin tức ABC” không tồn tại
  → canonical_value_not_found

  ### 4. Rule xác nhận hoặc sửa lựa chọn của LLM

  Không nên tin LLM tuyệt đối. Có thể áp dụng thứ tự:

  Exact rule match
      ↓ không match
  LLM selection
      ↓
  Semantic validation
      ↓ không hợp lệ
  Yêu cầu bổ sung context

  Nếu LLM chọn sai metric nhưng câu hỏi có rule rõ ràng, rule thắng.

  Ví dụ:

  “Thời lượng phát của chương trình X”

  Nếu LLM chọn weighted_view_duration nhưng phrase exact là thời lượng phát, validator/rule phải ép lại thành:

  program.airtime_duration

  ## Phân tầng mức độ an toàn

  Tôi đề xuất ba mức:

  ### Mức 1 — deterministic

  Dùng khi metric và dimension rõ ràng:

  “Thời lượng xem của thể loại Phim truyện”

  - Rule chọn metric.
  - Dictionary chọn category.
  - Không cần LLM hoặc chỉ dùng LLM để hỗ trợ extraction.

  ### Mức 2 — LLM có validation

  Dùng khi ngôn ngữ linh hoạt nhưng vẫn ánh xạ được vào semantic catalog:

  “Phim truyện đóng góp thế nào vào tổng thời gian xem?”

  - LLM đề xuất metric/filter.
  - Catalog validator kiểm tra.
  - SQL vẫn deterministic.

  ### Mức 3 — clarification

  Dùng khi có nhiều cách hiểu:

  “Tỷ lệ thời lượng của Phim truyện”

  Câu này có thể là:

  - Tỷ lệ thời lượng phát.
  - Tỷ lệ thời lượng xem.
  - Chia cho tất cả thể loại.
  - Chia cho nhóm thể loại được chọn.

  Hệ thống nên trả:

  > Bạn muốn xem tỷ lệ thời lượng phát hay thời lượng xem của thể loại Phim truyện? Tỷ lệ được tính trên tất cả thể
  > loại hay chỉ trên nhóm được chọn?
 
  Không tự đoán và không render SQL. -> Hiện tại skip và trả về log: [D] - Chưa clarification

  ## Kết luận

  Phương án phù hợp nhất là:

  - Không tạo metric theo từng filter hoặc từng câu query.
  - Tạo metric theo từng công thức và business meaning.
  - Recipe chứa SQL đã kiểm chứng.
  - Dimension metadata quy định metric hỗ trợ filter/group/sort nào.
  - Rule xử lý các cách nói phổ biến và rõ ràng.
  - LLM chỉ ánh xạ ngôn ngữ tự nhiên sang metric/dimension/filter trong danh sách đóng.
  - Mọi output LLM đều phải qua deterministic validation.
  - Nếu còn mơ hồ thì hỏi lại, không chạy SQL.

  Như vậy ta đạt được cả hai mục tiêu:

  - An toàn: công thức và SQL không phụ thuộc LLM.
  - Mở rộng: không phải tạo hàng loạt metric chỉ vì có thêm filter hoặc cách hỏi mới.
