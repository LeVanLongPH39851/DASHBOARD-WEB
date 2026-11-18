/**
 * CẤU HÌNH CỐ ĐỊNH VAI TRÒ (ROLE_CODE) VÀ QUYỀN HẠN TRONG HỆ THỐNG
 * ----------------------------------------------------------------
 * Mọi logic phân quyền trong hệ thống đều kiểm tra trực tiếp theo `role_code`.
 * Danh sách quyền (permissions) của từng `role_code` được cố định tại đây.
 */

const ROLES = Object.freeze({
  ADMIN_AMI: "admin_ami",
  SUPER_ADMIN: "super_admin",
  GROUP_ADMIN: "group_admin",
  GROUP_MEMBER: "group_member",
});

// Thứ tự cấp bậc Role từ thấp đến cao
const ROLE_RANK = Object.freeze({
  [ROLES.GROUP_MEMBER]: 1,
  [ROLES.GROUP_ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
  [ROLES.ADMIN_AMI]: 4,
});

// Tập hợp các nhóm Role theo chức năng nghiệp vụ
const ALL_ROLE_CODES = Object.freeze([
  ROLES.ADMIN_AMI,
  ROLES.SUPER_ADMIN,
  ROLES.GROUP_ADMIN,
  ROLES.GROUP_MEMBER,
]);

// 3 Role Quản trị được phép truy cập Quản lý Users & Role/Permission
const ADMIN_ROLE_CODES = Object.freeze([
  ROLES.ADMIN_AMI,
  ROLES.SUPER_ADMIN,
  ROLES.GROUP_ADMIN,
]);

// Role Quản trị cấp cao: tạo Group con, xóa Group, gán Dashboard cho Group con, gán Quản trị Group
const HIGH_ADMIN_ROLE_CODES = Object.freeze([
  ROLES.ADMIN_AMI,
  ROLES.SUPER_ADMIN,
]);

// Role Quản lý trong Group: thêm/sửa/xóa thành viên, cấp Dashboard cho thành viên
const GROUP_MANAGER_ROLE_CODES = Object.freeze([
  ROLES.ADMIN_AMI,
  ROLES.SUPER_ADMIN,
  ROLES.GROUP_ADMIN,
]);

// Cố định danh sách quyền tương ứng với từng role_code
const ROLE_PERMISSIONS_MAP = Object.freeze({
  [ROLES.ADMIN_AMI]: Object.freeze([
    "system.manage",
    "group.create",
    "group.view",
    "group.update",
    "group.delete",
    "group_admin.assign",
    "group_dashboard.assign",
    "member.create",
    "member.view",
    "member.update",
    "member.delete",
    "member_dashboard.assign",
    "member_dashboard.revoke",
    "dashboard.view",
  ]),
  [ROLES.SUPER_ADMIN]: Object.freeze([
    "group.create",
    "group.view",
    "group.update",
    "group.delete",
    "group_admin.assign",
    "group_dashboard.assign",
    "member.view",
    "dashboard.view",
  ]),
  [ROLES.GROUP_ADMIN]: Object.freeze([
    "group.view",
    "member.create",
    "member.view",
    "member.update",
    "member.delete",
    "member_dashboard.assign",
    "member_dashboard.revoke",
    "dashboard.view",
  ]),
  [ROLES.GROUP_MEMBER]: Object.freeze(["dashboard.view"]),
});

function normalizeRoleCode(roleCode) {
  return String(roleCode || "").trim().toLowerCase();
}

function getRoleRank(roleCode) {
  return ROLE_RANK[normalizeRoleCode(roleCode)] || 1;
}

function isSystemRole(roleCode) {
  return normalizeRoleCode(roleCode) === ROLES.ADMIN_AMI;
}

function isHighAdminRole(roleCode) {
  return HIGH_ADMIN_ROLE_CODES.includes(normalizeRoleCode(roleCode));
}

function isGroupManagerRole(roleCode) {
  return GROUP_MANAGER_ROLE_CODES.includes(normalizeRoleCode(roleCode));
}

function isAdminRole(roleCode) {
  return ADMIN_ROLE_CODES.includes(normalizeRoleCode(roleCode));
}

function hasAnyRole(userRoleCodes = [], allowedRoleCodes = []) {
  const normalizedUserRoles = (Array.isArray(userRoleCodes) ? userRoleCodes : []).map(
    normalizeRoleCode,
  );
  return allowedRoleCodes.some((allowed) =>
    normalizedUserRoles.includes(normalizeRoleCode(allowed)),
  );
}

function getPermissionsForRoles(roleCodes = []) {
  const permSet = new Set();
  (Array.isArray(roleCodes) ? roleCodes : []).forEach((code) => {
    const perms = ROLE_PERMISSIONS_MAP[normalizeRoleCode(code)] || [];
    perms.forEach((p) => permSet.add(p));
  });
  return Array.from(permSet);
}

function createHttpError(status, message, fieldErrors) {
  const err = new Error(message);
  err.status = status;
  err.statusCode = status;
  if (fieldErrors) {
    err.fieldErrors = fieldErrors;
  }
  return err;
}

module.exports = {
  ROLES,
  ROLE_RANK,
  ALL_ROLE_CODES,
  ADMIN_ROLE_CODES,
  HIGH_ADMIN_ROLE_CODES,
  GROUP_MANAGER_ROLE_CODES,
  ROLE_PERMISSIONS_MAP,
  normalizeRoleCode,
  getRoleRank,
  isSystemRole,
  isHighAdminRole,
  isGroupManagerRole,
  isAdminRole,
  hasAnyRole,
  getPermissionsForRoles,
  createHttpError,
};
