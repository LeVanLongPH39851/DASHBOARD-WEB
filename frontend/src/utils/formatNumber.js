// utils/formatNumber.js
export function formatNumber(value, { isPercent = false } = {}) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  if (isPercent) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%';
  }

  return Number(value).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
}
