const otpService = require("../services/otp.service");

async function sendOtp(req, res, next) {
  try {
    const { email, sessionCookie, user } = req.body;

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
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { challengeId, otp } = req.body;

    const result = await otpService.verifyOtp(challengeId, otp);

    return res.status(200).json({
      status: "success",
      message: "Xác thực OTP thành công",
      data: result,
    });
  } catch (error) {
    const clientErrors = [
      "OTP không tồn tại hoặc đã hết hạn",
      "Bạn đã nhập sai OTP quá số lần cho phép",
      "OTP không chính xác",
      "Challenge ID hoặc OTP không hợp lệ",
    ];

    if (clientErrors.includes(error.message)) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    next(error);
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
};
