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
        → Grafana query PromQL để vẽ dashboard
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
            ├── alerting.yml                # Contact point Telegram
            └── rules.yml                   # Alert rules
```

---

## Giải thích từng file

### `monitoring/prometheus.yml`

Nói với Prometheus: scrape ai, ở đâu, bao lâu một lần.

```yaml
scrape_configs:
  - job_name: 'nginx'     # metric connections/requests từ stub_status
  - job_name: 'cadvisor'  # metric CPU/RAM từng container
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

Khai báo **contact point** Telegram — nơi Grafana gửi notification khi alert fire.

```
Contact point: telegram-endpoint
  → Bot Token + Chat ID + Thread ID
  → Message template HTML (FIRING / RESOLVED)
```

---

### `alerting/rules.yml`

3 alert rule hiện tại:

| Rule | Điều kiện | Severity | For |
|---|---|---|---|
| `429 Rate Limit Triggered` | count 429 trong 1 phút > 0 | warning | ngay lập tức |
| `Gateway No Traffic` | không có log nào trong 5 phút | critical | 5 phút |
| `Backend Errors (5xx)` | hơn 3 lỗi 5xx trong 2 phút | critical | ngay lập tức |

`Gateway No Traffic` được cấu hình `noDataState: Alerting` — có nghĩa là khi Loki không có data (nginx down, không ghi log) thì Grafana vẫn fire alert thay vì im lặng.

---

## Truy cập

| Service | URL | Ghi chú |
|---|---|---|
| Grafana | `http://localhost:3000` | admin / admin |
| Dashboard chính | `http://localhost:3000/d/dashboard-web-monitoring` | |
| Nginx Logs | `http://localhost:3000/d/nginx-logs/nginx-logs` | |
| cAdvisor | `http://localhost:3000/d/cadvisor-containers` | |

---

## Những gì chưa có (known gaps)

- **Service-level metric**: hiện tại chỉ đo từ tầng gateway. Nếu `/api/query` chậm, biết được "chậm" nhưng chưa biết chậm ở đâu (code, LLM call, hay network).
- **Load testing**: các ngưỡng rate limit (50r/s superset, 6r/m chatbot) được đặt tay, chưa được validate bằng load test thực tế.
