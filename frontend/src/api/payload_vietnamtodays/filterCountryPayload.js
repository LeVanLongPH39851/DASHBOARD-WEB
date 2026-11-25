export const filterCountryPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data`,
  payload: {
    datasource: {
      id: 333,
      type: "table",
    },
    force: false,
    form_data: {
      adhoc_filters: [
        {
          clause: "WHERE",
          comparator: ["(not set)"],
          datasourceWarning: false,
          expressionType: "SIMPLE",
          filterOptionName: "filter_n8tepby7rl_pftydyoqy6j",
          isExtra: false,
          isNew: false,
          operator: "NOT IN",
          operatorId: "NOT_IN",
          sqlExpression: null,
          subject: "country",
        },
      ],
      dashboardId: 73,
      datasource: "333__table",
      defaultToFirstItem: false,
      enableEmptyFilter: false,
      extra_filters: [],
      extra_form_data: {},
      force: false,
      groupby: ["country"],
      inverseSelection: false,
      inView: true,
      metrics: ["count"],
      multiSelect: true,
      native_filter_id: "NATIVE_FILTER-xP5IzIaZk-9kg9diuQXMq",
      result_format: "json",
      result_type: "full",
      row_limit: 1000,
      searchAllOptions: false,
      showSearch: true,
      time_range: "No filter",
      type: "NATIVE_FILTER",
      url_params: {
        native_filters_key:
          "qFFJcRYEhpjuyzkO6ntesBkfsAmk-HTo96bOBt_2rHYwr9c0DZLojFbGTjAjbAMH",
      },
      viz_type: "filter_select",
    },
    queries: [
      {
        annotation_layers: [],
        applied_time_extras: {},
        columns: ["country"],
        custom_form_data: {},
        custom_params: {},
        extras: {
          having: "",
          where: "",
        },
        filters: [
          {
            col: "country",
            op: "NOT IN",
            val: ["(not set)"],
          },
        ],
        metrics: [],
        order_desc: true,
        orderby: [["country", true]],
        row_limit: 1000,
        series_limit: 0,
        time_range: "No filter",
        url_params: {
          native_filters_key:
            "qFFJcRYEhpjuyzkO6ntesBkfsAmk-HTo96bOBt_2rHYwr9c0DZLojFbGTjAjbAMH",
        },
      },
    ],
    result_format: "json",
    result_type: "full",
  },
};
