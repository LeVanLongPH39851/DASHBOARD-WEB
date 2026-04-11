export const grpBarChartBrandFirstLevelPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A603%7D&dashboard_id=49`,
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
            "col": "firstlevel_vn",
            "op": "IS NOT NULL"
          },
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
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Brand",
            "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
          },
          "firstlevel_vn"
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
          "firstlevel_vn"
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
                "firstlevel_vn"
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
      "slice_id": 603,
      "url_params": {},
      "x_axis": {
        "datasourceWarning": false,
        "expressionType": "SQL",
        "label": "Brand",
        "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "sum",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "grp"
      ],
      "groupby": [
        "firstlevel_vn"
      ],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": null,
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_k345kdwzw9r_ncmdc8ienx",
          "isExtra": false,
          "isNew": false,
          "operator": "IS NOT NULL",
          "operatorId": "IS_NOT_NULL",
          "sqlExpression": null,
          "subject": "firstlevel_vn"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_w98q0fl6rld_8ea697frd6",
          "isExtra": true,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
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
      "y_axis_title_margin": 15,
      "y_axis_title_position": "Left",
      "sort_series_type": "sum",
      "color_scheme": "supersetColors",
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
      "chart_id": 603,
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
        "CHIN-SU (CHILI SAUCE)",
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HISMART",
        "KOKOMI SNACKING",
        "MORINAGA",
        "NESTLE NAN",
        "Phim dài tập",
        "Quảng bá",
        "Quảng cáo",
        "SAM NHUNG BO THAN TW3 (ORIENTAL KIDNEY RESTORATIVE MEDICINE)",
        "TAM BINH (DRINK SUPP.)",
        "TH TRUE MILK (FRESH MILK)",
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