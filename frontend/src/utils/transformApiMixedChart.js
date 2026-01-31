// utils/transformApiMixedChart.js

/**
 * Transform API data to MixedChart format - UNIVERSAL
 * 
 * @param {Array} apiData - Array of data objects
 * @param {String} labelKey - Key for labels (e.g., 'date', 'time_band', 'channel')
 * @param {Array|Object} colnamesOrOptions - Colnames array OR options object
 * @returns {Object} - {labels, series}
 */
export const transformMixedChartData = (
  apiData = [],
  labelKey = 'date',
  colnamesOrOptions = null
) => {
  // ✅ HANDLE FLEXIBLE PARAMETERS
  let colnames = null;
  let formatLabel = null;
  let metricsConfig = null;
  let sortByLabel = true;
  let excludeColumns = [];

  if (Array.isArray(colnamesOrOptions)) {
    // ✅ Truyền trực tiếp colnames array
    colnames = colnamesOrOptions;
  } else if (colnamesOrOptions && typeof colnamesOrOptions === 'object') {
    // ✅ Truyền options object
    ({
      colnames = null,
      formatLabel = null,
      metricsConfig = null,
      sortByLabel = true,
      excludeColumns = []
    } = colnamesOrOptions);
  }

  if (!apiData || apiData.length === 0) {
    return { labels: [], series: [] };
  }

  // ✅ BƯỚC 1: Group data by label
  const groupedData = {};
  
  apiData.forEach(item => {
    const labelValue = item[labelKey];
    if (!labelValue && labelValue !== 0) return;
    
    // ✅ AUTO FORMAT LABEL
    let formattedLabel;
    
    if (formatLabel) {
      formattedLabel = formatLabel(labelValue);
    } else {
      if (typeof labelValue === 'number') {
        // Timestamp
        const date = new Date(labelValue);
        formattedLabel = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      } else if (typeof labelValue === 'string') {
        // Keep string as is
        formattedLabel = labelValue;
      } else {
        formattedLabel = String(labelValue);
      }
    }
    
    if (!groupedData[formattedLabel]) {
      groupedData[formattedLabel] = { _sortKey: labelValue };
    }
    
    // Add all metrics
    Object.keys(item).forEach(key => {
      if (key !== labelKey && !excludeColumns.includes(key)) {
        groupedData[formattedLabel][key] = item[key];
      }
    });
  });

  // ✅ BƯỚC 2: Extract labels
  let labels = Object.keys(groupedData);
  
  // Sort if needed
  if (sortByLabel) {
    labels.sort((a, b) => {
      const valA = groupedData[a]._sortKey;
      const valB = groupedData[b]._sortKey;
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return valA - valB;
      }
      return String(valA).localeCompare(String(valB));
    });
  }

  // ✅ BƯỚC 3: Determine metrics
  let metrics = metricsConfig;
  
  if (!metrics) {
    if (colnames && Array.isArray(colnames)) {
      // ✅ Use colnames from API
      metrics = colnames.filter(
        col => col !== labelKey && !excludeColumns.includes(col)
      );
    } else {
      // Auto detect from data
      const allKeys = new Set();
      Object.values(groupedData).forEach(obj => {
        Object.keys(obj).forEach(key => {
          if (key !== '_sortKey') {
            allKeys.add(key);
          }
        });
      });
      metrics = Array.from(allKeys);
    }
  }

  // ✅ BƯỚC 4: Build series
  const series = metrics.map(metricName => ({
    name: metricName,
    data: labels.map(label => {
      const value = groupedData[label][metricName];
      return value !== undefined && value !== null ? Number(value) : null;
    })
  }));

  return {
    labels,
    series
  };
};


/**
 * Helper: Format date
 */
export const formatDate = (timestamp, format = 'DD/MM/YYYY') => {
  const date = new Date(timestamp);
  
  switch(format) {
    case 'DD/MM/YYYY':
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    case 'DD/MM':
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    case 'HH:mm':
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0];
    default:
      return date.toLocaleDateString();
  }
};
