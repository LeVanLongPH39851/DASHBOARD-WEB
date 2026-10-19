export const filterSourcePayload = {
  url: `${import.meta.env.VITE_API_DOMAIN}/api/v1/chart/data`,
  payload: {
    datasource: {
      id: 318,
      type: "table",
    },
    force: false,
    form_data: {
      adhoc_filters: [],
      dashboardId: 73,
      datasource: "318__table",
      defaultToFirstItem: false,
      enableEmptyFilter: false,
      extra_filters: [],
      extra_form_data: {},
      force: false,
      groupby: ["source"],
      inverseSelection: false,
      inView: true,
      metrics: ["count"],
      multiSelect: true,
      native_filter_id: "NATIVE_FILTER-CuRL2SFMzqcYG4Ja-B6EV",
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
        columns: ["source"],
        custom_form_data: {},
        custom_params: {},
        extras: {
          having: "",
          where: "",
        },
        filters: [],
        metrics: [],
        order_desc: true,
        orderby: [["source", true]],
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
