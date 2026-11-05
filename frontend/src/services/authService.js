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

export default api;
