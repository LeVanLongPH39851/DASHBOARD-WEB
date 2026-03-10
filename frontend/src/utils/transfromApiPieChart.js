/**
 * Transform Superset API data to PieChart format
 * @param {Array} apiData - Array of objects from Superset (data.data)
 * @param {Array} colnames - Column names array from Superset (data.colnames)
 * @returns {Object} - { labels, values } or null
 */
export const transformPieChartData = (apiData, colnames) => {
  // Validate data
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  // Validate colnames
  if (!colnames || !Array.isArray(colnames) || colnames.length < 2) {
    return null;
  }

  // First column = label, second column = value
  const labelKey = colnames[0];
  const valueKey = colnames[1];
  
  return {
    labels: apiData.map(item => item[labelKey] || ''),
    values: apiData.map(item => item[valueKey] || 0),
  };
};
