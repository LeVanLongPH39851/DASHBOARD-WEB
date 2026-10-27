FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PORT=8010
WORKDIR /app
COPY requirements.lock ./requirements.lock
RUN pip install --no-cache-dir -r requirements.lock
COPY config/ ./config/
COPY data/ ./data/
COPY skills/ ./skills/
COPY src/ ./src/
COPY api.py main.py ./
EXPOSE 8010
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8010/health', timeout=3)" || exit 1
CMD ["python", "api.py", "--host", "0.0.0.0", "--port", "8010"]
