export const spendUSDNumberChartPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A599%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 266,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "date",
            "op": "TEMPORAL_RANGE",
            "val": "No filter"
          }
        ],
        "extras": {
          "time_grain_sqla": "P1D",
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          {
            "timeGrain": "P1D",
            "columnType": "BASE_AXIS",
            "sqlExpression": "date",
            "label": "date",
            "expressionType": "SQL"
          }
        ],
        "metrics": [
          "price_usd"
        ],
        "annotation_layers": [],
        "series_limit": 0,
        "order_desc": true,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [
          {
            "operation": "pivot",
            "options": {
              "index": [
                "date"
              ],
              "columns": [],
              "aggregates": {
                "price_usd": {
                  "operator": "mean"
                }
              },
              "drop_missing_columns": true
            }
          },
          {
            "operation": "flatten"
          }
        ]
      }
    ],
    "form_data": {
      "datasource": "266__table",
      "viz_type": "big_number",
      "slice_id": 599,
      "url_params": {},
      "x_axis": "date",
      "time_grain_sqla": "P1D",
      "metric": "price_usd",
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "expressionType": "SIMPLE",
          "operator": "TEMPORAL_RANGE",
          "subject": "date"
        }
      ],
      "compare_lag": 1,
      "compare_suffix": "So với ngày hôm trước",
      "show_timestamp": true,
      "show_trend_line": true,
      "start_y_axis_at_zero": true,
      "color_picker": {
        "a": 1,
        "b": 137,
        "g": 193,
        "r": 90
      },
      "header_font_size": 0.4,
      "subheader_font_size": 0.15,
      "y_axis_format": ",.2f",
      "currency_format": {
        "symbol": "USD",
        "symbolPosition": "prefix"
      },
      "time_format": "%d/%m/%Y",
      "rolling_type": "None",
      "dashboards": [
        49
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 599,
      "label_colors": {
        "price": "#ffd04c",
        "price_usd": "#ffd04c",
        "count": "#ffd04c",
        "VTV1": "#ca2d1e",
        "VTV2": "#42932b",
        "VTV3": "#000191",
        "VTV5": "#9467bd",
        "VTV Cần Thơ": "#6ce5e8",
        "VTV4": "#8c564b",
        "VTV9": "#e377c2",
        "VTV5 Tây Nam Bộ": "#7f7f7f",
        "VTV8": "#bcbd22",
        "VTV7": "#2d8bba",
        "Thời sự - Chính luận": "#6BD3B3",
        "Phim dài tập": "#FCC550",
        "Đời sống": "#EE5960",
        "Tài liệu - Phóng sự": "#408184",
        "Giải trí": "#66CBE2",
        "Giáo dục - Đào tạo": "#5470C6",
        "Dành cho trẻ em": "#ffb2f3",
        "Thể thao": "#FF874E",
        "Sự kiện": "#03748E",
        "Quảng bá": "#8c564a",
        "Phim truyện": "#C9BBAB",
        "Quảng cáo": "#B17BAA"
      },
      "shared_label_colors": [
        "2.Trưa (11h - 14h)",
        "3.Chiều (14h - 18h)",
        "4.Tối (18h - 24h)",
        "AJINOMOTO VIETNAM",
        "BONCHA (RTD GREEN TEA)",
        "CASPER (AIR CONDITIONER)",
        "CHARMORA CITY NHA TRANG",
        "CONG TY CO PHAN TAP DOAN TRUONG HAI",
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HOA PHAT (TOLE)",
        "ICH NIEU KHANG (PROSTATE DISORDER SUPP.)",
        "KANGAROO (WATER FILTER)",
        "LPBANK",
        "PONNIE",
        "Phim dài tập",
        "Quảng bá",
        "Quảng cáo",
        "SAM NHUNG BO THAN TW3 (ORIENTAL KIDNEY RESTORATIVE MEDICINE)",
        "SUN GROUP VIETNAM (REAL ESTATE COMPANY)",
        "SUN PHUQUOC AIRWAYS",
        "Sự kiện - Đặc biệt",
        "TAM BINH (DRINK SUPP.)",
        "TH TRUE MILK (FRESH MILK)",
        "TH TRUE YOGURT (EATING & FLAVOURED YOGHURT)",
        "THEP VAS",
        "TRUONG HAI AUTO CO., LTD",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "VTV1",
        "VTV10",
        "VTV2",
        "VTV3",
        "VTV4",
        "VTV5",
        "VTV5 Tây Nam Bộ",
        "VTV5 Tây Nguyên",
        "VTV7",
        "VTV8",
        "VTV9",
        "ZOZO IMUSE (COLD-FLU SUPP.)",
        "price",
        "Đời sống"
      ],
      "map_label_colors": {},
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};