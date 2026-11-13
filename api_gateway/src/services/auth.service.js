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

  // Kiểm tra phân quyền Global của user từ Custom Backend (bảng user_global_roles)
  const userPermissions = await backendService.getUserPermissions(user.id);
  const globalRoles = userPermissions?.global_roles || [];
  const globalPermissions = userPermissions?.global_permissions || [];

  if (
    !Array.isArray(globalRoles) ||
    globalRoles.length === 0 ||
    !Array.isArray(globalPermissions) ||
    globalPermissions.length === 0
  ) {
    const err = new Error("Tài khoản chưa được phân quyền trong hệ thống");
    err.status = 403;
    err.statusCode = 403;
    throw err;
  }

  user.global_roles = globalRoles;
  user.global_permissions = globalPermissions;
  user.require_otp =
    userPermissions?.require_otp !== undefined
      ? Boolean(userPermissions.require_otp)
      : true;
  user.can_change_password =
    userPermissions?.can_change_password !== undefined
      ? Boolean(userPermissions.can_change_password)
      : true;

  // Kiểm tra cấu hình có được gửi mã OTP khi đăng nhập không (check trực tiếp cột require_otp từ bảng user_global_roles)
  const isOtpRequired =
    userPermissions?.require_otp !== undefined
      ? Boolean(userPermissions.require_otp)
      : true;

  // Nếu không yêu cầu OTP trong bảng user_global_roles (require_otp = false) thì trả thẳng sessionCookie về cho frontend
  if (!isOtpRequired) {
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
