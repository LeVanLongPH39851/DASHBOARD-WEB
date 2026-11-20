const Redis = require("ioredis");

const redisHost = process.env.REDIS_HOST || "100.100.10.4";
const redisPort = parseInt(process.env.REDIS_PORT || "7000", 10);
const redisDb = parseInt(process.env.REDIS_DB || "5", 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
  db: redisDb,
  password: redisPassword,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 2,
  retryStrategy(times) {
    if (times > 5) {
      console.warn("[Redis Cache DB 5] Quá số lần thử lại, tạm ngừng retry");
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redisClient.on("connect", () => {
  console.log(`[Redis Cache DB 5] Đang kết nối tới ${redisHost}:${redisPort} (DB ${redisDb})...`);
});

redisClient.on("ready", () => {
  console.log(`[Redis Cache DB 5] Sẵn sàng hoạt động (DB ${redisDb})`);
});

redisClient.on("error", (err) => {
  console.warn("[Redis Cache DB 5 Warning]", err.message);
});

module.exports = redisClient;
