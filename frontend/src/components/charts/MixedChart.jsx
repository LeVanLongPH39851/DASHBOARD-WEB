import React, { memo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import Label from '../layouts/components/NameChart';

const MixedChart = ({
  data,
  height = '500px',
  fontSize = {
    tooltip: 14,
    legend: 13,
    axisLabel: 12,
    dataLabel: 13
  },
  fontFamily = 'Arial, sans-serif',
  fontWeight = {
    tooltip: 500,
    legend: 500,
    axisLabel: 400,
    dataLabel: 600
  },
  nameChart = 'Biểu đồ RATING (%) và REACH (%) theo khung giờ',
  description = 'khung giờ',
  enableZoom = true,
  maxVisibleItems = 24,
  barSeriesKeys = ['ave_reach'],
  lineSeriesKeys = ['rating'],
  colors = {
    'ave_reach': '#ffd04c',
    'rating': '#ff5757'
  },
  barMaxWidth = 80,
  barWidthPercent = '60%'
}) => {
  const { labels = [], series = [] } = data;
  const chartRef = useRef(null);

  // Tính toán có cần dataZoom hay không
  const needsScroll = enableZoom && labels.length > maxVisibleItems;
  const zoomEndPercent = needsScroll 
    ? Math.round((maxVisibleItems / labels.length) * 100) 
    : 100;

  // ECHARTS OPTION
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { 
        fontSize: fontSize.tooltip,
        color: '#1f2937',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
      formatter: params => {
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${params[0].name}
            </div>
            ${params.map(p => `
              <div style="margin: 4px 0; display: flex; align-items: center;">
                ${p.marker} 
                <span style="font-weight: 600; margin-right: 8px; color: #374151;">${p.seriesName}:</span> 
                <span style="font-size: 15px; font-weight: 500;">${p.value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '-'}</span>
              </div>
            `).join('')}
          </div>
        `;
      }
    },

    // DataZoom
    dataZoom: needsScroll ? [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: zoomEndPercent,
        bottom: 50,
        height: 20,
        brushSelect: false,
        handleSize: '80%',
        handleStyle: {
          color: '#3b82f6'
        },
        textStyle: {
          fontSize: 12,
          color: '#64748b'
        },
        borderColor: '#e5e7eb',
        fillerColor: 'rgba(59, 130, 246, 0.1)',
        dataBackground: {
          lineStyle: {
            color: '#3b82f6',
            opacity: 0.3
          },
          areaStyle: {
            color: '#3b82f6',
            opacity: 0.1
          }
        }
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: zoomEndPercent,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      }
    ] : [],

    legend: {
      bottom: needsScroll ? 80 : 10,
      left: 'center',
      itemWidth: 14,
      itemHeight: 14,
      icon: 'roundRect',
      textStyle: { 
        fontSize: fontSize.legend,
        color: '#64748b',
        fontWeight: fontWeight.legend
      },
      data: series.map(s => ({
        name: s.name,
        icon: barSeriesKeys.includes(s.name) ? 'rect' : 'circle'
      }))
    },

    grid: {
      left: '3%',
      right: '4%',
      bottom: needsScroll ? '120px' : '80px',
      top: 50, // ✅ Tăng để có space cho label
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { 
        show: true, 
        lineStyle: { color: '#d1d5db' } 
      },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: '#374151',
        fontWeight: fontWeight.axisLabel,
        rotate: 0,
        interval: 0,
        formatter: (value) => value
      },
      splitLine: { show: false }
    },

    // ✅ CHỈ 1 Y-AXIS
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e5e7eb',
          type: 'dashed',
          width: 1,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => v.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        fontSize: fontSize.axisLabel,
        color: '#6b7280',
        fontWeight: fontWeight.axisLabel
      }
    },

    series: series.map((s) => {
      const isBar = barSeriesKeys.includes(s.name);
      const color = colors[s.name] || '#999';
      
      if (isBar) {
        // Bar series
        return {
          name: s.name,
          type: 'bar',
          data: s.data,
          barWidth: barWidthPercent,
          barMaxWidth: barMaxWidth,
          itemStyle: {
            color: color,
            borderRadius: [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: { 
              shadowBlur: 10, 
              shadowColor: 'rgba(0,0,0,0.2)',
              opacity: 0.9
            }
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, -8], // ✅ Khoảng cách label với bar
            formatter: (params) => {
              return params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '';
            },
            fontSize: fontSize.dataLabel,
            fontWeight: fontWeight.dataLabel,
            fontFamily: fontFamily,
            color: '#1e293b'
          }
        };
      } else {
        // Line series
        return {
          name: s.name,
          type: 'line',
          data: s.data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: color,
            width: 3
          },
          itemStyle: {
            color: color,
            borderWidth: 2,
            borderColor: '#fff'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)',
              borderWidth: 3
            }
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, -20], // ✅ Khoảng cách label với line (xa hơn bar nhiều)
            formatter: (params) => {
              return params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '';
            },
            fontSize: fontSize.dataLabel,
            fontWeight: fontWeight.dataLabel,
            fontFamily: fontFamily,
            color: color
          }
        };
      }
    })
  };

  return (
    <div className="bg-background-light rounded-xl">
      <Label nameChart={nameChart} description={description}/>
      <ReactECharts 
        ref={chartRef}
        option={option} 
        style={{ height, width: '100%' }}
        opts={{
          renderer: 'canvas',
          locale: 'VN'
        }}
      />
    </div>
  );
};

export default React.memo(MixedChart);
