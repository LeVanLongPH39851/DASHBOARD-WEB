export const reachBarChartBrandChannelPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A605%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 201,
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
            "label": "Brand",
            "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
          },
          "channel_name_tvd"
        ],
        "metrics": [
          "reach"
        ],
        "orderby": [
          [
            "reach",
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
                "Brand"
              ],
              "columns": [
                "channel_name_tvd"
              ],
              "aggregates": {
                "reach": {
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
                "reach": null
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
      "datasource": "201__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 605,
      "url_params": {},
      "x_axis": {
        "expressionType": "SQL",
        "label": "Brand",
        "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "sum",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "reach"
      ],
      "groupby": [
        "channel_name_tvd"
      ],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "expressionType": "SIMPLE",
          "operator": "TEMPORAL_RANGE",
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
      "y_axis_title": "",
      "y_axis_title_margin": 15,
      "y_axis_title_position": "Left",
      "sort_series_type": "sum",
      "color_scheme": "supersetColors",
      "time_shift_color": true,
      "show_value": true,
      "stack": "Stack",
      "only_total": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "top",
      "x_axis_time_format": "smart_date",
      "y_axis_format": ",d",
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
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 605,
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
      "own_color_scheme": "supersetColors",
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