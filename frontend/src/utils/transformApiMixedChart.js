// utils/transformApiMixedChart.js

/**
 * Transform API data to MixedChart format - UNIVERSAL
 *
 * @param {Array} apiData - Array of data objects
 * @param {String} labelKey - Key for labels (e.g., 'date', 'time_band', 'channel')
 * @param {Array|Object} colnamesOrOptions - Colnames array OR options object
 * @returns {Object} - {labels, series}
 */

const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hh = Number(match[1]);
  const mm = Number(match[2]);

  if (Number.isNaN(hh) || Number.isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    return null;
  }

  return hh * 60 + mm;
};

const minutesToTime = (totalMinutes) => {
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

export const transformMixedChartData = (
  apiData = [],
  labelKey = 'date',
  colnamesOrOptions = null,
  fullTimeband = null
) => {
  let colnames = null;
  let formatLabel = null;
  let metricsConfig = null;
  let sortByLabel = true;
  let excludeColumns = [];

  if (Array.isArray(colnamesOrOptions)) {
    colnames = colnamesOrOptions;
  } else if (colnamesOrOptions && typeof colnamesOrOptions === 'object') {
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

    let formattedLabel;

    if (formatLabel) {
      formattedLabel = formatLabel(labelValue);
    } else {
      if (typeof labelValue === 'number') {
        const date = new Date(labelValue);
        formattedLabel = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      } else if (typeof labelValue === 'string') {
        formattedLabel = labelValue;
      } else {
        formattedLabel = String(labelValue);
      }
    }

    if (!groupedData[formattedLabel]) {
      groupedData[formattedLabel] = { _sortKey: labelValue };
    }

    Object.keys(item).forEach(key => {
      if (key !== labelKey && !excludeColumns.includes(key)) {
        groupedData[formattedLabel][key] = item[key];
      }
    });
  });

  // ✅ BƯỚC 2: Extract labels
  let labels = Object.keys(groupedData);

  if (fullTimeband === 'full_timeband_minute') {
    
    // ✅ FIX CỨNG FULL DAY 00:00 -> 23:59
    labels = [];
    for (let m = 0; m <= 1439; m++) {
      const minuteLabel = minutesToTime(m);
      labels.push(minuteLabel);

      if (!groupedData[minuteLabel]) {
        groupedData[minuteLabel] = { _sortKey: minuteLabel };
      }
    }
  } else if (sortByLabel) {
    labels.sort((a, b) => {
      const valA = groupedData[a]?._sortKey;
      const valB = groupedData[b]?._sortKey;

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
      metrics = colnames.filter(
        col => col !== labelKey && !excludeColumns.includes(col)
      );
    } else {
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
      const value = groupedData[label]?.[metricName];
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

  switch (format) {
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