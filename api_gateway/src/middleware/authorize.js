const backendService = require("../services/backend.service");

function authorize(requiredPermission) {
  return async function (req, res, next) {
    try {
      const username = req.user.username;

      const user = await backendService.getUserPermissions(username);

      const permissions = user.permissions || [];

      // Lưu Role và Permission vào request
      req.user.role = user.role;
      req.user.permissions = permissions;

      // Kiểm tra quyền
      if (!permissions.includes(requiredPermission)) {
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
