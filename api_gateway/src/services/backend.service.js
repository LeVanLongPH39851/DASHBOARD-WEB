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
      timeout: 50000,
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
      timeout: 50000,
    },
  );

  return response.data;
}

async function getManagedGroups(userId) {
  const response = await axios.get(`${BACKEND_URL}/internal/auth/role/groups`, {
    params: {
      userId,
    },
    headers: {
      "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
    },
    timeout: 50000,
  });

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
      timeout: 50000,
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
      timeout: 50000,
    },
  );

  return response.data;
}

async function getAssignableUsers(userId, groupId = null) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/users/assignable`,
    {
      params: { userId, ...(groupId ? { groupId } : {}) },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 8000,
    },
  );

  return response.data;
}

async function getUsersInfo(userId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/users/info`,
    {
      params: { userId },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 10000,
    },
  );

  return response.data;
}

async function getGroupMembers(userId, groupId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/groups/members`,
    {
      params: { userId, groupId },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 8000,
    },
  );

  return response.data;
}

async function assignGroupMember(payload) {
  const response = await axios.post(
    `${BACKEND_URL}/internal/auth/role/groups/members`,
    payload,
    {
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 8000,
    },
  );

  return response.data;
}

async function removeGroupMember(payload) {
  const response = await axios.delete(
    `${BACKEND_URL}/internal/auth/role/groups/members`,
    {
      data: payload,
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 8000,
    },
  );

  return response.data;
}

async function deleteManagedGroup(payload) {
  const response = await axios.delete(
    `${BACKEND_URL}/internal/auth/role/groups`,
    {
      data: payload,
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 8000,
    },
  );

  return response.data;
}

// -------------------------------------------------------------
// Users Management APIs (Dành cho 3 Admin)
// -------------------------------------------------------------
async function getManagedUsers(userId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/manage/users`,
    {
      params: { userId },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 10000,
    },
  );
  return response.data;
}

async function getRoleOptions(userId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/manage/roles`,
    {
      params: { userId },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 8000,
    },
  );
  return response.data;
}

async function getManagedUserDetail(userId, targetUserId) {
  const response = await axios.get(
    `${BACKEND_URL}/internal/auth/role/manage/users/detail`,
    {
      params: { userId, targetUserId },
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 10000,
    },
  );
  return response.data;
}

async function createManagedUser(payload) {
  const response = await axios.post(
    `${BACKEND_URL}/internal/auth/role/manage/users`,
    payload,
    {
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 12000,
    },
  );
  return response.data;
}

async function updateManagedUser(payload) {
  const response = await axios.put(
    `${BACKEND_URL}/internal/auth/role/manage/users`,
    payload,
    {
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 12000,
    },
  );
  return response.data;
}

async function deleteManagedUser(payload) {
  const response = await axios.delete(
    `${BACKEND_URL}/internal/auth/role/manage/users`,
    {
      data: payload,
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 12000,
    },
  );
  return response.data;
}

async function updateUserProfile(userId, data) {
  const response = await axios.put(
    `${BACKEND_URL}/internal/auth/role/users/profile`,
    {
      userId,
      ...data,
    },
    {
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 10000,
    },
  );
  return response.data;
}

async function changeUserPassword(userId, data) {
  const response = await axios.put(
    `${BACKEND_URL}/internal/auth/role/users/change-password`,
    {
      userId,
      ...data,
    },
    {
      headers: {
        "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
      },
      timeout: 10000,
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
  deleteManagedGroup,
  getAssignableUsers,
  getUsersInfo,
  updateUserProfile,
  changeUserPassword,
  getGroupMembers,
  assignGroupMember,
  removeGroupMember,
  getManagedUsers,
  getRoleOptions,
  getManagedUserDetail,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
};
