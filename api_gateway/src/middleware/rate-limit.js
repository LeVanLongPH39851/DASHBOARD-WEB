const rateLimit = require("express-rate-limit");

// Rate Limit toàn bộ API
const globalRateLimit = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),

  limit: Number(process.env.RATE_LIMIT_MAX || 100),

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    status: 429,
    message: "Too many requests",
  },
});

// Rate Limit riêng cho Login
const loginRateLimit = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || 900000),

  limit: Number(process.env.LOGIN_RATE_LIMIT_MAX || 10),

  standardHeaders: true,

  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: {
    status: 429,
    message: "Too many login attempts",
  },
});

module.exports = {
  globalRateLimit,
  loginRateLimit,
};
