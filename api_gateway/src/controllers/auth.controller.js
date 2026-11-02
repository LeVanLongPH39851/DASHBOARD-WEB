const authService = require("../services/auth.service");
const supersetService = require("../services/superset.service");

// Đăng nhập và gửi OTP
async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username và password là bắt buộc",
      });
    }

    const result = await authService.login(username, password);

    return res.status(202).json({
      status: "otp_required",
      message: "OTP đã được gửi đến email",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Gửi lại OTP
async function resendOtpController(req, res, next) {
  try {
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({
        message: "Thiếu challengeId",
      });
    }

    const result = await authService.resendOtp(challengeId);

    return res.status(200).json({
      success: true,
      message: "Gửi lại OTP thành công",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Xác minh OTP
async function verifyOtpController(req, res, next) {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Challenge ID và OTP là bắt buộc",
      });
    }

    const result = await authService.verifyOtp(challengeId, otp);

    return res.status(200).json({
      status: "success",
      message: "Đăng nhập thành công",
      data: {
        sessionCookie: result.sessionCookie,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Lấy thông tin user
async function meController(req, res) {
  return res.json({
    status: "success",
    user: req.user,
  });
}

// Logout
async function logoutController(req, res, next) {
  try {
    const sessionCookie = req.headers.cookie;

    if (!sessionCookie) {
      return res.status(401).json({
        status: "error",
        message: "Chưa đăng nhập",
      });
    }

    await supersetService.logout(sessionCookie);

    return res.status(200).json({
      status: "success",
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("[Logout Error]", error.message);

    return res.status(500).json({
      status: "error",
      message: "Đăng xuất thất bại",
    });
  }
}

module.exports = {
  loginController,
  resendOtpController,
  verifyOtpController,
  meController,
  logoutController,
};
