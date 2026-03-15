import React, { memo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import NumberChart from '../layouts/components/NameChart';
import { formatNumber } from '../../utils/formatNumber';
import Loading from '../commons/Loading';

const MixedChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  enableZoom = true,
  maxVisibleItems = 10,
  barSeriesKeys,
  lineSeriesKeys,
  colors,
  barMaxWidth,
  barWidthPercent,
  lastDataIndexActive=false
}) => {

  if(data==='isLoading') {
    return (
      <div className='p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component'>
        <NumberChart nameChart={nameChart} description={description}/>
        <Loading height={height} />
      </div>
    );
  }
  const { labels = [], series = [] } = data;
  const chartRef = useRef(null);

  // Tính toán có cần dataZoom hay không
  const needsScroll = enableZoom && labels.length > maxVisibleItems;
  const zoomEndPercent = needsScroll 
    ? Math.round((maxVisibleItems / labels.length) * 100) 
    : 100;

  const lastDataIndex = labels.length - 1;
  

  // ECHARTS OPTION
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        crossStyle: {
          color: 'rgba(0, 0, 0, 0.2)'
        }
      },
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 0,
      textStyle: { 
        fontSize: fontSize.tooltip,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
      formatter: params => {
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 600; font-size: 13px; color: rgba(0, 0, 0, 0.7);">
              ${params[0].name}
            </div>
            ${params.map(p => `
              <div style="margin: 2px 0; display: flex; align-items: center;">
                ${p.marker} 
                <span style="font-weight: 600; font-size: 12px; margin-right: 4px; color: rgba(0, 0, 0, 0.7);">${p.seriesName}:</span> 
                <span style="font-size: 12px; font-weight: 500; color: rgba(0, 0, 0, 0.7);">${typeof p.value === 'number' ? formatNumber(p.value, { isPercent: p.seriesName.includes('%') }) : (p.value || '-')}
                </span>
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
        bottom: 0,
        height: 20,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 247, 217, 1)',
        borderColor: 'rgb(252, 233, 167)',
        brushSelect: false,
        handleSize: '100%',
        handleStyle: {
          color: 'rgba(255, 204, 0, 1)',
          borderColor: 'rgba(255, 255, 255, 1)'
        },
        textStyle: {
          fontSize: fontSize.axisLabel,
          color: 'rgba(0, 0, 0, 0.7)',
          fontWeight: 600
        },
        emphasis: {
          handleStyle: {
            color: 'rgba(255, 255, 255, 1)',
            borderColor: 'rgba(255, 204, 0, 1)'
          }
        },
        fillerColor: 'rgb(252, 233, 167)',
        dataBackground: {
          lineStyle: {
            opacity: 0.2,
            color: 'rgba(255, 204, 0, 1)'
          },
          areaStyle: {
            opacity: 0.2,
            color: 'rgba(255, 204, 0, 1)'
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
      top: needsScroll ? 0 : 0,
      left: 0,
      itemWidth: 14,
      itemHeight: 14,
      icon: 'roundRect',
      itemGap: 10,
      textStyle: { 
        fontSize: fontSize.legend,
        color: 'rgba(30, 27, 57, 1)',
        fontWeight: fontWeight.legend,
        letterSpacing: '0.1px',
        fontFamily: fontFamily
      },
      data: series.map(s => ({
        name: s.name,
        icon: barSeriesKeys.includes(s.name) ? 'roundRect' : 'circle'
      }))
    },

    grid: {
      left: '1%',
      right: '1%',
      bottom: needsScroll ? '30px' : '1%',
      top: 45.5,
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { 
        show: true, 
        lineStyle: { color: 'rgba(0, 0, 0, 0.2)' }
      },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily,
        rotate: 0,
        interval: 'auto',
        formatter: (value) => value
      },
      splitLine: { show: false }
    },

    yAxis: {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: 'rgba(0, 0, 0, 0.2)' } },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: 'rgba(229, 229, 239, 1)',
          type: 'dashed',
          width: 1.5,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => v.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        fontSize: fontSize.axisLabel,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily
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
          data: s.data.map((val, dataIdx) => ({
            value: val,
            itemStyle: {
              color: dataIdx === lastDataIndex || !lastDataIndexActive ? color : 'rgba(206, 206, 206, 1)',
              borderRadius: [10, 10, 0, 0]
            },
            label: {
              color: dataIdx === lastDataIndex || !lastDataIndexActive ? 'rgba(0,0,0,0.7)' : 'rgba(206, 206, 206, 1)'
            }
          })),
          barWidth: barWidthPercent,
          barMaxWidth: barMaxWidth,
          itemStyle: {
            color: color,
            borderRadius: [10, 10, 0, 0]
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
            offset: [0, -8],
            formatter: (params) => {
              return typeof params.value === 'number' ? formatNumber(params.value, { isPercent: params.seriesName.includes('%') }) : (params.value || '-')
            },
            fontSize: fontSize.dataLabel,
            fontWeight: fontWeight.dataLabel,
            fontFamily: fontFamily,
            color: 'rgba(0, 0, 0, 0.7)'
          }
        };
      } else {
        // Line series
        return {
          name: s.name,
          type: 'line',
          data: s.data.map((val, dataIdx) => ({
            value: val,
            label: {
              color: dataIdx === lastDataIndex || !lastDataIndexActive ? color : 'rgba(171, 171, 171, 1)'
            }
          })),
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: {
            color: color,
            width: 3
          },
          itemStyle: {
            color: color
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
            offset: [0, -8],
            formatter: (params) => {
              return typeof params.value === 'number' ? formatNumber(params.value, { isPercent: params.seriesName.includes('%') }) : (params.value || '-')
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
    <div className='p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component'>
      <NumberChart nameChart={nameChart} description={description}/>
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
