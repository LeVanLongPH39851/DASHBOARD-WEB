export const filterAdcodePayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data`,
  payload: {
    "datasource": {
        "id": 195,
        "type": "table"
    },
    "force": false,
    "queries": [
        {
            "filters": [],
            "extras": {
                "having": "",
                "where": ""
            },
            "applied_time_extras": {},
            "columns": [
                "ads_code"
            ],
            "metrics": [],
            "orderby": [
                [
                    "ads_code",
                    true
                ]
            ],
            "annotation_layers": [],
            "row_limit": 1000,
            "series_limit": 0,
            "order_desc": true,
            "url_params": {},
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
            "ads_code"
        ],
        "adhoc_filters": [],
        "extra_filters": [],
        "extra_form_data": {},
        "metrics": [
            "count"
        ],
        "row_limit": 1000,
        "showSearch": true,
        "url_params": {},
        "inView": true,
        "viz_type": "filter_select",
        "type": "NATIVE_FILTER",
        "dashboardId": 49,
        "native_filter_id": "NATIVE_FILTER-jkHbRazmDBirqU7Tz1obp",
        "force": false,
        "result_format": "json",
        "result_type": "full"
    },
    "result_format": "json",
    "result_type": "full"
}
};