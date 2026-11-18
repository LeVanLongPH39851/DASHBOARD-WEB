const { Pool } = require("pg");
const { createHttpError } = require("./roles.config");

// Pool kết nối tới Custom Role DB (init.sql)
const rolePool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  max: 20,
});

rolePool.on("error", (error) => {
  console.error("[Role DB Pool Error]", error.message);
});

// Pool kết nối tới Superset Metadata DB
const supersetPool = new Pool({
  host: process.env.SUPERSET_PG_HOST || "100.100.10.3",
  port: Number(process.env.SUPERSET_PG_PORT || 15430),
  user: process.env.SUPERSET_PG_USER || "superset",
  password: process.env.SUPERSET_PG_PASSWORD || "superset",
  database: process.env.SUPERSET_PG_DB || "superset",
  connectionTimeoutMillis: Number(process.env.SUPERSET_PG_TIMEOUT_MS || 15000),
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  max: 15,
});

supersetPool.on("error", (error) => {
  console.error("[Superset DB Pool Error]", error.message);
});

// Kết nối pool có retry và thông báo lỗi rõ ràng khi timeout
async function acquireClientWithRetry(pool, name = "database", maxRetries = 2) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await pool.connect();
    } catch (err) {
      lastError = err;
      console.warn(
        `[Database] Kết nối ${name} thất bại (lần thử ${attempt}/${maxRetries}):`,
        err.message,
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }

  const isTimeout =
    lastError?.message?.includes("timeout") ||
    lastError?.cause?.message?.includes("timeout") ||
    lastError?.code === "ETIMEDOUT";

  if (isTimeout) {
    throw createHttpError(
      504,
      `Không thể kết nối đến cơ sở dữ liệu ${name} do quá thời gian chờ (timeout). Vui lòng thử lại.`,
    );
  }
  throw lastError;
}

async function rollbackQuietly(client) {
  if (!client) return;
  try {
    await client.query("ROLLBACK");
  } catch (_) {
    /* ignore */
  }
}

module.exports = {
  rolePool,
  supersetPool,
  acquireClientWithRetry,
  rollbackQuietly,
};
