/**
 * Transform Superset API data to BarChart format
 * @param {Array} apiData - Array of objects from Superset
 * @returns {Object} - { labels, series }
 */
export const transformBarChartData = (apiData) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  // 1. Get the first key name dynamically (as label key)
  const firstItem = apiData[0];
  const labelKey = Object.keys(firstItem)[0];

  // 2. Extract labels using the first key
  const labels = apiData.map(item => item[labelKey]);

  // 3. Get all metric keys (exclude the first key which is label)
  const metricKeys = Object.keys(firstItem).filter(key => key !== labelKey);

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
