export const spendVNDBarChartBrandTimebandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A584%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 195,
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
            "datasourceWarning": true,
            "expressionType": "SQL",
            "label": "Brand",
            "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
          },
          {
            "datasourceWarning": true,
            "expressionType": "SQL",
            "label": "Khung giờ",
            "sqlExpression": "CASE WHEN time_band IN ('11h - 12h', '12h - 13h', '13h - 14h') THEN '2.Trưa (11h - 14h)' WHEN time_band IN ('14h - 15h', '15h - 16h', '16h - 17h', '17h - 18h') THEN '3.Chiều (14h - 18h)' WHEN time_band IN ('18h - 19h', '19h - 20h', '20h - 21h', '21h - 22h', '22h - 23h', '23h - 24h') THEN '4.Tối (18h - 24h)' ELSE '1.Sáng (0h - 11h)' END"
          }
        ],
        "metrics": [
          "price"
        ],
        "orderby": [
          [
            "price",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [
          {
            "datasourceWarning": true,
            "expressionType": "SQL",
            "label": "Khung giờ",
            "sqlExpression": "CASE WHEN time_band IN ('11h - 12h', '12h - 13h', '13h - 14h') THEN '2.Trưa (11h - 14h)' WHEN time_band IN ('14h - 15h', '15h - 16h', '16h - 17h', '17h - 18h') THEN '3.Chiều (14h - 18h)' WHEN time_band IN ('18h - 19h', '19h - 20h', '20h - 21h', '21h - 22h', '22h - 23h', '23h - 24h') THEN '4.Tối (18h - 24h)' ELSE '1.Sáng (0h - 11h)' END"
          }
        ],
        "series_limit": 0,
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
                "Brand"
              ],
              "columns": [
                "Khung giờ"
              ],
              "aggregates": {
                "price": {
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
                "price": null
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
      "datasource": "195__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 584,
      "url_params": {},
      "x_axis": {
        "datasourceWarning": true,
        "expressionType": "SQL",
        "label": "Brand",
        "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "sum",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "price"
      ],
      "groupby": [
        {
          "datasourceWarning": true,
          "expressionType": "SQL",
          "label": "Khung giờ",
          "sqlExpression": "CASE WHEN time_band IN ('11h - 12h', '12h - 13h', '13h - 14h') THEN '2.Trưa (11h - 14h)' WHEN time_band IN ('14h - 15h', '15h - 16h', '16h - 17h', '17h - 18h') THEN '3.Chiều (14h - 18h)' WHEN time_band IN ('18h - 19h', '19h - 20h', '20h - 21h', '21h - 22h', '22h - 23h', '23h - 24h') THEN '4.Tối (18h - 24h)' ELSE '1.Sáng (0h - 11h)' END"
        }
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
      "row_limit": 50000,
      "truncate_metric": true,
      "show_empty_columns": true,
      "comparison_type": "values",
      "annotation_layers": [],
      "forecastPeriods": 10,
      "forecastInterval": 0.8,
      "orientation": "horizontal",
      "x_axis_title_margin": "0",
      "y_axis_title": "",
      "y_axis_title_margin": 15,
      "y_axis_title_position": "Left",
      "sort_series_type": "name",
      "sort_series_ascending": true,
      "color_scheme": "supersetColors",
      "time_shift_color": true,
      "show_value": true,
      "stack": "Stack",
      "only_total": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "top",
      "x_axis_time_format": "smart_date",
      "y_axis_format": ",.2f",
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
      "chart_id": 584,
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