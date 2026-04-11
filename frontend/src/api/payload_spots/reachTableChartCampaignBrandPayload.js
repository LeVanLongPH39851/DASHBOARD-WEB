export const reachTableChartCampaignBrandPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data?form_data=%7B%22slice_id%22%3A613%7D&dashboard_id=49`,
  payload: {
    "datasource": {
      "id": 201,
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
            "val": "2025-11-01T00:00:00 : 2025-11-16T23:59:59"
          }
        ],
        "extras": {
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "campaign_name",
          "brand",
          "advertiser"
        ],
        "metrics": [
          "reach"
        ],
        "orderby": [
          [
            "reach",
            false
          ]
        ],
        "annotation_layers": [],
        "row_limit": 50000,
        "series_limit": 0,
        "order_desc": true,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [],
        "time_offsets": []
      },
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "filters": [
          {
            "col": "date",
            "op": "TEMPORAL_RANGE",
            "val": "2025-11-01T00:00:00 : 2025-11-16T23:59:59"
          }
        ],
        "extras": {
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [],
        "metrics": [
          "reach"
        ],
        "annotation_layers": [],
        "row_limit": 0,
        "row_offset": 0,
        "series_limit": 0,
        "url_params": {},
        "custom_params": {},
        "custom_form_data": {},
        "post_processing": [],
        "time_offsets": []
      }
    ],
    "form_data": {
      "datasource": "201__table",
      "viz_type": "table",
      "slice_id": 613,
      "url_params": {},
      "query_mode": "aggregate",
      "groupby": [
        "campaign_name",
        "brand",
        "advertiser"
      ],
      "temporal_columns_lookup": {
        "date": true
      },
      "metrics": [
        "reach"
      ],
      "all_columns": [],
      "percent_metrics": [],
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "2025-11-01T00:00:00 : 2025-11-16T23:59:59",
          "expressionType": "SIMPLE",
          "operator": "TEMPORAL_RANGE",
          "subject": "date"
        }
      ],
      "order_by_cols": [],
      "row_limit": 50000,
      "server_page_length": 10,
      "order_desc": true,
      "show_totals": true,
      "table_timestamp_format": "smart_date",
      "include_search": true,
      "allow_render_html": true,
      "column_config": {
        "reach": {
          "d3NumberFormat": ",d"
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
      "chart_id": 613,
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
        "2.Trưa (11h - 14h)",
        "3.Chiều (14h - 18h)",
        "4.Tối (18h - 24h)",
        "AJINOMOTO VIETNAM",
        "BONCHA (RTD GREEN TEA)",
        "CHIN-SU (CHILI SAUCE)",
        "Dành cho trẻ em",
        "Giáo dục - Đào tạo",
        "Giải trí",
        "HISMART",
        "KOKOMI SNACKING",
        "MORINAGA",
        "NESTLE NAN",
        "Phim dài tập",
        "Quảng bá",
        "Quảng cáo",
        "SAM NHUNG BO THAN TW3 (ORIENTAL KIDNEY RESTORATIVE MEDICINE)",
        "TAM BINH (DRINK SUPP.)",
        "TH TRUE MILK (FRESH MILK)",
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