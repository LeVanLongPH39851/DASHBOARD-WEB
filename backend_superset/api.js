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

// Gọi API có gắn user_id để có thể kill sau
async function callAPIWithUser(url, payload, user_id) {
  return await client.post(url, payload, user_id);
}

async function getAPIWithUser(url, user_id) {
  return await client.get(url, {}, user_id);
}

// Kill tất cả request đang pending/running của user_id
function killUserRequests(user_id) {
  return client.killUser(user_id);
}

module.exports = {
  callAPI,
  getAPI,
  callAPIWithUser,
  getAPIWithUser,
  killUserRequests,
  client  // Export client nếu cần dùng trực tiếp
};