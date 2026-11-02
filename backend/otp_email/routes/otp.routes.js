const express = require("express");
const router = express.Router();

const otpController = require("../controllers/otp.controller");

router.post("/send", otpController.sendOtp);
router.post("/resend", otpController.resendOtp);
router.post("/verify", otpController.verifyOtp);

module.exports = router;
