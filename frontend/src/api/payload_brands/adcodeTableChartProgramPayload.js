export const adcodeTableChartProgramPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A825%7D&dashboard_id=54`,
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
                "having": "",
                "where": ""
            },
            "applied_time_extras": {},
            "columns": [
                "ads_code",
                "time_band",
                "program_name"
            ],
            "metrics": [
                "price",
                "count",
                "5s",
                "10s",
                "15s",
                "30s",
                "others"
            ],
            "orderby": [
                [
                    "price",
                    false
                ]
            ],
            "annotation_layers": [],
            "row_limit": 50000,
            "series_limit": 0,
            "order_desc": true,
            "url_params": {
                "native_filters_key": "SOn8ptSChvx5HUMxRwJqX711wVU7JhQLkh7Klm6i4OHAVvD1aQd5FjE9XuQoCCZH"
            },
            "custom_params": {},
            "custom_form_data": {},
            "post_processing": [],
            "time_offsets": []
        }
    ],
    "form_data": {
        "datasource": "223__table",
        "viz_type": "table",
        "slice_id": 825,
        "url_params": {
            "native_filters_key": "SOn8ptSChvx5HUMxRwJqX711wVU7JhQLkh7Klm6i4OHAVvD1aQd5FjE9XuQoCCZH"
        },
        "query_mode": "aggregate",
        "groupby": [
            "ads_code",
            "time_band",
            "program_name"
        ],
        "temporal_columns_lookup": {
            "date": true
        },
        "metrics": [
            "price",
            "count",
            "5s",
            "10s",
            "15s",
            "30s",
            "others"
        ],
        "all_columns": [],
        "percent_metrics": [],
        "adhoc_filters": [
            {
                "clause": "WHERE",
                "comparator": "No filter",
                "expressionType": "SIMPLE",
                "operator": "TEMPORAL_RANGE",
                "subject": "BroadcastDate"
            }
        ],
        "order_by_cols": [],
        "row_limit": 50000,
        "server_page_length": 10,
        "order_desc": true,
        "show_totals": false,
        "table_timestamp_format": "smart_date",
        "include_search": false,
        "allow_render_html": true,
        "column_config": {
            "count": {
                "d3NumberFormat": ",d"
            },
            "price": {
                "d3NumberFormat": ",.2f"
            }
        },
        "show_cell_bars": true,
        "color_pn": true,
        "comparison_color_scheme": "Green",
        "conditional_formatting": [],
        "comparison_type": "values",
        "dashboards": [
            54
        ],
        "extra_form_data": {
            "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
        },
        "chart_id": 825,
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
            "7UP (AERATED SO...",
            "ANGELA (WOMEN S...",
            "ANTOT THYMO",
            "BAO KHI KHANG (...",
            "BENH VIEN DA KH...",
            "BIA HA NOI",
            "BINH VI THAI MI...",
            "BONCHA (RTD GRE...",
            "BONIDETOX (LING...",
            "BYEBYE-FYVER",
            "C2 (RTD GREEN T...",
            "CASPER (AIR CON...",
            "CHIN-SU (CHILI ...",
            "CLEAR MAT LANH",
            "CLEAR MEN (MEN ...",
            "CLOSEUP BAC HA",
            "COLGATE (TOOTHP...",
            "COMFORT (FABRIC...",
            "DA HUONG (FEMIN...",
            "DONG LUC TOWER",
            "DONG TRUNG HA T...",
            "DOVE (HAIR CARE...",
            "DOWNY (FABRIC C...",
            "DR.THANH (RTD H...",
            "DUOC LIEU THAI ...",
            "DUTCH LADY OMEG...",
            "ENSURE (NUTRITI...",
            "ENTEROGERMINA (...",
            "FUZE TEA",
            "Giáo dục - Đào tạo",
            "Giải trí",
            "HAO HAO",
            "HDBANK PRIORITY",
            "HEAD & SHOULDER...",
            "HOA PHAT (TOLE)",
            "HOA PHAT STEEL ...",
            "HOAT HUYET - NH...",
            "HOAT HUYET DUON...",
            "HOAT HUYET THON...",
            "ICH NIEU KHANG ...",
            "JEX (BONE & JOI...",
            "KANGAROO (WATER...",
            "KHUONG THAO DAN...",
            "KOKOMI SNACKING",
            "LIPOVITAN",
            "LOTTE CHOCOLAT",
            "MANULIFE",
            "MB (BANK)",
            "MEAT DELI (PORK...",
            "MICHELIN",
            "MOLFIX OXY",
            "NAGAKAWA (AIR C...",
            "NAM NGU (FISH S...",
            "NGAN HANG TMCP ...",
            "NGOC CHAU (TOOT...",
            "NGUYEN XUAN (HE...",
            "NUI THAN TAI MI...",
            "NUMBER 1 (ENERG...",
            "OMO (WASHING LI...",
            "OPTIMUM COLOS (...",
            "OPTIMUM GOLD (G...",
            "OTIV (BRAIN SUP...",
            "P/S (TOOTHPASTE...",
            "PANTENE PRO-V (...",
            "PEPSI (AERATED ...",
            "PHU MY HUNG HAR...",
            "PHU MY PETROVIE...",
            "PHUONG DONG ASA...",
            "PONNIE",
            "PSA",
            "PURITE",
            "PV GAS - PETROV...",
            "Phim dài tập",
            "RANG DONG",
            "RED BULL (ENERG...",
            "REJOICE (SHAMPO...",
            "ROMA D-MAXX MAR...",
            "ROMANO (MEN SHA...",
            "SAM NHUNG BO TH...",
            "SCTV CHANNELS (...",
            "SEABANK",
            "SEAPAYMENT",
            "STING (ENERGY D...",
            "SUA RUA MAT LEN...",
            "SUMIKURA",
            "SUN GROUP VIETN...",
            "SUNLIGHT (DISH ...",
            "SUNSILK (HAIR C...",
            "TAM BINH (DRINK...",
            "TAY THI",
            "TH TRUE MILK (F...",
            "THAI DUONG (HER...",
            "THANH HANG BEAU...",
            "THEP VAS",
            "TRUONG CAO DANG...",
            "Thời sự - Chính luận",
            "UNIQLO (FASHION...",
            "VINACAFE (COFFE...",
            "VINAMILK (EATIN...",
            "VINAMILK (FRESH...",
            "VTV1",
            "VTV3",
            "VTV8",
            "VTV9",
            "VUONG BAO (PROS...",
            "Vui lòng chọn filter Brand",
            "WIT (EYE SUPP.)",
            "XANH ISLAND CAT...",
            "YAKULT (DRINKIN...",
            "YOMOST",
            "YOOSUN (FACIAL ...",
            "YUMANGEL (STOMA...",
            "ZOZO (DRINK SUP...",
            "ZOZO IMUSE (COL...",
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