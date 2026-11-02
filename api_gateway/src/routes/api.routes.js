const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");

const authorize = require("../middleware/authorize");

const forwardRequest = require("../services/proxy.service");

const services = require("../config/services");

const authController = require("../controllers/auth.controller");

const { loginRateLimit } = require("../middleware/rate-limit");

router.post("/auth/login", loginRateLimit, authController.loginController);

// Gửi lại OTP
router.post("/auth/resend-otp", authController.resendOtpController);

// Xác minh OTP
router.post("/auth/verify-otp", authController.verifyOtpController);

// Lấy thông tin user
router.get("/auth/me", authenticate, authController.meController);

// Logout
router.post("/auth/logout", authenticate, authController.logoutController);

router.use("/backend", authenticate, authorize("backend:read"), (req, res) => {
  forwardRequest(req, res, services.backend);
});

module.exports = router;
