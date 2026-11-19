const { rolePool } = require("../config/db");

const AUDIT_ACTIONS = Object.freeze({
  AUTH_LOGIN: "AUTH_LOGIN",
  AUTH_LOGOUT: "AUTH_LOGOUT",
  AUTH_OTP_SEND: "AUTH_OTP_SEND",
  AUTH_OTP_RESEND: "AUTH_OTP_RESEND",
  AUTH_OTP_VERIFY_SUCCESS: "AUTH_OTP_VERIFY_SUCCESS",
  AUTH_OTP_VERIFY_FAILED: "AUTH_OTP_VERIFY_FAILED",

  DASHBOARD_VIEW: "DASHBOARD_VIEW",

  GROUP_CREATE: "GROUP_CREATE",
  GROUP_DASHBOARDS_UPDATE: "GROUP_DASHBOARDS_UPDATE",
  GROUP_DELETE: "GROUP_DELETE",

  GROUP_MEMBER_ASSIGN: "GROUP_MEMBER_ASSIGN",
  GROUP_MEMBER_UPDATE: "GROUP_MEMBER_UPDATE",
  GROUP_MEMBER_REMOVE: "GROUP_MEMBER_REMOVE",

  USER_CREATE: "USER_CREATE",
  USER_UPDATE: "USER_UPDATE",
  USER_DELETE: "USER_DELETE",

  USER_PROFILE_UPDATE: "USER_PROFILE_UPDATE",
  USER_PASSWORD_CHANGE: "USER_PASSWORD_CHANGE",
});

/**
 * Ghi log hành động của user vào bảng audit_logs (init.sql:L248-L264).
 * Luôn sử dụng rolePool độc lập (không chạy chung transaction client của nghiệp vụ chính)
 * để tránh làm abort transaction PostgreSQL nếu bảng audit_logs gặp sự cố.
 */
async function logAudit({
  userId = null,
  action,
  targetType = null,
  targetId = null,
  description = null,
  metadata = null,
}) {
  if (!action) return null;

  const parsedUserId = Number(userId);
  const safeUserId =
    Number.isSafeInteger(parsedUserId) && parsedUserId > 0
      ? parsedUserId
      : null;

  try {
    const { rows } = await rolePool.query(
      `
        INSERT INTO audit_logs (
          superset_user_id,
          action,
          target_type,
          target_id,
          description,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        RETURNING id, created_at
      `,
      [
        safeUserId,
        String(action).slice(0, 100),
        targetType ? String(targetType).slice(0, 100) : null,
        targetId !== undefined && targetId !== null
          ? String(targetId).slice(0, 100)
          : null,
        description ? String(description) : null,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
    return rows[0] || null;
  } catch (error) {
    console.warn("[Audit Log Warning] Không thể ghi audit_logs:", error.message);
    return null;
  }
}

module.exports = {
  AUDIT_ACTIONS,
  logAudit,
};
