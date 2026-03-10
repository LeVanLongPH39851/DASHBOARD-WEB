import { LABEL } from "./label";

/**
 * Hàm format timestamp thành dd/mm/yyyy
 * @param {number|string} timestamp - Timestamp milliseconds (1772064000000)
 * @returns {string} - dd/mm/yyyy hoặc giá trị gốc nếu không phải timestamp
 */
const formatDate = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') return timestamp;
  
  // Kiểm tra timestamp hợp lệ (13 chữ số milliseconds)
  if (timestamp.toString().length !== 13) return timestamp;
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

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

  // ALL columns become series (columns in table) with mapped labels + date format
  const series = colnames.map(colName => ({
    name: mapLabel(colName), // Mapping label ở đây
    data: apiData.map(item => formatDate(item[colName] ?? ''))
  }));

  return {
    labels,
    series
  };
};
