var variableCustoms = {
    fontFamily: '"Be Vietnam Pro", sans-serif',
    colorLive: 'rgba(91, 214, 216, 1)',
    colorTimeshift: '#fe9273',
    colorRating: 'rgba(255, 56, 60, 1)',
    colorAveReach: 'rgba(255, 204, 0, 1)',
    metricRating: ['rating', 'rating_timeband'],
    metricAveReach: ['ave_reach', 'ave_reach_1'],
    metricRatingPercent: 'rating_timeband%',
    metricAveReachPercent: 'reach%_1',
    colorChannel: {
    "VTV1": "rgba(217, 31, 38, 1)",
    "VTV2": "rgba(86, 154, 255, 1)",
    "VTV3": "rgba(128, 212, 27, 1)",
    "VTV5": "rgba(2, 147, 113, 1)",
    "VTV Cần Thơ": "rgba(253, 147, 242, 1)",
    "VTV4": "rgba(255, 146, 64, 1)",
    "VTV9": "rgba(158, 121, 65, 1)",
    "VTV5 Tây Nam Bộ": "rgba(189, 189, 189, 1)",
    "VTV8": "rgba(174, 74, 164, 1)",
    "VTV7": "rgba(99, 234, 255, 1)",
    "VTV5 Tây Nguyên": "rgba(238, 245, 60, 1)",
    "VTV10": "rgba(253, 147, 242, 1)"
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
    },
    colorDuration: {
    "15s": "#6BD3B3",
    "30s": "#FCC550",
    "5s": "#EE5960",
    "Others": "#408184"
    }
}

