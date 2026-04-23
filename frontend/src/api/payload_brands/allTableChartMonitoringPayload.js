export const allTableChartMonitoringPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A614%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 204,
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
          "week",
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Ngày",
            "sqlExpression": "date"
          },
          "channel_name_tvd",
          {
            "expressionType": "SQL",
            "label": "Mã giờ",
            "sqlExpression": "ads_code"
          },
          "spot_start_time",
          "spot_end_time",
          "program_name",
          "duration",
          "break_in_program",
          "position_in_break",
          "campaign_name",
          "spot_type",
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Ngành hàng/ Group",
            "sqlExpression": "group"
          },
          "product",
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Nhãn hàng/ Brand",
            "sqlExpression": "brand"
          },
          "advertiser"
        ],
        "metrics": [
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-31T13:39:54.301388",
              "column_name": "price",
              "created_on": "2025-12-31T13:39:54.301385",
              "description": null,
              "expression": null,
              "extra": "{}",
              "filterable": true,
              "groupby": true,
              "id": 2644,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "DOUBLE",
              "type_generic": 0,
              "uuid": "d574f065-dabc-44bf-b783-629e5fdfe768",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Chi phí (triệu VND)",
            "optionName": "metric_j8hhpgdhil_bjx8lrm2ls",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-31T13:39:54.306324",
              "column_name": "reach",
              "created_on": "2025-12-31T13:39:54.306319",
              "description": null,
              "expression": null,
              "extra": "{}",
              "filterable": true,
              "groupby": true,
              "id": 2645,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "e4e566b4-dc9a-4e3f-bd49-c0964c748ddc",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Reach",
            "optionName": "metric_e8gouw370w_ldd25klq8f",
            "sqlExpression": null
          }
        ],
        "orderby": [
          [
            {
              "aggregate": null,
              "column": null,
              "datasourceWarning": false,
              "expressionType": "SQL",
              "hasCustomLabel": false,
              "label": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time",
              "optionName": "metric_q6r31un8nqq_o1r3rm6py1",
              "sqlExpression": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time"
            },
            true
          ]
        ],
        "annotation_layers": [],
        "row_limit": 10000,
        "series_limit": 0,
        "series_limit_metric": {
          "aggregate": null,
          "column": null,
          "datasourceWarning": false,
          "expressionType": "SQL",
          "hasCustomLabel": false,
          "label": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time",
          "optionName": "metric_q6r31un8nqq_o1r3rm6py1",
          "sqlExpression": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time"
        },
        "order_desc": false,
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
              "changed_on": "2025-12-31T13:39:54.301388",
              "column_name": "price",
              "created_on": "2025-12-31T13:39:54.301385",
              "description": null,
              "expression": null,
              "extra": "{}",
              "filterable": true,
              "groupby": true,
              "id": 2644,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "DOUBLE",
              "type_generic": 0,
              "uuid": "d574f065-dabc-44bf-b783-629e5fdfe768",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Chi phí (triệu VND)",
            "optionName": "metric_j8hhpgdhil_bjx8lrm2ls",
            "sqlExpression": null
          },
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2025-12-31T13:39:54.306324",
              "column_name": "reach",
              "created_on": "2025-12-31T13:39:54.306319",
              "description": null,
              "expression": null,
              "extra": "{}",
              "filterable": true,
              "groupby": true,
              "id": 2645,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "e4e566b4-dc9a-4e3f-bd49-c0964c748ddc",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": true,
            "label": "Reach",
            "optionName": "metric_e8gouw370w_ldd25klq8f",
            "sqlExpression": null
          }
        ],
        "annotation_layers": [],
        "row_limit": 0,
        "row_offset": 0,
        "series_limit": 0,
        "series_limit_metric": {
          "aggregate": null,
          "column": null,
          "datasourceWarning": false,
          "expressionType": "SQL",
          "hasCustomLabel": false,
          "label": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time",
          "optionName": "metric_q6r31un8nqq_o1r3rm6py1",
          "sqlExpression": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time"
        },
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [],
        "time_offsets": []
      }
    ],
    "form_data": {
      "datasource": "204__table",
      "viz_type": "table",
      "slice_id": 614,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "week",
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Ngày",
          "sqlExpression": "date"
        },
        "channel_name_tvd",
        {
          "expressionType": "SQL",
          "label": "Mã giờ",
          "sqlExpression": "ads_code"
        },
        "spot_start_time",
        "spot_end_time",
        "program_name",
        "duration",
        "break_in_program",
        "position_in_break",
        "campaign_name",
        "spot_type",
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Ngành hàng/ Group",
          "sqlExpression": "group"
        },
        "product",
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Nhãn hàng/ Brand",
          "sqlExpression": "brand"
        },
        "advertiser"
      ],
      "time_grain_sqla": "P1D",
      "temporal_columns_lookup": {
        "date": true
      },
      "metrics": [
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-31T13:39:54.301388",
            "column_name": "price",
            "created_on": "2025-12-31T13:39:54.301385",
            "description": null,
            "expression": null,
            "extra": "{}",
            "filterable": true,
            "groupby": true,
            "id": 2644,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "DOUBLE",
            "type_generic": 0,
            "uuid": "d574f065-dabc-44bf-b783-629e5fdfe768",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Chi phí (triệu VND)",
          "optionName": "metric_j8hhpgdhil_bjx8lrm2ls",
          "sqlExpression": null
        },
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2025-12-31T13:39:54.306324",
            "column_name": "reach",
            "created_on": "2025-12-31T13:39:54.306319",
            "description": null,
            "expression": null,
            "extra": "{}",
            "filterable": true,
            "groupby": true,
            "id": 2645,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "e4e566b4-dc9a-4e3f-bd49-c0964c748ddc",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": true,
          "label": "Reach",
          "optionName": "metric_e8gouw370w_ldd25klq8f",
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
      "timeseries_limit_metric": {
        "aggregate": null,
        "column": null,
        "datasourceWarning": false,
        "expressionType": "SQL",
        "hasCustomLabel": false,
        "label": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time",
        "optionName": "metric_q6r31un8nqq_o1r3rm6py1",
        "sqlExpression": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time"
      },
      "order_by_cols": [],
      "row_limit": 10000,
      "server_page_length": 10,
      "order_desc": false,
      "show_totals": true,
      "table_timestamp_format": "smart_date",
      "include_search": true,
      "allow_render_html": true,
      "column_config": {
        "Chi phí (triệu VND)": {
          "d3NumberFormat": ",.2f"
        },
        "Ngày": {
          "d3TimeFormat": "%d/%m/%Y"
        },
        "Reach": {
          "d3NumberFormat": ",d"
        }
      },
      "show_cell_bars": false,
      "color_pn": true,
      "comparison_color_scheme": "Green",
      "conditional_formatting": [
        {
          "colorScheme": "#ACE1C4",
          "column": "Reach",
          "operator": "None"
        }
      ],
      "comparison_type": "values",
      "dashboards": [
        49
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 614,
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
        "1.Sáng (0h - 11h)",
        "2.Trưa (11h - 14h)",
        "3.Chiều (14h - 18h)",
        "4.Tối (18h - 24h)",
        "AJINOMOTO VIETN...",
        "AJINOMOTO VIETNAM",
        "BINH DIEN FERTI...",
        "BONCHA (RTD GREEN TEA)",
        "BRG GROUP",
        "CASTROL BP PETC...",
        "CHIN-SU (CHILI SAUCE)",
        "COCA-COLA VIETN...",
        "COLGATE-PALMOLI...",
        "CONG TY CO PHAN...",
        "CONG TY CP TAP ...",
        "CONG TY HONDA V...",
        "CONG TY TNHH AM...",
        "CONG TY TNHH BE...",
        "CONG TY TNHH DA...",
        "CONG TY TNHH DU...",
        "CONG TY TNHH HA...",
        "CONG TY TNHH KI...",
        "CONG TY TNHH ME...",
        "CONG TY TNHH MO...",
        "CONG TY TNHH UN...",
        "DONG NAM A JS B...",
        "DONG TAY INVEST...",
        "Dành cho trẻ em",
        "ECO PHARMACY JS...",
        "FOBIC CO., LTD",
        "FORIPHARM (NO.3...",
        "FRIESLANDCAMPIN...",
        "GLAXO SMITHKLIN...",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HANOI BEVERAGE ...",
        "HCMC HOUSING DE...",
        "HISAMITSU VIETN...",
        "HISMART",
        "HOA LINH PHARMA...",
        "HOA PHAT STEEL ...",
        "HYUNDAI THANH C...",
        "IMC (INT'L MEDI...",
        "KANGAROO GROUP",
        "KOKOMI SNACKING",
        "LONG HAI CO., L...",
        "MASAN CONSUMER ...",
        "MIKADO TECHNOLO...",
        "MORINAGA",
        "NAM HA PHARMA J...",
        "NESTLE NAN",
        "NESTLE VIETNAM ...",
        "NGAN HANG TMCP ...",
        "P&G VIETNAM CO....",
        "PETROVIETNAM",
        "PETROVIETNAM FE...",
        "Phim dài tập",
        "Quảng bá",
        "Quảng cáo",
        "ROHTO MENTHOLAT...",
        "SAIGON TOURIST ...",
        "SAM NHUNG BO THAN TW3 (ORIENTAL KIDNEY RESTORATIVE MEDICINE)",
        "SANOFI-AVENTIS ...",
        "SKODA AUTO A.S",
        "SUN GROUP CORPO...",
        "SUNTORY PEPSICO...",
        "TAM ANH HOSPITA...",
        "TAM BINH (DRINK SUPP.)",
        "TAM BINH PHARMA...",
        "TAN HIEP PHAT B...",
        "TH MILK FOOD JS...",
        "TH TRUE MILK (FRESH MILK)",
        "THAM MY VIEN KA...",
        "TIEN PHONG PLAS...",
        "TRAPHACO JSC",
        "TRUONG HAI AUTO...",
        "TRUONG HAI GROU...",
        "TW3 PHARMA TRAD...",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "UNIBEN JS CO.",
        "UNILEVER VIETNA...",
        "URC (UNIVERSAL ...",
        "VIETNAM FOOD IN...",
        "VIETNAM POST & ...",
        "VINAMILK CORPOR...",
        "VINASOY",
        "VINH GIA PHARM ...",
        "VP BANK (VIETNA...",
        "VTV Cần Thơ",
        "VTV1",
        "VTV2",
        "VTV3",
        "VTV4",
        "VTV8",
        "VTV9",
        "WIPRO CONSUMER ...",
        "YAKULT VIETNAM ...",
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