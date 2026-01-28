export const allTableChartChannelPayload = {
  url: 'https://ratings.vtv.vn/api/v1/chart/data?form_data=%7B%22slice_id%22%3A406%7D&dashboard_id=45',
  payload: {
    "datasource": {
      "id": 151,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "channel_name_tvd",
            "op": "IS NOT NULL"
          },
          {
            "col": "event_category_name",
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
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "channel_name_tvd",
          "event_category_name"
        ],
        "metrics": [
          "rating",
          "ave_reach",
          {
            "aggregate": null,
            "column": null,
            "datasourceWarning": false,
            "expressionType": "SQL",
            "hasCustomLabel": true,
            "label": "REACH (%)",
            "optionName": "metric_9ppj0mqev3_8uux5j9smu5",
            "sqlExpression": "SUM(CASE WHEN\n{% if filter_values('event_category_name')|length > 0 %} 1 = 1 {% else %} event_category_name IS NULL {% endif %}\n  AND\n{% if filter_values('platform')|length > 0 %} 1 = 1 {% else %} platform IS NULL {% endif %}\n  AND\n{% if filter_values('regional_name')|length > 0 or filter_values('key_city')|length > 0 or filter_values('others')|length > 0 or filter_values('province')|length > 0 %} 1 = 1 {% else %} province IS NULL {% endif %}\n  AND\n{% if filter_values('time_band')|length > 0 %} 1 = 1 {% else %} time_band IS NULL {% endif %}\nTHEN distinct_user_by_day*1.5*\n{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 %}\nre_weight_province\n{% elif filter_values('regional_name')|length > 0 %}\nre_weight_region\n{% else %}\nre_weight_national\n{% endif %} ELSE 0 END)/1.5/COUNT(DISTINCT date)*100/{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 or filter_values('regional_name')|length > 0 %}SUM(DISTINCT re_total){% else %}70859907{% endif %}"
          },
          "rating%",
          "minute/user/day"
        ],
        "orderby": [
          [
            "rating",
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
      "datasource": "151__table",
      "viz_type": "table",
      "slice_id": 406,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "channel_name_tvd",
        "event_category_name"
      ],
      "temporal_columns_lookup": {
        "date": true
      },
      "metrics": [
        "rating",
        "ave_reach",
        {
          "aggregate": null,
          "column": null,
          "datasourceWarning": false,
          "expressionType": "SQL",
          "hasCustomLabel": true,
          "label": "REACH (%)",
          "optionName": "metric_9ppj0mqev3_8uux5j9smu5",
          "sqlExpression": "SUM(CASE WHEN\n{% if filter_values('event_category_name')|length > 0 %} 1 = 1 {% else %} event_category_name IS NULL {% endif %}\n  AND\n{% if filter_values('platform')|length > 0 %} 1 = 1 {% else %} platform IS NULL {% endif %}\n  AND\n{% if filter_values('regional_name')|length > 0 or filter_values('key_city')|length > 0 or filter_values('others')|length > 0 or filter_values('province')|length > 0 %} 1 = 1 {% else %} province IS NULL {% endif %}\n  AND\n{% if filter_values('time_band')|length > 0 %} 1 = 1 {% else %} time_band IS NULL {% endif %}\nTHEN distinct_user_by_day*1.5*\n{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 %}\nre_weight_province\n{% elif filter_values('regional_name')|length > 0 %}\nre_weight_region\n{% else %}\nre_weight_national\n{% endif %} ELSE 0 END)/1.5/COUNT(DISTINCT date)*100/{% if filter_values('province')|length > 0 or filter_values('key_city')|length > 0 or filter_values('regional_name')|length > 0 %}SUM(DISTINCT re_total){% else %}70859907{% endif %}"
        },
        "rating%",
        "minute/user/day"
      ],
      "all_columns": [],
      "percent_metrics": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": null,
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_7acpelzezr6_d65o9tb5yn",
          "isExtra": false,
          "isNew": false,
          "operator": "IS NOT NULL",
          "operatorId": "IS_NOT_NULL",
          "sqlExpression": null,
          "subject": "channel_name_tvd"
        },
        {
          "clause": "WHERE",
          "comparator": [
            null
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_eamx6qodyft_xoe6a641ofg",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "event_category_name"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_tnsjonat8i_zjb04xmv6s",
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
        "REACH (%)": {
          "d3NumberFormat": ",.2f"
        },
        "ave_reach": {
          "d3NumberFormat": ",d"
        },
        "minute/user/day": {
          "d3NumberFormat": ",d"
        },
        "rating": {
          "d3NumberFormat": ",d"
        },
        "rating%": {
          "d3NumberFormat": ",.2f"
        }
      },
      "show_cell_bars": false,
      "color_pn": true,
      "comparison_color_scheme": "Green",
      "conditional_formatting": [
        {
          "colorScheme": "#ACE1C4",
          "column": "rating",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "rating%",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "ave_reach",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "REACH (%)",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "minute/user/day",
          "operator": "None"
        }
      ],
      "comparison_type": "values",
      "dashboards": [
        45,
        39
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 406,
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