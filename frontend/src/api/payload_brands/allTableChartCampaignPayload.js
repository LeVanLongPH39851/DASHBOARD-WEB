export const allTableChartCampaignPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A827%7D&dashboard_id=54`,
  payload: {
    "datasource": {
      "id": 225,
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
          "time_grain_sqla": "P1W",
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Tuần",
            "sqlExpression": "week"
          },
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Campaign",
            "sqlExpression": "campaign_name"
          },
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Nhãn",
            "sqlExpression": "brand"
          },
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Nhà quảng cáo",
            "sqlExpression": "advertiser"
          }
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
        "row_limit": 50,
        "series_limit": 50,
        "order_desc": true,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {}
      }
    ],
    "form_data": {
      "datasource": "225__table",
      "viz_type": "pivot_table_v2",
      "slice_id": 827,
      "url_params": {},
      "groupbyColumns": [
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Tuần",
          "sqlExpression": "week"
        }
      ],
      "groupbyRows": [
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Campaign",
          "sqlExpression": "campaign_name"
        },
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Nhãn",
          "sqlExpression": "brand"
        },
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Nhà quảng cáo",
          "sqlExpression": "advertiser"
        }
      ],
      "time_grain_sqla": "P1W",
      "temporal_columns_lookup": {
        "date": true
      },
      "metrics": [
        "reach"
      ],
      "metricsLayout": "COLUMNS",
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "expressionType": "SIMPLE",
          "operator": "TEMPORAL_RANGE",
          "subject": "date"
        }
      ],
      "series_limit": 50,
      "row_limit": 50,
      "order_desc": true,
      "aggregateFunction": "Sum",
      "rowTotals": true,
      "rowSubTotals": false,
      "colTotals": false,
      "transposePivot": false,
      "combineMetric": false,
      "valueFormat": ",d",
      "date_format": "smart_date",
      "rowOrder": "key_a_to_z",
      "colOrder": "key_a_to_z",
      "rowSubtotalPosition": false,
      "colSubtotalPosition": true,
      "conditional_formatting": [
        {
          "colorScheme": "#ACE1C4",
          "column": "Reach",
          "operator": "None"
        }
      ],
      "allow_render_html": true,
      "annotation_layers": [],
      "dashboards": [
        93
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 827,
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
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};