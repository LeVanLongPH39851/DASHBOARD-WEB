var variableCustoms = {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    colorLive: '#6ce5e8',
    colorTimeshift: '#fe9273'
}

export const CUSTOM_CHART = {
  allChart: {
    fontFamily: variableCustoms.fontFamily
  },
  barChart: {
    height: 420,
    fontSize: {
        legend: 16, tooltip: 15, axisLabel: 14, dataLabel: 14
    },
    barChartChannelEvent: {
        colors: [variableCustoms.colorLive, variableCustoms.colorTimeshift]
    },
    fontWeight: {
        legend: 500, tooltip: 500, axisLabel: 600, dataLabel: 700
    }
  }
};