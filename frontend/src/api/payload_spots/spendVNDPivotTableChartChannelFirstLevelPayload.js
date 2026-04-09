export const spendVNDPivotTableChartChannelFirstLevelPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A577%7D&dashboard_id=49`,
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
            "col": "firstlevel_vn",
            "op": "IS NOT NULL"
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
          "firstlevel_vn",
          "channel_name_tvd"
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
      "viz_type": "pivot_table_v2",
      "slice_id": 577,
      "url_params": {},
      "groupbyColumns": [
        "firstlevel_vn"
      ],
      "groupbyRows": [
        "channel_name_tvd"
      ],
      "temporal_columns_lookup": {
        "date": true
      },
      "metrics": [
        "price"
      ],
      "metricsLayout": "COLUMNS",
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": null,
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_mmx56gacw7_3158qp6nkb",
          "isExtra": false,
          "isNew": false,
          "operator": "IS NOT NULL",
          "operatorId": "IS_NOT_NULL",
          "sqlExpression": null,
          "subject": "firstlevel_vn"
        },
        {
          "clause": "WHERE",
          "comparator": "No filter",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_1x56qm5f6j8_g3uf8meas2r",
          "isExtra": true,
          "isNew": false,
          "operator": "TEMPORAL_RANGE",
          "sqlExpression": null,
          "subject": "date"
        }
      ],
      "row_limit": 50000,
      "order_desc": true,
      "aggregateFunction": "Sum",
      "rowTotals": false,
      "rowSubTotals": false,
      "colTotals": true,
      "colSubTotals": false,
      "transposePivot": false,
      "combineMetric": false,
      "valueFormat": ",.2f",
      "date_format": "smart_date",
      "rowOrder": "key_a_to_z",
      "colOrder": "value_z_to_a",
      "rowSubtotalPosition": false,
      "colSubtotalPosition": false,
      "conditional_formatting": [
        {
          "colorScheme": "#ACE1C4",
          "column": "price",
          "operator": "None"
        },
        {
          "colorScheme": "#EFA1AA",
          "column": "price",
          "operator": "≤",
          "targetValue": 0
        },
        {
          "colorScheme": "#FDE380",
          "column": "price",
          "operator": "=",
          "targetValue": 0
        }
      ],
      "allow_render_html": true,
      "annotation_layers": [],
      "dashboards": [
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 577,
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
      "extra_filters": [],
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};