import { LABEL } from "./label";

/**
 * Hàm mapping label, nếu không tìm thấy thì lấy chính key
 * @param {string} key - Key cần mapping
 * @returns {string} - Label đã mapping hoặc chính key nếu không tìm thấy
 */
const mapLabel = (key) => LABEL[key] || key;

/**
 * Transform API data to TableChart format
 * @param {Array} apiData - Array of objects from API
 * @param {Array} colnames - Column names array (optional)
 * @returns {Object} - { labels, series }
 */
export const transformTableChartData = (apiData, colnames = null) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  // If colnames not provided, extract from first object
  if (!colnames) {
    colnames = Object.keys(apiData[0]);
  }

  // Use row indices as labels (dummy labels for table)
  const labels = apiData.map((_, index) => index);

  // ALL columns become series (columns in table) with mapped labels
  const series = colnames.map(colName => ({
    name: mapLabel(colName), // Mapping label ở đây
    data: apiData.map(item => item[colName] ?? '')
  }));

  return {
    labels,
    series
  };
};
