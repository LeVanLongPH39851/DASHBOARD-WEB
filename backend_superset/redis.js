const Redis = require("ioredis");
const crypto = require("crypto");

// Kết nối Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "100.100.10.4",
  port: parseInt(process.env.REDIS_PORT || "7000"),
  db: parseInt(process.env.REDIS_DB || "0"),
  retryStrategy(times) {
    if (times > 5) {
      console.error("❌ Redis: quá số lần retry, bỏ qua cache");
      return null; // Dừng retry
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () =>
  console.log("✅ Redis: đã kết nối 100.100.10.4:7000"),
);
redis.on("ready", () => console.log("✅ Redis: sẵn sàng nhận lệnh"));
redis.on("error", (err) => console.error("⚠️  Redis error:", err.message));

/**
 * Sort đệ quy tất cả key trong object (mọi cấp độ lồng nhau)
 * để đảm bảo JSON.stringify cho ra cùng string dù key thứ tự khác nhau.
 */
function sortDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }
  if (value !== null && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortDeep(value[k]);
        return acc;
      }, {});
  }
  return value;
}

/**
 * Loại bỏ filter user_id lồng trong queries[].filters[]
 * để 2 user khác nhau vẫn có thể share cùng cache key.
 */
function stripUserIdFilters(payload) {
  if (!Array.isArray(payload.queries)) return payload;
  return {
    ...payload,
    queries: payload.queries.map((q) => ({
      ...q,
      filters: Array.isArray(q.filters)
        ? q.filters.filter((f) => f.col !== "user_id")
        : q.filters,
    })),
  };
}

/**
 * Tạo cache key từ payload.
 * - Loại bỏ top-level user_id
 * - Loại bỏ filter user_id trong queries[].filters[]
 * - Sort deep toàn bộ object (kể cả nested)
 * - Key = "web_<SHA256 hex>"
 *
 * → Người dùng khác nhau với cùng bộ filter (trừ user_id)
 *   sẽ cho ra cùng cache key và có thể share cache.
 */
function buildCacheKey(payload) {
  const { user_id, ...payloadWithoutUser } = payload;
  const cleaned = stripUserIdFilters(payloadWithoutUser);
  const sorted = sortDeep(cleaned);
  const normalized = JSON.stringify(sorted);
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return `web_${hash}`;
}

/**
 * Lấy giá trị từ cache.
 * Trả về object đã parse, hoặc null nếu không có / lỗi.
 */
async function getCache(key) {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("⚠️  Redis getCache lỗi:", err.message);
    return null;
  }
}

/**
 * Lưu giá trị vào cache.
 * @param {string} key
 * @param {object} value
 * @param {number} ttlSeconds  TTL tính bằng giây (mặc định 1 giờ)
 */
async function setCache(key, value, ttlSeconds = 3600) {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    console.log(`💾 Redis: đã lưu key=${key} (TTL=${ttlSeconds}s)`);
  } catch (err) {
    console.error("⚠️  Redis setCache lỗi:", err.message);
  }
}

module.exports = { redis, buildCacheKey, getCache, setCache };
