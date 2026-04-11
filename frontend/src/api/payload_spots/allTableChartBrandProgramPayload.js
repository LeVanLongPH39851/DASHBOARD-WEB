export const allTableChartBrandProgramPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A612%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 203,
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
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "brand",
          "program_name"
        ],
        "metrics": [
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T03:56:35.118985",
              "column_name": "no_of_spot",
              "created_on": "2025-12-30T03:56:35.118983",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5121,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "5ab4d775-dba8-4f28-a992-af64d01454d0",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Tổng số spot",
            "optionName": "metric_3u832j7ppns_h78fcnuqcpj",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T04:08:23.679433",
              "column_name": "price",
              "created_on": "2025-12-30T04:08:23.679425",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5127,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "DOUBLE",
              "type_generic": 0,
              "uuid": "3264d6c7-ad20-4328-bcbb-1416cd522d1c",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Chi phí (triệu VND)",
            "optionName": "metric_zicsd7imi7s_2267c4bz4kt",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T03:56:35.119084",
              "column_name": "user_view",
              "created_on": "2025-12-30T03:56:35.119083",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5125,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "922ab6c5-b8ae-44f4-875a-3c9a3b8870f6",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Lượt xem/ Impression",
            "optionName": "metric_6xn7rilwhvo_z2f4z9mpssf",
            "sqlExpression": null
          },
          {
            "aggregate": null,
            "column": null,
            "datasourceWarning": false,
            "expressionType": "SQL",
            "hasCustomLabel": true,
            "label": "Reach",
            "optionName": "metric_lwzcxa27r4t_mbnozy4jlrn",
            "sqlExpression": "BITMAP_UNION_COUNT(reach)"
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T03:56:35.118959",
              "column_name": "grp_percent",
              "created_on": "2025-12-30T03:56:35.118957",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5120,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "NEWDECIMAL",
              "type_generic": null,
              "uuid": "a7a9629e-aa1e-4c67-958c-0b8ef978cc20",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "GRP (%)",
            "optionName": "metric_7v11rbk8zr_bmb0n7llae",
            "sqlExpression": null
          }
        ],
        "orderby": [
          [
            {
              "aggregate": "SUM",
              "column": {
                "advanced_data_type": null,
                "changed_on": "2025-12-30T03:56:35.118985",
                "column_name": "no_of_spot",
                "created_on": "2025-12-30T03:56:35.118983",
                "description": null,
                "expression": null,
                "extra": "{\"warning_markdown\":null}",
                "filterable": true,
                "groupby": true,
                "id": 5121,
                "is_active": true,
                "is_dttm": false,
                "python_date_format": null,
                "type": "LONGLONG",
                "type_generic": 0,
                "uuid": "5ab4d775-dba8-4f28-a992-af64d01454d0",
                "verbose_name": null
              },
              "datasourceWarning": false,
              "expressionType": "SIMPLE",
              "hasCustomLabel": true,
              "label": "Tổng số spot",
              "optionName": "metric_3u832j7ppns_h78fcnuqcpj",
              "sqlExpression": null
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
      },
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
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [],
        "metrics": [
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T03:56:35.118985",
              "column_name": "no_of_spot",
              "created_on": "2025-12-30T03:56:35.118983",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5121,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "5ab4d775-dba8-4f28-a992-af64d01454d0",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Tổng số spot",
            "optionName": "metric_3u832j7ppns_h78fcnuqcpj",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T04:08:23.679433",
              "column_name": "price",
              "created_on": "2025-12-30T04:08:23.679425",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5127,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "DOUBLE",
              "type_generic": 0,
              "uuid": "3264d6c7-ad20-4328-bcbb-1416cd522d1c",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Chi phí (triệu VND)",
            "optionName": "metric_zicsd7imi7s_2267c4bz4kt",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T03:56:35.119084",
              "column_name": "user_view",
              "created_on": "2025-12-30T03:56:35.119083",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5125,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "922ab6c5-b8ae-44f4-875a-3c9a3b8870f6",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Lượt xem/ Impression",
            "optionName": "metric_6xn7rilwhvo_z2f4z9mpssf",
            "sqlExpression": null
          },
          {
            "aggregate": null,
            "column": null,
            "datasourceWarning": false,
            "expressionType": "SQL",
            "hasCustomLabel": true,
            "label": "Reach",
            "optionName": "metric_lwzcxa27r4t_mbnozy4jlrn",
            "sqlExpression": "BITMAP_UNION_COUNT(reach)"
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-30T03:56:35.118959",
              "column_name": "grp_percent",
              "created_on": "2025-12-30T03:56:35.118957",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5120,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "NEWDECIMAL",
              "type_generic": null,
              "uuid": "a7a9629e-aa1e-4c67-958c-0b8ef978cc20",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "GRP (%)",
            "optionName": "metric_7v11rbk8zr_bmb0n7llae",
            "sqlExpression": null
          }
        ],
        "annotation_layers": [],
        "row_limit": 0,
        "row_offset": 0,
        "series_limit": 0,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [],
        "time_offsets": []
      }
    ],
    "form_data": {
      "datasource": "203__table",
      "viz_type": "table",
      "slice_id": 612,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "brand",
        "program_name"
      ],
      "temporal_columns_lookup": {},
      "metrics": [
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-30T03:56:35.118985",
            "column_name": "no_of_spot",
            "created_on": "2025-12-30T03:56:35.118983",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5121,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "5ab4d775-dba8-4f28-a992-af64d01454d0",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Tổng số spot",
          "optionName": "metric_3u832j7ppns_h78fcnuqcpj",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-30T04:08:23.679433",
            "column_name": "price",
            "created_on": "2025-12-30T04:08:23.679425",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5127,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "DOUBLE",
            "type_generic": 0,
            "uuid": "3264d6c7-ad20-4328-bcbb-1416cd522d1c",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Chi phí (triệu VND)",
          "optionName": "metric_zicsd7imi7s_2267c4bz4kt",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-30T03:56:35.119084",
            "column_name": "user_view",
            "created_on": "2025-12-30T03:56:35.119083",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5125,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "922ab6c5-b8ae-44f4-875a-3c9a3b8870f6",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Lượt xem/ Impression",
          "optionName": "metric_6xn7rilwhvo_z2f4z9mpssf",
          "sqlExpression": null
        },
        {
          "aggregate": null,
          "column": null,
          "datasourceWarning": false,
          "expressionType": "SQL",
          "hasCustomLabel": true,
          "label": "Reach",
          "optionName": "metric_lwzcxa27r4t_mbnozy4jlrn",
          "sqlExpression": "BITMAP_UNION_COUNT(reach)"
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-30T03:56:35.118959",
            "column_name": "grp_percent",
            "created_on": "2025-12-30T03:56:35.118957",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5120,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "NEWDECIMAL",
            "type_generic": null,
            "uuid": "a7a9629e-aa1e-4c67-958c-0b8ef978cc20",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "GRP (%)",
          "optionName": "metric_7v11rbk8zr_bmb0n7llae",
          "sqlExpression": null
        }
      ],
      "all_columns": [],
      "percent_metrics": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "expressionType": "SIMPLE",
          "operator": "TEMPORAL_RANGE",
          "subject": "date"
        }
      ],
      "order_by_cols": [],
      "row_limit": 50000,
      "server_page_length": 10,
      "order_desc": true,
      "show_totals": true,
      "table_timestamp_format": "smart_date",
      "include_search": true,
      "allow_render_html": true,
      "column_config": {
        "Chi phí (triệu VND)": {
          "d3NumberFormat": ",.2f"
        },
        "GRP (%)": {
          "d3NumberFormat": ",.1f"
        },
        "Lượt xem/ Impression": {
          "d3NumberFormat": ",d"
        },
        "Reach": {
          "d3NumberFormat": ",d"
        },
        "Tổng số spot": {
          "d3NumberFormat": ",d"
        }
      },
      "show_cell_bars": false,
      "color_pn": true,
      "comparison_color_scheme": "Green",
      "conditional_formatting": [
        {
          "colorScheme": "#ACE1C4",
          "column": "Tổng số spot",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "Chi phí (triệu VND)",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "Lượt xem/ Impression",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "Reach",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "GRP (%)",
          "operator": "None"
        }
      ],
      "comparison_type": "values",
      "annotation_layers": [],
      "dashboards": [
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 612,
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
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};