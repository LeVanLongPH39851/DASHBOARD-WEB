import React, { memo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NameChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';

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
}) => {

  if(data==='isLoading') {
    return (
      <div className='p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component'>
        <NameChart nameChart={nameChart} description={description} />
        <Loading height={height} />
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

  // Helper function để lấy màu theo tên label (ưu tiên colorFirstLevel object)
  const getColorForItem = (name, index) => {
    // Nếu colors là object (colorFirstLevel), lấy màu theo tên
    if (colors && typeof colors === 'object' && !Array.isArray(colors)) {
      return colors[name] || colors[`${name}`.trim()] || '#3b82f6';
    }
    // Nếu là array, lấy theo index
    return colors?.[index % (colors?.length || 10)] || '#3b82f6';
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
        fontSize: fontSize.tooltip,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
      formatter: (params) => {
        const percent = params.percent;
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 600; font-size: 13px; color: rgba(0, 0, 0, 0.7);">
              ${params.marker} ${params.name}
            </div>
            <div style="font-weight: 700; color: #059669; font-size: 12px;">
              ${params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) })} <span style="font-size: 11px">(${(percent || 0).toFixed(2)}%)</span>
            </div>
          </div>
        `;
      },
    },

    legend: enableLegend ? {
      type: 'scroll',
      orient: 'vertical',
      left: 0,
      top: 0,
      itemWidth: 14,
      itemHeight: 14,
      icon: 'circle',
      itemGap: 8,
      textStyle: {
        fontSize: fontSize?.legend,
        color: 'rgba(30, 27, 57, 1)',
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
      center: ['60%', '50%'],
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(0,0,0,0.2)',
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
            fontSize: fontSize?.dataLabel,
            fontWeight: fontWeight?.dataLabel,
            height: 24,
            lineHeight: 24
          },
          c: {
            fontSize: fontSize?.dataLabel,
            fontWeight: fontWeight.dataLabel,
            height: 20,
            lineHeight: 20
          }
        }
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 70,
        lineStyle: {
          width: 2,
          type: 'solid'
        }
      },
      itemStyle: {
        borderRadius: 6,
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 2
      },
      data: pieSeriesData.map((item, idx) => ({
        ...item,
        itemStyle: {
          color: getColorForItem(item.name, idx), // ✅ Slice màu từ colors
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
    <div className='p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component'>
      <NameChart nameChart={nameChart} description={description} getChartData={getEChartsData} />
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height, width: '100%' }}
        opts={{
          renderer: 'canvas',
          locale: 'VN',
        }}
      />
    </div>
  );
};

export default memo(PieChart);
