const axios = require("axios");

const roleClient = axios.create({
  baseURL: `${process.env.BACKEND_URL}/internal/auth/role`,
  timeout: 15000,
  headers: {
    "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
  },
});

// -------------------------------------------------------------
// 1. Phân quyền & Dashboard
// -------------------------------------------------------------
async function getUserPermissions(userId) {
  const { data } = await roleClient.get("/check-roles", {
    params: { userId },
  });
  return data;
}

async function getUserDashboards(userId) {
  const { data } = await roleClient.get("/dashboards", {
    params: { userId },
  });
  return data;
}

// -------------------------------------------------------------
// 2. Quản lý Group & Thành viên trong Group
// -------------------------------------------------------------
async function getManagedGroups(userId) {
  const { data } = await roleClient.get("/groups", {
    params: { userId },
  });
  return data;
}

async function createManagedGroup(payload) {
  const { data } = await roleClient.post("/groups", payload);
  return data;
}

async function updateGroupDashboards(payload) {
  const { data } = await roleClient.put("/groups/dashboards", payload);
  return data;
}

async function deleteManagedGroup(payload) {
  const { data } = await roleClient.delete("/groups", { data: payload });
  return data;
}

async function getAssignableUsers(userId, groupId = null) {
  const { data } = await roleClient.get("/users/assignable", {
    params: { userId, ...(groupId ? { groupId } : {}) },
  });
  return data;
}

async function getGroupMembers(userId, groupId) {
  const { data } = await roleClient.get("/groups/members", {
    params: { userId, groupId },
  });
  return data;
}

async function assignGroupMember(payload) {
  const { data } = await roleClient.post("/groups/members", payload);
  return data;
}

async function removeGroupMember(payload) {
  const { data } = await roleClient.delete("/groups/members", {
    data: payload,
  });
  return data;
}

// -------------------------------------------------------------
// 3. Thông tin cá nhân (User Info, Profile & Đổi mật khẩu)
// -------------------------------------------------------------
async function getUsersInfo(userId) {
  const { data } = await roleClient.get("/users/info", {
    params: { userId },
  });
  return data;
}

async function updateUserProfile(userId, payload) {
  const { data } = await roleClient.put("/users/profile", {
    userId,
    ...payload,
  });
  return data;
}

async function changeUserPassword(userId, payload) {
  const { data } = await roleClient.put("/users/change-password", {
    userId,
    ...payload,
  });
  return data;
}

// -------------------------------------------------------------
// 4. Quản lý Users (Dành cho 3 Admin: admin_ami, super_admin, group_admin)
// -------------------------------------------------------------
async function getManagedUsers(userId) {
  const { data } = await roleClient.get("/manage/users", {
    params: { userId },
  });
  return data;
}

async function getRoleOptions(userId) {
  const { data } = await roleClient.get("/manage/roles", {
    params: { userId },
  });
  return data;
}

async function getManagedUserDetail(userId, targetUserId) {
  const { data } = await roleClient.get("/manage/users/detail", {
    params: { userId, targetUserId },
  });
  return data;
}

async function createManagedUser(payload) {
  const { data } = await roleClient.post("/manage/users", payload);
  return data;
}

async function updateManagedUser(payload) {
  const { data } = await roleClient.put("/manage/users", payload);
  return data;
}

async function deleteManagedUser(payload) {
  const { data } = await roleClient.delete("/manage/users", {
    data: payload,
  });
  return data;
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
