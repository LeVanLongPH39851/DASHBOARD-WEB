export const adcodeTableChartProgramPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A755%7D&dashboard_id=52`,
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
                "ads_code",
                "time_band",
                "program_name",
                "channel_name_tvd"
            ],
            "metrics": [
                "price",
                "count"
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
                "native_filters_key": "ns1K9jVaxdhLXzlcWjFO7h-8zD_3XbubAO2gvW_-kMAdQ_5U4vbiaLxXzVUsOSSr"
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
        "slice_id": 755,
        "url_params": {
            "native_filters_key": "ns1K9jVaxdhLXzlcWjFO7h-8zD_3XbubAO2gvW_-kMAdQ_5U4vbiaLxXzVUsOSSr"
        },
        "query_mode": "aggregate",
        "groupby": [
            "ads_code",
            "time_band",
            "program_name",
            "channel_name_tvd"
        ],
        "temporal_columns_lookup": {
            "date": true
        },
        "metrics": [
            "price",
            "count"
        ],
        "all_columns": [],
        "percent_metrics": [],
        "adhoc_filters": [
            {
                "clause": "WHERE",
                "comparator": "No filter",
                "datasourceWarning": false,
                "expressionType": "SIMPLE",
                "filterOptionName": "filter_lvdf7g62p58_01kfhr96urbv",
                "isExtra": false,
                "isNew": false,
                "operator": "TEMPORAL_RANGE",
                "operatorId": "TEMPORAL_RANGE",
                "sqlExpression": null,
                "subject": "date"
            }
        ],
        "order_by_cols": [],
        "row_limit": 50000,
        "server_page_length": 10,
        "order_desc": true,
        "show_totals": false,
        "table_timestamp_format": "smart_date",
        "include_search": true,
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
            52
        ],
        "extra_form_data": {
            "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
        },
        "chart_id": 755,
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
            "ANTOT THYMO",
            "BINH DIEN FERTI...",
            "CASPER (AIR CONDITIONER)",
            "CASPER ELECTRIC...",
            "CASTROL BP PETC...",
            "CHIN-SU (CHILI SAUCE)",
            "COLGATE (TOOTHPASTE)",
            "CONG TY CO PHAN...",
            "CONG TY CP TAP ...",
            "CONG TY SINO VI...",
            "CONG TY TNHH BE...",
            "CONG TY TNHH CH...",
            "CONG TY TNHH DU...",
            "DAI BAC CO., LT...",
            "DAT VIET CERAMI...",
            "DHC GROUP",
            "DONG LUC GROUP",
            "Dành cho trẻ em",
            "ECO PHARMACY JS...",
            "FUMAKILLA VIETN...",
            "GLAXO SMITHKLIN...",
            "Giáo dục - Đào tạo",
            "Giải trí",
            "HANOI BEVERAGE ...",
            "HCMC HOUSING DE...",
            "HOA PHAT (TOLE)",
            "HOA PHAT STEEL ...",
            "HOAT HUYET - NHAT NHAT (TRAD. BRAIN HEALTH MED.)",
            "HOAT HUYET DUONG NAO-TRAPHACO (TRAD. BRAIN HEALTH MED.)",
            "HYUNDAI THANH C...",
            "ICH NIEU KHANG (PROSTATE DISORDER SUPP.)",
            "JUMBO VAPE (ANTI-MOSQUITO COIL & SPRAY)",
            "KANGAROO (WATER FILTER)",
            "KANGAROO GROUP",
            "KOKOMI SNACKING",
            "LONG HAI CO., L...",
            "MANULIFE",
            "MASAN CONSUMER ...",
            "MICHELIN",
            "NAM NGU (FISH SAUCE)",
            "NGAN HANG THUON...",
            "NGAN HANG TMCP ...",
            "NHAT NHAT TRADI...",
            "P&G VIETNAM CO....",
            "PANTENE PRO-V (SHAMPOO & CONDITIONER)",
            "PETROVIETNAM",
            "PONNIE",
            "Phim dài tập",
            "Quảng bá",
            "Quảng cáo",
            "ROMA D-MAXX MARIE (BISCUIT)",
            "SAIGON CO.OP (S...",
            "SAIGON TOURIST ...",
            "SAM NHUNG BO THAN TW3 (ORIENTAL KIDNEY RESTORATIVE MEDICINE)",
            "SUN GROUP CORPO...",
            "SUN GROUP VIETNAM (REAL ESTATE COMPANY)",
            "TAM BINH (DRINK SUPP.)",
            "TAM BINH PHARMA...",
            "TAN HIEP PHAT B...",
            "TH MILK FOOD JS...",
            "TH TRUE MILK (FRESH MILK)",
            "THAM MY VIEN KA...",
            "TRAPHACO JSC",
            "TRUONG HAI AUTO CO., LTD",
            "TRUONG HAI AUTO...",
            "TRUONG HAI GROU...",
            "Thể thao",
            "Thời sự - Chính luận",
            "Tài liệu - Phóng sự",
            "UNILEVER VIETNA...",
            "VAS GROUP",
            "VIETNAM NATIONA...",
            "VIETNAM POST & ...",
            "VINACAFE (COFFEE CORPORATE)",
            "VINAMILK (FRESH MILK)",
            "VINAMILK CORPOR...",
            "VTV1",
            "VTV10",
            "VTV2",
            "VTV3",
            "VTV4",
            "VTV5 Tây Nam Bộ",
            "VTV7",
            "VTV8",
            "VTV9",
            "XANH ISLAND CAT BA (LEISURE PROPERTY)",
            "YAKULT VIETNAM ...",
            "ZOZO IMUSE (COLD-FLU SUPP.)",
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