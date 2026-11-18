/**
 * CẤU HÌNH CỐ ĐỊNH VAI TRÒ (ROLE_CODE) VÀ QUYỀN HẠN TẠI API GATEWAY
 * -----------------------------------------------------------------
 * Phân quyền tại API Gateway kiểm tra trực tiếp theo `role_code`.
 */

const ROLES = Object.freeze({
  ADMIN_AMI: "admin_ami",
  SUPER_ADMIN: "super_admin",
  GROUP_ADMIN: "group_admin",
  GROUP_MEMBER: "group_member",
});

// Tất cả các role hợp lệ trong hệ thống (được xem Dashboard & thông tin cá nhân)
const ALL_ROLES = Object.freeze([
  ROLES.ADMIN_AMI,
  ROLES.SUPER_ADMIN,
  ROLES.GROUP_ADMIN,
  ROLES.GROUP_MEMBER,
]);

// 3 Role Quản trị (được vào trang Role & Permission, Quản lý Users, Quản lý thành viên Group)
const ADMIN_ROLES = Object.freeze([
  ROLES.ADMIN_AMI,
  ROLES.SUPER_ADMIN,
  ROLES.GROUP_ADMIN,
]);

// 2 Role Quản trị cấp cao (được tạo Group, xóa Group, gán Dashboard cho Group)
const HIGH_ADMIN_ROLES = Object.freeze([
  ROLES.ADMIN_AMI,
  ROLES.SUPER_ADMIN,
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

function hasAllowedRole(userRoles = [], allowedRoles = []) {
  const requiredList = Array.isArray(allowedRoles)
    ? allowedRoles
    : [allowedRoles];
  const normalizedUserRoles = (Array.isArray(userRoles) ? userRoles : []).map(
    normalizeRoleCode,
  );

  // admin_ami luôn có toàn quyền hệ thống
  if (normalizedUserRoles.includes(ROLES.ADMIN_AMI)) {
    return true;
  }

  return requiredList.some((role) =>
    normalizedUserRoles.includes(normalizeRoleCode(role)),
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

module.exports = {
  ROLES,
  ALL_ROLES,
  ADMIN_ROLES,
  HIGH_ADMIN_ROLES,
  ROLE_PERMISSIONS_MAP,
  normalizeRoleCode,
  hasAllowedRole,
  getPermissionsForRoles,
};
