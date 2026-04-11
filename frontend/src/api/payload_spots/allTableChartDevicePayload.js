export const allTableChartDevicePayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A620%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 205,
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
          "Ngày"
        ],
        "metrics": [
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "certification_details": null,
              "certified_by": null,
              "column_name": "Số lượng",
              "description": null,
              "expression": null,
              "filterable": true,
              "groupby": true,
              "id": 3288,
              "is_certified": false,
              "is_dttm": false,
              "python_date_format": null,
              "type": "UInt64",
              "type_generic": 0,
              "verbose_name": null,
              "warning_markdown": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Số lượng",
            "optionName": "metric_t27z7c44mkp_2rmny59s50o",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "certification_details": null,
              "certified_by": null,
              "column_name": "Thời lượng",
              "description": null,
              "expression": null,
              "filterable": true,
              "groupby": true,
              "id": 3289,
              "is_certified": false,
              "is_dttm": false,
              "python_date_format": null,
              "type": "Float64",
              "type_generic": 0,
              "verbose_name": null,
              "warning_markdown": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Thời lượng",
            "optionName": "metric_i82fow8at_q9xlzq1tg9",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "certification_details": null,
              "certified_by": null,
              "column_name": "Active device",
              "description": null,
              "expression": null,
              "filterable": true,
              "groupby": true,
              "id": 3287,
              "is_certified": false,
              "is_dttm": false,
              "python_date_format": null,
              "type": "Nullable(UInt64)",
              "type_generic": 0,
              "verbose_name": null,
              "warning_markdown": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Active device",
            "optionName": "metric_8hyev0gjywj_gngnfhw4lr",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "certification_details": null,
              "certified_by": null,
              "column_name": "REACH 1+",
              "description": null,
              "expression": null,
              "filterable": true,
              "groupby": true,
              "id": 3282,
              "is_certified": false,
              "is_dttm": false,
              "python_date_format": null,
              "type": "Nullable(Float64)",
              "type_generic": null,
              "verbose_name": null,
              "warning_markdown": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Reach 1+ (%)",
            "optionName": "metric_i8euqki2iwn_mqr31qlzt4k",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "certification_details": null,
              "certified_by": null,
              "column_name": "REACH 2+",
              "description": null,
              "expression": null,
              "filterable": true,
              "groupby": true,
              "id": 3283,
              "is_certified": false,
              "is_dttm": false,
              "python_date_format": null,
              "type": "Nullable(Float64)",
              "type_generic": null,
              "verbose_name": null,
              "warning_markdown": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Reach 2+ (%)",
            "optionName": "metric_okr7q9fdss_clx42hxiw8e",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "certification_details": null,
              "certified_by": null,
              "column_name": "REACH 3+",
              "description": null,
              "expression": null,
              "filterable": true,
              "groupby": true,
              "id": 3284,
              "is_certified": false,
              "is_dttm": false,
              "python_date_format": null,
              "type": "Nullable(Float64)",
              "type_generic": null,
              "verbose_name": null,
              "warning_markdown": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Reach 3 + (%)",
            "optionName": "metric_z08tdndzmfd_dvz632univ",
            "sqlExpression": null
          }
        ],
        "orderby": [
          [
            {
              "aggregate": "MAX",
              "column": {
                "advanced_data_type": null,
                "changed_on": "2025-11-17T16:43:18.473809",
                "column_name": "date_sort",
                "created_on": "2025-11-17T16:43:18.473800",
                "description": null,
                "expression": null,
                "extra": "{}",
                "filterable": true,
                "groupby": true,
                "id": 3451,
                "is_active": true,
                "is_dttm": true,
                "python_date_format": null,
                "type": "Date",
                "type_generic": 2,
                "uuid": "bf5b11f8-f540-44c1-86d8-e4bf020c4e43",
                "verbose_name": null
              },
              "datasourceWarning": false,
              "expressionType": "SIMPLE",
              "hasCustomLabel": false,
              "label": "MAX(date_sort)",
              "optionName": "metric_zdbj8k8tru_75bpo5b5xli",
              "sqlExpression": null
            },
            true
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_limit": 0,
        "series_limit_metric": {
          "aggregate": "MAX",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-11-17T16:43:18.473809",
            "column_name": "date_sort",
            "created_on": "2025-11-17T16:43:18.473800",
            "description": null,
            "expression": null,
            "extra": "{}",
            "filterable": true,
            "groupby": true,
            "id": 3451,
            "is_active": true,
            "is_dttm": true,
            "python_date_format": null,
            "type": "Date",
            "type_generic": 2,
            "uuid": "bf5b11f8-f540-44c1-86d8-e4bf020c4e43",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": false,
          "label": "MAX(date_sort)",
          "optionName": "metric_zdbj8k8tru_75bpo5b5xli",
          "sqlExpression": null
        },
        "order_desc": false,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [],
        "time_offsets": []
      }
    ],
    "form_data": {
      "datasource": "205__table",
      "viz_type": "table",
      "slice_id": 620,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "Ngày"
      ],
      "temporal_columns_lookup": {
        "date": true,
        "date_sort": true
      },
      "metrics": [
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "certification_details": null,
            "certified_by": null,
            "column_name": "Số lượng",
            "description": null,
            "expression": null,
            "filterable": true,
            "groupby": true,
            "id": 3288,
            "is_certified": false,
            "is_dttm": false,
            "python_date_format": null,
            "type": "UInt64",
            "type_generic": 0,
            "verbose_name": null,
            "warning_markdown": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Số lượng",
          "optionName": "metric_t27z7c44mkp_2rmny59s50o",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "certification_details": null,
            "certified_by": null,
            "column_name": "Thời lượng",
            "description": null,
            "expression": null,
            "filterable": true,
            "groupby": true,
            "id": 3289,
            "is_certified": false,
            "is_dttm": false,
            "python_date_format": null,
            "type": "Float64",
            "type_generic": 0,
            "verbose_name": null,
            "warning_markdown": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Thời lượng",
          "optionName": "metric_i82fow8at_q9xlzq1tg9",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "certification_details": null,
            "certified_by": null,
            "column_name": "Active device",
            "description": null,
            "expression": null,
            "filterable": true,
            "groupby": true,
            "id": 3287,
            "is_certified": false,
            "is_dttm": false,
            "python_date_format": null,
            "type": "Nullable(UInt64)",
            "type_generic": 0,
            "verbose_name": null,
            "warning_markdown": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Active device",
          "optionName": "metric_8hyev0gjywj_gngnfhw4lr",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "certification_details": null,
            "certified_by": null,
            "column_name": "REACH 1+",
            "description": null,
            "expression": null,
            "filterable": true,
            "groupby": true,
            "id": 3282,
            "is_certified": false,
            "is_dttm": false,
            "python_date_format": null,
            "type": "Nullable(Float64)",
            "type_generic": null,
            "verbose_name": null,
            "warning_markdown": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Reach 1+ (%)",
          "optionName": "metric_i8euqki2iwn_mqr31qlzt4k",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "certification_details": null,
            "certified_by": null,
            "column_name": "REACH 2+",
            "description": null,
            "expression": null,
            "filterable": true,
            "groupby": true,
            "id": 3283,
            "is_certified": false,
            "is_dttm": false,
            "python_date_format": null,
            "type": "Nullable(Float64)",
            "type_generic": null,
            "verbose_name": null,
            "warning_markdown": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Reach 2+ (%)",
          "optionName": "metric_okr7q9fdss_clx42hxiw8e",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "certification_details": null,
            "certified_by": null,
            "column_name": "REACH 3+",
            "description": null,
            "expression": null,
            "filterable": true,
            "groupby": true,
            "id": 3284,
            "is_certified": false,
            "is_dttm": false,
            "python_date_format": null,
            "type": "Nullable(Float64)",
            "type_generic": null,
            "verbose_name": null,
            "warning_markdown": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Reach 3 + (%)",
          "optionName": "metric_z08tdndzmfd_dvz632univ",
          "sqlExpression": null
        }
      ],
      "all_columns": [],
      "percent_metrics": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_unohv6wh01m_50zzhq6g2yn",
          "isExtra": false,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "operatorId": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
      "timeseries_limit_metric": {
        "aggregate": "MAX",
        "column": {
          "advanced_data_type": null,
          "changed_on": "2025-11-17T16:43:18.473809",
          "column_name": "date_sort",
          "created_on": "2025-11-17T16:43:18.473800",
          "description": null,
          "expression": null,
          "extra": "{}",
          "filterable": true,
          "groupby": true,
          "id": 3451,
          "is_active": true,
          "is_dttm": true,
          "python_date_format": null,
          "type": "Date",
          "type_generic": 2,
          "uuid": "bf5b11f8-f540-44c1-86d8-e4bf020c4e43",
          "verbose_name": null
        },
        "datasourceWarning": false,
        "expressionType": "SIMPLE",
        "hasCustomLabel": false,
        "label": "MAX(date_sort)",
        "optionName": "metric_zdbj8k8tru_75bpo5b5xli",
        "sqlExpression": null
      },
      "order_by_cols": [],
      "row_limit": 50000,
      "server_page_length": 10,
      "order_desc": false,
      "table_timestamp_format": "smart_date",
      "include_search": true,
      "allow_render_html": true,
      "column_config": {
        "Active device": {
          "d3NumberFormat": ",d"
        },
        "Reach 1+ (%)": {
          "d3NumberFormat": ",.2f"
        },
        "Reach 2+ (%)": {
          "d3NumberFormat": ",.2f"
        },
        "Reach 3 + (%)": {
          "d3NumberFormat": ",.2f"
        },
        "Số lượng": {
          "d3NumberFormat": ",d"
        },
        "Thời lượng": {
          "d3NumberFormat": ",.2f"
        }
      },
      "show_cell_bars": true,
      "color_pn": true,
      "comparison_color_scheme": "Green",
      "conditional_formatting": [],
      "comparison_type": "values",
      "annotation_layers": [],
      "dashboards": [
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 620,
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