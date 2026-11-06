export const transformApiHeatMapData = (
  apiData = [],
  colnames = [],
  xAxisKey,
  seriesKey,
  options = {},
) => {
  const {
    sortLabels = true,
    sortSeries = false,
    formatLabel = null,
    formatSeriesName = null,
  } = options;

  if (!Array.isArray(apiData) || apiData.length === 0) {
    return { labels: [], series: [] };
  }

  // Tự động lấy cột giá trị còn lại
  const columns =
    Array.isArray(colnames) && colnames.length
      ? colnames
      : Object.keys(apiData[0]);

  const valueKey = columns.find((col) => col !== xAxisKey && col !== seriesKey);

  if (!valueKey) {
    return { labels: [], series: [] };
  }

  // Chuẩn hóa tên series, loại bỏ ký tự ẩn
  const normalize = (value) =>
    String(value ?? "")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim();

  const labelsSet = new Set();
  const seriesMap = new Map();

  // Nhóm dữ liệu theo trục X và series
  apiData.forEach((item) => {
    if (item[xAxisKey] == null || item[seriesKey] == null) return;

    const rawLabel = item[xAxisKey];
    const rawSeriesName = normalize(item[seriesKey]);

    const label = formatLabel ? formatLabel(rawLabel) : String(rawLabel);

    const seriesName = formatSeriesName
      ? formatSeriesName(rawSeriesName)
      : rawSeriesName;

    labelsSet.add(label);

    if (!seriesMap.has(seriesName)) {
      seriesMap.set(seriesName, new Map());
    }

    const rawValue = item[valueKey];

    const value =
      rawValue !== null &&
      rawValue !== undefined &&
      rawValue !== "" &&
      Number.isFinite(Number(rawValue))
        ? Number(rawValue)
        : null;

    seriesMap.get(seriesName).set(label, value);
  });

  let labels = [...labelsSet];
  let seriesNames = [...seriesMap.keys()];

  // Sắp xếp labels
  if (sortLabels) {
    labels.sort((a, b) =>
      String(a).localeCompare(String(b), undefined, {
        numeric: true,
      }),
    );
  }

  // Sắp xếp series nếu cần
  if (sortSeries) {
    seriesNames.sort((a, b) => a.localeCompare(b));
  }

  // Tạo dữ liệu cho HeatmapChart
  const series = seriesNames.map((name) => ({
    name,
    data: labels.map((label) => seriesMap.get(name).get(label) ?? null),
  }));

  return {
    labels,
    series,
  };
};
