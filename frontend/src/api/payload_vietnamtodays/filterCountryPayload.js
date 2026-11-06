export const filterCountryPayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data`,
  payload: {
    datasource: {
      id: 317,
      type: "table",
    },
    force: false,
    form_data: {
      adhoc_filters: [],
      dashboardId: 73,
      datasource: "317__table",
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
      type: "NATIVE_FILTER",
      url_params: {
        native_filters_key:
          "MgCV6-72oLuZ-SwWwrEI4ChE-grHnHGJ_gSmIckR9ONcxrlj18IdZCzn_ax6LSWN",
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
        filters: [],
        metrics: [],
        order_desc: true,
        orderby: [["country", true]],
        row_limit: 1000,
        series_limit: 0,
        url_params: {
          native_filters_key:
            "MgCV6-72oLuZ-SwWwrEI4ChE-grHnHGJ_gSmIckR9ONcxrlj18IdZCzn_ax6LSWN",
        },
      },
    ],
    result_format: "json",
    result_type: "full",
  },
};
