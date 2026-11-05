const axios = require("axios");

const BACKEND_URL = process.env.BACKEND_URL;

async function getUserPermissions(userId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/check-roles`,
    {
      params: {
        userId: userId,
      },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 5000,
    },
  );

  return response.data;
}

async function getUserDashboards(userId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/dashboards`,
    {
      params: {
        userId: userId,
      },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 5000,
    },
  );

  return response.data;
}

async function getManagedGroups(userId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/groups`,
    {
      params: {
        userId,
      },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 5000,
    },
  );

  return response.data;
}

async function createManagedGroup(payload) {
  const response = await axios.post(
    `${BACKEND_URL}/internal/auth/role/groups`,
    payload,
    {
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 5000,
    },
  );

  return response.data;
}

async function updateGroupDashboards(payload) {
  const response = await axios.put(
    `${BACKEND_URL}/internal/auth/role/groups/dashboards`,
    payload,
    {
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 5000,
    },
  );

  return response.data;
}

module.exports = {
  getUserPermissions,
  getUserDashboards,
  getManagedGroups,
  createManagedGroup,
  updateGroupDashboards,
};
