export const allTableChartDevicePayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A899%7D&dashboard_id=52`,
  payload: {
    "datasource": {
      "id": 269,
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
            "val": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, DAY)"
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
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_limit": 0,
        "order_desc": false,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [],
        "time_offsets": []
      }
    ],
    "form_data": {
      "datasource": "269__table",
      "viz_type": "table",
      "slice_id": 899,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "Ngày"
      ],
      "temporal_columns_lookup": {
        "date": true
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
          "comparator": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, DAY)",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_dhy0cixsop_0upjv1lsej7h",
          "isExtra": false,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
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
      "dashboards": [
        52
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 899,
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
        "AJINOMOTO VIETNAM",
        "BOGANIC PREMIUM (LIVER SUPP.)",
        "CA HOI NA UY SFN",
        "CASPER (AIR CONDITIONER)",
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HOAT HUYET DUONG NAO-TRAPHACO (TRAD. BRAIN HEALTH MED.)",
        "IPHONE - APPLE WATCH",
        "KANGAROO (WATER FILTER)",
        "MIK GROUP",
        "MOOZI",
        "NGUYEN XUAN (HERBAL SHAMPOO)",
        "NOBLE CRYSTAL LONG BIEN",
        "Phim dài tập",
        "Quảng bá",
        "Quảng cáo",
        "SUN GROUP VIETNAM (REAL ESTATE COMPANY)",
        "Sự kiện - Đặc biệt",
        "TAM BINH (DRINK SUPP.)",
        "TECHCOMBANK",
        "THE PARKLAND",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "VINAMILK",
        "VINAMILK (FRESH MILK)",
        "VINHOMES GLOBAL GATE HA LONG",
        "VINHOMES HAI VAN BAY",
        "VPBANK",
        "VPP HAI TIEN",
        "VTV1",
        "VTV10",
        "VTV2",
        "VTV3",
        "VTV4",
        "VTV6",
        "VTV8",
        "VTV9",
        "YAMAHA",
        "price",
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