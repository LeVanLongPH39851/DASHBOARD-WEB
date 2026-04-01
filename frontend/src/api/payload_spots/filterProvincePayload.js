export const filterProvincePayload = {
  url: 'https://ratings.vtv.vn/api/v1/chart/data',
  payload: {
    "datasource": {
      "id": 158,
      "type": "table"
    },
    "force": false,
    "queries": [
      {
        "time_range": "No filter",
        "filters": [
          {
            "col": "others",
            "op": "==",
            "val": "Toàn quốc"
          }
        ],
        "extras": {
          "having": "",
          "where": ""
        },
        "applied_time_extras": {},
        "columns": [
          "province"
        ],
        "metrics": [
          "sort_province"
        ],
        "orderby": [
          [
            "sort_province",
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
      "defaultToFirstItem": false,
      "enableEmptyFilter": false,
      "inverseSelection": false,
      "multiSelect": true,
      "searchAllOptions": false,
      "sortAscending": true,
      "datasource": "158__table",
      "groupby": [
        "province"
      ],
      "sortMetric": "sort_province",
      "adhoc_filters": [
        {
          "clause": "WHERE",
          "comparator": "Toàn quốc",
          "datasourceWarning": false,
          "expressionType": "SIMPLE",
          "filterOptionName": "filter_d89obh3benv_mi55s1vn9ug",
          "isExtra": false,
          "isNew": false,
          "operator": "==",
          "operatorId": "EQUALS",
          "sqlExpression": null,
          "subject": "others"
        }
      ],
      "extra_filters": [],
      "extra_form_data": {},
      "metrics": [
        "count"
      ],
      "row_limit": 1000,
      "showSearch": true,
      "time_range": "No filter",
      "url_params": {
        "native_filters_key": "Nbns9NZoEsWSQA8OYmECuS__bJl7FRxp289AAglj_u6P2L0GcuwD7T_jjcmDsWl5"
      },
      "inView": true,
      "viz_type": "filter_select",
      "type": "NATIVE_FILTER",
      "dashboardId": 45,
      "native_filter_id": "NATIVE_FILTER-W9AKmuRoShOCcAOYg57A4",
      "force": false,
      "result_format": "json",
      "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
  }
};