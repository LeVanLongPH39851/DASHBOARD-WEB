import { LABEL } from "./label";

/**
 * Hàm format timestamp thành dd/mm/yyyy
 * @param {number|string} timestamp - Timestamp milliseconds (1772064000000)
 * @returns {string} - dd/mm/yyyy hoặc giá trị gốc nếu không phải timestamp
 */
const formatDate = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'number') return timestamp;
  
  // Kiểm tra timestamp hợp lệ (13 chữ số milliseconds)
  if (timestamp < 946684800000) return timestamp;
  
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

/**
 * Transform API data to TableChart format
 * @param {Array} apiData - Array of objects from API
 * @param {Array} colnames - Column names array (optional)
 * @returns {Object} - { labels, series }
 */
export const transformTableChartData = (apiData, colnames = null, columnSort = null, hiddenLabels = [], labelTables = LABEL) => {
  const mapLabel = (key) => labelTables[key] || key;
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return null;
  }

  // If colnames not provided, extract from first object
  if (!colnames) {
    colnames = Object.keys(apiData[0]);
  }

  let sortedColnames = colnames;
  if (columnSort && Array.isArray(columnSort)) {
    sortedColnames = [...colnames].sort((a, b) => {
      const ia = columnSort.indexOf(a);
      const ib = columnSort.indexOf(b);

      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  const hiddenSet = new Set(hiddenLabels);

  const visibleColnames = sortedColnames.filter((colName) => {
    const mappedLabel = mapLabel(colName);
    return !hiddenSet.has(colName) && !hiddenSet.has(mappedLabel);
  });

  // Use row indices as labels (dummy labels for table)
  const labels = apiData.map((_, index) => index);

  // ALL columns become series (columns in table) with mapped labels + date format
  const series = visibleColnames.map(colName => ({
    name: mapLabel(colName), // Mapping label ở đây
    data: apiData.map(item => formatDate(item[colName] ?? ''))
  }));

  return {
    labels,
    series
  };
};
