const Redis = require("ioredis");

const otpRedis = new Redis({
  host: process.env.REDIS_HOST || "100.100.10.4",
  port: Number(process.env.REDIS_PORT || 7000),
  db: Number(process.env.OTP_REDIS_DB || 5),
  password: process.env.REDIS_PASSWORD || undefined,

  retryStrategy(times) {
    if (times > 5) {
      console.error("[OTP Redis] Quá số lần retry");
      return null;
    }

    return Math.min(times * 200, 2000);
  },
});

otpRedis.on("connect", () => {
  console.log("[OTP Redis] Đang kết nối...");
});

otpRedis.on("ready", () => {
  console.log("[OTP Redis] Đã sẵn sàng");
});

otpRedis.on("error", (error) => {
  console.error("[OTP Redis Error]", error.message);
});

module.exports = otpRedis;
