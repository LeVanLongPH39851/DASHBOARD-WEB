/**
 * Transform Superset API data to TreeMap format
 * @param {Array} apiData - Array of objects from Superset (data.data)
 * @param {Array} colnames - Column names array from Superset (data.colnames)
 * @returns {Object} - { labels, series } for TreeMapChart or null
 * 
 * Example API response:
 * {
 *   data: [
 *     { channel_name_tvd: "VTV1", "reach%": 38.54 },
 *     { channel_name_tvd: "VTV2", "reach%": 13.14 }
 *   ],
 *   colnames: ["channel_name_tvd", "reach%"]
 * }
 * 
 * Output format:
 * {
 *   labels: ["VTV1", "VTV2"],
 *   series: [{ name: "reach%", data: [38.54, 13.14] }]
 * }
 */
export const transformTreeMapData = (apiData, colnames) => {
  // Validate data
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    console.warn('transformTreeMapData: Invalid or empty apiData');
    return null;
  }

  // Validate colnames
  if (!colnames || !Array.isArray(colnames) || colnames.length === 0) {
    console.warn('transformTreeMapData: Invalid or empty colnames');
    return null;
  }

  // 1. First column is label key (category)
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

/**
 * Alternative: Transform trực tiếp sang ECharts TreeMap format
 * @param {Array} apiData - Array of objects from Superset
 * @param {Array} colnames - Column names
 * @returns {Array} - ECharts treemap data format [{ name, value }]
 */
export const transformToEChartsTreeMap = (apiData, colnames) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return [];
  }

  if (!colnames || colnames.length < 2) {
    return [];
  }

  const labelKey = colnames[0];
  const valueKey = colnames[1];

  return apiData.map(item => ({
    name: item[labelKey],
    value: item[valueKey] || 0
  }));
};

/**
 * Transform nested/grouped data to TreeMap (2 levels)
 * Use when API returns grouped data
 * 
 * Example:
 * {
 *   data: [
 *     { channel: "VTV1", timeband: "Morning", reach: 10 },
 *     { channel: "VTV1", timeband: "Evening", reach: 15 }
 *   ],
 *   colnames: ["channel", "timeband", "reach"]
 * }
 */
export const transformNestedTreeMapData = (apiData, colnames) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  if (!colnames || colnames.length < 3) {
    console.warn('transformNestedTreeMapData: Need at least 3 columns');
    return null;
  }

  const [groupKey, labelKey, valueKey] = colnames;

  // Group by first column (e.g., channel)
  const grouped = {};
  apiData.forEach(item => {
    const group = item[groupKey];
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push({
      label: item[labelKey],
      value: item[valueKey] || 0
    });
  });

  // Convert to series format
  const labels = [...new Set(apiData.map(item => item[labelKey]))];
  const series = Object.keys(grouped).map(groupName => ({
    name: groupName,
    data: labels.map(label => {
      const found = grouped[groupName].find(item => item.label === label);
      return found ? found.value : 0;
    })
  }));

  return {
    labels,
    series
  };
};
