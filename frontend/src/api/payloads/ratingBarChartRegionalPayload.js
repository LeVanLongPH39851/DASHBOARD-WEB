export const ratingBarChartRegionalPayload = {
  url: 'https://ratings.vtv.vn/api/v1/chart/data?form_data=%7B%22slice_id%22%3A425%7D&dashboard_id=45',
  payload: {
    "datasource": {
      "id": 148,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "regional_name",
            "op": "NOT IN",
            "val": [
              "NULL"
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
            "expressionType": "SQL",
            "label": "Vùng",
            "sqlExpression": "CASE WHEN regional_name = 'Đồng bằng sông Hồng' THEN 'Đồng bằng' || CHR(10) || 'sông Hồng' WHEN regional_name = 'Bắc Trung Bộ và Duyên hải miền Trung' THEN 'Bắc Trung Bộ và' || CHR(10) || 'Duyên hải miền Trung' WHEN regional_name = 'Trung du và miền núi phía Bắc' THEN 'Trung du và' || CHR(10) || 'miền núi phía Bắc' WHEN regional_name = 'Đồng bằng sông Cửu Long' THEN 'Đồng bằng' || CHR(10) || 'sông Cửu Long' ELSE regional_name END"
          }
        ],
        "metrics": [
          "rating"
        ],
        "orderby": [
          [
            "rating",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [],
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
                "Vùng"
              ],
              "columns": [],
              "aggregates": {
                "rating": {
                  "operator": "mean"
                }
              },
              "drop_missing_columns": false
            }
          },
          {
            "operation": "sort",
            "options": {
              "by": "rating",
              "ascending": true
            }
          },
          {
            "operation": "flatten"
          }
        ]
      }
    ],
    "form_data": {
      "datasource": "148__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 425,
      "url_params": {},
      "x_axis": {
        "expressionType": "SQL",
        "label": "Vùng",
        "sqlExpression": "CASE WHEN regional_name = 'Đồng bằng sông Hồng' THEN 'Đồng bằng' || CHR(10) || 'sông Hồng' WHEN regional_name = 'Bắc Trung Bộ và Duyên hải miền Trung' THEN 'Bắc Trung Bộ và' || CHR(10) || 'Duyên hải miền Trung' WHEN regional_name = 'Trung du và miền núi phía Bắc' THEN 'Trung du và' || CHR(10) || 'miền núi phía Bắc' WHEN regional_name = 'Đồng bằng sông Cửu Long' THEN 'Đồng bằng' || CHR(10) || 'sông Cửu Long' ELSE regional_name END"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort": "rating",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "name",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "rating"
      ],
      "groupby": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": [
            "NULL"
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_tng08xk1h4b_a3d4m1ukzv",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "regional_name"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_dt0eavgqxnq_2jwj7kf0ajo",
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
      "only_total": true,
      "show_legend": false,
      "legendType": "scroll",
      "legendOrientation": "top",
      "x_axis_time_format": "smart_date",
      "y_axis_format": ",d",
      "truncateYAxis": false,
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
        39
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 425,
      "label_colors": {
        "ave_reach": "#ffd04c",
        "ave_reach_1": "#ffd04c",
        "reach%_1": "#ffd04c",
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
        "Quảng cáo": "#B17BAA",
        "1.Thứ Hai": "#1FA8C9",
        "2.Thứ Ba": "#454E7C",
        "3.Thứ Tư": "#5AC189",
        "4.Thứ Năm": "#FF7F44",
        "5.Thứ Sáu": "#666666",
        "6.Thứ Bảy": "#E04355",
        "7.Chủ Nhật": "#FCC700"
      },
      "shared_label_colors": [
        "7.Chủ Nhật",
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "Live",
        "Phim dài tập",
        "Phim truyện",
        "Quảng bá",
        "Sự kiện",
        "TSV",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "VTV Cần Thơ",
        "VTV1",
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
        "ave_reach_1",
        "rating",
        "rating_timeband",
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