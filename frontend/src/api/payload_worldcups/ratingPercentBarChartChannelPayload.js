export const ratingPercentBarChartChannelPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A918%7D&dashboard_id=66`,
  payload: {
    "datasource": {
      "id": 279,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-7, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
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
        "applied_time_extras": {},
        "columns": [
          {
            "columnType": "BASE_AXIS",
            "sqlExpression": "channel_name_tvd",
            "label": "channel_name_tvd",
            "expressionType": "SQL"
          },
          "Chtrinh"
        ],
        "metrics": [
          "rating%"
        ],
        "orderby": [
          [
            "rating%",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 10000,
        "series_columns": [
          "Chtrinh"
        ],
        "series_limit": 0,
        "order_desc": true,
        "url_params": {
          "native_filters_key": "BTinBldyeeH2Bi1Ojx6_HGLfupLGLjt7YMX4epnhJtgpGz7c1XE6Umw-cYFAv4PS"
        },
        "custom_params": {},
        "custom_form_data": {},
        "time_offsets": [],
        "post_processing": [
          {
            "operation": "pivot",
            "options": {
              "index": [
                "channel_name_tvd"
              ],
              "columns": [
                "Chtrinh"
              ],
              "aggregates": {
                "rating%": {
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
                "rating%": null
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
      "datasource": "279__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 918,
      "url_params": {
        "native_filters_key": "BTinBldyeeH2Bi1Ojx6_HGLfupLGLjt7YMX4epnhJtgpGz7c1XE6Umw-cYFAv4PS"
      },
      "x_axis": "channel_name_tvd",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "sum",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "rating%"
      ],
      "groupby": [
        "Chtrinh"
      ],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "expressionType": "SIMPLE",
          "operator": "TEMPORAL_RANGE",
          "subject": "date"
        }
      ],
      "order_desc": true,
      "row_limit": 10000,
      "truncate_metric": true,
      "show_empty_columns": true,
      "comparison_type": "values",
      "annotation_layers": [],
      "forecastPeriods": 10,
      "forecastInterval": 0.8,
      "orientation": "horizontal",
      "x_axis_title_margin": 15,
      "y_axis_title_margin": 15,
      "y_axis_title_position": "Left",
      "sort_series_type": "sum",
      "sort_series_ascending": false,
      "color_scheme": "supersetColors",
      "time_shift_color": true,
      "stack": "Stack",
      "only_total": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "top",
      "x_axis_time_format": "smart_date",
      "y_axis_format": "SMART_NUMBER",
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
        66
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-7, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 918,
      "label_colors": {
        "ave_reach": "#ffd04c",
        "ave_reach_timeband": "#ffd04c",
        "reach_timeband%": "#ffd04c",
        "rating": "#ff5757",
        "Live": "#6ce5e8",
        "TSV": "#fe9273",
        "MOBILE": "#5097d7",
        "SMART_TV": "#50bf62",
        "PC/Lap": "#ffd501",
        "TABLET": "#ff6f31",
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
        "VTV5 Tây Nguyên": "#b97286",
        "rating_timeband": "#ff5757",
        "rating_timeband%": "#ff5757",
        "Workweek": "#fe9273",
        "Weekend": "#6ce5e8",
        "Thời sự - Chính luận": "#6BD3B3",
        "Sự kiện - Đặc biệt": "#7A378B",
        "Phim dài tập": "#FCC550",
        "Đời sống": "#EE5960",
        "Tài liệu - Phóng sự": "#408184",
        "Giải trí": "#BFEFFF",
        "Giáo dục - Đào tạo": "#5470C6",
        "Dành cho trẻ em": "#ffb2f3",
        "Thể thao": "#FF874E",
        "Sự kiện": "#03748E",
        "Quảng bá": "#8c564a",
        "Phim truyện": "#C9BBAB",
        "Phim điện ảnh": "#C3BBAB",
        "Quảng cáo": "#B17BAA",
        "Thứ Hai": "#1FA8C9",
        "Thứ Ba": "#454E7C",
        "Thứ Tư": "#5AC189",
        "Thứ Năm": "#FF7F44",
        "Thứ Sáu": "#666666",
        "Thứ Bảy": "#E04355",
        "Chủ Nhật": "#FCC700"
      },
      "shared_label_colors": [],
      "map_label_colors": {
        "2026-06-14, THTT FIFA WORLD CUP 2026 - VÒNG BẢNG": "#1FA8C9",
        "2026-06-14, BÌNH LUẬN FIFA WORLD CUP 2026": "#454E7C",
        "2026-06-14, TT FIFA WORLD CUP 2026 - VÒNG BẢNG": "#5AC189",
        "2026-06-12, THTT FIFA WORLD CUP 2026 - VÒNG BẢNG": "#FF7F44",
        "2026-06-13, THTT FIFA WORLD CUP 2026 - VÒNG BẢNG": "#666666",
        "2026-06-12, TT FIFA WORLD CUP 2026 - VÒNG BẢNG": "#E04355",
        "2026-06-13, TT FIFA WORLD CUP 2026 - VÒNG BẢNG": "#FCC700",
        "2026-06-12, BÌNH LUẬN FIFA WORLD CUP 2026": "#A868B7",
        "2026-06-13, BÌNH LUẬN FIFA WORLD CUP 2026": "#3CCCCB",
        "2026-06-13, CẬN CẢNH FIFA WORLD CUP 2026": "#A38F79",
        "2026-06-13, TT BÓNG CHUYỀN NỮ VTV CUP 2025": "#8FD3E4",
        "2026-06-12, THTT LỄ KHAI MẠC FIFA WORLD CUP 2026 - MEXICO": "#A1A6BD",
        "2026-06-14, VTV SPORTS NEWS": "#FF7F44",
        "2026-06-14, FIFA WORLD CUP 2026 - CHUYỆN NGƯỜI TRONG CUỘC": "#666666",
        "2026-06-13, BƯỚC NHẢY MÙA XUÂN": "#ACE1C4",
        "2026-06-12, ĐƯỜNG TỚI FIFA WORLD CUP 2026": "#FEC0A1",
        "2026-06-14, CẬN CẢNH FIFA WORLD CUP 2026": "#E04355",
        "2026-06-13, THTT LỄ KHAI MẠC FIFA WORLD CUP 2026 - MỸ": "#B2B2B2",
        "2026-06-12, FIFA WORLD CUP 2026 - CHUYỆN NGƯỜI TRONG CUỘC": "#EFA1AA",
        "2026-06-12, CẬN CẢNH FIFA WORLD CUP 2026": "#FDE380",
        "2026-06-13, TT GIẢI PICKLEBALL VTV CUP 2025": "#D3B3DA",
        "2026-06-12, TT GIẢI PICKLEBALL VTV CUP 2025": "#9EE5E5",
        "2026-06-14, BƯỚC NHẢY MÙA XUÂN": "#FCC700",
        "2026-06-14, TT GIẢI PICKLEBALL VTV CUP 2025": "#A868B7",
        "2026-06-12, NÓNG CÙNG FIFA WORLD CUP 2026": "#D1C6BC",
        "2026-06-13, VTV SPORTS NEWS": "#D3B3DA",
        "2026-06-13, FIFA WORLD CUP 2026 - CHUYỆN NGƯỜI TRONG CUỘC": "#9EE5E5",
        "2026-06-12, VTV SPORTS NEWS": "#1f86c9",
        "2026-06-14, 360° THỂ THAO": "#3CCCCB",
        "2026-06-12, BƯỚC NHẢY MÙA XUÂN": "#47457c",
        "2026-06-12, SÂN CỎ FIFA WORLD CUP 2026": "#5ac19e",
        "2026-06-13, SÂN CỎ FIFA WORLD CUP 2026": "#ffa444",
        "2026-06-13, THTT LỄ KHAI MẠC FIFA WORLD CUP 2026 - CANADA": "#e05043",
        "2026-06-13, TẠP CHÍ THỂ THAO": "#fcf900",
        "2026-06-14, GIỜ VÀNG THỂ THAO": "#A38F79",
        "2026-06-12, TT BÓNG CHUYỀN NỮ VTV CUP 2025": "#b768b6",
        "2026-06-12, TẠP CHÍ THỂ THAO": "#3cb0cc",
        "2026-06-12, TT LỄ KHAI MẠC FIFA WORLD CUP 2026 - MEXICO": "#a39779",
        "2026-06-12, CẢM HỨNG FIFA WORLD CUP 2026": "#8fc2e4",
        "2026-06-12, CẬN CẢNH THỂ THAO": "#a2a1bd",
        "2026-06-12, 360° THỂ THAO": "#ace1cf",
        "2026-06-13, 360° THỂ THAO": "#fed3a1",
        "2026-06-13, NÓNG CÙNG FIFA WORLD CUP 2026": "#b2b2b2",
        "THTT FIFA WORLD CUP 2026": "#1FA8C9",
        "Các chương trình Đồng hành": "#454E7C"
      },
      "own_color_scheme": "supersetColors",
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};