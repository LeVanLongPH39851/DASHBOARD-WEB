var variableCustoms = {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    colorLive: 'rgba(91, 214, 216, 1)',
    colorTimeshift: 'rgba(72, 151, 252, 1)',
    colorRating: '#ff5757',
    colorAveReach: '#ffd04c',
    metricRating: ['rating', 'rating_timeband'],
    metricAveReach: ['ave_reach', 'ave_reach_1'],
    metricRatingPercent: 'rating_timeband%',
    metricAveReachPercent: 'reach%_1',
    colorChannel: {
    "VTV1": "#ca2d1e",
    "VTV2": "#42932b",
    "VTV3": "#000191",
    "VTV5": "#9467bd",
    "VTV Cần Thơ": "#6ce5e8",
    "VTV4": "#8c564b",
    "VTV9": "#e377c2",
    "VTV5 Tây Nam Bộ": "#7f7f7f",
    "VTV8": "#bcbd22",
    "VTV7": "#2d8bba",
    "VTV5 Tây Nguyên": "#b97286"
    },
    colorFirstLevel: {
    "Thời sự - Chính luận": "#6BD3B3",
    "Phim dài tập": "#FCC550",
    "Đời sống": "#EE5960",
    "Tài liệu - Phóng sự": "#408184",
    "Giải trí": "#66CBE2",
    "Giáo dục - Đào tạo": "#5470C6",
    "Dành cho trẻ em": "#ffb2f3",
    "Thể thao": "#FF874E",
    "Sự kiện": "#03748E",
    "Quảng bá": "#8c564a",
    "Phim truyện": "#C9BBAB",
    "Quảng cáo": "#B17BAA"
    }
}

