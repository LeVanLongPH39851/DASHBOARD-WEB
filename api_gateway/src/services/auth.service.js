const axios = require("axios");
const supersetService = require("./superset.service");
const backendService = require("./backend.service");

const internalClient = axios.create({
  baseURL: process.env.BACKEND_URL,
  timeout: 15000,
  headers: {
    "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
  },
});

// Bước 1: Đăng nhập Superset và gửi OTP
async function login(username, password) {
  // Đăng nhập Superset
  const credentials = await supersetService.login(username, password);

  const user = credentials.user;
  const email = user?.email;

  if (!email) {
    throw new Error("Tài khoản Superset chưa có email");
  }

  // Kiểm tra quyền của user từ Custom Backend
  const userPermissions = await backendService.getUserPermissions(user.id);
  const permissions = userPermissions?.permissions || [];

  // Nếu không có quyền otp.verify thì trả thẳng sessionCookie về cho frontend
  if (!permissions.includes("otp.verify")) {
    return {
      otpRequired: false,
      sessionCookie: credentials.sessionCookie,
      user,
    };
  }

  // Gửi session và email sang Custom Backend
  const response = await internalClient.post("/internal/auth/otp/send", {
    email,
    sessionCookie: credentials.sessionCookie,
    user,
  });

  return {
    otpRequired: true,
    ...response.data.data,
  };
}

// Bước 2: Gửi lại OTP
async function resendOtp(challengeId) {
  const response = await internalClient.post("/internal/auth/otp/resend", {
    challengeId,
  });

  return response.data.data;
}

// Bước 3: Xác minh OTP
async function verifyOtp(challengeId, otp) {
  const response = await internalClient.post("/internal/auth/otp/verify", {
    challengeId,
    otp,
  });

  return response.data.data;
}

module.exports = {
  login,
  resendOtp,
  verifyOtp,
};
