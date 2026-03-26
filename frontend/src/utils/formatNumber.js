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

export const formatKMB = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
};