export const CUSTOM_CHART = {
  domain: 'https://testvtv-long.datahub.net.vn',
  allChart: {
    fontFamily: variableCustoms.fontFamily
  },
  numberWithTrendChart: {
    fontSize: {
        tooltip: 12
    },
    fontWeight: {
        tooltip: 500
    }
  },
  barChart: {
    height: 332,
    fontSize: {
        legend: 12, tooltip: 12, axisLabel: 12, dataLabel: 12
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
            color: [variableCustoms.colorAveReach],
            name: 'Ave.Reach (000) theo thị trường',
            colorZoom: 'yellow'
        },
        rating: {
            color: [variableCustoms.colorRating],
            name: 'Rating (000) theo thị trường',
            colorZoom: 'red'
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
        height: '400px',
        name: 'Chỉ số đo lường kênh',
        description: 'Chỉ số đo lường kênh',
        STT: false,
        pagination: false,
        center: true
    },
    tableChartArea: {
        height: '400px',
        name: 'Rating (%) và Ave.Reach (%) theo thị trường',
        description: 'Rating (%)',
        STT: false,
        pagination: false
    },
    tableProgramChannel: {
        height: '550px',
        programRank: {
          name: 'XẾP HẠNG chương trình theo các chỉ số',
          description: 'XẾP HẠNG chương trình theo các chỉ số',
        },
        programDetail: {
          name: 'Chỉ số đo lường chi tiết từng chương trình',
          description: 'Chỉ số đo lường chi tiết từng chương trình',
        },
        programEvent: {
          name: 'Chỉ số đo lường chương trình theo Live/TimeShift',
          description: 'Chỉ số đo lường chương trình theo Live/TimeShift',
        },
        STT: true,
        pagination: true
    }
  },
  mixedChart: {
    height: '399px',
    fontSize: {
      legend: 12, tooltip: 12, axisLabel: 12, dataLabel: 12
    },
    fontWeight: {
      legend: 600, tooltip: 500, axisLabel: 500, dataLabel: 600
    },
    mixedChartDate: {
      name: 'Biến động khán giả theo ngày',
      description: 'Biến động',
      metrics: {
        rating: [variableCustoms.metricRating[0]],
        aveReach: [variableCustoms.metricAveReach[0]]
      },
      colors: {
        'rating': variableCustoms.colorRating,
        'ave_reach': variableCustoms.colorAveReach
      },
      maxVisibleItems: 10,
      lastDataIndexActive: true
    },
    mixedChartPercentTimeband: {
      name: 'Biến động Rating (%) và Ave.Reach (%) theo khung giờ',
      description: 'Biến động',
      metrics: {
        ratingPercent: [variableCustoms.metricRatingPercent],
        aveReachPercent: [variableCustoms.metricAveReachPercent]
      },
      colors: {
        'rating_timeband%': variableCustoms.colorRating,
        'reach%_1': variableCustoms.colorAveReach
      },
      offsetLine: -1,
      xAxisTitle: 'Khung giờ (H)'
    },
    mixedChartTimeband: {
      name: 'Biến động Rating (000) và Ave.Reach (000) theo khung giờ',
      description: 'Biến động',
      metrics: {
        rating: [variableCustoms.metricRating[1]],
        aveReach: [variableCustoms.metricAveReach[1]]
      },
      colors: {
        'rating_timeband': variableCustoms.colorRating,
        'ave_reach_1': variableCustoms.colorAveReach
      },
      KMB: true,
      offsetLine: -1,
      xAxisTitle: 'Khung giờ (H)'
    },
    barMaxWidth: 100,
    barWidthPercent: '60%'
  },
  lineChart: {
    height: '399px',
    fontSize: {
      legend: 12, tooltip: 12, axisLabel: 12, dataLabel: 12
    },
    fontWeight: {
      legend: 600, tooltip: 500, axisLabel: 500, dataLabel: 500
    },
    lineChartPercentTimebandChannel: {
      name: 'Biến động Rating (%) kênh theo khung giờ',
      description: 'Biến động',
      showTopNSeries: 3
    },
    lineChartPercentDateChannel: {
      aveReach: {
        name: 'Biến động Reach (%) kênh theo ngày',
        description: 'Biến động'
      },
      rating: {
        name: 'Biến động Rating (%) kênh theo ngày',
        description: 'Biến động'
      }
    },
    lineChartTimebandChannel: {
      aveReach: {
        name: 'Biến động Ave.Reach (000) kênh theo khung giờ',
        description: 'Biến động'
      },
      rating: {
        name: 'Biến động Rating (000) kênh theo khung giờ',
        description: 'Biến động'
      },
      showTopNSeries: 3
    },
    lineChartDateChannel: {
      aveReach: {
        name: 'Biến động Reach (000) kênh theo ngày',
        description: 'Biến động'
      },
      rating: {
        name: 'Biến động Rating (000) kênh theo ngày',
        description: 'Biến động'
      }
    },
    lineChartTimebandDay: {
      aveReach: {
        name: 'Biến động Ave.Reach (000) ngày trong tuần theo khung giờ',
        description: 'Biến động'
      },
      rating: {
        name: 'Biến động Rating (000) ngày trong tuần theo khung giờ',
        description: 'Biến động'
      },
      left: 100,
      showTopNSeries: 3,
    },
    lineChartTimebandRegional: {
        name: 'Biến động Ave.Reach (000) vùng theo khung giờ',
        description: 'Biến động',
        showTopNSeries: 3,
        left: 260
    },
    lineChartMinuteChannel: {
        name: 'Xu hướng Rating (000) CÁC KÊNH',
        description: 'Biến động',
        legendTop: true
    },
    lineChartMinuteDay: {
        name: 'RATING (000) KÊNH TRONG NGÀY',
        description: 'Biến động',
        legendTop: true
    },
    lineChartMinuteDays: {
        name: 'RATING (000) CHƯƠNG TRÌNH theo phút (nhiều ngày)',
        description: 'Biến động',
        legendTop: true
    },
    colorChannel: variableCustoms.colorChannel,
    smooth: true,
    symbolSize: 7,
    lineWidth: 2,
    areaStyle: false,
    stack: false,
    showTopNSeries: null,
    xAxisTitle: 'Khung giờ (H)'
  },
  treeMapChart: {
    height: '350px',
    fontSize: { tooltip: 12, label: 12 },
    fontWeight: { tooltip: 500, label: 600 },
    treeMapChartPercentChannel: {
      name: 'Thị phần kênh theo Ave.Reach (%)',
      description: 'Thị phần'
    },
    treeMapChartChannel: {
      name: 'Thị phần kênh theo Rating (000)',
      description: 'Thị phần'
    },
    colorChannel: variableCustoms.colorChannel
  },
  pieChart: {
    height: 320,
    fontSize: { tooltip: 12, legend: 12 , dataLabel: 12},
    fontWeight: { tooltip: 500, legend: 500 , dataLabel: 600},
    pieChartFirstLevel: {
      totalEvent: {
        name: 'Tỉ lệ THỜI LƯỢNG PHÁT các thể loại',
        description: 'Tỉ lệ'
      },
      totalView: {
        name: 'Tỉ lệ THỜI LƯỢNG XEM các thể loại',
        description: 'Tỉ lệ'
      }
    },
    colorFirstLevel: variableCustoms.colorFirstLevel,
    colorChannel: variableCustoms.colorChannel,
    colorDuration: variableCustoms.colorDuration,
    donut: true,
    innerRadius: 45
  }
};