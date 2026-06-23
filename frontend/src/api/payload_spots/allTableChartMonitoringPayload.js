export const allTableChartMonitoringPayload = {
    url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A793%7D&dashboard_id=52`,
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
                    "spot_start_time",
                    "program_name",
                    {
                        "expressionType": "SQL",
                        "label": "Thời lượng Spot",
                        "sqlExpression": "round(duration, 0)"
                    },
                    "break_in_program",
                    "position_in_break",
                    "spot_type",
                    "campaign_name",
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
                        "aggregate": null,
                        "column": null,
                        "datasourceWarning": false,
                        "expressionType": "SQL",
                        "hasCustomLabel": true,
                        "label": "Chi phí (triệu VND)",
                        "optionName": "metric_j8hhpgdhil_bjx8lrm2ls",
                        "sqlExpression": "MAX(CASE WHEN price IS NOT NULL THEN price ELSE 0 END) / 1000000"
                    },
                    "reach"
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
                            "optionName": "metric_zbeogmehqk_z96xd75qcoe",
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
                    "optionName": "metric_zbeogmehqk_z96xd75qcoe",
                    "sqlExpression": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time"
                },
                "order_desc": false,
                "url_params": {
                    "native_filters_key": "qWJHacf2DouKYTsJ_waus3is_LtSHcCw2PIH0UsoCXJbwduGtlbMaUfgGbKXYQWx"
                },
                "custom_params": {},
                "custom_form_data": {},
                "post_processing": [],
                "time_offsets": []
            }
        ],
        "form_data": {
            "datasource": "225__table",
            "viz_type": "table",
            "slice_id": 793,
            "url_params": {
                "native_filters_key": "qWJHacf2DouKYTsJ_waus3is_LtSHcCw2PIH0UsoCXJbwduGtlbMaUfgGbKXYQWx"
            },
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
                "spot_start_time",
                "program_name",
                {
                    "expressionType": "SQL",
                    "label": "Thời lượng Spot",
                    "sqlExpression": "round(duration, 0)"
                },
                "break_in_program",
                "position_in_break",
                "spot_type",
                "campaign_name",
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
                    "aggregate": null,
                    "column": null,
                    "datasourceWarning": false,
                    "expressionType": "SQL",
                    "hasCustomLabel": true,
                    "label": "Chi phí (triệu VND)",
                    "optionName": "metric_j8hhpgdhil_bjx8lrm2ls",
                    "sqlExpression": "MAX(CASE WHEN price IS NOT NULL THEN price ELSE 0 END) / 1000000"
                },
                "reach"
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
                "optionName": "metric_zbeogmehqk_z96xd75qcoe",
                "sqlExpression": "date ASC ,RIGHT(channel_name_tvd, 1) ASC ,spot_start_time"
            },
            "order_by_cols": [],
            "row_limit": 10000,
            "server_page_length": 10,
            "order_desc": false,
            "show_totals": false,
            "table_timestamp_format": "smart_date",
            "include_search": true,
            "allow_rearrange_columns": false,
            "allow_render_html": true,
            "column_config": {
                "Chi phí (triệu VND)": {
                    "d3NumberFormat": ",.2f"
                },
                "Ngày": {
                    "columnWidth": 20,
                    "d3TimeFormat": "%d/%m/%Y"
                },
                "Nhãn hàng/ Brand": {
                    "columnWidth": 20
                },
                "channel_name_tvd": {
                    "columnWidth": 15,
                    "truncateLongCells": false
                },
                "reach": {
                    "d3NumberFormat": ",d"
                }
            },
            "show_cell_bars": false,
            "color_pn": true,
            "comparison_color_scheme": "Green",
            "conditional_formatting": [
                {
                    "colorScheme": "#ACE1C4",
                    "column": "reach",
                    "operator": "None"
                }
            ],
            "comparison_type": "values",
            "dashboards": [
                52
            ],
            "extra_form_data": {
                "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
            },
            "chart_id": 793,
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
                "HOA PHAT STEEL ...",
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
                "Phim dài tập",
                "Quảng bá",
                "Quảng cáo",
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
                "VINAMILK CORPOR...",
                "VTV1",
                "VTV10",
                "VTV2",
                "VTV3",
                "VTV4",
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
            "result_type": "full",
            heavy: true
        },
        "result_format": "json",
        "result_type": "full"
    }
};