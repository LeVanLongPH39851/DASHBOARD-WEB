export const grpBarChartRegionalBrandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A587%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 197,
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
            "val": "2025-10-20T00:00:00 : 2025-10-26T23:59:59"
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
            "expressionType": "SQL",
            "label": "regional_name",
            "sqlExpression": "CASE \r\n        WHEN regional_name = 'Đồng bằng sông Hồng' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Hồng')\r\n        WHEN regional_name = 'Bắc Trung Bộ và Duyên hải miền Trung' \r\n            THEN CONCAT('Bắc Trung', '\\n', 'Bộ và', '\\n', 'Duyên hải', '\\n', 'miền Trung')\r\n        WHEN regional_name = 'Trung du và miền núi phía Bắc' \r\n            THEN CONCAT('Trung du', '\\n', 'và', '\\n', 'miền núi', '\\n', 'phía Bắc')\r\n        WHEN regional_name = 'Đồng bằng sông Cửu Long' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Cửu', '\\n', 'Long')\r\n        WHEN regional_name = 'Đông Nam Bộ' \r\n            THEN CONCAT('Đông Nam', '\\n', 'Bộ')\r\n        WHEN regional_name = 'Tây Nguyên' \r\n            THEN CONCAT('Tây', '\\n', 'Nguyên')\r\n        ELSE regional_name\r\n    END"
          },
          "brand"
        ],
        "metrics": [
          "grp"
        ],
        "orderby": [
          [
            "grp",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [
          "brand"
        ],
        "series_limit": 10,
        "order_desc": true,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "time_offsets": [],
        "post_processing": [
          {
            "operation": "pivot",
            "options": {
              "index": [
                "regional_name"
              ],
              "columns": [
                "brand"
              ],
              "aggregates": {
                "grp": {
                  "operator": "mean"
                }
              },
              "drop_missing_columns": false
            }
          },
          {
            "operation": "rename",
            "options": {
              "columns": {
                "grp": null
              },
              "level": 0,
              "inplace": true
            }
          },
          {
            "operation": "flatten"
          }
        ]
      }
    ],
    "form_data": {
      "datasource": "197__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 587,
      "url_params": {},
      "x_axis": {
        "expressionType": "SQL",
        "label": "regional_name",
        "sqlExpression": "CASE \r\n        WHEN regional_name = 'Đồng bằng sông Hồng' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Hồng')\r\n        WHEN regional_name = 'Bắc Trung Bộ và Duyên hải miền Trung' \r\n            THEN CONCAT('Bắc Trung', '\\n', 'Bộ và', '\\n', 'Duyên hải', '\\n', 'miền Trung')\r\n        WHEN regional_name = 'Trung du và miền núi phía Bắc' \r\n            THEN CONCAT('Trung du', '\\n', 'và', '\\n', 'miền núi', '\\n', 'phía Bắc')\r\n        WHEN regional_name = 'Đồng bằng sông Cửu Long' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Cửu', '\\n', 'Long')\r\n        WHEN regional_name = 'Đông Nam Bộ' \r\n            THEN CONCAT('Đông Nam', '\\n', 'Bộ')\r\n        WHEN regional_name = 'Tây Nguyên' \r\n            THEN CONCAT('Tây', '\\n', 'Nguyên')\r\n        ELSE regional_name\r\n    END"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "sum",
      "x_axis_sort_series_ascending": false,
      "metrics": [
        "grp"
      ],
      "groupby": [
        "brand"
      ],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "2025-10-20T00:00:00 : 2025-10-26T23:59:59",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_ecx58m6xo76_b1iw1pkcit7",
          "isExtra": false,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
      "limit": 10,
      "order_desc": true,
      "row_limit": 50000,
      "truncate_metric": true,
      "show_empty_columns": true,
      "comparison_type": "values",
      "annotation_layers": [],
      "forecastPeriods": 10,
      "forecastInterval": 0.8,
      "orientation": "vertical",
      "x_axis_title_margin": 15,
      "y_axis_title_margin": "0",
      "y_axis_title_position": "Left",
      "sort_series_type": "max",
      "sort_series_ascending": false,
      "color_scheme": "presetColors",
      "time_shift_color": true,
      "show_value": true,
      "stack": "Stack",
      "only_total": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "top",
      "x_axis_time_format": "smart_date",
      "y_axis_format": ",.1f",
      "y_axis_bounds": [
        null,
        null
      ],
      "truncateXAxis": true,
      "rich_tooltip": true,
      "showTooltipTotal": true,
      "showTooltipPercentage": true,
      "tooltipTimeFormat": "smart_date",
      "dashboards": [
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 587,
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
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "Phim dài tập",
        "Quảng bá",
        "Quảng cáo",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "VTV Cần Thơ",
        "VTV1",
        "VTV2",
        "VTV3",
        "VTV4",
        "VTV8",
        "VTV9",
        "price",
        "price_usd",
        "Đời sống"
      ],
      "map_label_colors": {},
      "own_color_scheme": "presetColors",
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};