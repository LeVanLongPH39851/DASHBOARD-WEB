export const reachBarChartChannelPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A844%7D&dashboard_id=54`,
  payload: {
    "datasource": {
      "id": 240,
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
            "datasourceWarning": true,
            "expressionType": "SQL",
            "label": "brand",
            "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
          },
          "channel_name_tvd"
        ],
        "metrics": [
          {
            "aggregate": "SUM",
            "column": {
              "advanced_data_type": null,
              "changed_on": "2026-01-08T03:03:57.316123",
              "column_name": "reach",
              "created_on": "2026-01-08T03:03:57.316115",
              "description": null,
              "expression": null,
              "extra": "{}",
              "filterable": true,
              "groupby": true,
              "id": 5328,
              "is_active": true,
              "is_dttm": false,
              "python_date_format": null,
              "type": "LONGLONG",
              "type_generic": 0,
              "uuid": "57d3108e-a0b9-402b-abe0-3ed65e21c9d2",
              "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": false,
            "label": "SUM(reach)",
            "optionName": "metric_y2ea5imb0n_ifyzgnajnfd",
            "sqlExpression": null
          }
        ],
        "orderby": [
          [
            {
              "aggregate": "SUM",
              "column": {
                "advanced_data_type": null,
                "changed_on": "2026-01-08T03:03:57.316123",
                "column_name": "reach",
                "created_on": "2026-01-08T03:03:57.316115",
                "description": null,
                "expression": null,
                "extra": "{}",
                "filterable": true,
                "groupby": true,
                "id": 5328,
                "is_active": true,
                "is_dttm": false,
                "python_date_format": null,
                "type": "LONGLONG",
                "type_generic": 0,
                "uuid": "57d3108e-a0b9-402b-abe0-3ed65e21c9d2",
                "verbose_name": null
              },
              "datasourceWarning": false,
              "expressionType": "SIMPLE",
              "hasCustomLabel": false,
              "label": "SUM(reach)",
              "optionName": "metric_y2ea5imb0n_ifyzgnajnfd",
              "sqlExpression": null
            },
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 10000,
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
                "brand"
              ],
              "columns": [
                "channel_name_tvd"
              ],
              "aggregates": {
                "SUM(reach)": {
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
                "SUM(reach)": null
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
      "datasource": "240__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 844,
      "url_params": {},
      "x_axis": {
        "datasourceWarning": true,
        "expressionType": "SQL",
        "label": "brand",
        "sqlExpression": "CASE\r\nWHEN length(brand) > 15\r\n   THEN CONCAT(left(brand, 15), '...')\r\nELSE brand\r\nEND"
      },
      "time_grain_sqla": "P1D",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "sum",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        {
          "aggregate": "SUM",
          "column": {
            "advanced_data_type": null,
            "changed_on": "2026-01-08T03:03:57.316123",
            "column_name": "reach",
            "created_on": "2026-01-08T03:03:57.316115",
            "description": null,
            "expression": null,
            "extra": "{}",
            "filterable": true,
            "groupby": true,
            "id": 5328,
            "is_active": true,
            "is_dttm": false,
            "python_date_format": null,
            "type": "LONGLONG",
            "type_generic": 0,
            "uuid": "57d3108e-a0b9-402b-abe0-3ed65e21c9d2",
            "verbose_name": null
          },
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "hasCustomLabel": false,
          "label": "SUM(reach)",
          "optionName": "metric_y2ea5imb0n_ifyzgnajnfd",
          "sqlExpression": null
        }
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
      "row_limit": 10000,
      "truncate_metric": true,
      "show_empty_columns": true,
      "comparison_type": "values",
      "annotation_layers": [],
      "forecastPeriods": 10,
      "forecastInterval": 0.8,
      "orientation": "horizontal",
      "x_axis_title_margin": 15,
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
        93
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 844,
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
        "BINH VI THAI MI...",
        "BO PHE NAM HA (...",
        "BOGANIC PREMIUM...",
        "BONCHA (RTD GRE...",
        "C2 (RTD GREEN T...",
        "CASTROL (MOTORB...",
        "CHANTE (WASHING...",
        "CHIN-SU (CHILI ...",
        "CHIN-SU (FISH S...",
        "CLEAR MAT LANH",
        "CLEAR MEN (MEN ...",
        "COCA-COLA (AERA...",
        "COLGATE (TOOTHP...",
        "DA HUONG (FEMIN...",
        "DOVE (HAIR CARE...",
        "DOWNY (FABRIC C...",
        "DR.THANH (RTD H...",
        "DUNG DICH XIT H...",
        "DUTCH LADY OMEG...",
        "Dành cho trẻ em",
        "ENTEROGERMINA (...",
        "FAMI (SOY MILK)",
        "GU NGON",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HANOI (DRAUGHT ...",
        "HAO HAO",
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
        "ICH NIEU KHANG ...",
        "IMPERIA HOLIDAY...",
        "INTIMATE",
        "KANGAROO (WATER...",
        "KHUONG THAO DAN...",
        "KNORR (SEASONIN...",
        "KOKOMI SNACKING",
        "LIFEBUOY VITAMI...",
        "LINEABON (VITAM...",
        "MAGGI (OYSTER O...",
        "MILO (ENERGY PO...",
        "MORINAGA",
        "NAM NGU (FISH S...",
        "NESTLE NAN",
        "NEXTG CAL (VITA...",
        "NGOC CHAU (TOOT...",
        "NGUYEN XUAN (HE...",
        "NUMBER 1 (ENERG...",
        "NUMBER 1- 0 DO ...",
        "NUOC TANG LUC 4...",
        "OMACHI (INSTANT...",
        "OPTIMUM COLOS (...",
        "OREO (BISCUIT)",
        "P/S (TOOTHPASTE...",
        "PETRO VIETNAM (...",
        "PHUONG DONG ASA...",
        "PROSPAN (COUGH ...",
        "PSA",
        "PURITE",
        "Phim dài tập",
        "Quảng cáo",
        "REJOICE (SHAMPO...",
        "REMOS VIET NAM",
        "ROMANO (MEN SHA...",
        "SALONPAS (PAIN ...",
        "SAM NHUNG BO TH...",
        "SENSODYNE (TOOT...",
        "STING (ENERGY D...",
        "SUBAC (ANTISEPT...",
        "SUN GROUP VIETN...",
        "SUN PHUQUOC AIR...",
        "SUNLIGHT (DISH ...",
        "SUNSILK (HAIR C...",
        "TAM BINH (DRINK...",
        "TAY THI",
        "TH TRUE FOOD (F...",
        "TH TRUE MILK (F...",
        "TH TRUE MISTORI",
        "TH TRUE YOGURT ...",
        "THAI DUONG (HER...",
        "THANH HANG BEAU...",
        "TRANG PHUC LINH...",
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
        "YAKULT (DRINKIN...",
        "YUMANGEL (STOMA...",
        "price",
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