const supersetService = require("../services/superset.service");

async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const credentials = await supersetService.login(username, password);

    return res.status(200).json({
      status: "success",
      message: "Login thành công",
      data: {
        sessionCookie: credentials.sessionCookie,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function meController(req, res, next) {
  try {
    const sessionCookie = req.headers.cookie;

    if (!sessionCookie) {
      return res.status(401).json({
        status: "error",
        message: "Chưa đăng nhập",
      });
    }

    const user = await supersetService.getCurrentUser(sessionCookie);

    return res.json({
      status: "success",
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  loginController,
  meController,
};
