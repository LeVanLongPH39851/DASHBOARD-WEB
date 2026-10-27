# Chatboy Rating — Accuracy v2.2

Chatbot phân tích Dashboard Rating, dùng semantic catalog để lập SQL Doris và template để trả lời số liệu. Phạm vi hiện tại: 23 KPI, 9 pattern; không có agent tự chạy shell hoặc tự sửa SQL.

Bản triển khai theo [spec nền tảng](specs/chatboy-accuracy-v2.md) và [spec hardening v2.2](specs/chatboy-accuracy-v2.2-hardening.md). Xem [hướng dẫn vận hành và nghiệm thu](specs/accuracy-v2-runbook.md) và [báo cáo kiểm chứng](evaluation/implementation-validation.md). **Chưa đủ điều kiện phát hành production** khi chưa hoàn thành snapshot/đáp án nghiệp vụ và ba lượt live evaluation; replay không thay thế các bước này.

V2.2 kiểm tra câu hỏi có bị bỏ sót KPI/filter, hỗ trợ kỳ lịch quý/năm, cho sửa clarification sai trên cùng revision và công bố dữ liệu thiếu kỳ/nhóm bằng `partial`. Lỗi nội bộ compiler/renderer/compute trả 500 có trace.

## Cài đặt

Đã kiểm thử trên Python 3.11. Dùng lockfile để có cùng dependency với CI:

```bash
python3.11 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
```

Production chỉ cần `pip install -r requirements.lock`. Cấu hình theo `.env.example`: Doris, LLM endpoint/model/key và `REDIS_URL`. Ứng dụng đọc `.env` khi khởi động; import module và test offline không tự kết nối production.

```bash
.venv/bin/python api.py --host 0.0.0.0 --port 8010
# Hoặc chạy API và Redis dùng chung:
docker compose up --build -d
```

Mỗi replica xử lý tối đa 5 yêu cầu đồng thời. Redis giữ các lượt chờ làm rõ trong 15 phút; có thể dùng Redis ngoài compose cho nhiều replica. `GET /health` kiểm tra tiến trình, `GET /ready` kiểm tra Redis và trả phiên bản ứng dụng; readiness này không chứng nhận chất lượng LLM hoặc dữ liệu Doris.

## API

```bash
curl http://localhost:8010/api/v2/query \
  -H 'Content-Type: application/json' \
  -d '{"type":"question","question":"Lượt xem VTV1 hôm qua là bao nhiêu?"}'
```

Nếu `status=needs_clarification`, gửi ID/revision và đúng trường do server cung cấp:

```json
{
  "type": "clarification",
  "clarification_id": "id-do-server-cap",
  "revision": 1,
  "answers": {"time_range": "từ 2026-06-01 đến 2026-06-07"}
}
```

Trường dạng choice nhận **option ID**, không nhận label. V2 giữ Decimal bằng chuỗi với `columns[].type=decimal`. API cũ `/api/query` và `/query` là adapter, dùng Decimal JSON number chính xác; trường `success` chỉ đúng khi có câu trả lời `answered`. `no_llm=true` qua HTTP bị từ chối: chế độ offline được chọn ở CLI hoặc khi khởi tạo service. Endpoint đồng bộ từ điển cũ trả HTTP 410; tên chương trình được xác minh bằng Doris.

Nếu answer sai, HTTP 422 có `error.field_errors` và cùng clarification ID/revision để nhập lại; TTL không gia hạn. V2 trả coverage trong `evidence` và `meta.data_status`; legacy có `data_status`. `partial` vẫn là câu trả lời có dữ liệu, kèm thông báo phần còn thiếu.

## CLI

```bash
# Chỉ lập plan, không gọi Doris; rules offline được chọn tường minh.
.venv/bin/python main.py --no-llm --json 'Top 5 kênh theo lượt xem hôm qua'
# Thực thi qua cùng ChatService với API, kể cả khi có --json.
.venv/bin/python main.py --execute --json 'Lượt xem VTV1 hôm qua'
# Tiếp tục lượt làm rõ qua Redis.
.venv/bin/python main.py --clarification-id ID --revision 1 \
  --answers '{"time_range":"tuần trước"}' --json
```

Plan-only không tự lookup tên chương trình qua mạng. Cần dependency lookup được inject hoặc dùng chế độ thực thi để xác minh chương trình.

## Kiểm thử và evaluation

```bash
.venv/bin/python -m pytest -q --junitxml=artifacts/regression.xml
.venv/bin/python -m src.evaluation validate
.venv/bin/python -m src.evaluation replay --output artifacts/evaluation
.venv/bin/python -m src.evaluation ablation --output artifacts/ablation
```

Test và replay chặn network; fixture LLM/Doris cùng clock cố định giúp tái lập lỗi. CI chạy regression và 150 ca replay trên mỗi PR, xuất JSON/CSV/Markdown và trace từng ca. Các ca trong `evaluation/cases.jsonl` hiện là **ứng viên giả lập, chưa duyệt**. Ablation replay kiểm tra wiring/budget; tác động của skills đến hiểu câu hỏi phải đo bằng ablation live.

Các lệnh `integration`, `live`, `serve`, `load`, `gate` và quy trình duyệt đáp án được mô tả trong [runbook](specs/accuracy-v2-runbook.md). `load` đo qua API evaluation bằng `--base-url`; release gate không nhận báo cáo service-only.

Smoke image với hai replica và Redis thật, không cần `.env` hay LLM/Doris thật:

```bash
docker compose -p chatboy-v22-smoke -f evaluation/docker-compose.smoke.yml up -d --build --wait replica-a replica-b
# Mặc định: 100 request, burst 5, sau đó 8 request/phút; khoảng 12 phút.
docker compose -p chatboy-v22-smoke -f evaluation/docker-compose.smoke.yml run --rm runner
docker compose -p chatboy-v22-smoke -f evaluation/docker-compose.smoke.yml down
```

CI chạy smoke nhanh với 5 request. Kết quả nằm trong `artifacts/v22-smoke/`; fixture/rules không chứng nhận latency của LLM/Doris production.

## Thành phần chính

| Thành phần | Vị trí |
|---|---|
| Shared service, workflow, deadline/budget/trace, Redis | `src/core/text_to_sql/runtime/` |
| Plan, renderer, validator, compute | `src/core/text_to_sql/` |
| FactSet và template số liệu | `facts.py`, `templates.py`, `presentation.py` trong thư mục trên |
| Công thức và capability | `data/dashboard/rating/` |
| Đơn vị, scale, precision của 23 KPI | `data/dashboard/rating/presentation.yaml` |
| Năm skills nghiệp vụ | `skills/rating-*/SKILL.md` |
| Evaluation runner và snapshot adapter | `src/evaluation/` |
| Ca cần nghiệp vụ duyệt | `evaluation/cases.jsonl` |

API authentication, hội thoại dài hạn và agent tự chủ không thuộc phạm vi bản nâng cấp này.
