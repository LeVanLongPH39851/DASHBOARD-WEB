export const totalViewDurationPieChartFirstLevelPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A637%7D&dashboard_id=50`,
  payload: {
    "datasource": {
      "id": 209,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "firstlevel_vn",
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
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "firstlevel_vn"
        ],
        "metrics": [
          "total_duration"
        ],
        "orderby": [
          [
            "total_duration",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_limit": 0,
        "order_desc": true,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {}
      }
    ],
    "form_data": {
      "datasource": "209__table",
      "viz_type": "pie",
      "slice_id": 637,
      "url_params": {},
      "groupby": [
        "firstlevel_vn"
      ],
      "metric": "total_duration",
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": [
            "active"
          ],
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_g7aiw93q6hw_g5j5tdlj52l",
          "isExtra": false,
          "isNew": false,
          "operator": "NOT IN",
          "operatorId": "NOT_IN",
          "sqlExpression": null,
          "subject": "firstlevel_vn"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_a4sz3qcrbz5_pg2nh65b12p",
          "isExtra": true,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
      "row_limit": 50000,
      "sort_by_metric": true,
      "color_scheme": "presetColors",
      "show_labels_threshold": 1,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "right",
      "label_type": "percent",
      "number_format": ",d",
      "date_format": "smart_date",
      "show_labels": true,
      "labels_outside": true,
      "label_line": true,
      "outerRadius": 64,
      "donut": true,
      "innerRadius": 36,
      "annotation_layers": [],
      "dashboards": [
        87
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 637,
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
        "Thứ Sáu",
        "Tài liệu - Phóng sự",
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