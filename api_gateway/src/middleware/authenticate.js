const supersetService = require("../services/superset.service");

async function authenticate(req, res, next) {
  try {
    const sessionCookie = req.headers.cookie;

    if (!sessionCookie) {
      return res.status(401).json({
        status: "error",
        message: "Chưa đăng nhập",
      });
    }

    const user = await supersetService.getCurrentUser(sessionCookie);

    req.user = {
      username: user.username,
      profile: user.profile,
    };

    req.sessionCookie = sessionCookie;

    next();
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({
        status: "error",
        message: "Session không hợp lệ hoặc đã hết hạn",
      });
    }

    console.error("[Authentication Error]", error.message);

    return res.status(503).json({
      status: "error",
      message: "Authentication service unavailable",
    });
  }
}

module.exports = authenticate;
