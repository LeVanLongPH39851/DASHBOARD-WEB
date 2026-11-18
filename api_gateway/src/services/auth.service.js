const supersetService = require("./superset.service");
const backendService = require("./backend.service");
const {
  ALL_ROLES,
  hasAllowedRole,
  getPermissionsForRoles,
} = require("../config/roles");

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
  const globalRoles =
    userPermissions?.global_roles || userPermissions?.roles || [];

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
    await backendService.createAuditLog({
      userId: user.id,
      action: "AUTH_LOGIN",
      targetType: "USER",
      targetId: user.id,
      description: `Tài khoản "${user.username || user.id}" đăng nhập trực tiếp (không yêu cầu OTP)`,
      metadata: {
        username: user.username,
        email,
        require_otp: false,
      },
    });

    return {
      otpRequired: false,
      sessionCookie: credentials.sessionCookie,
      user,
    };
  }

  const responseData = await backendService.sendOtp({
    email,
    sessionCookie: credentials.sessionCookie,
    user,
  });

  return {
    otpRequired: true,
    ...responseData.data,
  };
}

// Bước 2: Gửi lại OTP
async function resendOtp(challengeId) {
  const responseData = await backendService.resendOtp({ challengeId });
  return responseData.data;
}

// Bước 3: Xác minh OTP
async function verifyOtp(challengeId, otp) {
  const responseData = await backendService.verifyOtp({ challengeId, otp });
  return responseData.data;
}

module.exports = {
  login,
  resendOtp,
  verifyOtp,
};
