export const filterProductPayload = {
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
        "granularity": "date",
        "filters": [
          {
            "col": "product",
            "op": "IS NOT NULL"
          }
        ],
        "extras": {
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "product"
        ],
        "metrics": [],
        "orderby": [
          [
            "product",
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
        "product"
      ],
      "adhoc_filters": [
        {
          "expressionType": "SIMPLE",
          "subject": "product",
          "operator": "IS NOT NULL",
          "operatorId": "IS_NOT_NULL",
          "comparator": null,
          "clause": "WHERE",
          "sqlExpression": null,
          "isExtra": false,
          "isNew": false,
          "datasourceWarning": false,
          "filterOptionName": "filter_hosxrfn4o6_mfz7rm9bck"
        }
      ],
      "extra_filters": [],
      "extra_form_data": {
        "time_range": "DATEADD(DATETIME(\"today\"),-2, DAY) : DATEADD(DATETIME(\"today\"),-1, SECOND)"
      },
      "granularity_sqla": "date",
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
      "native_filter_id": "NATIVE_FILTER-7DXSrwapidPL3W-lT_CNe",
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};