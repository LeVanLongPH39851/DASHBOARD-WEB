const backendService = require("../services/backend.service");
const {
  hasAllowedRole,
  getPermissionsForRoles,
} = require("../config/roles");

function authorize(allowedRoles) {
  return async function (req, res, next) {
    try {
      const userId = req.user.profile.id;
      const user = await backendService.getUserPermissions(userId);

      const roles = user.roles || [];
      const globalRoles = user.global_roles || roles;
      const permissions =
        user.permissions || getPermissionsForRoles(roles);
      const globalPermissions =
        user.global_permissions || getPermissionsForRoles(globalRoles);

      // Gắn Role và Permission cố định theo role_code vào request
      req.user.roles = roles;
      req.user.permissions = permissions;
      req.user.global_roles = globalRoles;
      req.user.global_permissions = globalPermissions;

      const userRoleList = [...new Set([...roles, ...globalRoles])];

      if (!hasAllowedRole(userRoleList, allowedRoles)) {
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
