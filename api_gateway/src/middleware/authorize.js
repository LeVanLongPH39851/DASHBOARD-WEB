const backendService = require("../services/backend.service");
const { hasAllowedRole, getPermissionsForRoles } = require("../config/roles");

function parsePositiveInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

/**
 * Middleware phân quyền theo role_code:
 * - Mặc định: kiểm tra dựa trên Global Roles của user (getUserRoles).
 * - Khi options.checkGroup = true:
 *   + Nếu request có groupId (params.groupId, body.groupId, body.parentGroupId, query.groupId),
 *     kiểm tra theo vai trò thực tế của user trong Group đó qua getUserGroupRoleAndPermissions(userId, groupId).
 *   + Nếu không có groupId (ví dụ tạo Root Group hoặc lấy toàn bộ assignable users),
 *     kiểm tra theo options.rootRoles (nếu có) hoặc allowedRoles trên Global Roles.
 */
function authorize(allowedRoles, options = {}) {
  const { checkGroup = false, rootRoles = null } = options;

  return async function (req, res, next) {
    try {
      const userId = req.user.profile.id;
      const targetGroupId = checkGroup
        ? parsePositiveInt(
            req.params?.groupId ??
              req.body?.groupId ??
              req.body?.parentGroupId ??
              req.query?.groupId,
          )
        : null;

      const user = await backendService.getUserPermissions(
        userId,
        targetGroupId,
      );

      const roles = user.roles || [];
      const globalRoles = user.global_roles || roles;
      const groupRoles = user.group_roles || [];
      const permissions = user.permissions || getPermissionsForRoles(roles);
      const globalPermissions =
        user.global_permissions || getPermissionsForRoles(globalRoles);

      // Gắn Role và Permission cố định theo role_code vào request
      req.user.roles = roles;
      req.user.permissions = permissions;
      req.user.global_roles = globalRoles;
      req.user.global_permissions = globalPermissions;
      if (targetGroupId) {
        req.user.group_roles = groupRoles;
        req.user.group_permissions =
          user.group_permissions || getPermissionsForRoles(groupRoles);
      }

      let rolesToCheck;
      let requiredRoles = allowedRoles;

      if (checkGroup && targetGroupId) {
        // Kiểm tra theo getUserGroupRoleAndPermissions(userId, groupId)
        rolesToCheck = groupRoles.length > 0 ? groupRoles : roles;
      } else {
        rolesToCheck = [...new Set([...roles, ...globalRoles])];
        if (checkGroup && !targetGroupId && rootRoles) {
          requiredRoles = rootRoles;
        }
      }

      if (!hasAllowedRole(rolesToCheck, requiredRoles)) {
        return res.status(403).json({
          status: "error",
          message: "Bạn không có quyền thực hiện thao tác này",
        });
      }

      next();
    } catch (error) {
      console.error("[Authorization Error]", error.message);

      if (error.response?.status === 403) {
        return res.status(403).json({
          status: "error",
          message: "Permission denied",
        });
      }

      return res.status(503).json({
        status: "error",
        message: "Authorization service unavailable",
      });
    }
  };
}

module.exports = authorize;
