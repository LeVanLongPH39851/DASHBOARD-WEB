import React, { memo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NameChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';
import NoData from '../commons/NoData';

const PieChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  colors, // Hỗ trợ cả array và object
  enableLegend = true,
  donut, // true = donut chart, false = pie chart
  innerRadius, // % cho donut
  labelDisplay = 'percent', // NEW: 'percent', 'label', 'label-percent', 'percent-label'
  formatterValue = 0,
  border = true,
  suffix='',
  legendHorizontal=false,
  center=false
}) => {

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  if(data==='isLoading') {
    return (
      <div className='p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NameChart nameChart={nameChart} description={description} />
        <Loading height={!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 250 : 210} />
      </div>
    );
  } else if (!data) {
    return (
      <div className='p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NameChart nameChart={nameChart} description={description} />
        <NoData height={!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 250 : 210} />
      </div>
    );
  }

  const chartRef = useRef(null);

  const { labels = [], values = [], series = [] } = data;

  // Dùng series nếu có, fallback về labels + values
  const pieSeriesData = series.length > 0 
    ? series 
    : labels.map((name, i) => ({
        name,
        value: values[i] || 0,
      }));

  const getEChartsData = useCallback(() => {
    if (chartRef.current) {
      try {
        const instance = chartRef.current.getEchartsInstance();
        const option = instance.getOption();
        
        const legendSelected = option.legend?.[0]?.selected || {};
        const pieData = option.series?.[0]?.data || pieSeriesData;
        const visibleData = pieData.filter(item => legendSelected[item.name] !== false);
        
        return {
          labels: visibleData.map(item => item.name),
          series: [{
            data: visibleData.map(item => item.value || 0)  // ✅ Không cần name
          }]
        };
      } catch (error) {
        console.error('Lỗi PieChart data:', error);
        return {
          labels: pieSeriesData.map(item => item.name),
          series: [{ data: pieSeriesData.map(item => item.value || 0) }]
        };
      }
    }
    return {
      labels: pieSeriesData.map(item => item.name),
      series: [{ data: pieSeriesData.map(item => item.value || 0) }]
    };
  }, [pieSeriesData]);  // ✅ Chỉ deps cần thiết

  const DEFAULT_COLORS = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#c23531'
  ];

  // Helper function để lấy màu theo tên label (ưu tiên colorFirstLevel object)
  const getColorForItem = (name, index) => {
    // Nếu colors là object (colorFirstLevel), lấy màu theo tên
    if (colors && typeof colors === 'object' && !Array.isArray(colors)) {
      return colors[name] || colors[`${name}`.trim()] || DEFAULT_COLORS[0];
    }
    // Nếu là array, lấy theo index
     // Array colors
    if (Array.isArray(colors) && colors.length > 0) {
      return colors[index % colors.length];
    }
    
    // ✅ Default palette theo index
    return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };
  
  // Helper function để format label theo option
  const getLabelFormatter = () => {
    switch (labelDisplay) {
      case 'percent':
        return '{c|{d}%}';
      case 'label':
        return '{b|{b}}';
      case 'label-percent':
        return '{b|{b}}\n{c|{d}%}';  // ✅ Chỉ 1 backslash
      case 'percent-label':
        return '{c|{d}%}\n{b|{b}}';  // ✅ Chỉ 1 backslash
      default:
        return '{b|{b}}\n{c|{d}%}';  // ✅ Chỉ 1 backslash
    }
  };
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,1)',
      borderWidth: 0,
      textStyle: { 
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.tooltip : '11px' : '10.5px',
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
      formatter: (params) => {
        const percent = params.percent;
        return `
            <div style="padding: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '4'}px ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '16' : '15' : '8'}px; box-shadow: 0 ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '4' : '3' : '2'}px ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '4'}px rgba(0,0,0,0.1);">
            <div style="font-weight: 500; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '13' : '12' : '11'}px; color: rgba(0, 0, 0, 0.7);">
              ${params.marker} ${params.name}
            </div>
            <div style="font-weight: 400; color: #059669; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '10.5'}px;">
              ${params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') || formatterValue > 0 ? 2 : 0) })} ${suffix} <span style="font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '11' : '10.5' : '10'}px">(${(percent || 0).toFixed(2)}%)</span>
            </div>
          </div>
        `;
      },
    },

    legend: enableLegend ? {
      type: 'scroll',
      orient: !stateGlobals.screen_md && !legendHorizontal ? 'vertical' : 'horizontal',
      left: 0,
      top: 0,
      itemWidth: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 13 : 12 : 10,
      itemHeight: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 13 : 12 : 10,
      icon: 'circle',
      itemGap: 8,
      textStyle: {
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize?.legend : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(30, 27, 57, 1)' : 'rgba(225, 225, 225, 0.9)',
        fontWeight: fontWeight?.legend,
        fontFamily: fontFamily,
        letterSpacing: '0.1px'
      },
    } : {
      show: false,
    },

    series: [{
      name: nameChart,
      type: 'pie',
      radius: donut ? [innerRadius + '%', '75%'] : ['0%', '75%'],
      avoidLabelOverlap: false,
      center: [!stateGlobals.screen_md && enableLegend && !legendHorizontal && !center ? '60%' : '50%', '50%'],
      top: !stateGlobals.screen_md && !legendHorizontal ? 0 : '10%',
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: !stateGlobals.darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(225,225,225,225.2)',
        },
        labelLine: {
          lineStyle: {
            width: 4
          }
        }
      },
      label: {
        show: true,
        position: 'outer',
        formatter: getLabelFormatter(),
        fontSize: fontSize?.dataLabel,
        fontWeight: fontWeight?.dataLabel,
        fontFamily: fontFamily,
        rich: {
          b: {
            fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize?.dataLabel : '11px' : '10.5px',
            fontWeight: fontWeight?.dataLabel,
            height: 24,
            lineHeight: 24
          },
          c: {
            fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize?.dataLabel : '11px' : '10.5px',
            fontWeight: fontWeight.dataLabel,
            height: 20,
            lineHeight: 20
          }
        }
      },
      labelLine: {
        show: true,
        length: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 15 : 13 : 10,
        length2: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 70 : 50 : 30,
        lineStyle: {
          width: 2,
          type: 'solid'
        }
      },
      itemStyle: {
        borderRadius: border ? 6 : 0,
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: border ? 2 : 0
      },
      data: pieSeriesData.map((item, idx) => ({
        ...item,
        itemStyle: {
          color: getColorForItem(item.name, idx),
        },
        label: {
          rich: {
            c: {
              color: getColorForItem(item.name, idx)
            }
          }
        }
      })),
    }],
  };

  return (
    <div className='p-6 max-lg:p-5 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
      <NameChart nameChart={nameChart} description={description} getChartData={getEChartsData} />
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 250 : 210, width: '100%' }}
        opts={{
          renderer: 'canvas',
          locale: 'VN',
        }}
      />
    </div>
  );
};

export default memo(PieChart);
