import { allTableChartChannelPayload } from "../api/payloads";

var variableCustoms = {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    colorLive: '#6ce5e8',
    colorTimeshift: '#fe9273',
    colorRating: '#ff5757',
    colorAveReach: '#ffd04c',
    metricRating: 'rating',
    metricAveReach: 'ave_reach',
    metricRatingTimebandPercent: 'rating_timeband%',
    metricAveReachPercent: 'reach%_1'
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
        colors: [variableCustoms.colorLive, variableCustoms.colorTimeshift],
        ratingNameChart: 'Rating by Market',
        aveReachNameChart: 'Ave.Reach by Market',
        orientation: 'horizontal'
    },
    barChartDayEvent: {
        colors: [variableCustoms.colorLive, variableCustoms.colorTimeshift],
        ratingNameChart: 'Rating Day by Market',
        aveReachNameChart: 'Ave.Reach Day by Market',
        orientation: ''
    },
    barChartArea: {
        aveReach: {
            color: [variableCustoms.colorRating],
            name: 'RATING (000) theo thị trường'
        },
        rating: {
            color: [variableCustoms.colorAveReach],
            name: 'Ave.REACH (000) theo thị trường'
        },
        orientation: 'horizontal'
    },
    fontWeight: {
        legend: 500, tooltip: 500, axisLabel: 600, dataLabel: 700
    }
  },
  tableChart: {
    fontSize: {
        label: 16,
        td: 15
    },
    fontWeight: {
        label: 600,
        td: 500
    },
    tableChartChannel: {
        height: '600px',
        name: 'Chỉ số đo lường chi tiết từng chương trình',
        desciption: 'Chỉ số đo lường chi tiết từng chương trình',
        STT: false,
        pagination: false
    },
    tableChartArea: {
        height: '600px',
        name: 'Rating (%) và Reach (%) theo thị trường',
        desciption: 'Rating (%) và Reach (%)',
        STT: false,
        pagination: false
    },
  },
  mixedChart: {
    height: '500px',
    fontSize: {
      legend: 16, tooltip: 15, axisLabel: 14, dataLabel: 14
    },
    fontWeight: {
      legend: 500, tooltip: 500, axisLabel: 600, dataLabel: 700
    },
    mixedChartDate: {
      name: 'Biến động khán giả theo ngày',
      desciption: 'Biến động',
      metrics: {
        rating: [variableCustoms.metricRating],
        aveReach: [variableCustoms.metricAveReach]
      },
      colors: {
        'rating': variableCustoms.colorRating,
        'ave_reach': variableCustoms.colorAveReach
      }
    },
    mixedChartPercentTimeband: {
      name: 'Biến động RATING (%) và REACH (%) theo khung giờ',
      desciption: 'Biến động',
      metrics: {
        ratingPercent: [variableCustoms.metricRatingTimebandPercent],
        aveReachPercent: [variableCustoms.metricAveReachPercent]
      },
      colors: {
        'rating_timeband%': variableCustoms.colorRating,
        'reach%_1': variableCustoms.colorAveReach
      }
    },
    barMaxWidth: 100,
    barWidthPercent: '60%'
  }
};