// Test gọi server như React sẽ gọi

(async () => {
  const url = 'https://ratings.vtv.vn/api/v1/chart/data?form_data=%7B%22slice_id%22%3A387%7D&dashboard_id=45';
  
  const payload = {
    "datasource": {
      "id": 149,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "date",
            "op": "TEMPORAL_RANGE",
            "val": "No filter"
          }
        ],
        "extras": {
          "having": "",
          "where": ""
        },
        "columns": ["channel_name_tvd", "event_category_name"],
        "metrics": ["rating"],
        "row_limit": 50000
      }
    ],
    "result_format": "json",
    "result_type": "full"
  };

  try {
    console.log('🔄 Đang gọi server...\n');
    
    // Gọi server local như React sẽ gọi
    const response = await fetch('http://localhost:5000/api/superset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, payload })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Thành công!\n');
      console.log('📊 Số dòng:', result.rowcount);
      console.log('📋 Tên cột:', result.colnames);
      console.log('\n📦 Data:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('❌ Lỗi:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error.message);
    console.log('\n💡 Đảm bảo server đang chạy: node server.js');
    console.log(12132);
  }
})();
