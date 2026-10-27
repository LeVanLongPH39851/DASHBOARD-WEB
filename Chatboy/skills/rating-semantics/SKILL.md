---
name: rating-semantics
description: Chọn KPI, filter và group-by từ catalog Rating.
metadata:
  version: 1.0.0
  catalog_refs: data/dashboard/rating/catalog.yaml,data/dashboard/rating/dimensions.yaml,data/dashboard/rating/patterns_v3.yaml
---

Chỉ dùng ID trong catalog được cung cấp. Giá trị filter phải có trong câu hỏi gốc hoặc lượt xác nhận. Liệt kê khác đếm; group-by khác filter. Không tự chọn kênh, tỉnh hay chương trình. Không thay KPI để truy vấn chạy được. Thiếu ngữ nghĩa cần làm rõ. Giữ whitelist đầy đủ khi chưa rõ family.
