const axios = require("axios");
const supersetService = require("./superset.service");
const backendService = require("./backend.service");
const {
  ALL_ROLES,
  hasAllowedRole,
  getPermissionsForRoles,
} = require("../config/roles");

const internalClient = axios.create({
  baseURL: process.env.BACKEND_URL,
  timeout: 15000,
  headers: {
    "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
  },
});

// Bước 1: Đăng nhập Superset, kiểm tra role_code trong user_global_roles và gửi OTP
async function login(username, password) {
  const credentials = await supersetService.login(username, password);
  const user = credentials.user;
  const email = user?.email;

  if (!email) {
    throw new Error("Tài khoản Superset chưa có email");
  }

  // Kiểm tra vai trò Global của user từ Custom Backend (bảng user_global_roles) dựa theo role_code
  const userPermissions = await backendService.getUserPermissions(user.id);
  const globalRoles = userPermissions?.global_roles || userPermissions?.roles || [];

  if (!hasAllowedRole(globalRoles, ALL_ROLES)) {
    const err = new Error("Tài khoản chưa được phân quyền trong hệ thống");
    err.status = 403;
    err.statusCode = 403;
    throw err;
  }

  const globalPermissions =
    userPermissions?.global_permissions || getPermissionsForRoles(globalRoles);

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

  // Nếu không yêu cầu OTP trong bảng user_global_roles (require_otp = false) thì trả thẳng sessionCookie
  if (!user.require_otp) {
    return {
      otpRequired: false,
      sessionCookie: credentials.sessionCookie,
      user,
    };
  }

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
