export const filterProgramPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data`,
  payload: {
    "datasource": {
      "id": 179,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "granularity": "date",
        "filters": [],
        "extras": {
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "program_name"
        ],
        "metrics": [],
        "orderby": [
          [
            "program_name",
            true
          ]
        ],
        "annotation_layers": [],
        "row_limit": 1000,
        "series_limit": 0,
        "order_desc": true,
        "url_params": {
          "native_filters_key": "Nbns9NZoEsWSQA8OYmECuS__bJl7FRxp289AAglj_u6P2L0GcuwD7T_jjcmDsWl5"
        },
        "custom_params": {},
        "custom_form_data": {}
      }
    ],
    "form_data": {
      "enableEmptyFilter": false,
      "defaultToFirstItem": false,
      "multiSelect": true,
      "searchAllOptions": true,
      "inverseSelection": false,
      "datasource": "179__table",
      "groupby": [
        "program_name"
      ],
      "adhoc_filters": [],
      "extra_filters": [],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-1, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "granularity_sqla": "date",
      "metrics": [
        "count"
      ],
      "row_limit": 1000,
      "showSearch": true,
      "url_params": {
        "native_filters_key": "Nbns9NZoEsWSQA8OYmECuS__bJl7FRxp289AAglj_u6P2L0GcuwD7T_jjcmDsWl5"
      },
      "inView": true,
      "viz_type": "filter_select",
      "type": "NATIVE_FILTER",
      "dashboardId": 45,
      "native_filter_id": "NATIVE_FILTER-MIW4xkBpy_bNzfc7-RcmF",
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};