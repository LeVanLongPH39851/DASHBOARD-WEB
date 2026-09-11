# Sử dụng Python 3.10 slim để tối ưu kích thước image
FROM python:3.10-slim

# Thiết lập biến môi trường
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_HOME=/app \
    PORT=8010

WORKDIR $APP_HOME

# Cài đặt curl phục vụ healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy mã nguồn và catalog cấu hình
COPY config/ ./config/
COPY data/ ./data/
COPY src/ ./src/
COPY api.py main.py ./

# Mở cổng API
EXPOSE 8010

# Healthcheck kiểm tra trạng thái hoạt động của server
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://100.100.11.2:8010/docs || exit 1

# Khởi chạy server FastAPI
CMD ["python", "api.py", "--host", "0.0.0.0", "--port", "8010"]
