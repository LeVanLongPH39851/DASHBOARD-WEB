# Báo cáo Kiến trúc Nginx — DASHBOARD-WEB

> Ngày: 28/08/2026  
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
                  │  port 80 (internal) │
                  └────────┬────────┘
                           │ routing theo URL prefix
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌─────────────┐  ┌──────────────┐
    │  Frontend  │  │   Backend   │  │   Chatbot    │
    │  port 3022 │  │  port 5000  │  │ 100.100.11.2 │
    │ (internal) │  │ (internal)  │  │  port 8010   │
    └────────────┘  └─────────────┘  └──────────────┘
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

backend:
  expose: ["5000"]       # chỉ nội bộ trong app-network

frontend:
  expose: ["3022"]       # chỉ nội bộ trong app-network
```

Port `8082` là cổng duy nhất accessible từ bên ngoài, map vào port `80` bên trong container Gateway.

---

## 3. Routing rules

| URL Prefix | Upstream | Rate Limit | Timeout | Ghi chú |
|---|---|---|---|---|
| `/api/superset` | `backend:5000` | 50 req/s (burst=100) | 600s | Superset BI queries |
| `/api/doris/processlist` | `backend:5000` | Không | 600s | Xem tiến trình Doris |
| `/api/kill-user` | `backend:5000` | Không | 600s | Dừng query đang chạy |
| `/api/query` | `100.100.11.2:8010` | 1 req/10s | 120s | Chatbot AI (external) |
| `/api/health` | `backend:5000` | Không | 60s | Health check |
| `/` (catch-all) | `frontend:3022` | Không | default | React SPA |

---

## 4. Rate Limiting

### Zone `chatbot_limit` — `/api/query`
- **Rate:** 6 req/phút = 1 request mỗi 10 giây, tính theo IP
- **Burst:** không có, reject ngay nếu vượt
- **Lý do:** Chatbot AI tốn tài nguyên, giới hạn chặt để tránh abuse

### Zone `superset_limit` — `/api/superset`
- **Rate:** 50 req/giây, tính theo IP
- **Burst:** 100 request (nodelay)
- **Lý do:** Dashboard load một lần gửi ~45 request đồng thời, burst 100 đủ buffer cho 2 user cùng lúc. Rate 50r/s đủ thoải mái cho filter/refresh liên tục mà không ảnh hưởng UX, chỉ block abuse thực sự

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

## 5. Header forwarding

Với mọi request proxy, Gateway truyền thông tin client thật xuống các service:

```nginx
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Riêng Frontend còn được thêm header WebSocket để hỗ trợ HMR/realtime nếu cần:

```nginx
proxy_set_header Upgrade    $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## 6. Điểm còn thiếu / Đề xuất

| Hạng mục | Hiện trạng | Đề xuất |
|---|---|---|
| Authentication | Chưa có tại Gateway | Thêm `auth_request` hoặc JWT validation cho các `/api/*` endpoint |
| HTTPS/TLS | Chưa có (chỉ HTTP) | Thêm SSL termination tại Gateway |
| `/api/kill-user` & `/api/doris/processlist` | Không có rate limit, không có auth | Thêm IP whitelist hoặc Basic Auth — đây là endpoint nhạy cảm |
| Access log | Không cấu hình | Thêm log để monitor và debug production |

---

*Tài liệu này được tổng hợp từ `nginx/gateway.conf` và `docker-compose.yml`.*
