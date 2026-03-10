require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { callAPI } = require('./api');

const app = express();

// Cho phép React gọi từ localhost:3000 hoặc 5173
app.use(cors());
app.use(express.json());

// Endpoint cho React gọi
app.post('/api/superset', async (req, res) => {
  try {
    const { url, payload } = req.body;
    
    console.log('📥 Nhận request từ React');
    
    // Gọi Superset API
    const result = await callAPI(url, payload);
    
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
        ? result.result[0].rowcount + result.result[1].rowcountno
        : result.result[0].rowcount
    });
    
    console.log('✅ Trả data về React');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
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