export const CUSTOM_CHART = {
  allChart: {
    fontFamily: variableCustoms.fontFamily
  },
  barChart: {
    height: 332,
    fontSize: {
        legend: 12, tooltip: 15, axisLabel: 12, dataLabel: 12
    },
    barChartChannelEvent: {
        colors: [variableCustoms.colorLive, variableCustoms.colorTimeshift],
        ratingNameChart: 'Lượng khán giả bình quân mỗi ngày',
        aveReachNameChart: 'Lượng khán giả bình quân mỗi ngày',
        orientation: 'horizontal'
    },
    barChartDayEvent: {
        colors: [variableCustoms.colorLive, variableCustoms.colorTimeshift],
        ratingNameChart: 'Lượng khán giả bình quân mỗi ngày',
        aveReachNameChart: 'Lượng khán giả bình quân mỗi ngày',
        orientation: ''
    },
    barChartArea: {
        aveReach: {
            color: [variableCustoms.colorRating],
            name: 'Ave.REACH (000) theo thị trường'
        },
        rating: {
            color: [variableCustoms.colorAveReach],
            name: 'RATING (000) theo thị trường'
        },
        orientation: 'horizontal'
    },
    fontWeight: {
        legend: 600, tooltip: 500, axisLabel: 500, dataLabel: 500
    }
  },
  tableChart: {
    fontSize: {
        label: 14,
        td: 14
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
        desciption: 'Rating (%)',
        STT: false,
        pagination: false
    },
    tableProgramChannel: {
        height: '550px',
        programRank: {
          name: 'XẾP HẠNG chương trình theo các chỉ số',
          desciption: 'XẾP HẠNG chương trình theo các chỉ số',
        },
        programDetail: {
          name: 'Chỉ số đo lường chi tiết từng chương trình',
          desciption: 'Chỉ số đo lường chi tiết từng chương trình',
        },
        programEvent: {
          name: 'Chỉ số đo lường chương trình theo Live/TimeShift',
          desciption: 'Chỉ số đo lường chương trình theo Live/TimeShift',
        },
        STT: true,
        pagination: true
    }
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
        rating: [variableCustoms.metricRating[0]],
        aveReach: [variableCustoms.metricAveReach[0]]
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
        ratingPercent: [variableCustoms.metricRatingPercent],
        aveReachPercent: [variableCustoms.metricAveReachPercent]
      },
      colors: {
        'rating_timeband%': variableCustoms.colorRating,
        'reach%_1': variableCustoms.colorAveReach
      }
    },
    mixedChartTimeband: {
      name: 'Biến động RATING và REACH theo khung giờ',
      desciption: 'Biến động',
      metrics: {
        rating: [variableCustoms.metricRating[1]],
        aveReach: [variableCustoms.metricAveReach[1]]
      },
      colors: {
        'rating_timeband': variableCustoms.colorRating,
        'ave_reach_1': variableCustoms.colorAveReach
      }
    },
    barMaxWidth: 100,
    barWidthPercent: '60%'
  },
  lineChart: {
    height: '500px',
    fontSize: {
      legend: 16, tooltip: 15, axisLabel: 14, dataLabel: 14
    },
    fontWeight: {
      legend: 500, tooltip: 500, axisLabel: 600, dataLabel: 700
    },
    lineChartPercentTimebandChannel: {
      name: 'Biến động RATING (%) kênh theo khung giờ',
      desciption: 'Biến động',
      showTopNSeries: 3
    },
    lineChartPercentDateChannel: {
      aveReach: {
        name: 'Biến động Reach (%) kênh theo ngày',
        desciption: 'Biến động'
      },
      rating: {
        name: 'Biến động RATING (%) kênh theo ngày',
        desciption: 'Biến động'
      }
    },
    lineChartTimebandChannel: {
      aveReach: {
        name: 'Biến động Reach kênh theo khung giờ',
        desciption: 'Biến động'
      },
      rating: {
        name: 'Biến động RATING kênh theo khung giờ',
        desciption: 'Biến động'
      },
      showTopNSeries: 3
    },
    lineChartDateChannel: {
      aveReach: {
        name: 'Biến động Reach kênh theo ngày',
        desciption: 'Biến động'
      },
      rating: {
        name: 'Biến động RATING kênh theo ngày',
        desciption: 'Biến động'
      }
    },
    lineChartTimebandDay: {
      aveReach: {
        name: 'Biến động Ave.REACH (000) ngày trong tuần theo khung giờ',
        desciption: 'Biến động'
      },
      rating: {
        name: 'Biến động RATING (000) ngày trong tuần theo khung giờ',
        desciption: 'Biến động'
      }
    },
    lineChartTimebandRegional: {
        name: 'Biến động Ave.REACH (000) vùng theo khung giờ',
        desciption: 'Biến động',
        showTopNSeries: 3
    },
    colorChannel: variableCustoms.colorChannel,
    smooth: true,
    symbolSize: 6,
    lineWidth: 3,
    areaStyle: false,
    stack: false,
    showTopNSeries: null
  },
  treeMapChart: {
    height: '500px',
    fontSize: { tooltip: 14, label: 13 },
    fontWeight: { tooltip: 500, label: 600 },
    treeMapChartPercentChannel: {
      name: 'Thị phần kênh theo Reach (%)',
      desciption: 'Thị phần'
    },
    treeMapChartChannel: {
      name: 'Thị phần kênh theo RATING',
      desciption: 'Thị phần'
    },
    colorChannel: variableCustoms.colorChannel
  },
  pieChart: {
    height: 420,
    fontSize: { tooltip: 14, legend: 15 , dataLabel: 14},
    fontWeight: { tooltip: 500, legend: 500 , dataLabel: 500},
    pieChartFirstLevel: {
      totalEvent: {
        name: 'Tỉ lệ THỜI LƯỢNG PHÁT các thể loại',
        desciption: 'Tỉ lệ'
      },
      totalView: {
        name: 'Tỉ lệ THỜI LƯỢNG XEM các thể loại',
        desciption: 'Tỉ lệ'
      }
    },
    colorFirstLevel: variableCustoms.colorFirstLevel,
    donut: true,
    innerRadius: 50
  }
};