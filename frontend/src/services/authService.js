import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Đăng nhập
export const login = async (username, password) => {
  const response = await api.post("/api/auth/login", {
    username,
    password,
  });

  return response.data;
};

// Xác thực OTP
export const verifyOtp = async (challengeId, otp) => {
  const response = await api.post("/api/auth/verify-otp", {
    challengeId,
    otp,
  });

  return response.data;
};

// Gửi lại OTP
export const resendOtp = async (challengeId) => {
  const response = await api.post("/api/auth/resend-otp", {
    challengeId,
  });

  return response.data;
};

// Lấy thông tin user (tự động gửi kèm httpOnly Cookie qua withCredentials: true)
export const getMe = async () => {
  const response = await api.get("/api/auth/me");

  return response.data;
};

// Đăng xuất
export const logout = async () => {
  const response = await api.post("/api/auth/logout");

  return response.data;
};

// Lấy danh sách Dashboard được phép xem
export const getDashboards = async () => {
  const response = await api.get("/api/dashboards");

  return response.data;
};

// Kiểm tra quyền truy cập vào 1 Dashboard cụ thể (theo slug hoặc id)
export const checkDashboardAccess = async (target) => {
  const response = await api.get(
    `/api/dashboards/check-access/${encodeURIComponent(target)}`,
  );

  return response.data;
};

// Lấy danh sách Group quản lý (Role & Permission)
export const getManagedGroups = async () => {
  const response = await api.get("/api/groups");

  return response.data;
};

// Tạo Group mới
export const createManagedGroup = async (payload) => {
  const response = await api.post("/api/groups", payload);

  return response.data;
};

// Cập nhật danh sách Dashboard cấp phát cho Group
export const updateGroupDashboards = async (groupId, dashboardIds) => {
  const response = await api.put(`/api/groups/${groupId}/dashboards`, {
    dashboardIds,
  });

  return response.data;
};

// Xóa Group và các dữ liệu liên quan
export const deleteManagedGroup = async (groupId) => {
  const response = await api.delete(`/api/groups/${groupId}`);

  return response.data;
};

// Lấy thông tin User Info (username, email, status, ngày tạo, group, vai trò, các dashboard được xem)
export const getUsersInfo = async () => {
  const response = await api.get("/api/users/info");

  return response.data;
};

// Cập nhật thông tin cá nhân (first_name, last_name, email)
export const updateUserProfile = async (payload) => {
  const response = await api.put("/api/users/profile", payload);

  return response.data;
};

// Đổi mật khẩu tài khoản
export const changeUserPassword = async (payload) => {
  const response = await api.put("/api/users/change-password", payload);

  return response.data;
};

// Lấy danh sách user từ bảng users (Superset) có trong user_global_roles để gán vào Group
export const getAssignableUsers = async (groupId = null) => {
  const response = await api.get("/api/users/assignable", {
    params: groupId ? { groupId } : {},
  });

  return response.data;
};

// Lấy danh sách thành viên/quản trị của 1 Group
export const getGroupMembers = async (groupId) => {
  const response = await api.get(`/api/groups/${groupId}/members`);

  return response.data;
};

// Gán user làm quản trị hoặc thành viên của Group (kèm danh sách dashboard của thành viên)
export const assignGroupMember = async (groupId, payload) => {
  const response = await api.post(`/api/groups/${groupId}/members`, payload);

  return response.data;
};

// Xóa user khỏi Group
export const removeGroupMember = async (groupId, targetUserId) => {
  const response = await api.delete(
    `/api/groups/${groupId}/members/${targetUserId}`,
  );

  return response.data;
};

// -------------------------------------------------------------
// Quản lý Users (3 Admin: admin_ami, super_admin, group_admin)
// -------------------------------------------------------------
export const getManagedUsers = async () => {
  const response = await api.get("/api/manage/users");
  return response.data;
};

export const getManageableRoles = async () => {
  const response = await api.get("/api/manage/roles");
  return response.data;
};

export const getManagedUserDetail = async (targetUserId) => {
  const response = await api.get("/api/manage/users/detail", {
    params: { targetUserId },
  });
  return response.data;
};

export const createManagedUser = async (payload) => {
  const response = await api.post("/api/manage/users", payload);
  return response.data;
};

export const updateManagedUser = async (targetUserId, payload) => {
  const response = await api.put(`/api/manage/users/${targetUserId}`, payload);
  return response.data;
};

export const deleteManagedUser = async (targetUserId) => {
  const response = await api.delete(`/api/manage/users/${targetUserId}`);
  return response.data;
};

export default api;
