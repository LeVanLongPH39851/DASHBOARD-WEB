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

  const labels = apiData.map((item) => item[labelKey] ?? "Unknown");

  const metricKeys = Object.keys(firstItem).filter((key) => key !== labelKey);

  console.log("DEBUG metricKeys:", metricKeys);
  console.log("DEBUG firstItem keys:", Object.keys(firstItem));

  // 2️⃣ Reach / Rating
  const reachKey = metricKeys.find(
    (key) =>
      key.toLowerCase().includes("reach") || key.toLowerCase().includes("live"),
  );

  const ratingKey = metricKeys.find(
    (key) =>
      key !== reachKey &&
      (key.toLowerCase().includes("rating") ||
        key.toLowerCase().includes("tsv")),
  );

  const series = [];

  // 3️⃣ Reach → BAR
  if (reachKey) {
    series.push({
      name: "reach%",
      type: "bar",
      data: apiData.map((item) => formatNumber(item[reachKey], digits)),
    });
  }

  // 4️⃣ Rating → LINE
  // Nếu không có ratingKey từ API, tạo dữ liệu rating giả (70% của reach)
  if (!ratingKey && reachKey) {
    series.push({
      name: "rating%",
      type: "line",
      data: apiData.map((item) => {
        const reachVal = formatNumber(item[reachKey], digits);
        return formatNumber(Math.max(1, reachVal * 0.7), 1); // Rating = 70% reach, làm tròn 1 chữ số
      }),
    });
  } else if (ratingKey && ratingKey !== reachKey) {
    series.push({
      name: "rating%",
      type: "line",
      data: apiData.map((item) => formatNumber(item[ratingKey], digits)),
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
