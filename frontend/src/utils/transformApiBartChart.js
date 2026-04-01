/**
 * Transform Superset API data to BarChart format
 * @param {Array} apiData - Array of objects from Superset (data.data)
 * @param {Array} colnames - Column names array from Superset (data.colnames)
 * @returns {Object} - { labels, series } or null
 */
export const transformBarChartData = (apiData, colnames) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  if (!colnames || !Array.isArray(colnames) || colnames.length === 0) {
    return null;
  }

  const formatDateToDDMMYYYY = (value) => {
    if (value == null) return value;

    const num = Number(value);
    if (!Number.isFinite(num)) return value;

    const date = new Date(num);

    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const labelKey = colnames[0];
  const labels = apiData.map(item => formatDateToDDMMYYYY(item[labelKey]));
  const metricKeys = colnames.slice(1);

  const series = metricKeys.map(metricName => ({
    name: metricName,
    data: apiData.map(item => item[metricName] || 0)
  }));

  return {
    labels,
    series
  };
};