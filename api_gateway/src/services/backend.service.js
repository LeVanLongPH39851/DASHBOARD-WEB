const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL;

async function getUserPermissions(username) {
  const response = await axios.get(`${BACKEND_URL}/backend/check-role`, {
    params: {
      username,
    },

    headers: {
      "X-Gateway-Secret": process.env.GATEWAY_INTERNAL_SECRET,
    },

    timeout: 5000,
  });

  return response.data;
}

module.exports = {
  getUserPermissions,
};
