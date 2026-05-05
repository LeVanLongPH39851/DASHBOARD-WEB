export const spendVNDBarChartTimebandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A826%7D&dashboard_id=54`,
  payload: {
    "datasource": {
      "id": 223,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "BroadcastDate",
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
            "label": "Khung giờ",
            "sqlExpression": "CASE \r\n  WHEN time_band = '0h - 1h' THEN '00-01'\r\n  WHEN time_band = '1h - 2h' THEN '01-02'\r\n  WHEN time_band = '2h - 3h' THEN '02-03'\r\n  WHEN time_band = '3h - 4h' THEN '03-04'\r\n  WHEN time_band = '4h - 5h' THEN '04-05'\r\n  WHEN time_band = '5h - 6h' THEN '05-06'\r\n  WHEN time_band = '6h - 7h' THEN '06-07'\r\n  WHEN time_band = '7h - 8h' THEN '07-08'\r\n  WHEN time_band = '8h - 9h' THEN '08-09'\r\n  WHEN time_band = '9h - 10h' THEN '09-10'\r\n  WHEN time_band = '10h - 11h' THEN '10-11'\r\n  WHEN time_band = '11h - 12h' THEN '11-12'\r\n  WHEN time_band = '12h - 13h' THEN '12-13'\r\n  WHEN time_band = '13h - 14h' THEN '13-14'\r\n  WHEN time_band = '14h - 15h' THEN '14-15'\r\n  WHEN time_band = '15h - 16h' THEN '15-16'\r\n  WHEN time_band = '16h - 17h' THEN '16-17'\r\n  WHEN time_band = '17h - 18h' THEN '17-18'\r\n  WHEN time_band = '18h - 19h' THEN '18-19'\r\n  WHEN time_band = '19h - 20h' THEN '19-20'\r\n  WHEN time_band = '20h - 21h' THEN '20-21'\r\n  WHEN time_band = '21h - 22h' THEN '21-22'\r\n  WHEN time_band = '22h - 23h' THEN '22-23'\r\n  WHEN time_band = '23h - 24h' THEN '23-24'\r\nEND"
          }
        ],
        "metrics": [
          "price"
        ],
        "orderby": [
          [
            "price",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_columns": [],
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
                "Khung giờ"
              ],
              "columns": [],
              "aggregates": {
                "price": {
                  "operator": "mean"
                }
              },
              "drop_missing_columns": false
            }
          },
          {
            "operation": "sort",
            "options": {
              "is_sort_index": true,
              "ascending": true
            }
          },
          {
            "operation": "flatten"
          }
        ]
      }
    ],
    "form_data": {
      "datasource": "223__table",
      "viz_type": "echarts_timeseries_bar",
      "slice_id": 826,
      "url_params": {},
      "x_axis": {
        "datasourceWarning": false,
        "expressionType": "SQL",
        "label": "Khung giờ",
        "sqlExpression": "CASE \r\n  WHEN time_band = '0h - 1h' THEN '00-01'\r\n  WHEN time_band = '1h - 2h' THEN '01-02'\r\n  WHEN time_band = '2h - 3h' THEN '02-03'\r\n  WHEN time_band = '3h - 4h' THEN '03-04'\r\n  WHEN time_band = '4h - 5h' THEN '04-05'\r\n  WHEN time_band = '5h - 6h' THEN '05-06'\r\n  WHEN time_band = '6h - 7h' THEN '06-07'\r\n  WHEN time_band = '7h - 8h' THEN '07-08'\r\n  WHEN time_band = '8h - 9h' THEN '08-09'\r\n  WHEN time_band = '9h - 10h' THEN '09-10'\r\n  WHEN time_band = '10h - 11h' THEN '10-11'\r\n  WHEN time_band = '11h - 12h' THEN '11-12'\r\n  WHEN time_band = '12h - 13h' THEN '12-13'\r\n  WHEN time_band = '13h - 14h' THEN '13-14'\r\n  WHEN time_band = '14h - 15h' THEN '14-15'\r\n  WHEN time_band = '15h - 16h' THEN '15-16'\r\n  WHEN time_band = '16h - 17h' THEN '16-17'\r\n  WHEN time_band = '17h - 18h' THEN '17-18'\r\n  WHEN time_band = '18h - 19h' THEN '18-19'\r\n  WHEN time_band = '19h - 20h' THEN '19-20'\r\n  WHEN time_band = '20h - 21h' THEN '20-21'\r\n  WHEN time_band = '21h - 22h' THEN '21-22'\r\n  WHEN time_band = '22h - 23h' THEN '22-23'\r\n  WHEN time_band = '23h - 24h' THEN '23-24'\r\nEND"
      },
      "time_grain_sqla": "P1D",
      "xAxisForceCategorical": true,
      "x_axis_sort": "Khung giờ",
      "x_axis_sort_asc": true,
      "x_axis_sort_series": "name",
      "x_axis_sort_series_ascending": true,
      "metrics": [
        "price"
      ],
      "groupby": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_k49eok4zn9k_e3iibhwh527",
          "isExtra": false,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "operatorId": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "BroadcastDate"
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
      "orientation": "vertical",
      "x_axis_title": "Timeband (H)",
      "x_axis_title_margin": "40",
      "y_axis_title": "Chi phí (Triệu VND)",
      "y_axis_title_margin": "65",
      "y_axis_title_position": "Left",
      "sort_series_type": "sum",
      "color_scheme": "supersetColors",
      "time_shift_color": true,
      "show_value": true,
      "only_total": true,
      "zoomable": true,
      "show_legend": false,
      "legendType": "scroll",
      "legendOrientation": "top",
      "x_axis_time_format": "smart_date",
      "xAxisLabelRotation": 45,
      "y_axis_format": ",.2f",
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
      "chart_id": 826,
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
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};