export const filterProgramPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data`,
  payload: {
    "datasource": {
      "id": 195,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)",
        "granularity": null,
        "filters": [
          {
            "col": "program_name",
            "op": "IS NOT NULL"
          }
        ],
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
          "native_filters_key": "lItp2UHHv9WwzsHwV2xHwArdIlQehCU5yY2wbhqSKZlcG87G5ygnMiCYfQR1Dqyw"
        },
        "custom_params": {},
        "custom_form_data": {}
      }
    ],
    "form_data": {
      "enableEmptyFilter": false,
      "defaultToFirstItem": false,
      "multiSelect": true,
      "searchAllOptions": false,
      "inverseSelection": false,
      "datasource": "195__table",
      "groupby": [
        "program_name"
      ],
      "adhoc_filters": [
        {
          "expressionType": "SIMPLE",
          "subject": "program_name",
          "operator": "IS NOT NULL",
          "operatorId": "IS_NOT_NULL",
          "comparator": null,
          "clause": "WHERE",
          "sqlExpression": null,
          "isExtra": false,
          "isNew": false,
          "datasourceWarning": false,
          "filterOptionName": "filter_xl9ovxffmo_k240zy040uj"
        }
      ],
      "extra_filters": [],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "granularity_sqla": null,
      "metrics": [
        "count"
      ],
      "row_limit": 1000,
      "showSearch": true,
      "time_range": "No filter",
      "url_params": {
        "native_filters_key": "lItp2UHHv9WwzsHwV2xHwArdIlQehCU5yY2wbhqSKZlcG87G5ygnMiCYfQR1Dqyw"
      },
      "inView": true,
      "viz_type": "filter_select",
      "type": "NATIVE_FILTER",
      "dashboardId": 49,
      "native_filter_id": "NATIVE_FILTER-_ynpR2LbP8yFDoVbzt4yI",
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};