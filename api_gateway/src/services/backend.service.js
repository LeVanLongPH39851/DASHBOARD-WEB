const axios = require("axios");
const getNextInstance = require("./load-balancer");
const services = require("../config/services");

const RETRY_ATTEMPTS = Number(process.env.RETRY_ATTEMPTS ?? 2);
const REQUEST_TIMEOUT = Number(process.env.REQUEST_TIMEOUT || 15000);
const FAILURE_THRESHOLD = Number(process.env.HEALTH_FAILURE_THRESHOLD || 2);

const RETRYABLE_STATUS = [502, 503, 504];
const RETRYABLE_ERRORS = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNABORTED",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "EPIPE",
];
const PRE_CONNECT_ERRORS = ["ECONNREFUSED", "EHOSTUNREACH", "ENOTFOUND"];
const IDEMPOTENT_METHODS = ["GET", "HEAD", "OPTIONS", "PUT", "DELETE"];

function createGatewayError(status, message) {
  const err = new Error(message);
  err.status = status;
  err.statusCode = status;
  err.response = {
    status,
    data: {
      status: "error",
      message,
    },
  };
  return err;
}

/**
 * Gọi request tới service backend thông qua Load Balancer (Round-Robin + Retry + Timeout)
 */
async function requestBackend({
  method = "GET",
  path,
  params,
  data,
  timeout = REQUEST_TIMEOUT,
}) {
  const service = services.backend;
  const excludedInstances = [];
  const upperMethod = method.toUpperCase();
  const isIdempotent = IDEMPOTENT_METHODS.includes(upperMethod);
  const maxAttempts = Math.max(1, RETRY_ATTEMPTS + 1);
  const perAttemptTimeout =
    !isIdempotent
      ? timeout
      : maxAttempts > 1
        ? Math.max(2500, Math.floor((timeout - 500) / maxAttempts))
        : timeout;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let instance = getNextInstance(service, excludedInstances);

    // Nếu đã thử hết các instance khác (hoặc chỉ có 1 instance), cho phép retry lại trên các instance còn healthy
    if (!instance && excludedInstances.length > 0) {
      excludedInstances.length = 0;
      instance = getNextInstance(service, excludedInstances);
    }

    if (!instance) {
      throw createGatewayError(503, `${service.name} service unavailable`);
    }

    excludedInstances.push(instance.url);
    const targetUrl = new URL(path, instance.url).toString();

    try {
      const response = await axios({
        method: upperMethod,
        url: targetUrl,
        params,
        data,
        timeout: perAttemptTimeout,
        headers: {
          "x-internal-api-key": process.env.API_GATEWAY_INTERNAL_KEY,
        },
      });

      instance.failures = 0;
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const isTimeoutError =
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        error.message?.toLowerCase().includes("timeout");
      const isRetryableError =
        isTimeoutError || RETRYABLE_ERRORS.includes(error.code);
      const isRetryableStatus = RETRYABLE_STATUS.includes(status);
      const canRetryMethod =
        isIdempotent || PRE_CONNECT_ERRORS.includes(error.code);

      if (isRetryableError) {
        instance.failures = (instance.failures || 0) + 1;
        instance.successes = 0;

        const hasOtherHealthyInstances =
          service.instances.filter((i) => i.healthy && i.url !== instance.url)
            .length > 0;

        if (
          instance.failures >= FAILURE_THRESHOLD &&
          (hasOtherHealthyInstances || attempt === maxAttempts)
        ) {
          instance.healthy = false;
        }
      }

      if (
        canRetryMethod &&
        (isRetryableError || isRetryableStatus) &&
        attempt < maxAttempts
      ) {
        console.warn(
          `[Backend Retry ${attempt}/${RETRY_ATTEMPTS}] ${upperMethod} ${targetUrl} failed (${error.code || status}), retrying...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
        continue;
      }

      if (isTimeoutError) {
        throw createGatewayError(
          504,
          `Yêu cầu tới Backend quá thời gian chờ (${perAttemptTimeout}ms)`,
        );
      }

      throw error;
    }
  }

  throw createGatewayError(503, "No backend instance available");
}

function requestRoleApi(config) {
  return requestBackend({
    ...config,
    path: `/internal/auth/role${config.path}`,
  });
}

function requestOtpApi(config) {
  return requestBackend({
    ...config,
    path: `/internal/auth/otp${config.path}`,
  });
}

// -------------------------------------------------------------
// 1. OTP APIs (/internal/auth/otp/*)
// -------------------------------------------------------------
async function sendOtp(payload) {
  return requestOtpApi({
    method: "POST",
    path: "/send",
    data: payload,
    timeout: 30000,
  });
}

async function resendOtp(payload) {
  return requestOtpApi({
    method: "POST",
    path: "/resend",
    data: payload,
    timeout: 30000,
  });
}

async function verifyOtp(payload) {
  return requestOtpApi({
    method: "POST",
    path: "/verify",
    data: payload,
  });
}

// -------------------------------------------------------------
// 2. Phân quyền & Dashboard (/internal/auth/role/*)
// -------------------------------------------------------------
async function getUserPermissions(userId, groupId = null) {
  return requestRoleApi({
    method: "GET",
    path: "/check-roles",
    params: { userId, ...(groupId ? { groupId } : {}) },
  });
}

async function getUserDashboards(userId) {
  return requestRoleApi({
    method: "GET",
    path: "/dashboards",
    params: { userId },
  });
}

// -------------------------------------------------------------
// 3. Quản lý Group & Thành viên trong Group
// -------------------------------------------------------------
async function getManagedGroups(userId) {
  return requestRoleApi({
    method: "GET",
    path: "/groups",
    params: { userId },
  });
}

async function createManagedGroup(payload) {
  return requestRoleApi({
    method: "POST",
    path: "/groups",
    data: payload,
  });
}

async function updateManagedGroup(payload) {
  return requestRoleApi({
    method: "PUT",
    path: "/groups",
    data: payload,
  });
}

async function updateGroupDashboards(payload) {
  return requestRoleApi({
    method: "PUT",
    path: "/groups/dashboards",
    data: payload,
  });
}

async function deleteManagedGroup(payload) {
  return requestRoleApi({
    method: "DELETE",
    path: "/groups",
    data: payload,
  });
}

async function getAssignableUsers(userId, groupId = null) {
  return requestRoleApi({
    method: "GET",
    path: "/users/assignable",
    params: { userId, ...(groupId ? { groupId } : {}) },
  });
}

async function getGroupMembers(userId, groupId) {
  return requestRoleApi({
    method: "GET",
    path: "/groups/members",
    params: { userId, groupId },
  });
}

async function assignGroupMember(payload) {
  return requestRoleApi({
    method: "POST",
    path: "/groups/members",
    data: payload,
  });
}

async function removeGroupMember(payload) {
  return requestRoleApi({
    method: "DELETE",
    path: "/groups/members",
    data: payload,
  });
}

// -------------------------------------------------------------
// 4. Thông tin cá nhân (User Info, Profile & Đổi mật khẩu)
// -------------------------------------------------------------
async function getUsersInfo(userId) {
  return requestRoleApi({
    method: "GET",
    path: "/users/info",
    params: { userId },
  });
}

async function updateUserProfile(userId, payload) {
  return requestRoleApi({
    method: "PUT",
    path: "/users/profile",
    data: {
      userId,
      ...payload,
    },
  });
}

async function changeUserPassword(userId, payload) {
  return requestRoleApi({
    method: "PUT",
    path: "/users/change-password",
    data: {
      userId,
      ...payload,
    },
  });
}

// -------------------------------------------------------------
// 5. Quản lý Users (Dành cho 3 Admin: admin_ami, super_admin, group_admin)
// -------------------------------------------------------------
async function getManagedUsers(userId) {
  return requestRoleApi({
    method: "GET",
    path: "/manage/users",
    params: { userId },
  });
}

async function getRoleOptions(userId) {
  return requestRoleApi({
    method: "GET",
    path: "/manage/roles",
    params: { userId },
  });
}

async function getManagedUserDetail(userId, targetUserId) {
  return requestRoleApi({
    method: "GET",
    path: "/manage/users/detail",
    params: { userId, targetUserId },
  });
}

async function createManagedUser(payload) {
  return requestRoleApi({
    method: "POST",
    path: "/manage/users",
    data: payload,
  });
}

async function updateManagedUser(payload) {
  return requestRoleApi({
    method: "PUT",
    path: "/manage/users",
    data: payload,
  });
}

async function deleteManagedUser(payload) {
  return requestRoleApi({
    method: "DELETE",
    path: "/manage/users",
    data: payload,
  });
}

// -------------------------------------------------------------
// 6. Ghi Audit Logs (Không làm gián đoạn luồng chính nếu lỗi)
// -------------------------------------------------------------
async function createAuditLog(payload) {
  try {
    return await requestRoleApi({
      method: "POST",
      path: "/audit-logs",
      data: payload,
    });
  } catch (error) {
    console.warn("[Gateway Audit Log Warning]", error.message);
    return null;
  }
}

module.exports = {
  requestBackend,
  sendOtp,
  resendOtp,
  verifyOtp,
  getUserPermissions,
  getUserDashboards,
  getManagedGroups,
  createManagedGroup,
  updateManagedGroup,
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
  createAuditLog,
};
