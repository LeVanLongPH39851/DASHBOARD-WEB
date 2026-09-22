# Monitoring Stack

Tài liệu mô tả cách hệ thống monitoring hoạt động, các thành phần liên quan và cấu trúc file cấu hình.

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│                                                             │
│  nginx_w ──── access.log (JSON) ──────────────┐            │
│     │                                          │            │
│     └── /stub_status (port 8080)              │            │
│                   │                            │            │
│  cadvisor_w ── Docker cgroups                 │            │
└───────────────────┼───────────────────────────┼────────────┘
                    │                            │
          ┌─────────▼──────────┐      ┌─────────▼──────────┐
          │    Prometheus       │      │      Promtail       │
          │  (metric storage)   │      │   (log collector)   │
          │                     │      │                     │
          │  scrape mỗi 15s từ: │      │  đọc file log,      │
          │  - nginx-exporter   │      │  parse JSON,        │
          │  - cadvisor         │      │  đẩy vào Loki       │
          └─────────┬──────────┘      └─────────┬──────────┘
                    │                            │
                    └──────────┬─────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │        Loki          │
                    │   (log storage)      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │       Grafana        │
                    │  query Prometheus    │
                    │  query Loki          │
                    │  dashboard + alert   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │      Telegram        │
                    │  (alert notification)│
                    └─────────────────────┘
```

**Nguồn dữ liệu có 2 loại:**
- **Metric** (số đo tại thời điểm): Prometheus thu thập từ nginx-exporter và cAdvisor
- **Log** (sự kiện theo thời gian): Promtail đọc access.log của nginx và đẩy vào Loki

Grafana là điểm duy nhất để xem — nó query cả 2 nguồn và xử lý alert.

---

## Luồng dữ liệu chi tiết

### Log flow
```
nginx_w ghi request → /var/log/nginx/access.log (JSON format)
    → volume nginx_logs (shared Docker volume)
        → promtail_w đọc file, parse từng field JSON
            → đẩy vào loki_w:3100
                → Grafana query LogQL để vẽ dashboard và evaluate alert rule
```

### Metric flow
```
nginx-exporter_w đọc http://nginx_w:8080/stub_status
cadvisor_w đọc Docker cgroups (/sys, /var/lib/docker)
    → prometheus_w scrape mỗi 15s
        → Grafana query PromQL để vẽ dashboard và evaluate alert rule
```

---

## Cấu trúc thư mục

```
monitoring/
│
├── prometheus.yml                          # Cấu hình Prometheus
├── promtail.yml                            # Cấu hình Promtail
│
└── grafana/
    └── provisioning/                       # Auto-load khi Grafana start
        │
        ├── datasources/
        │   └── datasources.yml             # Khai báo Prometheus + Loki
        │
        ├── dashboards/
        │   ├── dashboards.yml              # Chỉ đường tới file JSON
        │   ├── nginx-dashboard.json        # Dashboard chính
        │   ├── logs-dashboard.json         # Dashboard xem log raw
        │   └── cadvisor-dashboard.json     # Dashboard container metrics
        │
        └── alerting/
            ├── alerting.yml                # Contact points + Notification policies
            └── rules.yml                   # Alert rules
```

---

## Giải thích từng file

### `monitoring/prometheus.yml`

Nói với Prometheus: scrape ai, ở đâu, bao lâu một lần.

```yaml
scrape_configs:
  - job_name: 'nginx'      # metric connections/requests từ stub_status
  - job_name: 'cadvisor'   # metric CPU/RAM từng container
  - job_name: 'prometheus' # Prometheus tự monitor chính nó
```

---

### `monitoring/promtail.yml`

Nói với Promtail: đọc file log nào, parse ra sao, đẩy về đâu.

Điểm quan trọng:
- `__path__`: đường dẫn file log cần đọc
- `pipeline_stages.json`: parse từng dòng JSON thành các field riêng
- `labels`: promote `status` và `method` thành Loki label để filter nhanh
- `timestamp`: dùng field `time` trong JSON làm timestamp thật, không phải thời điểm Promtail đọc

---

### `datasources/datasources.yml`

Grafana tự add 2 datasource khi khởi động, không cần vào UI add tay:
- **Loki** `http://loki_w:3100` — nguồn log, dùng cho LogQL query
- **Prometheus** `http://prometheus_w:9090` — nguồn metric, dùng cho PromQL query

---

### `dashboards/dashboards.yml`

Chỉ đường để Grafana biết tìm file JSON dashboard ở thư mục nào. Không có file này thì các file `.json` bên dưới bị bỏ qua.

---

### `dashboards/nginx-dashboard.json`

Dashboard chính gồm 4 section:

