const SupersetClient = require('./supersetClient');
const config = require('./config');

// Tạo client singleton
const client = new SupersetClient(
  config.SUPERSET_URL,
  config.USERNAME,
  config.PASSWORD
);

// Export hàm đơn giản
async function callAPI(url, payload) {
  return await client.post(url, payload);
}

async function getAPI(url) {
  return await client.get(url);
}

module.exports = {
  callAPI,
  getAPI,
  client  // Export client nếu cần dùng trực tiếp
};