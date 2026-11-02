import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
  timeout: 30000,
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

// Lấy thông tin user
export const getMe = async (sessionCookie) => {
  const response = await api.get("/api/auth/me", {
    headers: {
      Cookie: sessionCookie,
    },
  });

  return response.data;
};

// Đăng xuất
export const logout = async (sessionCookie) => {
  const response = await api.post(
    "/api/auth/logout",
    {},
    {
      headers: {
        Cookie: sessionCookie,
      },
    },
  );

  return response.data;
};

export default api;
