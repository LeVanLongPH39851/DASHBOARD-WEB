export const top10AllTableChartBrandPayload = {
  url: 'https://ratings.vtv.vn/api/v1/chart/data?form_data=%7B%22slice_id%22%3A593%7D&dashboard_id=49',
  payload: {
    "datasource": {
      "id": 198,
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
          "brand"
        ],
        "metrics": [
          "price",
          "price_usd",
          "count",
          "percent_price",
          "percent_count",
          "percent_duration",
          "percent_grp"
        ],
        "orderby": [
          [
            "price",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 10,
        "series_limit": 0,
        "order_desc": true,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [
          {
            "operation": "contribution",
            "options": {
              "columns": [
                "percent_price",
                "percent_count",
                "percent_duration",
                "percent_grp"
              ],
              "rename_columns": [
                "%percent_price",
                "%percent_count",
                "%percent_duration",
                "%percent_grp"
              ]
            }
          }
        ],
        "time_offsets": []
      }
    ],
    "form_data": {
      "datasource": "198__table",
      "viz_type": "table",
      "slice_id": 593,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "brand"
      ],
      "temporal_columns_lookup": {
        "date": true
      },
      "metrics": [
        "price",
        "price_usd",
        "count"
      ],
      "all_columns": [],
      "percent_metrics": [
        "percent_price",
        "percent_count",
        "percent_duration",
        "percent_grp"
      ],
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
      "row_limit": 10,
      "server_page_length": 10,
      "order_desc": true,
      "show_totals": false,
      "table_timestamp_format": "smart_date",
      "include_search": true,
      "allow_render_html": true,
      "column_config": {
        "%percent_count": {
          "d3NumberFormat": ".2%"
        },
        "%percent_duration": {
          "d3NumberFormat": ".2%"
        },
        "%percent_grp": {
          "d3NumberFormat": ".2%"
        },
        "%percent_price": {
          "d3NumberFormat": ".2%"
        },
        "count": {
          "d3NumberFormat": ",d"
        },
        "percent_price": {
          "d3NumberFormat": "SMART_NUMBER"
        },
        "price": {
          "d3NumberFormat": ",.2f"
        },
        "price_usd": {
          "currencyFormat": {
            "symbol": "USD"
          },
          "d3NumberFormat": ",.2f"
        }
      },
      "show_cell_bars": true,
      "color_pn": true,
      "comparison_color_scheme": "Green",
      "conditional_formatting": [],
      "comparison_type": "values",
      "annotation_layers": [],
      "dashboards": [
        80
      ],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "chart_id": 593,
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
        "price"
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