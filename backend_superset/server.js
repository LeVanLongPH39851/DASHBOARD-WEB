require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { callAPIWithUser, killUserRequests } = require('./api');

const app = express();

// Cho phép React gọi từ localhost:3000 hoặc 5173
app.use(cors());
app.use(express.json());

// Endpoint cho React gọi
app.post('/api/superset', async (req, res) => {
  try {
    const { url, payload, user_id } = req.body;

    console.log(`📥 Nhận request từ React (${user_id ? `[user_id: ${user_id}]` : 'NaN'})`);

    // Gọi Superset API (gắn user_id để có thể kill sau)
    const result = await callAPIWithUser(url, payload, user_id);

    // Trả về data
    res.json({
      success: true,
      data: result.result[1]
        ? [...result.result[0].data, ...result.result[1].data]
        : result.result[0].data,
      colnames: result.result[1]
        ? [...new Set([...result.result[0].colnames, ...result.result[1].colnames])]
        : result.result[0].colnames,
      rowcount: result.result[1]
        ? result.result[0].rowcount + result.result[1].rowcount
        : result.result[0].rowcount
    });

    console.log('✅ Trả data về React');

  } catch (error) {
    if (error.name === 'AbortError' || error.message?.includes('abort')) {
      console.log('🛑 Request bị kill bởi user');
      return res.status(499).json({
        success: false,
        killed: true,
        error: 'Request bị hủy bởi người dùng'
      });
    }
    console.error('❌ Lỗi:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint để query PROCESSLIST từ Doris
app.post('/api/doris/processlist', async (req, res) => {
  let connection;
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id là bắt buộc'
      });
    }

    console.log(`📥 Query PROCESSLIST cho user_id: ${user_id}`);

    // Kết nối đến Doris
    connection = await mysql.createConnection({
      host: '100.100.10.3',
      port: 9030,
      user: 'Ami_doris',
      password: 'Ami@123#@!',
      database: '',
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    // Thực hiện query PROCESSLIST
    const [rows] = await connection.execute(
      `SELECT * FROM information_schema.PROCESSLIST WHERE COMMAND = 'Query' AND Info like ?`,
      [`%${user_id}%`]
    );

    console.log(`✅ Query PROCESSLIST thành công, kết quả: ${rows.length} hàng`);

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
            status: 'killed',
            info: row.Info
          });

          console.log(`  ✅ Killed QUERY_ID: ${queryId}`);
        } catch (killError) {
          console.log(`  ⚠️  Lỗi kill QUERY_ID ${row.QUERY_ID}: ${killError.message}`);
          killResults.push({
            queryId: row.QUERY_ID,
            status: 'error',
            error: killError.message,
            info: row.Info
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
      killedCount: killResults.filter(r => r.status === 'killed').length
    });

  } catch (error) {
    console.error('❌ Lỗi Doris:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

// Endpoint để kill tất cả request đang chạy của một user_id
app.post('/api/kill-user', (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id là bắt buộc'
      });
    }

    console.log(`🔪 Kill request: nhận lệnh kill cho user_id: ${user_id}`);

    const killedCount = killUserRequests(user_id);

    console.log(`✅ Đã gửi lệnh abort cho ${killedCount} request của user_id: ${user_id}`);

    res.json({
      success: true,
      user_id,
      killedCount,
      message: killedCount > 0
        ? `Đã abort ${killedCount} request của user_id: ${user_id}`
        : `Không có request nào đang chạy cho user_id: ${user_id}`
    });

  } catch (error) {
    console.error('❌ Lỗi kill-user:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server đang chạy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server chạy tại http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/superset\n`);
});
