/**
 * Transform Superset API data to BarChart format
 * @param {Array} apiData - Array of objects from Superset (data.data)
 * @param {Array} colnames - Column names array from Superset (data.colnames)
 * @returns {Object} - { labels, series } or null
 */
export const transformBarChartData = (apiData, colnames) => {
  // Validate data
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  // Validate colnames
  if (!colnames || !Array.isArray(colnames) || colnames.length === 0) {
    return null;
  }

  // 1. First column is label key
  const labelKey = colnames[0];

  // 2. Extract labels using the first column
  const labels = apiData.map(item => item[labelKey]);

  // 3. Remaining columns are metric keys
  const metricKeys = colnames.slice(1);

  // 4. Build series array
  const series = metricKeys.map(metricName => ({
    name: metricName,
    data: apiData.map(item => item[metricName] || 0)
  }));

  return {
    labels,
    series
  };
};