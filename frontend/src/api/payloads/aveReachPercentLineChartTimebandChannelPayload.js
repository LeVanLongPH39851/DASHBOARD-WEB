export const aveReachPercentLineChartTimebandChannelPayload = {
  url: 'https://ratings.vtv.vn/api/v1/chart/data?form_data=%7B%22slice_id%22%3A397%7D&dashboard_id=45',
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
            "col": "channel_name_tvd",
            "op": "NOT IN",
            "val": [
              null
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
          },
          "channel_name_tvd"
        ],
        "metrics": [
          {
            "aggregate": null,
            "column": null,
            "datasourceWarning": false,
            "expressionType": "SQL",
            "hasCustomLabel": true,
            "label": "reach%",
            "optionName": "metric_cndx9b75ttj_lnji40e83md",
            "sqlExpression": "SUM(distinct_user_by_day*1.5*\n{% if filter_values('time_band')|length > 0 %}1.5*{% endif %}\n{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 %}\nweight_province\n{% elif filter_values('regional_name')|length > 0 %}\nweight_region\n{% else %}\nweight_national\n{% endif %})/1.5/COUNT(DISTINCT date)*100/{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 or filter_values('regional_name')|length > 0 %}SUM(DISTINCT total){% else %}70859907{% endif %}"
          }
        ],
        "orderby": [
          [
            {
              "aggregate": null,
              "column": null,
              "datasourceWarning": false,
              "expressionType": "SQL",
              "hasCustomLabel": true,
              "label": "reach%",
              "optionName": "metric_cndx9b75ttj_lnji40e83md",
              "sqlExpression": "SUM(distinct_user_by_day*1.5*\n{% if filter_values('time_band')|length > 0 %}1.5*{% endif %}\n{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 %}\nweight_province\n{% elif filter_values('regional_name')|length > 0 %}\nweight_region\n{% else %}\nweight_national\n{% endif %})/1.5/COUNT(DISTINCT date)*100/{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 or filter_values('regional_name')|length > 0 %}SUM(DISTINCT total){% else %}70859907{% endif %}"
            },
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [
          "channel_name_tvd"
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
                "date"
              ],
              "columns": [
                "channel_name_tvd"
              ],
              "aggregates": {
                "reach%": {
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
                "reach%": null
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
      "datasource": "148__table",
      "viz_type": "echarts_timeseries_smooth",
      "slice_id": 397,
      "url_params": {},
      "x_axis": "date",
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "name",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        {
          "aggregate": null,
          "column": null,
          "datasourceWarning": false,
          "expressionType": "SQL",
          "hasCustomLabel": true,
          "label": "reach%",
          "optionName": "metric_cndx9b75ttj_lnji40e83md",
          "sqlExpression": "SUM(distinct_user_by_day*1.5*\n{% if filter_values('time_band')|length > 0 %}1.5*{% endif %}\n{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 %}\nweight_province\n{% elif filter_values('regional_name')|length > 0 %}\nweight_region\n{% else %}\nweight_national\n{% endif %})/1.5/COUNT(DISTINCT date)*100/{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 or filter_values('regional_name')|length > 0 %}SUM(DISTINCT total){% else %}70859907{% endif %}"
        }
      ],
      "groupby": [
        "channel_name_tvd"
      ],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": [
            null
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_0on0014mtz5_7v7yk0doazn",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "channel_name_tvd"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_ay8pbj9wq9r_4rv3jv4zrjc",
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
      "x_axis_title_margin": 15,
      "y_axis_title_margin": "0",
      "y_axis_title_position": "Left",
      "sort_series_type": "sum",
      "color_scheme": "supersetColors",
      "time_shift_color": true,
      "show_value": true,
      "only_total": true,
      "markerEnabled": true,
      "markerSize": 1,
      "zoomable": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "left",
      "x_axis_time_format": "%d/%m/%Y",
      "rich_tooltip": true,
      "showTooltipTotal": false,
      "showTooltipPercentage": false,
      "tooltipTimeFormat": "%d/%m/%Y",
      "y_axis_format": ",.2f",
      "truncateXAxis": true,
      "y_axis_bounds": [
        null,
        null
      ],
      "dashboards": [
        45,
        39
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 397,
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