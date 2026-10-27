# Kiểm chứng triển khai Accuracy v2.2

Ngày kiểm chứng: 26/10/2026. Môi trường: CPython 3.11.17, dependency lock của repo; image build bằng production Dockerfile. Spec thực hiện: [hardening v2.2](../specs/chatboy-accuracy-v2.2-hardening.md).

## Kết quả

| Kiểm tra | Kết quả |
|---|---|
| Regression/API/runtime/Redis Lua | **330/330 passed**, thêm **38 subtests passed**, không deselect |
| Replay qua ChatService, chặn network | **150/150 passed** |
| Coverage dataset | 23 KPI, mỗi KPI ≥2 ca; 9 pattern, mỗi pattern 10 ca |
| Dataset/split | 90 data + 20 definition + 10 no-scope + 20 clarification + 10 faults; 100 development / 50 holdout |
| Ablation core | 149/150 |
| Ablation core + skills | 149/150 |
| Ablation core + skills + repair | 150/150 |
| Demo hardening chạy thực tế | 4/4 PASS: quý lịch, sửa clarification, thiếu kỳ, KPI sai |
| CLI plan-only | rank_lookup/Top-5, JSON hợp lệ, không gọi Doris |
| Dependency | pip check: không xung đột |
| Source/config | compileall, git diff --check, smoke compose config hợp lệ |
| Production Dockerfile | Build thành công với requirements.lock |
| Smoke HTTP hai image replica + Redis thật | **6/6 nhóm kiểm tra PASS**, gồm race/replay/TTL/partial |
| Load HTTP 100 request, burst 5, 8 rpm | **100/100 thành công**, lỗi 0%; P95 **201,44 ms**; tổng **712,69 giây** |
| Release gate với replay/smoke | **blocked**, đúng thiết kế |

Chênh lệch ablation là ca semantic output lỗi có chủ đích: repair sửa được. Fixture LLM không đo tác động của skills lên việc hiểu câu hỏi thực tế. Các tỷ lệ này không phải tuyên bố độ chính xác nghiệp vụ.

## Thay đổi đã kiểm chứng

- SemanticCoverage đối chiếu câu hỏi với alias/policy catalog, chặn bỏ filter và chọn sai KPI dù output hợp schema; dùng một repair chung. Audit plan giữ metric/filter/group/Top-N/order/time.
- Policy family và category share; xử lý alias KPI chồng lấn và tên chương trình chứa tên kênh/thời gian. Sửa header thừa của dictionary channels để alias VTV 1 được nạp đúng.
- TimeResolution phân biệt absent/resolved/ambiguous/unsupported/invalid. Hỗ trợ quý/năm lịch, reference time cố định, explicit grain ngày/tuần/tháng; ngày không hợp lệ không rơi về mặc định.
- PlanningOutcome có kiểu; compiler/renderer/compute bất ngờ trả 500, không bị che thành unsupported. Response không lộ exception text, trace giữ stage và request ID.
- Clarification validate thuần, atomic release owner claim khi input sai; 422 cùng ID/revision/fields, không tăng round hoặc TTL. Chặn token cũ release claim mới và complete trùng.
- Result coverage đối chiếu kỳ/nhóm được yêu cầu; thiếu dữ liệu trả partial, all NULL/empty trả no_data; baseline 0 không bị coi thiếu dữ liệu.
- V2 evidence có semantic/time/result coverage; legacy thêm data_status; CLI plan-only công bố outcome và xử lý lỗi có cấu trúc.
- Evaluation bootstrap riêng, không production dotenv fallback/interpolation; snapshot/schema/reference time được kiểm tra; runtime clock không bị đóng băng.
- Load đo client elapsed qua HTTP, kiểm tra status và metadata trước/sau; gate từ chối service-only, smoke, sai dataset/version/snapshot hoặc scenario.
- CI có offline regression/replay và một job smoke Docker hai replica + Redis thật với burst 5.

