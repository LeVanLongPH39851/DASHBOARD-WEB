const backendService = require("../services/backend.service");

function authorize(requiredPermission) {
  return async function (req, res, next) {
    try {
      const userId = req.user.profile.id;

      const user = await backendService.getUserPermissions(userId);

      const permissions = user.permissions || [];

      // Lưu Role và Permission vào request
      req.user.roles = user.roles || [];
      req.user.permissions = permissions;

      // Kiểm tra quyền (nếu có system.manage hoặc có quyền yêu cầu)
      const hasPermission = Array.isArray(requiredPermission)
        ? requiredPermission.some((perm) => permissions.includes(perm))
        : permissions.includes(requiredPermission);

      if (!permissions.includes("system.manage") && !hasPermission) {
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
