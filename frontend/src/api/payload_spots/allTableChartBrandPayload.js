export const allTableChartBrandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A611%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 202,
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
          "brand"
        ],
        "metrics": [
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308774",
              "column_name": "spot_5s",
              "created_on": "2025-12-29T15:11:26.308772",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5110,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "e6c6d8df-d934-47a9-9f57-be4bee7d72a7",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "5s",
            "optionName": "metric_lt2cjpkmml_75ruk66dvi4",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308684",
              "column_name": "spot_15s",
              "created_on": "2025-12-29T15:11:26.308682",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5108,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "7b94c806-7416-4b26-9b1a-f47f412d95a0",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "15s",
            "optionName": "metric_der8ngrocrf_gp66rrtciw",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308708",
              "column_name": "spot_30s",
              "created_on": "2025-12-29T15:11:26.308707",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5109,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "3df9b7a4-6098-4bbd-8a5e-f1f000fca520",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "30s",
            "optionName": "metric_6f0mhkcma2q_v570zjz7jj",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308800",
              "column_name": "spot_others",
              "created_on": "2025-12-29T15:11:26.308798",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5111,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "006bd93c-7c01-483c-affa-35fb58ec90ab",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Thời lượng khác",
            "optionName": "metric_j8gphks9kv8_srzm1ylud8",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308599",
              "column_name": "no_of_spot",
              "created_on": "2025-12-29T15:11:26.308597",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5105,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "470c896f-97a3-41fa-8385-26ffd65b890f",
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
              "changed_on": "2025-12-29T15:11:26.308572",
              "column_name": "grp_percent",
              "created_on": "2025-12-29T15:11:26.308570",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5104,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "NEWDECIMAL",
              "type_generic": null,
              "uuid": "0ffce766-5316-4e4e-816a-9aaf8be2c279",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "GRP (%)",
            "optionName": "metric_7v11rbk8zr_bmb0n7llae",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308840",
              "column_name": "user_view",
              "created_on": "2025-12-29T15:11:26.308838",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5112,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "7d078a29-cf07-4699-8281-a57953741d09",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Lượt xem/ Impression",
            "optionName": "metric_v7kx3zf7azl_udvive6uifp",
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
          }
        ],
        "orderby": [
          [
            {
              "aggregate": "SUM",
              "column": {
                "advanced_data_type": null,
                "changed_on": "2025-12-29T15:11:26.308774",
                "column_name": "spot_5s",
                "created_on": "2025-12-29T15:11:26.308772",
                "description": null,
                "expression": null,
                "extra": "{\"warning_markdown\":null}",
                "filterable": true,
                "groupby": true,
                "id": 5110,
                "is_active": true,
                "is_dttm": false,
                "python_date_format": null,
                "type": "LONGLONG",
                "type_generic": 0,
                "uuid": "e6c6d8df-d934-47a9-9f57-be4bee7d72a7",
                "verbose_name": null
              },
              "datasourceWarning": false,
              "expressionType": "SIMPLE",
              "hasCustomLabel": true,
              "label": "5s",
              "optionName": "metric_lt2cjpkmml_75ruk66dvi4",
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
              "changed_on": "2025-12-29T15:11:26.308774",
              "column_name": "spot_5s",
              "created_on": "2025-12-29T15:11:26.308772",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5110,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "e6c6d8df-d934-47a9-9f57-be4bee7d72a7",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "5s",
            "optionName": "metric_lt2cjpkmml_75ruk66dvi4",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308684",
              "column_name": "spot_15s",
              "created_on": "2025-12-29T15:11:26.308682",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5108,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "7b94c806-7416-4b26-9b1a-f47f412d95a0",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "15s",
            "optionName": "metric_der8ngrocrf_gp66rrtciw",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308708",
              "column_name": "spot_30s",
              "created_on": "2025-12-29T15:11:26.308707",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5109,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "3df9b7a4-6098-4bbd-8a5e-f1f000fca520",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "30s",
            "optionName": "metric_6f0mhkcma2q_v570zjz7jj",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308800",
              "column_name": "spot_others",
              "created_on": "2025-12-29T15:11:26.308798",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5111,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "006bd93c-7c01-483c-affa-35fb58ec90ab",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Thời lượng khác",
            "optionName": "metric_j8gphks9kv8_srzm1ylud8",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308599",
              "column_name": "no_of_spot",
              "created_on": "2025-12-29T15:11:26.308597",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5105,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "470c896f-97a3-41fa-8385-26ffd65b890f",
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
              "changed_on": "2025-12-29T15:11:26.308572",
              "column_name": "grp_percent",
              "created_on": "2025-12-29T15:11:26.308570",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5104,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "NEWDECIMAL",
              "type_generic": null,
              "uuid": "0ffce766-5316-4e4e-816a-9aaf8be2c279",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "GRP (%)",
            "optionName": "metric_7v11rbk8zr_bmb0n7llae",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-29T15:11:26.308840",
              "column_name": "user_view",
              "created_on": "2025-12-29T15:11:26.308838",
              "description": null,
              "expression": null,
              "extra": "{\"warning_markdown\":null}",
              "filterable": true,
              "groupby": true,
              "id": 5112,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "7d078a29-cf07-4699-8281-a57953741d09",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Lượt xem/ Impression",
            "optionName": "metric_v7kx3zf7azl_udvive6uifp",
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
      "datasource": "202__table",
      "viz_type": "table",
      "slice_id": 611,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "brand"
      ],
      "temporal_columns_lookup": {},
      "metrics": [
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-29T15:11:26.308774",
            "column_name": "spot_5s",
            "created_on": "2025-12-29T15:11:26.308772",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5110,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "e6c6d8df-d934-47a9-9f57-be4bee7d72a7",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "5s",
          "optionName": "metric_lt2cjpkmml_75ruk66dvi4",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-29T15:11:26.308684",
            "column_name": "spot_15s",
            "created_on": "2025-12-29T15:11:26.308682",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5108,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "7b94c806-7416-4b26-9b1a-f47f412d95a0",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "15s",
          "optionName": "metric_der8ngrocrf_gp66rrtciw",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-29T15:11:26.308708",
            "column_name": "spot_30s",
            "created_on": "2025-12-29T15:11:26.308707",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5109,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "3df9b7a4-6098-4bbd-8a5e-f1f000fca520",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "30s",
          "optionName": "metric_6f0mhkcma2q_v570zjz7jj",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-29T15:11:26.308800",
            "column_name": "spot_others",
            "created_on": "2025-12-29T15:11:26.308798",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5111,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "006bd93c-7c01-483c-affa-35fb58ec90ab",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Thời lượng khác",
          "optionName": "metric_j8gphks9kv8_srzm1ylud8",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-29T15:11:26.308599",
            "column_name": "no_of_spot",
            "created_on": "2025-12-29T15:11:26.308597",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5105,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "470c896f-97a3-41fa-8385-26ffd65b890f",
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
            "changed_on": "2025-12-29T15:11:26.308572",
            "column_name": "grp_percent",
            "created_on": "2025-12-29T15:11:26.308570",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5104,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "NEWDECIMAL",
            "type_generic": null,
            "uuid": "0ffce766-5316-4e4e-816a-9aaf8be2c279",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "GRP (%)",
          "optionName": "metric_7v11rbk8zr_bmb0n7llae",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-29T15:11:26.308840",
            "column_name": "user_view",
            "created_on": "2025-12-29T15:11:26.308838",
            "description": null,
            "expression": null,
            "extra": "{\"warning_markdown\":null}",
            "filterable": true,
            "groupby": true,
            "id": 5112,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "7d078a29-cf07-4699-8281-a57953741d09",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Lượt xem/ Impression",
          "optionName": "metric_v7kx3zf7azl_udvive6uifp",
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
        "15s": {
          "d3NumberFormat": ",d"
        },
        "30s": {
          "d3NumberFormat": ",d"
        },
        "5s": {
          "d3NumberFormat": ",d"
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
        "Thời lượng khác": {
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
          "column": "5s",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "15s",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "30s",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "Thời lượng khác",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "Tổng số spot",
          "operator": "None"
        },
        {
          "colorScheme": "#ACE1C4",
          "column": "GRP (%)",
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
      "chart_id": 611,
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
      "result_type": "full",
      heavy: true
    },
    "result_format": "json",
    "result_type": "full"
  }
};