V2.1 trước hardening có 247 tests. V2.2 hiện có 330 tests; các assert cũ dựa vào nội dung exception đã chuyển sang typed contract. Bốn câu draft program.channel_count được thêm phạm vi “trong dữ liệu chương trình”, giữ nguyên expected facts/rows/plan; không đổi oracle để hợp thức hóa lỗi chọn KPI. Tất cả case vẫn pending.

## Phạm vi smoke

Image chạy API và planner thực, hai replica dùng chung Redis 7.4. Script kiểm tra health/readiness, invalid answers không gọi query, sửa lại cùng revision, 5 request tranh claim thực thi một query, replay từ replica khác, expiry và partial ở cả v2/legacy.

Smoke chỉ dùng rules và database fixture với độ trễ giả lập 150 ms/query. Không đọc production .env, không gọi LLM/Doris thật, không dùng production Redis/volume/cổng host. P95 smoke chỉ mô tả môi trường này.

Phép đo HTTP chạy đủ 100 request theo nhịp 8 rpm sau burst 5, không tăng tốc bằng clock giả. Snapshot/reference time và versions giữ nguyên trước/sau. Workflow/catalog/skills/prompt của hai replica trùng báo cáo regression/replay. Hai replica tham gia kiểm tra race/replay; phần tải 100 request gửi vào một replica. Các container và network của project smoke được dọn sau kiểm chứng.

## Điều kiện phát hành còn thiếu

**Chưa đủ điều kiện production.** 150 case là dữ liệu giả lập, review.status=pending; chưa có SQL chuẩn độc lập trên snapshot Doris thật được nghiệp vụ duyệt.

Chưa chạy integration Doris, live LLM hoặc live HTTP load trên snapshot đã duyệt. Cần người duyệt nghiệp vụ và cấu hình môi trường evaluation riêng. Release yêu cầu ba live run độc lập cùng phiên bản, regression đầy đủ và báo cáo HTTP load đạt ngưỡng. Smoke không thay những bằng chứng này.

## Phiên bản và artifacts

- Workflow: `accuracy-v2.2-100545076b5cc945`
- Catalog: `8526b5e6f6df4d5c`
- Skills: `816144c91ab6c8ba`
- Prompt: `26ef3769b7f83f2d`
- Dataset SHA-256: `f816ea385db7dabacf0a9ba63bf57864745904b3b9fb48b8fdd5d914bd33ab1e`
- Image manifest local build: `sha256:80ae496810d20d133bcf1d52287fa6a3efe4e796b4697e9ab33d673e55ebeeb4`

Artifacts gitignored, được tạo bởi lệnh chạy và CI upload:

- [Regression JSON](../artifacts/regression.json), [JUnit XML](../artifacts/regression.xml).
- [Replay Markdown](../artifacts/v22-replay/summary.md), [Replay JSON](../artifacts/v22-replay/summary.json), [case CSV](../artifacts/v22-replay/cases.csv).
- `artifacts/v22-replay/<case-id>.json` và `.trace.jsonl`: mọi lượt, SQL/parameters, differences và trace.
- `artifacts/v22-ablation/`: ba cấu hình core/skills/skills-repair.
- [Demo quý](../artifacts/question-flow-v22/calendar-quarter.json), [demo sửa clarification](../artifacts/question-flow-v22/correct-clarification.json), [demo thiếu kỳ](../artifacts/question-flow-v22/missing-period.json), [demo KPI sai](../artifacts/question-flow-v22/wrong-metric.json).
- [Smoke JSON](../artifacts/v22-smoke/smoke.json), [HTTP load JSON](../artifacts/v22-smoke/load.json): báo cáo HTTP/Redis; `preflight/` giữ lượt chạy nhanh đầu tiên trên image trước vòng kiểm chứng cuối.
- [Release gate](../artifacts/v22-release-gate.json): blocked khi dùng replay và smoke làm bằng chứng.

Test HTTP offline cần chạy ngoài sandbox hiện tại vì cơ chế wakeup asyncio giữa các thread bị sandbox chặn; suite vẫn chặn network. Smoke Docker được chạy trong project riêng chatboy-v22-smoke.
