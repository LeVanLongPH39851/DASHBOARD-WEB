export const maxInsertPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A660%7D&dashboard_id=50`,
  payload: {
    "datasource": {
        "id": 221,
        "type": "table"
    },
    "force": false,
    "queries": [
        {
            "filters": [
                {
                    "col": "table_name",
                    "op": "==",
                    "val": "data_dashboard_rating"
                }
            ],
            "extras": {
                "having": "",
                "where": ""
            },
            "applied_time_extras": {},
            "columns": [],
            "metrics": [
                {
                    "aggregate": "MAX",
                    "column": {
                        "advanced_data_type": null,
                        "changed_on": "2026-04-04T05:07:20.342450",
                        "column_name": "check_time",
                        "created_on": "2026-04-04T05:07:20.342446",
                        "description": null,
                        "expression": null,
                        "extra": null,
                        "filterable": true,
                        "groupby": true,
                        "id": 2811,
                        "is_active": true,
                        "is_dttm": false,
                        "python_date_format": null,
                        "type": "DATETIME",
                        "type_generic": 1,
                        "uuid": "005d251e-323b-4db2-926f-2b0668ec9001",
                        "verbose_name": null
                    },
                    "datasourceWarning": false,
                    "expressionType": "SIMPLE",
                    "hasCustomLabel": false,
                    "label": "MAX(check_time)",
                    "optionName": "metric_g9fcrb1tqvj_d0qd454y8s",
                    "sqlExpression": null
                }
            ],
            "annotation_layers": [],
            "series_limit": 0,
            "order_desc": true,
            "url_params": {
                "native_filters_key": "hFy9vBG7nqht2IjTWdmuP1S0fNhPhpFE32Isj1Ef_W1jSWj8CB40AaORs1QiG4-x"
            },
            "custom_params": {},
            "custom_form_data": {}
        }
    ],
    "form_data": {
        "datasource": "221__table",
        "viz_type": "big_number_total",
        "slice_id": 660,
        "url_params": {
            "native_filters_key": "hFy9vBG7nqht2IjTWdmuP1S0fNhPhpFE32Isj1Ef_W1jSWj8CB40AaORs1QiG4-x"
        },
        "metric": {
            "aggregate": "MAX",
            "column": {
                "advanced_data_type": null,
                "changed_on": "2026-04-04T05:07:20.342450",
                "column_name": "check_time",
                "created_on": "2026-04-04T05:07:20.342446",
                "description": null,
                "expression": null,
                "extra": null,
                "filterable": true,
                "groupby": true,
                "id": 2811,
                "is_active": true,
                "is_dttm": false,
                "python_date_format": null,
                "type": "DATETIME",
                "type_generic": 1,
                "uuid": "005d251e-323b-4db2-926f-2b0668ec9001",
                "verbose_name": null
            },
            "datasourceWarning": false,
            "expressionType": "SIMPLE",
            "hasCustomLabel": false,
            "label": "MAX(check_time)",
            "optionName": "metric_g9fcrb1tqvj_d0qd454y8s",
            "sqlExpression": null
        },
        "adhoc_filters": [
            {
                "clause": "WHERE",
                "comparator": "data_dashboard_rating",
                "datasourceWarning": false,
                "expressionType": "SIMPLE",
                "filterOptionName": "filter_h18i3h4n6m_bk2zx18qo3q",
                "isExtra": false,
                "isNew": false,
                "operator": "==",
                "operatorId": "EQUALS",
                "sqlExpression": null,
                "subject": "table_name"
            }
        ],
        "header_font_size": 0.4,
        "subheader_font_size": 0.15,
        "y_axis_format": "SMART_NUMBER",
        "time_format": "%d/%m/%Y %H:%M",
        "conditional_formatting": [],
        "dashboards": [
            50
        ],
        "extra_form_data": {},
        "chart_id": 660,
        "label_colors": {
            "ave_reach": "#ffd04c",
            "ave_reach_timeband": "#ffd04c",
            "reach_timeband%": "#ffd04c",
            "rating": "#ff5757",
            "Live": "#6ce5e8",
            "TSV": "#fe9273",
            "MOBILE": "#5097d7",
            "SMART_TV": "#50bf62",
            "PC/Lap": "#ffd501",
            "TABLET": "#ff6f31",
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
            "VTV5 Tây Nguyên": "#b97286",
            "rating_timeband": "#ff5757",
            "rating_timeband%": "#ff5757",
            "Workweek": "#fe9273",
            "Weekend": "#6ce5e8",
            "Thời sự - Chính luận": "#6BD3B3",
            "Sự kiện - Đặc biệt": "#7A378B",
            "Phim dài tập": "#FCC550",
            "Đời sống": "#EE5960",
            "Tài liệu - Phóng sự": "#408184",
            "Giải trí": "#BFEFFF",
            "Giáo dục - Đào tạo": "#5470C6",
            "Dành cho trẻ em": "#ffb2f3",
            "Thể thao": "#FF874E",
            "Sự kiện": "#03748E",
            "Quảng bá": "#8c564a",
            "Phim truyện": "#C9BBAB",
            "Phim điện ảnh": "#C3BBAB",
            "Quảng cáo": "#B17BAA",
            "Thứ Hai": "#1FA8C9",
            "Thứ Ba": "#454E7C",
            "Thứ Tư": "#5AC189",
            "Thứ Năm": "#FF7F44",
            "Thứ Sáu": "#666666",
            "Thứ Bảy": "#E04355",
            "Chủ Nhật": "#FCC700"
        },
        "shared_label_colors": [
            "Chủ Nhật",
            "Dành cho trẻ em",
            "Giáo dục - Đào tạo",
            "Giải trí",
            "Live",
            "Phim dài tập",
            "Phim điện ảnh",
            "Sự kiện - Đặc biệt",
            "TSV",
            "Thể thao",
            "Thời sự - Chính luận",
            "Thứ Ba",
            "Thứ Bảy",
            "Thứ Hai",
            "Thứ Năm",
            "Thứ Sáu",
            "Thứ Tư",
            "Tài liệu - Phóng sự",
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
            "ave_reach",
            "rating",
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