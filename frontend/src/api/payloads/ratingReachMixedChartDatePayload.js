export const ratingReachMixedChartDatePayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A673%7D&dashboard_id=50`,
  payload: {
    "datasource": {
      "id": 210,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "days_of_week",
            "op": "NOT IN",
            "val": [
              "7 days"
            ]
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
            "sqlExpression": "date",
            "label": "date",
            "expressionType": "SQL"
          }
        ],
        "metrics": [
          "ave_reach"
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [],
        "series_limit": 0,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "time_offsets": [],
        "post_processing": [
          {
            "operation": "pivot",
            "options": {
              "index": [
                "date"
              ],
              "columns": [],
              "aggregates": {
                "ave_reach": {
                  "operator": "mean"
                }
              },
              "drop_missing_columns": true
            }
          },
          {
            "operation": "flatten"
          }
        ],
        "orderby": [
          [
            "ave_reach",
            false
          ]
        ]
      },
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "date",
            "op": "TEMPORAL_RANGE",
            "val": "No filter"
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
            "sqlExpression": "date",
            "label": "date",
            "expressionType": "SQL"
          }
        ],
        "metrics": [
          "rating"
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [],
        "series_limit": 0,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "time_offsets": [],
        "post_processing": [
          {
            "operation": "pivot",
            "options": {
              "index": [
                "date"
              ],
              "columns": [],
              "aggregates": {
                "rating": {
                  "operator": "mean"
                }
              },
              "drop_missing_columns": true
            }
          },
          {
            "operation": "flatten"
          }
        ],
        "orderby": [
          [
            "rating",
            false
          ]
        ]
      }
    ],
    "form_data": {
      "datasource": "210__table",
      "viz_type": "mixed_timeseries",
      "slice_id": 673,
      "url_params": {},
      "x_axis": "date",
      "time_grain_sqla": "P1D",
      "metrics": [
        "ave_reach"
      ],
      "groupby": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": [
            "7 days"
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_5361tah117y_ff2kgbem2k6",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "days_of_week"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_7lvs4l6vbva_6itypvumq4",
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
      "comparison_type": "values",
      "annotation_layers": [],
      "x_axis_title_margin": 15,
      "y_axis_title_margin": 15,
      "y_axis_title_position": "Left",
      "color_scheme": "supersetColors",
      "time_shift_color": true,
      "seriesType": "bar",
      "show_value": true,
      "opacity": 0.2,
      "markerEnabled": true,
      "markerSize": 2,
      "seriesTypeB": "smooth",
      "stackB": false,
      "show_valueB": true,
      "opacityB": 0.2,
      "markerEnabledB": true,
      "markerSizeB": 2,
      "zoomable": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "left",
      "x_axis_time_format": "%d/%m/%Y",
      "rich_tooltip": true,
      "showTooltipTotal": true,
      "showTooltipPercentage": true,
      "tooltipTimeFormat": "%d/%m/%Y",
      "truncateXAxis": true,
      "truncateYAxis": false,
      "y_axis_bounds": [
        null,
        null
      ],
      "y_axis_format": "SMART_NUMBER",
      "y_axis_bounds_secondary": [
        null,
        null
      ],
      "y_axis_format_secondary": "SMART_NUMBER",
      "dashboards": [
        87
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 673,
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
      "shared_label_colors": [
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "Live",
        "Phim dài tập",
        "Phim điện ảnh",
        "Sự kiện - Đặc biệt",
        "TSV",
        "Thể thao",
        "Thời sự - Chính luận",
        "Thứ Sáu",
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
        "ave_reach",
        "rating",
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