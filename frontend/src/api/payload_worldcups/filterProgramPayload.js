export const filterProgramPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data`,
  payload: {
    "datasource": {
      "id": 278,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-7, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "granularity": null,
        "filters": [],
        "extras": {
          "having": "",
          "where": "(program_name LIKE '%WORLD CUP 2026%')"
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
          "native_filters_key": "OcUvgu5jkVmkvrD-9pPuDlzcO0aYcFCk7b_yEqd1UiSa5RdQVnIh4crJTer84Kxh"
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
      "datasource": "278__table",
      "groupby": [
        "program_name"
      ],
      "adhoc_filters": [
        {
          "expressionType": "SQL",
          "sqlExpression": "program_name LIKE '%WORLD CUP 2026%'",
          "clause": "WHERE",
          "subject": null,
          "operator": null,
          "comparator": null,
          "isExtra": false,
          "isNew": false,
          "datasourceWarning": false,
          "filterOptionName": "filter_hdy1hazyqpw_tinlo0aadri"
        }
      ],
      "extra_filters": [],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-7, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "granularity_sqla": null,
      "metrics": [
        "count"
      ],
      "row_limit": 1000,
      "showSearch": true,
      "time_range": "No filter",
      "url_params": {
        "native_filters_key": "OcUvgu5jkVmkvrD-9pPuDlzcO0aYcFCk7b_yEqd1UiSa5RdQVnIh4crJTer84Kxh"
      },
      "inView": true,
      "viz_type": "filter_select",
      "type": "NATIVE_FILTER",
      "dashboardId": 66,
      "native_filter_id": "NATIVE_FILTER-MIW4xkBpy_bNzfc7-RcmF",
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};