require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { buildCacheKey, getCache, setCache } = require("./redis");

const pool = mysql.createPool({
  host: "100.100.10.3",
  port: 9030,
  user: "Ami_doris",
  password: "Ami@123#@!",
  database: "",
  waitForConnections: true,
  connectionLimit: 10, // Tối đa 10 connection
  queueLimit: 0,
});

const { callAPIWithUser, killUserRequests } = require("./api");

// Single-flight map: cache key → Promise đang chạy
// Ngăn nhiều request cùng hit DB khi cache miss đồng thời
const inFlight = new Map();

const app = express();

// Cho phép React gọi từ localhost:3000 hoặc 5173
app.use(cors());
app.use(express.json());

// Endpoint cho React gọi
app.post("/api/superset", async (req, res) => {
  try {
    const { url, payload, user_id } = req.body;

    // Nếu payload chứa user_id → tạo cache key từ payload KHÔNG có user_id
    // (strip cả top-level user_id lẫn filter user_id trong queries[].filters[])
    // → nhiều user khác nhau vẫn hit cùng cache key nếu cùng bộ filter
    let cacheKey = null;
    if (user_id && payload.force !== true) {
      cacheKey = buildCacheKey(payload);

      // 1. Cache hit → trả về ngay
      const cached = await getCache(cacheKey);
      if (cached) {
        console.log(`⚡ Cache hit: key=${cacheKey}`);
        return res.json({ ...cached, from_cache: true });
      }

      // 2. Đang có request khác chạy cùng key → chờ kết quả của nó
      if (inFlight.has(cacheKey)) {
        console.log(`⏳ Single-flight wait: key=${cacheKey}`);
        try {
          const responseData = await inFlight.get(cacheKey);
          return res.json({ ...responseData, from_cache: true });
        } catch (err) {
          // Request gốc lỗi → để fall-through gọi lại bên dưới
          console.warn(`⚠️  Single-flight upstream lỗi, thử lại: ${err.message}`);
        }
      }

      // 3. Cache miss, không có in-flight → request này chạy xuống DB
      console.log(`🔍 Cache miss: key=${cacheKey}`);
    }

    // Tạo Promise gọi Superset và đăng ký vào inFlight map
    const fetchPromise = (async () => {
      const result = await callAPIWithUser(url, payload, user_id);
      return {
        success: true,
        data: result.result[1]
          ? [...result.result[0].data, ...result.result[1].data]
          : result.result[0].data,
        colnames: result.result[1]
          ? [
              ...new Set([
                ...result.result[0].colnames,
                ...result.result[1].colnames,
              ]),
            ]
          : result.result[0].colnames,
        rowcount: result.result[1]
          ? result.result[0].rowcount + result.result[1].rowcount
          : result.result[0].rowcount,
      };
    })();

    if (cacheKey) {
      inFlight.set(cacheKey, fetchPromise);
    }

    let responseData;
    try {
      responseData = await fetchPromise;
    } finally {
      // Dù thành công hay lỗi đều xóa khỏi inFlight
      if (cacheKey) inFlight.delete(cacheKey);
    }

    // Lưu vào Redis nếu có cacheKey
    if (cacheKey) {
      const ttl = parseInt(process.env.REDIS_TTL || "3600");
      await setCache(cacheKey, responseData, ttl);
    }

    res.json(responseData);
    console.log('✅ Trả data về React');
  } catch (error) {
    if (error.name === "AbortError" || error.message?.includes("abort")) {
      return res.status(499).json({
        success: false,
        killed: true,
        error: "Request bị hủy bởi người dùng",
      });
    }
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint để query PROCESSLIST từ Doris
app.post("/api/doris/processlist", async (req, res) => {
  let connection;
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "user_id là bắt buộc",
      });
    }

    console.log(`📥 Query PROCESSLIST cho user_id: ${user_id}`);

    // Kết nối đến Doris
    connection = await pool.getConnection();

    // Thực hiện query PROCESSLIST
    const [rows] = await connection.execute(
      `SELECT * FROM information_schema.PROCESSLIST WHERE COMMAND = 'Query' AND Info like ?`,
      [`%${user_id}%`],
    );

    console.log(
      `✅ Query PROCESSLIST thành công, kết quả: ${rows.length} hàng`,
    );

    // Nếu có kết quả (length > 0), thực hiện KILL QUERY
    const killResults = [];
    if (rows.length > 0) {
      console.log(`🔥 Bắt đầu kill ${rows.length} query...`);

      for (const row of rows) {
        try {
          const queryId = row.QUERY_ID;
          console.log(`  Killing QUERY_ID: ${queryId}`);

          await connection.query(`KILL QUERY '${queryId}'`);

          killResults.push({
            queryId,
            status: "killed",
            info: row.Info,
          });

          console.log(`  ✅ Killed QUERY_ID: ${queryId}`);
        } catch (killError) {
          console.log(
            `  ⚠️  Lỗi kill QUERY_ID ${row.QUERY_ID}: ${killError.message}`,
          );
          killResults.push({
            queryId: row.QUERY_ID,
            status: "error",
            error: killError.message,
            info: row.Info,
          });
        }
      }

      console.log(`🏁 Hoàn tất kill, tổng cộng: ${killResults.length} query`);
    }

    res.json({
      success: true,
      processlist: rows,
      killResults: killResults,
      count: rows.length,
      killedCount: killResults.filter((r) => r.status === "killed").length,
    });
  } catch (error) {
    console.error("❌ Lỗi Doris:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Endpoint để kill tất cả request đang chạy của một user_id
app.post("/api/kill-user", (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: "user_id là bắt buộc",
      });
    }

    console.log(`🔪 Kill request: nhận lệnh kill cho user_id: ${user_id}`);

    const killedCount = killUserRequests(user_id);

    console.log(
      `✅ Đã gửi lệnh abort cho ${killedCount} request của user_id: ${user_id}`,
    );

    res.json({
      success: true,
      user_id,
      killedCount,
      message:
        killedCount > 0
          ? `Đã abort ${killedCount} request của user_id: ${user_id}`
          : `Không có request nào đang chạy cho user_id: ${user_id}`,
    });
  } catch (error) {
    console.error("❌ Lỗi kill-user:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Endpoint cho ChatBot
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    console.log(`💬 ChatBot nhận: "${message}"`);

    // Gọi API query
    const apiResponse = await fetch('http://100.100.11.2:8010/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: message,
        no_llm: false,
        execute: true,
      }),
    });

    const data = await apiResponse.json();
    console.log('✅ ChatBot API trả về:', JSON.stringify(data).substring(0, 200));

    res.json({
      success: true,
      reply: data,
    });
  } catch (error) {
    console.error('❌ Lỗi ChatBot:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server đang chạy" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server chạy tại http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/superset\n`);
});
