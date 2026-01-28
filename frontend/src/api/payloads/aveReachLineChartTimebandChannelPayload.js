export const aveReachLineChartTimebandChannelPayload = {
  url: 'https://ratings.vtv.vn/api/v1/chart/data?form_data=%7B%22slice_id%22%3A393%7D&dashboard_id=45',
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
            "col": "time_band",
            "op": "NOT IN",
            "val": [
              null
            ]
          },
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
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "time_band",
            "sqlExpression": "CASE \r\n  WHEN time_band = '0h - 1h' THEN '00-01'\r\n  WHEN time_band = '1h - 2h' THEN '01-02'\r\n  WHEN time_band = '2h - 3h' THEN '02-03'\r\n  WHEN time_band = '3h - 4h' THEN '03-04'\r\n  WHEN time_band = '4h - 5h' THEN '04-05'\r\n  WHEN time_band = '5h - 6h' THEN '05-06'\r\n  WHEN time_band = '6h - 7h' THEN '06-07'\r\n  WHEN time_band = '7h - 8h' THEN '07-08'\r\n  WHEN time_band = '8h - 9h' THEN '08-09'\r\n  WHEN time_band = '9h - 10h' THEN '09-10'\r\n  WHEN time_band = '10h - 11h' THEN '10-11'\r\n  WHEN time_band = '11h - 12h' THEN '11-12'\r\n  WHEN time_band = '12h - 13h' THEN '12-13'\r\n  WHEN time_band = '13h - 14h' THEN '13-14'\r\n  WHEN time_band = '14h - 15h' THEN '14-15'\r\n  WHEN time_band = '15h - 16h' THEN '15-16'\r\n  WHEN time_band = '16h - 17h' THEN '16-17'\r\n  WHEN time_band = '17h - 18h' THEN '17-18'\r\n  WHEN time_band = '18h - 19h' THEN '18-19'\r\n  WHEN time_band = '19h - 20h' THEN '19-20'\r\n  WHEN time_band = '20h - 21h' THEN '20-21'\r\n  WHEN time_band = '21h - 22h' THEN '21-22'\r\n  WHEN time_band = '22h - 23h' THEN '22-23'\r\n  WHEN time_band = '23h - 24h' THEN '23-24'\r\nEND"
          },
          "channel_name_tvd"
        ],
        "metrics": [
          "ave_reach_1"
        ],
        "orderby": [
          [
            "ave_reach_1",
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
                "time_band"
              ],
              "columns": [
                "channel_name_tvd"
              ],
              "aggregates": {
                "ave_reach_1": {
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
                "ave_reach_1": null
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
      "viz_type": "echarts_timeseries_line",
      "slice_id": 393,
      "url_params": {},
      "x_axis": {
        "datasourceWarning": false,
        "expressionType": "SQL",
        "label": "time_band",
        "sqlExpression": "CASE \r\n  WHEN time_band = '0h - 1h' THEN '00-01'\r\n  WHEN time_band = '1h - 2h' THEN '01-02'\r\n  WHEN time_band = '2h - 3h' THEN '02-03'\r\n  WHEN time_band = '3h - 4h' THEN '03-04'\r\n  WHEN time_band = '4h - 5h' THEN '04-05'\r\n  WHEN time_band = '5h - 6h' THEN '05-06'\r\n  WHEN time_band = '6h - 7h' THEN '06-07'\r\n  WHEN time_band = '7h - 8h' THEN '07-08'\r\n  WHEN time_band = '8h - 9h' THEN '08-09'\r\n  WHEN time_band = '9h - 10h' THEN '09-10'\r\n  WHEN time_band = '10h - 11h' THEN '10-11'\r\n  WHEN time_band = '11h - 12h' THEN '11-12'\r\n  WHEN time_band = '12h - 13h' THEN '12-13'\r\n  WHEN time_band = '13h - 14h' THEN '13-14'\r\n  WHEN time_band = '14h - 15h' THEN '14-15'\r\n  WHEN time_band = '15h - 16h' THEN '15-16'\r\n  WHEN time_band = '16h - 17h' THEN '16-17'\r\n  WHEN time_band = '17h - 18h' THEN '17-18'\r\n  WHEN time_band = '18h - 19h' THEN '18-19'\r\n  WHEN time_band = '19h - 20h' THEN '19-20'\r\n  WHEN time_band = '20h - 21h' THEN '20-21'\r\n  WHEN time_band = '21h - 22h' THEN '21-22'\r\n  WHEN time_band = '22h - 23h' THEN '22-23'\r\n  WHEN time_band = '23h - 24h' THEN '23-24'\r\nEND"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "name",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "ave_reach_1"
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
          "filterOptionName": "filter_6557zui19i9_zxmyog5lfdr",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "time_band"
        },
        {
          "clause": "WHERE",
          "comparator": [
            null
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_xlk8esriff_ge5y3ci667e",
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
          "filterOptionName": "filter_1rnafy3ye4w_v8htpo4ajz",
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
      "x_axis_title": "Timeband (H)",
      "x_axis_title_margin": "40",
      "y_axis_title_margin": "0",
      "y_axis_title_position": "Left",
      "sort_series_type": "sum",
      "color_scheme": "supersetColors",
      "time_shift_color": true,
      "seriesType": "line",
      "show_value": false,
      "only_total": true,
      "opacity": 0.2,
      "markerEnabled": true,
      "markerSize": 0,
      "zoomable": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "left",
      "x_axis_time_format": "smart_date",
      "xAxisLabelRotation": 45,
      "rich_tooltip": true,
      "showTooltipTotal": true,
      "showTooltipPercentage": true,
      "tooltipTimeFormat": "smart_date",
      "y_axis_format": "SMART_NUMBER",
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
      "chart_id": 393,
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