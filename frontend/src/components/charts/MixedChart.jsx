import React, { memo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NumberChart from '../layouts/components/NameChart';
import { formatNumber } from '../../utils/formatNumber';
import Loading from '../commons/Loading';
import { formatKMB } from '../../utils/formatNumber';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';
import NoData from '../commons/NoData';
import { LABEL_METRIC } from '../../utils/label';

const MixedChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  enableZoom = true,
  maxVisibleItems = true,
  barSeriesKeys,
  lineSeriesKeys,
  colors,
  barMaxWidth,
  barWidthPercent,
  lastDataIndexActive=false
}) => {

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  
  if(data==='isLoading') {
    return (
      <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NumberChart nameChart={nameChart} description={description}/>
        <Loading height={!stateGlobals.screen_md ? height : 230} />
      </div>
    );
  } else if (!data.labels.length > 0) {
    return (
      <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NumberChart nameChart={nameChart} description={description}/>
        <NoData height={!stateGlobals.screen_md ? height : 230} />
      </div>
    );
  }

  const { labels = [], series = [] } = data;
  const chartRef = useRef(null);

  const getEChartsData = useCallback(() => {
    if (chartRef.current) {
      try {
        const instance = chartRef.current.getEchartsInstance();
        const option = instance.getOption();
        
        const legendSelected = option.legend?.[0]?.selected || {};
        const dataZoom = option.dataZoom?.[0] || {};
        const start = dataZoom.start || 0;
        const end = dataZoom.end || 100;
        const startIndex = Math.floor((start / 100) * labels.length);
        const endIndex = Math.floor((end / 100) * labels.length);
        const visibleLabels = labels.slice(startIndex, endIndex);
        
        return {
          labels: visibleLabels,
          series: (option.series || series)
            .filter(s => legendSelected[s.name] !== false)
            .map(s => ({
              name: s.name,
              data: visibleLabels.map((_, i) => {
                const fullData = s.data[startIndex + i] || {};
                return fullData.value || fullData || 0;  // ✅ Unwrap value
              })
            }))
        };
      } catch (error) {
        console.error('Lỗi lấy MixedChart data:', error);
        return { labels, series };
      }
    }
    return { labels, series };
  }, [labels, series]);

  // Tính toán có cần dataZoom hay không
  const needsScroll = maxVisibleItems!=true ? enableZoom && labels.length > maxVisibleItems : true;
  const zoomEndPercent = maxVisibleItems!=true ? (needsScroll 
    ? Math.round((maxVisibleItems / labels.length) * 100)
    : 100) : 100;

  const lastDataIndex = labels.length - 1;
    
  // ECHARTS OPTION
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        crossStyle: {
          color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)'
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
          <div style="padding: ${!stateGlobals.screen_md ? '12' : '4'}px ${!stateGlobals.screen_md ? '16' : '8'}px; box-shadow: 0 ${!stateGlobals.screen_md ? '4' : '2'}px ${!stateGlobals.screen_md ? '12' : '4'}px rgba(0,0,0,0.1);">
            <div style="font-weight: 600; font-size: ${!stateGlobals.screen_md ? '13' : '11'}px; color: rgba(0, 0, 0, 0.7);">
              ${params[0].name}
            </div>
            ${params.map(p => `
              <div style="margin: 2px 0; display: flex; align-items: center;">
                ${p.marker} 
                <span style="font-weight: 600; font-size: ${!stateGlobals.screen_md ? '12' : '10.5'}px; margin-right: 4px; color: rgba(0, 0, 0, 0.7);">${p.seriesName}:</span> 
                <span style="font-size: ${!stateGlobals.screen_md ? '12' : '10.5'}px; font-weight: 500; color: rgba(0, 0, 0, 0.7);">${typeof p.value === 'number' ? formatNumber(p.value, { isPercent: p.seriesName.includes('%') }) : (p.value || '-')}
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
        height: !stateGlobals.screen_md ? 20 : 10,
        borderRadius: 8,
        backgroundColor: !stateGlobals.darkMode ? 'rgba(255, 247, 217, 1)' : 'rgb(62, 63, 45)',
        borderColor: !stateGlobals.darkMode ? 'rgb(252, 233, 167)' : 'rgb(159, 135, 39)',
        brushSelect: false,
        handleSize: '100%',
        handleStyle: {
          color: 'rgba(255, 204, 0, 1)',
          borderColor: !stateGlobals.darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(28, 37, 52, 1)'
        },
        textStyle: {
          fontSize: !stateGlobals.screen_md ? fontSize.axisLabel : '10.5px',
          color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          fontWeight: 600
        },
        emphasis: {
          handleStyle: {
            color: !stateGlobals.darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(28, 37, 52, 1)',
            borderColor: 'rgba(255, 204, 0, 1)'
          }
        },
        fillerColor: !stateGlobals.darkMode ? 'rgb(252, 233, 167)' : 'rgb(159, 135, 39)',
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
      itemWidth: !stateGlobals.screen_md ? 14 : 10,
      itemHeight: !stateGlobals.screen_md ? 14 : 10,
      icon: 'roundRect',
      itemGap: 10,
      textStyle: { 
        fontSize: !stateGlobals.screen_md ? fontSize.legend : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(30, 27, 57, 1)' : 'rgba(255, 255, 255, 0.9)',
        fontWeight: fontWeight.legend,
        letterSpacing: '0.1px',
        fontFamily: fontFamily
      },
      data: series.map(s => ({
        name: LABEL_METRIC[s.name] || s.name,
        icon: barSeriesKeys.includes(s.name) ? 'roundRect' : 'circle'
      }))
    },

    grid: {
      left: '1%',
      right: '1%',
      bottom: needsScroll ? (!stateGlobals.screen_md ? '30px' : '20px') : '1%',
      top: !stateGlobals.screen_md ? 45.5 : 43,
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { 
        show: true, 
        lineStyle: { color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)' }
      },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: !stateGlobals.screen_md ? fontSize.axisLabel : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
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
      axisLine: { show: true, lineStyle: { color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)' } },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: !stateGlobals.darkMode ? 'rgba(229, 229, 239, 1)' : 'rgba(255, 255, 255, 0.2)',
          type: 'dashed',
          width: 1,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => !stateGlobals.screen_md ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : formatKMB(v),
        fontSize: !stateGlobals.screen_md ? fontSize.axisLabel : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
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
          name: LABEL_METRIC[s.name] || s.name,
          type: 'bar',
          data: s.data.map((val, dataIdx) => ({
            value: val,
            itemStyle: {
              color: dataIdx === lastDataIndex || !lastDataIndexActive ? color : (!stateGlobals.darkMode ? 'rgba(206, 206, 206, 1)' : 'rgba(60, 74, 96, 1)'),
              borderRadius: [10, 10, 0, 0]
            },
            label: {
              color: dataIdx === lastDataIndex || !lastDataIndexActive ? (!stateGlobals.darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255, 255, 255, 0.8)') : 'rgba(180, 180, 180, 1)'
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
              shadowColor: !stateGlobals.darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(225,225,225,0.2)',
              opacity: 0.9
            }
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, !stateGlobals.screen_md ? -8 : 0],
            formatter: (params) => {
              return typeof params.value === 'number' ? (!stateGlobals.screen_md ? formatNumber(params.value, { isPercent: params.seriesName.includes('%') }) : (params.seriesName.includes('%') ? formatNumber(params.value, { isPercent: params.seriesName.includes('%') }) : formatKMB(params.value))) : (params.value || '-')
            },
            fontSize: !stateGlobals.screen_md ? fontSize.dataLabel : '10.5px',
            fontWeight: fontWeight.dataLabel,
            fontFamily: fontFamily,
            color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)'
          }
        };
      } else {
        // Line series
        return {
          name: LABEL_METRIC[s.name] || s.name,
          type: 'line',
          data: s.data.map((val, dataIdx) => ({
            value: val,
            label: {
              color: dataIdx === lastDataIndex || !lastDataIndexActive ? color : 'rgba(150, 150, 150, 1)'
            }
          })),
          smooth: true,
          symbol: 'circle',
          symbolSize: !stateGlobals.screen_md ? 5 : (labels.length == 1 ? 5 : 0),
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
              shadowColor: !stateGlobals.darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(225,225,225,0.3)',
              borderWidth: 3
            }
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, !stateGlobals.screen_md ? -8 : 0],
            formatter: (params) => {
              return typeof params.value === 'number' ? (!stateGlobals.screen_md ? formatNumber(params.value, { isPercent: params.seriesName.includes('%') }) : (params.seriesName.includes('%') ? formatNumber(params.value, { isPercent: params.seriesName.includes('%') }) : formatKMB(params.value))) : (params.value || '-')
            },
            fontSize: !stateGlobals.screen_md ? fontSize.dataLabel : '10.5px',
            fontWeight: fontWeight.dataLabel,
            fontFamily: fontFamily,
            color: color
          }
        };
      }
    })
  };

  return (
    <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
      <NumberChart nameChart={nameChart} description={description} getChartData={getEChartsData} />
      <ReactECharts 
        ref={chartRef}
        option={option} 
        style={{ height: !stateGlobals.screen_md ? height : 230, width: '100%' }}
        opts={{
          renderer: 'canvas',
          locale: 'VN'
        }}
      />
    </div>
  );
};

export default React.memo(MixedChart);
