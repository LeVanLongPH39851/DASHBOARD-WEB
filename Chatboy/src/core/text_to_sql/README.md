# Lõi Rating Accuracy v2.2

Tài liệu hiện hành: [README dự án](../../../README.md), [spec nền](../../../specs/chatboy-accuracy-v2.md), [hardening v2.2](../../../specs/chatboy-accuracy-v2.2-hardening.md), [runbook](../../../specs/accuracy-v2-runbook.md).

`runtime/service.py` là boundary của API, CLI execute và evaluation. Mỗi request có pipeline riêng, dependency được inject; không giữ trạng thái hội thoại trong singleton. `RatingQueryPipeline.generate()` vẫn hỗ trợ plan-only cho công cụ và test.

Luồng số liệu: route → extract → semantic coverage → canonical bind → resolve/select → time/context validation → compile → validate plan/coverage → render SQL → execute → result schema/coverage → compute → FactSet → template. `PlanningOutcome` quyết định ready/clarification/unsupported; lỗi nội bộ đi tới boundary 500. Lỗi dependency được truyền ra bằng `WorkflowError`; mode LLM không tự fallback sang rules.

`planning_contracts.py` khai báo SourceEvidence, SemanticCoverage, TimeResolution, PlanningOutcome và ResultCoverage. Kiểm tra câu hỏi độc lập với schema output LLM nằm ở `semantic_coverage.py`; policy tại `semantic_policies.yaml`. `result_coverage.py` đối chiếu kỳ/nhóm được yêu cầu, không chứng nhận freshness dữ liệu.

Clarification dùng namespace v2.2, atomic claim/complete/release qua Lua. Answer sai được trả 422 cùng revision sau khi release owner claim; round và TTL không tăng. `src/evaluation/load.py` đo HTTP và `release.py` từ chối service-only/smoke làm bằng chứng phát hành.

Các module `d_000` đến `d_016` giữ tên để tương thích với code hiện có. `d_014_rating_analysis_narrator.py` hiện là facade cho template deterministic, chỉ nhận `FactSet`. Định nghĩa cũng lấy từ catalog bằng template. Metadata `narration_prompts.yaml` còn được catalog đọc để tương thích schema pattern cũ; runtime không dùng nó để gọi LLM viết số liệu.

Catalog YAML quản lý công thức/capability/recipe. `presentation.yaml` bổ sung kiểu đơn vị, scale và precision; KPI mới phải khai báo metadata này. Renderer tạo `GeneratedSQL` có parameters và `ResultSchema`; `bound_sql` chỉ là preview, không dùng làm đầu vào executor.

Chạy kiểm thử từ root repo bằng `python -m pytest -q`; chạy evaluation bằng `python -m src.evaluation replay`. Không dùng unittest discovery làm bộ nghiệm thu đầy đủ vì các regression mới dùng pytest.
