const supersetService = require("../services/superset.service");

async function authenticate(req, res, next) {
  try {
    // 1. Lấy session cookie từ request
    const sessionCookie = req.headers.cookie;

    if (!sessionCookie) {
      return res.status(401).json({
        message: "Missing session cookie",
      });
    }

    // 2. Xác thực session với Superset
    const user = await supersetService.getCurrentUser(sessionCookie);

    // 3. Lưu thông tin user vào request
    req.user = {
      username: user.username,
      profile: user.profile,
      sessionCookie,
    };

    next();
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({
        message: "Session is invalid or expired",
      });
    }

    console.error("[Authentication Error]", error.message);

    return res.status(503).json({
      message: "Authentication service unavailable",
    });
  }
}

module.exports = authenticate;
