export const durationSpotPieChartLenghtPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A615%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 195,
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
            "val": "2025-10-22T00:00:00 : 2025-10-28T00:00:00"
          }
        ],
        "extras": {
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          {
            "expressionType": "SQL",
            "label": "duration_spot",
            "sqlExpression": "CASE WHEN ratecard_duration <= 5 THEN '5s'\nWHEN ratecard_duration > 5 AND ratecard_duration <= 15 THEN '15s' WHEN ratecard_duration > 15 AND ratecard_duration <= 30 THEN '30s' ELSE 'Others' END"
          }
        ],
        "metrics": [
          "count"
        ],
        "orderby": [
          [
            "count",
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
      "datasource": "195__table",
      "viz_type": "pie",
      "slice_id": 615,
      "url_params": {},
      "groupby": [
        {
          "expressionType": "SQL",
          "label": "duration_spot",
          "sqlExpression": "CASE WHEN ratecard_duration <= 5 THEN '5s'\nWHEN ratecard_duration > 5 AND ratecard_duration <= 15 THEN '15s' WHEN ratecard_duration > 15 AND ratecard_duration <= 30 THEN '30s' ELSE 'Others' END"
        }
      ],
      "metric": "count",
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "2025-10-22T00:00:00 : 2025-10-28T00:00:00",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_vvztk7p1g9_xjo2309cl4s",
          "isExtra": false,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
      "row_limit": 50000,
      "sort_by_metric": true,
      "color_scheme": "supersetColors",
      "show_labels_threshold": 2,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "top",
      "label_type": "percent",
      "number_format": ",d",
      "date_format": "smart_date",
      "show_labels": true,
      "labels_outside": true,
      "label_line": true,
      "show_total": false,
      "outerRadius": 70,
      "donut": false,
      "innerRadius": 30,
      "annotation_layers": [],
      "dashboards": [
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 615,
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
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "Phim dài tập",
        "Quảng bá",
        "Quảng cáo",
        "Thể thao",
        "Thời sự - Chính luận",
        "Tài liệu - Phóng sự",
        "VTV Cần Thơ",
        "VTV1",
        "VTV2",
        "VTV3",
        "VTV4",
        "VTV8",
        "VTV9",
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