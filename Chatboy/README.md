# Rating Chatbot — Natural Language Analytics & Knowledge Engine

Hệ thống Chatbot phân tích số liệu truyền hình (Rating TVD) và tra cứu kiến thức nghiệp vụ cho **Rating Dashboard** trên Apache Doris, tích hợp FastAPI và LLM Semantic Extraction.

---

## 🌟 Tính Năng Nổi Bật

- **🎯 Top-Level Intent Router**: Tự động phân loại câu hỏi người dùng thành 3 nhóm nghiệp vụ:
  1. **`data_query`**: Tra cứu và phân tích số liệu thực tế qua quy trình 15 bước Text-to-SQL an toàn trên Apache Doris.
  2. **`definition`**: Trả lời trực tiếp định nghĩa, cách tính, và ý nghĩa của các chỉ số (Rating, Reach, Lượt xem...) từ Catalog Metadata.
  3. **`no_scope`**: Phát hiện và hướng dẫn đối với các câu hỏi ngoài phạm vi nghiệp vụ.
- **🛡️ Zero-LLM SQL Generation**: LLM chỉ đóng vai trò trích xuất tham số ngữ nghĩa (Semantic Extractor); toàn bộ quá trình tạo SQL và tính toán số liệu được thực thi bằng mã nguồn Python deterministic 100%, chống hoàn toàn hallucination và SQL injection.
- **⚡ Unified Output Format (`AgentResponse`)**: Cung cấp phản hồi đồng nhất cho phía Chatbot UI qua trường `reply`.
- **📊 Logging chuyên biệt**: Ghi log độc lập theo từng intent level (`logs/data_query.log`, `logs/definition.log`, `logs/no_scope.log`).

---

## 🏗️ Cấu Trúc Dự Án

```
XBobo/
├── api.py                          # FastAPI backend server (/api/query, /health)
├── main.py                         # CLI Terminal runner & Interactive REPL
├── requirements.txt                # Python dependencies
├── config/
│   ├── doris_config.py             # Cấu hình kết nối Apache Doris
│   └── llm_config.py               # Cấu hình kết nối LLM (Gemini/OpenAI/vLLM)
├── data/dashboard/rating/          # Semantic Catalog (YAML metadata & từ điển CSV)
│   ├── catalog.yaml                # Manifest trung tâm
│   ├── channel/                    # Metadata KPI kênh (metrics.yaml, fact.yaml, ...)
│   ├── program/                    # Metadata KPI chương trình (metrics.yaml, fact.yaml, ...)
│   ├── patterns_v3.yaml            # 8 Pattern phân tích nghiệp vụ
│   └── values/                     # Từ điển giá trị chuẩn (kênh, chương trình, tỉnh thành...)
├── logs/                           # Thư mục chứa log files xoay vòng theo intent
└── src/core/text_to_sql/           # Core engine
    ├── intent_routing/             # Tầng Intent Router 000 (100% LLM)
    ├── definition_agent/           # Tầng Knowledge QA 016 (Catalog Metadata)
    ├── semantic_extraction/        # Trích xuất ngữ nghĩa (Workflow 001)
    ├── canonical_binding/          # Đối sánh từ điển chuẩn (Workflow 002)
    ├── semantic_resolution/        # Giải quyết thực thể (Workflow 003)
    ├── recipes/                    # Template SQL sinh động cho Channel & Program
    ├── d_015_rating_query_pipeline.py # Orchestrator trung tâm
    └── test/                       # 174 Unit & Integration Tests
```

---

## 🚀 Khởi Động & Cài Đặt

### 1. Cài đặt môi trường

```bash
# Tạo virtual environment và kích hoạt
python3.10 -m venv .venv
source .venv/bin/activate

# Cài đặt thư viện phụ thuộc
pip install -r requirements.txt
```

### 2. Cấu hình file `.env`

Tạo file `.env` tại thư mục gốc với các thông số:

```ini
# Cấu hình Doris Database
DORIS_HOST=100.100.11.2
DORIS_PORT=9030
DORIS_USER=root
DORIS_PASSWORD=your_password
DORIS_DATABASE=data_dashboard_rating

# Cấu hình LLM
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-2.0-flash
```

---

## 💻 Hướng Dẫn Sử Dụng

### 1. Khởi chạy Backend API Server (`api.py`)

```bash
.venv/bin/python api.py --host 0.0.0.0 --port 8020
```
- **Swagger Docs**: `http://0.0.0.0:8020/docs`
- **POST Query**: `POST http://0.0.0.0:8020/api/query`

**Ví dụ gọi qua cURL:**
```bash
# Câu hỏi số liệu (Data Query)
curl -X POST "http://0.0.0.0:8020/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Rating của VTV1 hôm qua", "use_router": true, "execute": true}'

# Câu hỏi định nghĩa (Definition)
curl -X POST "http://0.0.0.0:8020/api/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "Reach% là gì?", "use_router": true}'
```

### 2. Sử dụng CLI Terminal (`main.py`)

```bash
# 1. Chạy câu hỏi Data Query (tạo SQL)
.venv/bin/python main.py "Rating của VTV1 hôm qua"

# 2. Chạy câu hỏi Definition
.venv/bin/python main.py "Reach% là gì?"

# 3. Xuất toàn bộ chẩn đoán dạng JSON
.venv/bin/python main.py "Rating VTV1 hôm qua" --json

# 4. Gửi truy vấn và lấy số liệu từ Doris
.venv/bin/python main.py "Top 5 kênh có lượt xem cao nhất hôm qua" --execute

# 5. Chế độ tương tác liên tục (Interactive REPL)
.venv/bin/python main.py -i
```

---

## 🧪 Kiểm Thử (Testing)

Chạy toàn bộ **174 unit tests** bảo đảm độ tin cậy và không regression:

```bash
.venv/bin/python -m unittest discover -s src/core/text_to_sql/test -v
```

---

## 📖 Tài Liệu Chi Tiết

Xem tài liệu kiến trúc chi tiết của 15 giai đoạn Text-to-SQL và Catalog Metadata tại:
👉 [**`src/core/text_to_sql/README.md`**](src/core/text_to_sql/README.md)
