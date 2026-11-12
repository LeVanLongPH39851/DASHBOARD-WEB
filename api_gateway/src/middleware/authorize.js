const backendService = require("../services/backend.service");

function authorize(requiredPermission) {
  return async function (req, res, next) {
    try {
      const userId = req.user.profile.id;

      const user = await backendService.getUserPermissions(userId);

      const permissions = user.permissions || [];
      const roles = user.roles || [];
      const globalRoles = user.global_roles || [];
      const globalPermissions = user.global_permissions || [];

      // Lưu Role và Permission vào request
      req.user.roles = roles;
      req.user.permissions = permissions;
      req.user.global_roles = globalRoles;
      req.user.global_permissions = globalPermissions;

      const allTokens = [
        ...permissions,
        ...roles,
        ...globalRoles,
        ...globalPermissions,
      ];

      // Kiểm tra quyền (nếu có system.manage, admin_ami hoặc có quyền/role yêu cầu)
      const hasPermission = Array.isArray(requiredPermission)
        ? requiredPermission.some((perm) => allTokens.includes(perm))
        : allTokens.includes(requiredPermission);

      if (
        !allTokens.includes("system.manage") &&
        !allTokens.includes("admin_ami") &&
        !hasPermission
      ) {
        return res.status(403).json({
          message: "You do not have permission",
        });
      }

      next();
    } catch (error) {
      console.error("[Authorization Error]", error.message);

      if (error.response?.status === 403) {
        return res.status(403).json({
          message: "Permission denied",
        });
      }

      return res.status(503).json({
        message: "Authorization service unavailable",
      });
    }
  };
}

module.exports = authorize;
