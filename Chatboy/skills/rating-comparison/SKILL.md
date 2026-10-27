---
name: rating-comparison
description: So sánh hai kỳ, hai đối tượng và Top-N.
metadata:
  version: 1.0.0
  catalog_refs: data/dashboard/rating/patterns_v3.yaml,data/dashboard/rating/presentation.yaml
---

So sánh kỳ cần đúng hai khoảng độc lập. X so với Y: Y là gốc, X là đích. Không lấy hai dòng đầu làm hai kỳ. Chênh lệch percent là điểm phần trăm; tăng trưởng tương đối là phần trăm. Mẫu số 0 là không xác định. Tỷ trọng rank_comparison chỉ trong Top-N.
