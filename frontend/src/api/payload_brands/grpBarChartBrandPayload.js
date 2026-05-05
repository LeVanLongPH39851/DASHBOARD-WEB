export const grpBarChartBrandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A831%7D&dashboard_id=54`,
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
            "col": "regional_name",
            "op": "IN",
            "val": [
              "active"
            ]
          },
          {
            "col": "brand",
            "op": "IN",
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
            "label": "regional_name",
            "sqlExpression": "CASE \r\n        WHEN regional_name = 'Đồng bằng sông Hồng' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Hồng')\r\n        WHEN regional_name = 'Bắc Trung Bộ và Duyên hải miền Trung' \r\n            THEN CONCAT('Bắc Trung', '\\n', 'Bộ và', '\\n', 'Duyên hải', '\\n', 'miền Trung')\r\n        WHEN regional_name = 'Trung du và miền núi phía Bắc' \r\n            THEN CONCAT('Trung du', '\\n', 'và', '\\n', 'miền núi', '\\n', 'phía Bắc')\r\n        WHEN regional_name = 'Đồng bằng sông Cửu Long' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Cửu', '\\n', 'Long')\r\n        WHEN regional_name = 'Đông Nam Bộ' \r\n            THEN CONCAT('Đông Nam', '\\n', 'Bộ')\r\n        WHEN regional_name = 'Tây Nguyên' \r\n            THEN CONCAT('Tây', '\\n', 'Nguyên')\r\n        ELSE regional_name\r\n    END"
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
                "regional_name"
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
      "slice_id": 831,
      "url_params": {},
      "x_axis": {
        "datasourceWarning": false,
        "expressionType": "SQL",
        "label": "regional_name",
        "sqlExpression": "CASE \r\n        WHEN regional_name = 'Đồng bằng sông Hồng' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Hồng')\r\n        WHEN regional_name = 'Bắc Trung Bộ và Duyên hải miền Trung' \r\n            THEN CONCAT('Bắc Trung', '\\n', 'Bộ và', '\\n', 'Duyên hải', '\\n', 'miền Trung')\r\n        WHEN regional_name = 'Trung du và miền núi phía Bắc' \r\n            THEN CONCAT('Trung du', '\\n', 'và', '\\n', 'miền núi', '\\n', 'phía Bắc')\r\n        WHEN regional_name = 'Đồng bằng sông Cửu Long' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Cửu', '\\n', 'Long')\r\n        WHEN regional_name = 'Đông Nam Bộ' \r\n            THEN CONCAT('Đông Nam', '\\n', 'Bộ')\r\n        WHEN regional_name = 'Tây Nguyên' \r\n            THEN CONCAT('Tây', '\\n', 'Nguyên')\r\n        ELSE regional_name\r\n    END"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "sum",
      "x_axis_sort_series_ascending": false,
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
          "filterOptionName": "filter_1fkn9740bt4_qrp6gtlbj2l",
          "isExtra": false,
          "isNew": false,
          "operator": "IN",
          "operatorId": "IN",
          "sqlExpression": null,
          "subject": "regional_name"
        },
        {
          "clause": "WHERE",
          "comparator": [
            "active"
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_15y0u8uzkw1_sozwi3j5m6g",
          "isExtra": false,
          "isNew": false,
          "operator": "IN",
          "operatorId": "IN",
          "sqlExpression": null,
          "subject": "brand"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_ecx58m6xo76_b1iw1pkcit7",
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
      "x_axis_title_margin": 15,
      "y_axis_title_margin": "0",
      "y_axis_title_position": "Left",
      "sort_series_type": "max",
      "sort_series_ascending": false,
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
        54
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 831,
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
        "AJINOMOTO VIETN...",
        "ALIPAS (MEN SUP...",
        "ANTOT THYMO",
        "BAO KHI KHANG (...",
        "BAO THANH (COUG...",
        "BENH VIEN DA KH...",
        "BIA HA NOI",
        "BINH VI THAI MI...",
        "BO PHE NAM HA (...",
        "BO PHE NHAT NHA...",
        "BOGANIC PREMIUM...",
        "BONCHA (RTD GRE...",
        "BONI BRAIN (ANT...",
        "C2 (RTD GREEN T...",
        "CASPER (AIR CON...",
        "CASTROL (MOTORB...",
        "CENLAND",
        "CENTA RIVERSIDE",
        "CHANTE (WASHING...",
        "CHARMORA CITY N...",
        "CHIN-SU (CHILI ...",
        "CHIN-SU (FISH S...",
        "CLEAR MAT LANH",
        "CLEAR MEN (MEN ...",
        "COCA-COLA (AERA...",
        "COLGATE (TOOTHP...",
        "COMFORT (FABRIC...",
        "DA HUONG (FEMIN...",
        "DAT VIET CERAMI...",
        "DONG LUC TOWER",
        "DONG TRUNG HA T...",
        "DOVE (HAIR CARE...",
        "DOWNY (FABRIC C...",
        "DR.THANH (RTD H...",
        "DUNG DICH XIT H...",
        "DUTCH LADY OMEG...",
        "Dành cho trẻ em",
        "ENCHANTEUR (SHO...",
        "ENSURE (NUTRITI...",
        "ENTEROGERMINA (...",
        "FAMI (SOY MILK)",
        "FLC PREMIER PAR...",
        "FPT LONG CHAU P...",
        "GU NGON",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HANOI (BEER)",
        "HANOI (DRAUGHT ...",
        "HAO HAO",
        "HD BANK",
        "HDBANK PRIORITY",
        "HEAD & SHOULDER...",
        "HISMART",
        "HOA PHAT (TOLE)",
        "HOA PHAT STEEL ...",
        "HOAT HUYET - NH...",
        "HOAT HUYET DUON...",
        "HOAT HUYET THON...",
        "HONDA",
        "HONDA CUVE",
        "HONG SAM THAI M...",
        "HONG SAM VIET N...",
        "HYUNDAI-SANTAFE...",
        "ICH NIEU KHANG ...",
        "IMPERIA HOLIDAY...",
        "INTIMATE",
        "JEX (BONE & JOI...",
        "JOGARBOLA",
        "JUMBO VAPE (ANT...",
        "KANGAROO (WATER...",
        "KATIA PREMIUM V...",
        "KHUONG THAO DAN...",
        "KINGSUP (MEN SU...",
        "KNORR (SEASONIN...",
        "KOKOMI SNACKING",
        "LIFEBUOY VITAMI...",
        "LINEABON (VITAM...",
        "LOCPHAT PAY",
        "LPBANK",
        "LPBANK VISA",
        "LYNNTIMES ONSEN...",
        "MAGGI (OYSTER O...",
        "MANULIFE",
        "MB (BANK)",
        "MICHELIN",
        "MILO (ENERGY PO...",
        "MOLFIX OXY",
        "MORINAGA",
        "NAGAKAWA (AIR C...",
        "NAM NGU (FISH S...",
        "NESTLE NAN",
        "NEXTG CAL (VITA...",
        "NGOC CHAU (TOOT...",
        "NGUYEN XUAN (HE...",
        "NOBLE PALACE TA...",
        "NUI THAN TAI MI...",
        "NUMBER 1 (ENERG...",
        "NUMBER 1 (SOY M...",
        "NUMBER 1- 0 DO ...",
        "NUOC TANG LUC 4...",
        "OMACHI (INSTANT...",
        "OMO (WASHING LI...",
        "OPTIMUM COLOS (...",
        "OREO (BISCUIT)",
        "OTIV (BRAIN SUP...",
        "P/S (TOOTHPASTE...",
        "PANTENE PRO-V (...",
        "PEPSI (AERATED ...",
        "PETRO VIETNAM (...",
        "PHU MY PETROVIE...",
        "PHUONG DONG ASA...",
        "PLUSSSZ",
        "PONNIE",
        "POWER OF SUN",
        "PROSPAN (COUGH ...",
        "PSA",
        "PURITE",
        "PV GAS - PETROV...",
        "Phim dài tập",
        "Quảng cáo",
        "RED BULL (ENERG...",
        "REJOICE (SHAMPO...",
        "REMOS VIET NAM",
        "ROMA D-MAXX MAR...",
        "ROMANO (MEN SHA...",
        "SAIGON TOURIST ...",
        "SALONPAS (PAIN ...",
        "SAM NHUNG BO TH...",
        "SCTV CHANNELS (...",
        "SENSODYNE (TOOT...",
        "SIEU THI DIEN M...",
        "SINO VANLOCK EL...",
        "STING (ENERGY D...",
        "SUBAC (ANTISEPT...",
        "SUMIKURA",
        "SUN GROUP VIETN...",
        "SUN PHUQUOC AIR...",
        "SUNLIGHT (DISH ...",
        "SUNSILK (HAIR C...",
        "SURF (WASHING L...",
        "TAM BINH (DRINK...",
        "TAY THI",
        "TH TRUE FOOD (F...",
        "TH TRUE MILK (F...",
        "TH TRUE MISTORI",
        "TH TRUE YOGURT ...",
        "THAI DUONG (HER...",
        "THANH HANG BEAU...",
        "THEP VAS",
        "TRANG PHUC LINH...",
        "TROPICANA TWIST...",
        "TRUONG HAI AUTO...",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "UNIQLO (FASHION...",
        "VF8",
        "VF9",
        "VIEN NGAM THONG...",
        "VIFON MI AN LIE...",
        "VIM (WC CLEANIN...",
        "VINACAFE (COFFE...",
        "VINAGA - DHA",
        "VINAMILK (EATIN...",
        "VINAMILK (FRESH...",
        "VTV1",
        "VTV2",
        "VTV3",
        "VTV8",
        "VTV9",
        "VUONG BAO (PROS...",
        "VUONG NIEU DAN ...",
        "Vui lòng chọn filter Brand",
        "WIT (EYE SUPP.)",
        "XANH ISLAND CAT...",
        "YAKULT (DRINKIN...",
        "YOMOST",
        "YOOSUN (FACIAL ...",
        "YUMANGEL (STOMA...",
        "ZOZO IMUSE (COL...",
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