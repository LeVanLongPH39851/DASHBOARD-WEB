# Báo cáo Kiến trúc Nginx — DASHBOARD-WEB

> Ngày: 11/09/2026
> Nhánh: add-chatbot
> Mục đích: Tài liệu kỹ thuật về vai trò và cách hoạt động của Nginx Gateway trong hệ thống

---

## 1. Tổng quan kiến trúc

Hệ thống sử dụng Nginx làm **API Gateway duy nhất** — toàn bộ traffic từ bên ngoài đi vào một điểm, được phân loại và forward đến đúng service bên trong Docker network.

```
                        Internet

                           │

                     port 8082 (host)

                           │

                           ▼

                  ┌─────────────────┐
                  │  Nginx Gateway  │  ← nginx/gateway.conf
                  │   port 80       │
                  └────────┬────────┘

                           │ routing theo URL prefix

     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│ Frontend │     │ Backend (x3)     │     │ Chatbot  │
│ port 3022│     │ backend-1 :5000  │     │ port 8010│
│(internal)│     │ backend-2 :5000  │     │(internal)│
└──────────┘     │ backend-3 :5000  │     └──────────┘
                 │ least_conn LB    │
                 └──────────────────┘
```

Không có service nào expose trực tiếp ra ngoài host — tất cả nằm trong Docker network nội bộ `app-network`. Chỉ Gateway mở port `8082` ra ngoài.

---

## 2. Cấu hình Docker

File `docker-compose.yml`:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "8082:80"          # host:8082 → container:80
  volumes:
    - ./nginx/gateway.conf:/etc/nginx/conf.d/default.conf:ro
  depends_on:
    frontend:
      condition: service_healthy   # đợi frontend healthy mới start
    backend-1:
      condition: service_started
    backend-2:
      condition: service_started
    backend-3:
      condition: service_started
    chatbot:
      condition: service_started

backend-1/2/3:
  expose: ["5000"]       # chỉ nội bộ trong app-network
  container_name: dashboard-web-backend-[1/2/3]

frontend:
  expose: ["3022"]       # chỉ nội bộ trong app-network
  healthcheck:
    test: wget -qO- http://127.0.0.1:3022/
    interval: 5s / retries: 10 / start_period: 15s

chatbot:
  expose: ["8010"]       # chỉ nội bộ trong app-network
  container_name: chatbot_dashboard_rating
  healthcheck:
    test: curl -f http://localhost:8010/health
```

Port `8082` là cổng duy nhất accessible từ bên ngoài, map vào port `80` bên trong container Gateway.

---

## 3. Upstreams

```nginx
upstream frontend_service {
    server frontend:3022;
    keepalive 16;
}

upstream chatbot_service {
    server chatbot:8010;        # nội bộ — KHÔNG còn dùng IP ngoài
    keepalive 8;
}

upstream backend_superset_service {
    least_conn;                 # load balance: chọn backend ít connection nhất
    server dashboard-web-backend-1:5000;
    server dashboard-web-backend-2:5000;
    server dashboard-web-backend-3:5000;
    keepalive 32;
}
```

DNS resolver nội bộ Docker được khai báo để nginx resolve hostname lazy (không fail lúc start nếu service chưa kịp lên):

```nginx
resolver 127.0.0.11 valid=5s;
```

---

## 4. Routing rules

| URL Prefix | Upstream | Rate Limit | Timeout | Ghi chú |
|---|---|---|---|---|
| `/api/superset` | `backend_superset_service` | 50 req/s (burst=100) | 600s | Superset BI queries, load balance 3 backend |
| `/api/doris/processlist` | `backend_superset_service` | Không | 600s | Xem tiến trình Doris |
| `/api/kill-user` | `backend_superset_service` | Không | 600s | Dừng query đang chạy |
| `/api/query` | `chatbot_service` | 1 req/10s | 120s | Chatbot AI — nội bộ `chatbot:8010` |
| `/api/health` | `backend_superset_service` | Không | default | Health check |
| `/` (catch-all) | `frontend_service` | Không | default | React SPA |

> **Thay đổi so với nhánh cũ:** `/api/query` trước đây trỏ ra IP ngoài `100.100.11.2:8010`. Nhánh này đã chuyển Chatbot vào Docker network nội bộ, proxy sang `chatbot:8010`.

---

## 5. Rate Limiting

### Zone `chatbot_limit` — `/api/query`

- **Rate:** 6 req/phút = 1 request mỗi 10 giây, tính theo IP
- **Burst:** không có, reject ngay nếu vượt
- **Lý do:** Chatbot AI tốn tài nguyên, giới hạn chặt để tránh abuse

### Zone `superset_limit` — `/api/superset`

- **Rate:** 50 req/giây, tính theo IP
- **Burst:** 100 request (nodelay)
- **Lý do:** Dashboard load một lần gửi ~45 request đồng thời, burst 100 đủ buffer cho 2 user cùng lúc

### Custom 429 Response

Khi bị rate limit, Gateway trả JSON thay vì HTML mặc định:

```json
{
  "success": false,
  "error": "Rate limit exceeded. Vui lòng thử lại sau 10 giây.",
  "retry_after": 10
}
```

Kèm header `Retry-After: 10`.

---

## 6. Header forwarding

Với mọi request proxy, Gateway truyền thông tin client thật xuống các service:

```nginx
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Riêng Frontend còn được thêm header WebSocket:

```nginx
proxy_set_header Upgrade    $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## 7. Điểm còn thiếu / Đề xuất

| Hạng mục | Hiện trạng | Đề xuất |
|---|---|---|
| Authentication | Chưa có tại Gateway | Thêm `auth_request` hoặc JWT validation cho các `/api/*` endpoint |
| HTTPS/TLS | Chưa có (chỉ HTTP) | Thêm SSL termination tại Gateway |
| `/api/kill-user` & `/api/doris/processlist` | Không có rate limit, không có auth | Thêm IP whitelist hoặc Basic Auth — đây là endpoint nhạy cảm |
| Access log | Không cấu hình | Thêm log format để monitor và debug production |
| Chatbot `.env` | Không commit lên git (đã xóa khỏi history) | Quản lý qua secrets manager hoặc inject lúc deploy |

---

*Tài liệu này được tổng hợp từ `nginx/gateway.conf` và `docker-compose.yml` trên nhánh `add-chatbot`.*
