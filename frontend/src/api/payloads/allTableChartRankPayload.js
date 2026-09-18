export const allTableChartRankPayload = {
    url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A643%7D&dashboard_id=50`,
    payload: {
        "datasource": {
            "id": 309,
            "type": "table"
        },
        "force": false,
        "queries": [
            {
                "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
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
                    "channel_name_tvd",
                    "program_name",
                    "firstlevel_vn",
                    "name_vn"
                ],
                "metrics": [
                    "rating",
                    "rating%",
                    "ave_reach",
                    "reach%",
                    "minute_user_program",
                    "retention_rate"
                ],
                "orderby": [
                    [
                        "rating",
                        false
                    ]
                ],
                "annotation_layers": [],
                "row_limit": 50000,
                "series_limit": 0,
                "order_desc": true,
                "url_params": {
                    "native_filters_key": "CO3Sw_XA-KBVhIlGz3uqx05sPtlRuwGR0D1FvlZZcWTor3w9uzk59pLwaQiNLPE6"
                },
                "custom_params": {},
                "custom_form_data": {},
                "post_processing": [],
                "time_offsets": []
            }
        ],
        "form_data": {
            "datasource": "309__table",
            "viz_type": "table",
            "slice_id": 1026,
            "cache_timeout": 3600,
            "url_params": {
                "native_filters_key": "CO3Sw_XA-KBVhIlGz3uqx05sPtlRuwGR0D1FvlZZcWTor3w9uzk59pLwaQiNLPE6"
            },
            "query_mode": "aggregate",
            "groupby": [
                "channel_name_tvd",
                "program_name",
                "firstlevel_vn",
                "name_vn"
            ],
            "temporal_columns_lookup": {
                "date": true
            },
            "metrics": [
                "rating",
                "rating%",
                "ave_reach",
                "reach%",
                "minute_user_program",
                "retention_rate"
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
            "order_by_cols": [],
            "row_limit": 50000,
            "server_page_length": 10,
            "order_desc": true,
            "table_timestamp_format": "smart_date",
            "allow_render_html": true,
            "column_config": {
                "ave_reach": {
                    "d3NumberFormat": ",d"
                },
                "minute_user_program": {
                    "d3NumberFormat": ",.2f"
                },
                "rating": {
                    "d3NumberFormat": ",d"
                },
                "rating%": {
                    "d3NumberFormat": ",.2f"
                },
                "reach%": {
                    "d3NumberFormat": ",.2f"
                },
                "retention_rate": {
                    "d3NumberFormat": ",.2f"
                }
            },
            "show_cell_bars": false,
            "color_pn": true,
            "comparison_color_scheme": "Green",
            "conditional_formatting": [
                {
                    "colorScheme": "#ACE1C4",
                    "column": "rating",
                    "operator": "None"
                },
                {
                    "colorScheme": "#ACE1C4",
                    "column": "rating%",
                    "operator": "None"
                },
                {
                    "colorScheme": "#ACE1C4",
                    "column": "ave_reach",
                    "operator": "None"
                },
                {
                    "colorScheme": "#ACE1C4",
                    "column": "reach%",
                    "operator": "None"
                },
                {
                    "colorScheme": "#ACE1C4",
                    "column": "minute_user_program",
                    "operator": "None"
                },
                {
                    "colorScheme": "#ACE1C4",
                    "column": "retention_rate",
                    "operator": "None"
                }
            ],
            "comparison_type": "values",
            "dashboards": [],
            "extra_form_data": {
                "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
            },
            "chart_id": 1026,
            "label_colors": {},
            "shared_label_colors": [],
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