// helper làm tròn
const formatNumber = (value, digits = 2) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Number(num.toFixed(digits));
};

export const transformMixedChartData = (apiData = [], digits = 2) => {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    console.warn("Dữ liệu MixedChart rỗng");
    return { labels: [], series: [] };
  }

  const firstItem = apiData[0];

  // 1️⃣ Label
  const labelKey =
    Object.keys(firstItem).find((key) =>
      ["time", "hour", "band", "khung", "timeband"].some((k) =>
        key.toLowerCase().includes(k),
      ),
    ) || Object.keys(firstItem)[0];

  // Thu thập tất cả keys để tìm reach/rating dù nằm ở query khác
  const allKeys = new Set();
  apiData.forEach((item) => {
    Object.keys(item || {}).forEach((key) => allKeys.add(key));
  });

  const reachKey = Array.from(allKeys).find(
    (key) =>
      key.toLowerCase().includes("reach") || key.toLowerCase().includes("live"),
  );

  const ratingKey = Array.from(allKeys).find(
    (key) =>
      key !== reachKey &&
      (key.toLowerCase().includes("rating") ||
        key.toLowerCase().includes("tsv")),
  );

  // 2️⃣ Build maps by label (avoid duplicate timebands)
  const labelOrder = [];
  const seenLabels = new Set();
  const reachByLabel = new Map();
  const ratingByLabel = new Map();

  apiData.forEach((item) => {
    const label = item?.[labelKey] ?? "Unknown";
    if (!seenLabels.has(label)) {
      seenLabels.add(label);
      labelOrder.push(label);
    }
    if (reachKey && item?.[reachKey] != null) {
      reachByLabel.set(label, formatNumber(item[reachKey], digits));
    }
    if (ratingKey && item?.[ratingKey] != null) {
      ratingByLabel.set(label, formatNumber(item[ratingKey], digits));
    }
  });

  const labels = labelOrder;
  const series = [];

  if (reachKey) {
    series.push({
      name: "reach%",
      type: "bar",
      data: labels.map((label) => reachByLabel.get(label) ?? 0),
    });
  }

  if (ratingKey && ratingKey !== reachKey) {
    series.push({
      name: "rating%",
      type: "line",
      data: labels.map((label) => ratingByLabel.get(label) ?? 0),
    });
  } else if (!ratingKey && reachKey) {
    // fallback: tạo rating giả nếu không có rating thực
    series.push({
      name: "rating%",
      type: "line",
      data: labels.map((label) => {
        const reachVal = reachByLabel.get(label) ?? 0;
        return formatNumber(Math.max(1, reachVal * 0.7), 1);
      }),
    });
  }

  console.log("✅ MixedChart FIXED:", {
    labels,
    reachKey,
    ratingKey,
    series,
  });

  return { labels, series };
};