| Section | Panel | Datasource |
|---|---|---|
| Traffic & Availability | Health check OK/FAIL, Total requests, 429 count, Request rate by status, Total requests mỗi 30s | Loki |
| Latency | p90/p95/p99 all routes, p99 by route | Loki |
| Rate Limiting & Backend | 429 theo từng API, Upstream distribution backend-1/2/3 | Loki |
| Infrastructure | CPU usage, Memory usage từng container | Prometheus |

Truy cập: `http://localhost:3000/d/dashboard-web-monitoring`

---

### `dashboards/logs-dashboard.json`

Hiển thị toàn bộ nginx access log dạng raw, tự refresh 10 giây. Click vào từng dòng để expand đầy đủ các field JSON.

Truy cập: `http://localhost:3000/d/nginx-logs/nginx-logs`

---

### `dashboards/cadvisor-dashboard.json`

Dashboard cộng đồng Grafana (ID 14282) — CPU, RAM, Network I/O, filesystem cho từng container.

Truy cập: `http://localhost:3000/d/cadvisor-containers`

---

### `alerting/alerting.yml`

Khai báo **contact points** và **notification policies**.

#### Contact points

| Name | Mô tả |
|---|---|
| `telegram-endpoint` | Gửi cả firing lẫn resolved (dùng cho alert memory) |
| `telegram-no-resolved` | Chỉ gửi firing, không gửi resolved (dùng cho alert event 429/5xx) |
| `telegram-no-resolved-container` | Chỉ gửi firing, không gửi resolved (dùng cho alert container down) |

Tất cả đều gửi về cùng 1 Telegram group, cùng thread `VTVRatings`.

#### Notification policies

```
default → telegram-endpoint (group theo alertname + severity)
  ├── alert_type = container → telegram-no-resolved-container
  │     group_by: [...] (mỗi container = 1 tin riêng)
  │     repeat mỗi 1h
  └── alert_type = event    → telegram-no-resolved
        (group theo alertname)
        repeat mỗi 24h (default)
```

---

### `alerting/rules.yml`

Chia thành 2 group:

#### Group `nginx-gateway-alerts` (evaluate mỗi 30s, datasource: Loki)

| Rule | Điều kiện | Severity | For | alert_type |
|---|---|---|---|---|
| `429 Rate Limit - Chatbot` | > 5 request `/api/query` bị 429 trong 2 phút | warning | ngay lập tức | event |
| `429 Rate Limit - Superset` | > 50 request `/api/superset` bị 429 trong 2 phút | warning | 1 phút | event |
| `Backend Errors (5xx) - Superset` | > 3 lỗi 5xx trên `/api/superset` trong 2 phút | critical | ngay lập tức | event |
| `Backend Errors (5xx) - Chatbot` | > 3 lỗi 5xx trên `/api/query` trong 2 phút | critical | ngay lập tức | event |

#### Group `container-health` (evaluate mỗi 30s, datasource: Prometheus/cAdvisor)

| Rule | Điều kiện | Severity | For | alert_type |
|---|---|---|---|---|
| `Container memory gần giới hạn` | memory usage > 85% limit liên tục 5 phút | critical | 5 phút | container |
| `Container bị down` | `time() - container_last_seen > 150s` | critical | 30 giây | container |

**Lưu ý về rule `Container bị down`:**
- Ngưỡng 150s (2.5 phút) là do cAdvisor cache metric 2 phút sau khi container stop — đặt thấp hơn sẽ không bao giờ trigger.
- `noDataState: OK` — khi metric biến mất hoàn toàn (container đã bị xóa hẳn), rule tự resolve thay vì giữ firing mãi.
- Độ trễ phát hiện thực tế: ~3–3.5 phút sau khi container stop.
- Mỗi container down = 1 tin Telegram riêng (nhờ `group_by: ['...']`).

---

## Truy cập

| Service | URL | Ghi chú |
|---|---|---|
| Grafana | `http://localhost:3000` | admin / admin |
| Dashboard chính | `http://localhost:3000/d/dashboard-web-monitoring` | |
| Nginx Logs | `http://localhost:3000/d/nginx-logs/nginx-logs` | |
| cAdvisor Dashboard | `http://localhost:3000/d/cadvisor-containers` | |

---

## Known gaps

- **Service-level metric**: hiện tại chỉ đo từ tầng gateway. Nếu `/api/query` chậm, biết được "chậm" nhưng chưa biết chậm ở đâu (code, LLM call, hay network).
- **Load testing**: các ngưỡng rate limit (50r/s superset, 6r/m chatbot) được đặt tay, chưa được validate bằng load test thực tế.
- **Container down detection lag**: do giới hạn cache của cAdvisor, độ trễ tối thiểu luôn là ~2 phút — không thể rút ngắn chỉ bằng cấu hình alert.
