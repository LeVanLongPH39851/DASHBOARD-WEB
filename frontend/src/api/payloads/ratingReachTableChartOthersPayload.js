export const ratingReachTableChartOthersPayload = {
  url: 'https://ratings.vtv.vn/api/v1/chart/data?form_data=%7B%22slice_id%22%3A469%7D&dashboard_id=45',
  payload: {
    "datasource": {
      "id": 164,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "others",
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
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "others",
          "firstlevel_vn",
          "channel_name_tvd"
        ],
        "metrics": [
          {
            "aggregate": null,
            "column": null,
            "datasourceWarning": false,
            "expressionType": "SQL",
            "hasCustomLabel": true,
            "label": "RATING (người/phút)",
            "optionName": "metric_p4iqlv5uc2_02tvavwx8w5u",
            "sqlExpression": "CASE WHEN SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END) = 0 THEN 0\nELSE CASE WHEN (SUM(duration_view_program*1.9)/60)/(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)/60) <= SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*event_duration)/SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)*0.90 THEN (SUM(duration_view_program*1.9*weight_national)/60)/(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)/60) ELSE SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*weight_national*event_duration)/SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)*0.90 END END"
          },
          {
            "aggregate": null,
            "column": null,
            "datasourceWarning": false,
            "expressionType": "SQL",
            "hasCustomLabel": true,
            "label": "Ave.REACH (người/lượt phát)",
            "optionName": "metric_7w9jnjvs9j_7zkjzq2m07l",
            "sqlExpression": "CAST(COALESCE(SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*weight_national*event_duration)/ NULLIF(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END), 0), 0) AS INT)"
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
              "label": "RATING (người/phút)",
              "optionName": "metric_p4iqlv5uc2_02tvavwx8w5u",
              "sqlExpression": "CASE WHEN SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END) = 0 THEN 0\nELSE CASE WHEN (SUM(duration_view_program*1.9)/60)/(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)/60) <= SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*event_duration)/SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)*0.90 THEN (SUM(duration_view_program*1.9*weight_national)/60)/(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)/60) ELSE SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*weight_national*event_duration)/SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)*0.90 END END"
            },
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_limit": 0,
        "order_desc": true,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [],
        "time_offsets": []
      }
    ],
    "form_data": {
      "datasource": "164__table",
      "viz_type": "table",
      "slice_id": 469,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "others",
        "firstlevel_vn",
        "channel_name_tvd"
      ],
      "temporal_columns_lookup": {
        "date": true
      },
      "metrics": [
        {
          "aggregate": null,
          "column": null,
          "datasourceWarning": false,
          "expressionType": "SQL",
          "hasCustomLabel": true,
          "label": "RATING (người/phút)",
          "optionName": "metric_p4iqlv5uc2_02tvavwx8w5u",
          "sqlExpression": "CASE WHEN SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END) = 0 THEN 0\nELSE CASE WHEN (SUM(duration_view_program*1.9)/60)/(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)/60) <= SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*event_duration)/SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)*0.90 THEN (SUM(duration_view_program*1.9*weight_national)/60)/(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)/60) ELSE SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*weight_national*event_duration)/SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END)*0.90 END END"
        },
        {
          "aggregate": null,
          "column": null,
          "datasourceWarning": false,
          "expressionType": "SQL",
          "hasCustomLabel": true,
          "label": "Ave.REACH (người/lượt phát)",
          "optionName": "metric_7w9jnjvs9j_7zkjzq2m07l",
          "sqlExpression": "CAST(COALESCE(SUM(distinct_user_by_day*CASE WHEN date <> '2025-09-02' THEN 1.5 ELSE 1.2 END*weight_national*event_duration)/ NULLIF(SUM(CASE WHEN number = 1 THEN event_duration ELSE 0 END), 0), 0) AS INT)"
        }
      ],
      "all_columns": [],
      "percent_metrics": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": [
            "NULL"
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_1xmif8ecxei_yqg4wjyx51",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "others"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_p08nent0fqn_apzwbtg6qw",
          "isExtra": true,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
      "order_by_cols": [],
      "row_limit": 50000,
      "server_page_length": 10,
      "order_desc": true,
      "table_timestamp_format": "smart_date",
      "include_search": true,
      "allow_render_html": true,
      "column_config": {
        "Ave.REACH (người/lượt phát)": {
          "d3NumberFormat": ",d"
        },
        "RATING (người/phút)": {
          "d3NumberFormat": ",d"
        }
      },
      "show_cell_bars": false,
      "color_pn": true,
      "comparison_color_scheme": "Green",
      "conditional_formatting": [
        {
          "colorScheme": "#ACE1C4",
          "column": "RATING (người/phút)",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "Ave.REACH (người/lượt phát)",
          "operator": "None"
        }
      ],
      "comparison_type": "values",
      "dashboards": [
        45
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 469,
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
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};