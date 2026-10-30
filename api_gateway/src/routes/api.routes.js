const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");

const authorize = require("../middleware/authorize");

const forwardRequest = require("../services/proxy.service");

const services = require("../config/services");

const authController = require("../controllers/auth.controller");

const { loginRateLimit } = require("../middleware/rate-limit");

router.post("/auth/login", loginRateLimit, authController.loginController);

router.get("/auth/me", authController.meController);

router.use("/backend", authenticate, authorize("backend:read"), (req, res) => {
  forwardRequest(req, res, services.backend);
});

module.exports = router;
