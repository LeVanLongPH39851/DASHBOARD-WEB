export const getYesterday = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()); // 2 chữ số cuối
  return `${day}/${month}/${year}`;
};

// Format timestamp -> dd/MM/yyyy HH:mm
export const formatDateTime = (timestamp) => {
    timestamp = timestamp - 7 * 60 * 60 * 1000;
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const getDayBeforeYesterday = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 2);
  return yesterday.toISOString().split('T')[0];
};

export const generateRandomId = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomPart = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const timestamp = Date.now();
  return `${randomPart}_${timestamp}`;
};