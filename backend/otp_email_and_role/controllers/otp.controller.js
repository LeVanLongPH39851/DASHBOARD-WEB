const otpService = require("../services/otp.service");

function handleOtpError(error, res) {
  console.error("[OTP Controller Error]", error.message);
  const status = error.statusCode || error.status || 500;
  return res.status(status).json({
    status: "error",
    message: error.message || "Lỗi xử lý OTP tại máy chủ Backend",
  });
}

async function sendOtp(req, res, next) {
  try {
    const { email, sessionCookie, user } = req.body || {};

    const result = await otpService.createOtp({
      email,
      sessionCookie,
      user,
    });

    return res.status(200).json({
      status: "success",
      message: "OTP đã được gửi đến email",
      data: result,
    });
  } catch (error) {
    return handleOtpError(error, res, next);
  }
}

async function resendOtp(req, res, next) {
  try {
    const { challengeId } = req.body || {};

    const result = await otpService.resendOtp(challengeId);

    return res.status(200).json({
      status: "success",
      message: "OTP mới đã được gửi đến email",
      data: result,
    });
  } catch (error) {
    return handleOtpError(error, res, next);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { challengeId, otp } = req.body || {};

    const result = await otpService.verifyOtp(challengeId, otp);

    return res.status(200).json({
      status: "success",
      message: "Xác thực OTP thành công",
      data: result,
    });
  } catch (error) {
    return handleOtpError(error, res, next);
  }
}

module.exports = {
  sendOtp,
  resendOtp,
  verifyOtp,
};
