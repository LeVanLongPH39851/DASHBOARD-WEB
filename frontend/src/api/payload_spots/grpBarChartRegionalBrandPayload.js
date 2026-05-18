export const grpBarChartRegionalBrandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A766%7D&dashboard_id=52`,
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
                    "op": "NOT IN",
                    "val": [
                        "active"
                    ]
                },
                {
                    "col": "brand",
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
                    "label": "regional_name",
                    "sqlExpression": "CASE \r\n        WHEN regional_name = 'Đồng bằng sông Hồng' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Hồng')\r\n        WHEN regional_name = 'Nam Trung Bộ và Tây Nguyên' \r\n            THEN CONCAT('Nam Trung Bộ', '\\n', 'và', '\\n', 'Tấy Nguyên')\r\n        WHEN regional_name = 'Trung du và miền núi phía Bắc' \r\n            THEN CONCAT('Trung du', '\\n', 'và', '\\n', 'miền núi', '\\n', 'phía Bắc')\r\n        WHEN regional_name = 'Đồng bằng sông Cửu Long' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Cửu', '\\n', 'Long')\r\n        WHEN regional_name = 'Đông Nam Bộ' \r\n     THEN CONCAT('Bắc Trung ', 'Bộ')\r\n        ELSE regional_name\r\n    END"
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
            "url_params": {
                "native_filters_key": "ns1K9jVaxdhLXzlcWjFO7h-8zD_3XbubAO2gvW_-kMAdQ_5U4vbiaLxXzVUsOSSr"
            },
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
        "slice_id": 766,
        "url_params": {
            "native_filters_key": "ns1K9jVaxdhLXzlcWjFO7h-8zD_3XbubAO2gvW_-kMAdQ_5U4vbiaLxXzVUsOSSr"
        },
        "x_axis": {
            "expressionType": "SQL",
            "label": "regional_name",
            "sqlExpression": "CASE \r\n        WHEN regional_name = 'Đồng bằng sông Hồng' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Hồng')\r\n        WHEN regional_name = 'Nam Trung Bộ và Tây Nguyên' \r\n            THEN CONCAT('Nam Trung Bộ', '\\n', 'và', '\\n', 'Tấy Nguyên')\r\n        WHEN regional_name = 'Trung du và miền núi phía Bắc' \r\n            THEN CONCAT('Trung du', '\\n', 'và', '\\n', 'miền núi', '\\n', 'phía Bắc')\r\n        WHEN regional_name = 'Đồng bằng sông Cửu Long' \r\n            THEN CONCAT('Đồng bằng', '\\n', 'sông Cửu', '\\n', 'Long')\r\n ELSE regional_name\r\n    END"
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
                "filterOptionName": "filter_nfkl8w1g0me_ndsm6p85gyg",
                "isExtra": false,
                "isNew": false,
                "operator": "NOT IN",
                "operatorId": "NOT_IN",
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
                "filterOptionName": "filter_m13sgflrb5d_9li5sf5ybhh",
                "isExtra": false,
                "isNew": false,
                "operator": "NOT IN",
                "operatorId": "NOT_IN",
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
            52
        ],
        "extra_form_data": {
            "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
        },
        "chart_id": 766,
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
        "own_color_scheme": "presetColors",
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