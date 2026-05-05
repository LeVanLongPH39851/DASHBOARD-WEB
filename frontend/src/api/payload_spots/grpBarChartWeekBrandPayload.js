export const grpBarChartWeekBrandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A767%7D&dashboard_id=52`,
  payload: {
    "datasource": {
      "id": 226,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "brand",
            "op": "NOT IN",
            "val": [
              "active"
            ]
          },
          {
            "col": "week",
            "op": "NOT IN",
            "val": [
              "active"
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
          {
            "columnType": "BASE_AXIS",
            "sqlExpression": "week",
            "label": "week",
            "expressionType": "SQL"
          },
          "brand"
        ],
        "metrics": [
          "grp"
        ],
        "orderby": [
          [
            "grp",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [
          "brand"
        ],
        "series_limit": 10,
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
                "week"
              ],
              "columns": [
                "brand"
              ],
              "aggregates": {
                "grp": {
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
                "grp": null
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
      "datasource": "226__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 767,
      "url_params": {},
      "x_axis": "week",
      "xAxisForceCategorical": false,
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "name",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "grp"
      ],
      "groupby": [
        "brand"
      ],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": [
            "active"
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_1tp6wo9zsjz_wn5lus5ckjm",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "brand"
        },
        {
          "clause": "WHERE",
          "comparator": [
            "active"
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_ejrptmzi2uk_aoinr2mfoh5",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "week"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_cbvyu1psyy_ngvd43uwen",
          "isExtra": true,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
      "limit": 10,
      "order_desc": true,
      "row_limit": 50000,
      "truncate_metric": true,
      "show_empty_columns": true,
      "comparison_type": "values",
      "annotation_layers": [],
      "forecastPeriods": 10,
      "forecastInterval": 0.8,
      "orientation": "vertical",
      "x_axis_title": "Tuần",
      "x_axis_title_margin": 30,
      "y_axis_title_margin": "0",
      "y_axis_title_position": "Left",
      "sort_series_type": "sum",
      "color_scheme": "presetColors",
      "time_shift_color": true,
      "show_value": true,
      "stack": "Stack",
      "only_total": true,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "top",
      "x_axis_time_format": "smart_date",
      "y_axis_format": ",.1f",
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
        52
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 767,
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
        "<NULL>",
        "ABBOTT LABORATO...",
        "ACECOOK VIETNAM...",
        "AGRIBANK VN (VI...",
        "AJINOMOTO VIETN...",
        "BAO THANH (COUGHS FLU)",
        "BENH VIEN PHAP ...",
        "BIDV (BANK FOR ...",
        "BINH DIEN FERTI...",
        "BINH SON REFINI...",
        "BO PHE NAM HA (COUGH DROP SUPP.)",
        "BONCHA (RTD GREEN TEA)",
        "BOTANIA CO., LT...",
        "BRG GROUP",
        "CASPER ELECTRIC...",
        "CASTROL BP PETC...",
        "CHIN-SU FOODS (CORPORATE)",
        "COCA-COLA VIETN...",
        "COLGATE (TOOTHPASTE)",
        "COLGATE-PALMOLI...",
        "COMPACT",
        "CONG TY CO PHAN TAP DOAN TRUONG HAI",
        "CONG TY CO PHAN...",
        "CONG TY CP BANH...",
        "CONG TY CP DAY ...",
        "CONG TY CP TAP ...",
        "CONG TY DUOC PH...",
        "CONG TY HONDA V...",
        "CONG TY TNHH AM...",
        "CONG TY TNHH AP...",
        "CONG TY TNHH BE...",
        "CONG TY TNHH BO...",
        "CONG TY TNHH CA...",
        "CONG TY TNHH CH...",
        "CONG TY TNHH DA...",
        "CONG TY TNHH DU...",
        "CONG TY TNHH GA...",
        "CONG TY TNHH GI...",
        "CONG TY TNHH HA...",
        "CONG TY TNHH ME...",
        "CONG TY TNHH MT...",
        "CONG TY TNHH NA...",
        "CONG TY TNHH SO...",
        "CONG TY TNHH TA...",
        "CONG TY TNHH TM...",
        "CONG TY TNHH TU...",
        "CONG TY TNHH UN...",
        "CÔNG TY CỔ PHẦN...",
        "DANISA",
        "DECOLGEN",
        "DHC GROUP",
        "DONG LUC GROUP",
        "DONG NAM A JS B...",
        "Dành cho trẻ em",
        "ECO PHARMACY JS...",
        "FOBIC CO., LTD",
        "FONTERRA CO-OPE...",
        "FORIPHARM (NO.3...",
        "FRIESLANDCAMPIN...",
        "FUMAKILLA VIETN...",
        "GLAXO SMITHKLIN...",
        "GOODY",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HANOI BEVERAGE ...",
        "HCMC HOUSING DE...",
        "HEINEKEN VIETNA...",
        "HISAMITSU VIETN...",
        "HOA LINH PHARMA...",
        "HOA PHAT (TOLE)",
        "HOA PHAT STEEL ...",
        "HOA SEN GROUP",
        "HOANG MAI PRODU...",
        "HOAT HUYET - NHAT NHAT (TRAD. BRAIN HEALTH MED.)",
        "HONG KONG BEAUT...",
        "HUUNGHI FOODS J...",
        "HYUNDAI THANH C...",
        "I.P VIETNAM CO....",
        "IMC (INT'L MEDI...",
        "KANGAROO GROUP",
        "KHUONG THAO DAN (BONE & JOINT SUPP.)",
        "LEE KUM KEE COM...",
        "LOHACO",
        "LONG HAI CO., L...",
        "LPBANK",
        "MASAN CONSUMER ...",
        "MIKADO TECHNOLO...",
        "MILITARY COMMER...",
        "NAM DUOC JS CO.",
        "NAM HA PHARMA J...",
        "NAM NGU (FISH SAUCE)",
        "NATIONAL PHARMA...",
        "NESTLE VIETNAM ...",
        "NGAN HANG THUON...",
        "NGAN HANG TMCP ...",
        "NHAT NHAT TRADI...",
        "P&G VIETNAM CO....",
        "PEPSICO FOODS V...",
        "PETROVIETNAM",
        "PETROVIETNAM CA...",
        "PHUN XAM TU NHI...",
        "PV GAS - PETROVIETNAM GAS JOINT STOCK CORPORATION",
        "Phim dài tập",
        "Phim điện ảnh",
        "Quảng bá",
        "Quảng cáo",
        "RED BULL VIETNA...",
        "RICHY-KENJU (BISCUIT)",
        "ROCKSTAR (ENERGY DRINKS)",
        "ROHTO MENTHOLAT...",
        "SABECO (SAIGON ...",
        "SAIGON TOURIST ...",
        "SAM NHUNG BO THAN TW3 (ORIENTAL KIDNEY RESTORATIVE MEDICINE)",
        "SANOFI-AVENTIS ...",
        "SHOPEE CO., LTD",
        "SKODA AUTO A.S",
        "SOHACO GROUP",
        "SUN GROUP CORPO...",
        "SUN GROUP VIETNAM (REAL ESTATE COMPANY)",
        "SUN PHUQUOC AIRWAYS",
        "SUNSHINE GROUP",
        "SUNTORY PEPSICO...",
        "Sự kiện - Đặc biệt",
        "TAM ANH HOSPITA...",
        "TAM BINH (DRINK SUPP.)",
        "TAM BINH PHARMA...",
        "TAN HIEP PHAT B...",
        "TECHCOMBANK",
        "TH MILK FOOD JS...",
        "TH TRUE YOGURT (EATING & FLAVOURED YOGHURT)",
        "THAM MY VIEN KA...",
        "THE GIOI DI DON...",
        "THE SOUTHERN FE...",
        "THE SUNSET SUN GRAND CITY HILLSIDE RESIDENCE",
        "THEP VAS",
        "TONG CONG TY CP...",
        "TONG CONG TY VI...",
        "TRAPHACO JSC",
        "TRUONG HAI AUTO...",
        "TRUONG HAI GROU...",
        "TUNG HO STEEL V...",
        "TW3 PHARMA TRAD...",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "UNIBEN JS CO.",
        "UNILEVER VIETNA...",
        "UNIQLO (FASHION)",
        "URC (UNIVERSAL ...",
        "VAS GROUP",
        "VIETCOMBANK",
        "VIETINBANK (VIE...",
        "VIETNAM AIRLINE...",
        "VIETNAM FOOD IN...",
        "VIETNAM NATIONA...",
        "VIETNAM PAYMENT...",
        "VIETNAM POST & ...",
        "VIETTEL CORPORA...",
        "VIFON MI RIEU CUA",
        "VINACAFE BIEN H...",
        "VINAMILK (FRESH MILK)",
        "VINAMILK CORPOR...",
        "VINASOY",
        "VINH GIA PHARM ...",
        "VTV Cần Thơ",
        "VTV1",
        "VTV10",
        "VTV2",
        "VTV3",
        "VTV4",
        "VTV5",
        "VTV5 Tây Nam Bộ",
        "VTV5 Tây Nguyên",
        "VTV7",
        "VTV8",
        "VTV9",
        "WIPRO CONSUMER ...",
        "YAKULT VIETNAM ...",
        "YUHAN CORPORATI...",
        "ZOZO IMUSE (COLD-FLU SUPP.)",
        "price",
        "Đời sống"
      ],
      "map_label_colors": {},
      "own_color_scheme": "presetColors",
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};