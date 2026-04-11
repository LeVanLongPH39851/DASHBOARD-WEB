export const spendVNDPieChartAdvertiserPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A586%7D&dashboard_id=49`,
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
            "val": "No filter"
          }
        ],
        "extras": {
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          {
            "datasourceWarning": false,
            "expressionType": "SQL",
            "label": "Avertiser",
            "sqlExpression": "CASE\r\nWHEN length(advertiser) > 15\r\n   THEN CONCAT(left(advertiser, 15), '...')\r\nELSE advertiser\r\nEND"
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
      "slice_id": 586,
      "url_params": {},
      "groupby": [
        {
          "datasourceWarning": false,
          "expressionType": "SQL",
          "label": "Avertiser",
          "sqlExpression": "CASE\r\nWHEN length(advertiser) > 15\r\n   THEN CONCAT(left(advertiser, 15), '...')\r\nELSE advertiser\r\nEND"
        }
      ],
      "metric": "price",
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "expressionType": "SIMPLE",
          "operator": "TEMPORAL_RANGE",
          "subject": "date"
        }
      ],
      "row_limit": 50000,
      "sort_by_metric": true,
      "color_scheme": "echarts5Colors",
      "show_labels_threshold": 1,
      "roseType": null,
      "show_legend": true,
      "legendType": "scroll",
      "legendOrientation": "right",
      "label_type": "percent",
      "number_format": ",.2f",
      "date_format": "smart_date",
      "show_labels": true,
      "labels_outside": true,
      "label_line": true,
      "outerRadius": 70,
      "donut": true,
      "innerRadius": 41,
      "annotation_layers": [],
      "dashboards": [
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 586,
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
        "price_usd",
        "Đời sống"
      ],
      "map_label_colors": {},
      "own_color_scheme": "echarts5Colors",
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};