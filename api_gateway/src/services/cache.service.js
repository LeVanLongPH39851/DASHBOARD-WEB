const redisClient = require("../config/redis");

const DEFAULT_TTL = parseInt(process.env.CACHE_TTL || "300", 10); // 5 phút mặc định

/**
 * Xây dựng key cache theo chuẩn: gateway:<action>:<user_id>[:<sub_key>]
 */
function buildKey(action, userId, ...parts) {
  const cleanParts = parts
    .filter((p) => p !== undefined && p !== null && p !== "")
    .map((p) => String(p).trim().replace(/\s+/g, "_"));

  const base = `gateway:${action}:${userId}`;
  return cleanParts.length > 0 ? `${base}:${cleanParts.join(":")}` : base;
}

/**
 * Lấy dữ liệu từ Redis DB 5
 * Trả về Object đã parse JSON hoặc null nếu không tồn tại / Redis lỗi
 */
async function getCache(key) {
  try {
    const raw = await redisClient.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Cache GET Warning] Key "${key}":`, err.message);
    return null;
  }
}

/**
 * Lưu dữ liệu vào Redis DB 5 với TTL (mặc định 300s = 5 phút)
 */
async function setCache(key, value, ttlSeconds = DEFAULT_TTL) {
  try {
    if (value === undefined || value === null) return;
    const serialized = JSON.stringify(value);
    await redisClient.set(key, serialized, "EX", ttlSeconds);
  } catch (err) {
    console.warn(`[Cache SET Warning] Key "${key}":`, err.message);
  }
}

/**
 * Xóa một key cụ thể
 */
async function deleteCache(key) {
  try {
    await redisClient.unlink(key);
  } catch (err) {
    console.warn(`[Cache DEL Warning] Key "${key}":`, err.message);
  }
}

/**
 * Xóa các key theo pattern (sử dụng scanStream không gây block server)
 * Thích hợp xóa toàn bộ key của một action của TẤT CẢ các user_id_superset
 */
async function deleteCacheByPattern(pattern) {
  try {
    return new Promise((resolve) => {
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      let totalDeleted = 0;

      stream.on("data", async (keys) => {
        if (keys && keys.length > 0) {
          stream.pause();
          try {
            const pipeline = redisClient.pipeline();
            keys.forEach((k) => pipeline.unlink(k));
            await pipeline.exec();
            totalDeleted += keys.length;
          } catch (delErr) {
            console.warn(`[Cache Batch Unlink Warning] Pattern "${pattern}":`, delErr.message);
          } finally {
            stream.resume();
          }
        }
      });

      stream.on("end", () => {
        if (totalDeleted > 0) {
          console.log(`[Cache Invalidate] Đã xóa ${totalDeleted} key khớp pattern "${pattern}"`);
        }
        resolve(totalDeleted);
      });

      stream.on("error", (err) => {
        console.warn(`[Cache ScanStream Warning] Pattern "${pattern}":`, err.message);
        resolve(totalDeleted);
      });
    });
  } catch (err) {
    console.warn(`[Cache Invalidate By Pattern Warning] Pattern "${pattern}":`, err.message);
  }
}

/**
 * Xóa cache của danh sách các actions bị ảnh hưởng trên TẤT CẢ các users
 * @param {string[]} actions - Mảng tên các action cần xóa, ví dụ ['dashboards', 'groups', 'user_info']
 */
async function invalidateActions(actions) {
  if (!Array.isArray(actions) || actions.length === 0) return;
  try {
    await Promise.all(
      actions.map((act) => deleteCacheByPattern(`gateway:${act}:*`)),
    );
  } catch (err) {
    console.warn("[Cache Invalidate Actions Warning]", err.message);
  }
}

module.exports = {
  buildKey,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  invalidateActions,
  DEFAULT_TTL,
};
