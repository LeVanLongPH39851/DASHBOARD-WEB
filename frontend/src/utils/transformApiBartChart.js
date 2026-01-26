/**
 * Transform Superset API data to BarChart format
 * @param {Array} apiData - Array of objects from Superset
 * @returns {Object} - { labels, series }
 */
export const transformBarChartData = (apiData) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  // 1. Extract labels (channel names)
  const labels = apiData.map(item => item.channel_name_tvd);

  // 2. Get all metric keys (exclude channel_name_tvd)
  const firstItem = apiData[0];
  const metricKeys = Object.keys(firstItem).filter(key => key !== 'channel_name_tvd');

  // 3. Build series array
  const series = metricKeys.map(metricName => ({
    name: metricName,
    data: apiData.map(item => item[metricName] || 0)
  }));

  return {
    labels,
    series
  };
};