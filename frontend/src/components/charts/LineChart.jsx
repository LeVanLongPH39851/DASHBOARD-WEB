// LineChart.jsx - showTopNSeries = 0: ẩn value, null: hiện hết
import React, { memo, useRef, useMemo, useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NameChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';
import { formatKMB } from '../../utils/formatNumber';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';
import NoData from '../commons/NoData';

const LineChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  enableZoom = true,
  colors = {},
  showLabel = true,
  smooth,
  symbolSize,
  lineWidth,
  areaStyle,
  stack,
  labelOffset = 0,
  showTopNSeries,
  left=145,
  legendTop=false,
  KMB=true,
  xAxisTitle=false,
  fullScreen=false,
  textOverflow=false
}) => {

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  
  if(data==='isLoading') {
    return (
      <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NameChart nameChart={nameChart} description={description} fullScreen={fullScreen} />
        <Loading height={!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 350 : 240} />
      </div>
    );
  } else if (!data.labels.length > 0) {
    return (
      <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NameChart nameChart={nameChart} description={description} fullScreen={fullScreen} />
        <NoData height={!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 350 : 240} />
      </div>
    );
  }

  const { labels = [], series = [] } = data;
  const chartRef = useRef(null);
  const [selectedSeries, setSelectedSeries] = useState(
    series.reduce((acc, s) => ({ ...acc, [s.name]: true }), {})
  );

  const needsScroll = true;
  const zoomEndPercent = 100;

  const defaultColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  // ✅ LOGIC showTopNSeries mới:
  const sortedLegendData = useMemo(() => {
    const visibleSeries = series.filter(s => selectedSeries[s.name]);
    
    const seriesWithTotal = visibleSeries.map(s => ({
      name: s.name,
      total: s.data.reduce((sum, val) => sum + (val || 0), 0)
    }));
    
    const sorted = seriesWithTotal.sort((a, b) => b.total - a.total);
    
    // ✅ Quy tắc mới:
    // showTopNSeries = 0 → topSeriesNames = empty set (ẩn hết value)
    // showTopNSeries = null → topSeriesNames = null (hiện hết value)
    // showTopNSeries = số > 0 → top N series
    
    let topSeriesNames = null;
    if (showTopNSeries===null) {
      showTopNSeries = labels.length > 1 ? 3 : showTopNSeries;
    }
    
    if (stateGlobals.screen_lg && showTopNSeries !==0  && labels.length > 1) {
      showTopNSeries = 1;
    }

    if (stateGlobals.screen_md && labels.length > 1) {
      showTopNSeries = 0;
    }

    if (showTopNSeries === 0) {
      topSeriesNames = new Set(); // Empty → ẩn hết
    } else if (showTopNSeries && typeof showTopNSeries === 'number' && showTopNSeries > 0) {
      topSeriesNames = new Set(sorted.slice(0, showTopNSeries).map(s => s.name));
    }
    // else: null → hiện hết
    
    return {
      legendOrder: sorted.map(s => s.name),
      topSeriesNames
    };
  }, [series, showTopNSeries, selectedSeries]);

  const topSeriesNames = sortedLegendData.topSeriesNames;
  const legendData = sortedLegendData.legendOrder;
  const labelLength = labels.length - 1;

  const colorMap = useMemo(() => {
    return series.reduce((acc, s, index) => {
      acc[s.name] = colors[s.name] || defaultColors[index % defaultColors.length];
      return acc;
    }, {});
  }, [series, colors]);

  const getEChartsData = useCallback(() => {
    if (chartRef.current) {
      try {
        const instance = chartRef.current.getEchartsInstance();
        const option = instance.getOption();
        
        // ✅ Lấy legend selected state
        const legendSelected = option.legend?.[0]?.selected || {};
        
        // ✅ Lấy dataZoom range để filter labels
        const dataZoom = option.dataZoom?.[0] || {};
        const start = dataZoom.start || 0;
        const end = dataZoom.end || 100;
        const startIndex = Math.floor((start / 100) * labels.length);
        const endIndex = Math.floor((end / 100) * labels.length);
        
        // ✅ Filter labels theo dataZoom
        const visibleLabels = labels.slice(startIndex, endIndex);
        
        return {
          labels: visibleLabels,  // ✅ Chỉ labels đang zoom
          series: (option.series || series)
            .filter(s => legendSelected[s.name] !== false)  // ✅ Chỉ series đang visible
            .map(s => ({
              name: s.name,
              data: visibleLabels.map((_, i) => s.data[startIndex + i] || 0)  // ✅ Data theo zoom range
            }))
        };
      } catch (error) {
        console.error('Lỗi lấy LineChart data:', error);
        return { labels, series };
      }
    }
    return { labels, series };
  }, [labels, series]);


  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const handleLegendSelectChanged = (params) => {
      setSelectedSeries(params.selected);
    };

    chart.on('legendselectchanged', handleLegendSelectChanged);

    return () => {
      chart.off('legendselectchanged', handleLegendSelectChanged);
    };
  }, []);

  const option = {
    color: legendData.map(name => {
      const seriesIndex = series.findIndex(s => s.name === name);
      return colors[name] || defaultColors[seriesIndex % defaultColors.length];
    }),

    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        crossStyle: { color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)' }
      },
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 0,
      textStyle: { 
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.tooltip : '11px' : '10.5px',
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
      formatter: params => {
        // ✅ Chỉ hiện series CÓ value tại xAxis này
        const visibleParams = params.filter(p => p.value && p.value !== 0 && p.value !== null && p.value !== undefined).sort((a, b) => b.value - a.value);
        const total = visibleParams.reduce((sum, p) => sum + p.value, 0);
        
        if (visibleParams.length === 0) return '';
        
        return `
           <div style="padding: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '4'}px ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '16' : '15' : '8'}px; box-shadow: 0 ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '4' : '3' : '2'}px ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '4'}px rgba(0,0,0,0.1);">
            <div style="font-weight: 500; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '13' : '12' : '11'}px; color: rgba(0, 0, 0, 0.7);">
              ${visibleParams[0].name}
            </div>
            ${visibleParams.map(p => {
              const percent = total > 0 ? (p.value / total * 100).toFixed(2) : 0;
              
              return `
                <div style="margin: 2px 0; display: flex; align-items: center;">
                  <span style="
                    display: inline-block;
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    background-color: ${colorMap[p.seriesName]};
                    margin-right: 6px;
                    flex-shrink: 0;
                  "></span>
                  <span style="font-weight: 500; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '10.5'}px; margin-right: 4px; color: rgba(0, 0, 0, 0.7);">${p.seriesName}:</span> 
                  <span style="font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '10.5'}px; font-weight: 400; color: rgba(0, 0, 0, 0.7);">
                    ${p.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) })} <span style="font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '11' : '10.5' : '10'}px;">(${percent}%)</span>
                  </span>
                </div>
              `;
            }).join('')}
            <hr style="margin:  ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '5' : '4.5' : '4'}px 0; border: none; height: 1px; background: rgba(0, 0, 0, 0.1);">
            <div style="font-weight: 600; color: #059669; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '10.5'}px;">
              <span>Tổng:</span> <span>${total.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) })}</span>
            </div>
          </div>
        `;
      }
    },

    dataZoom: needsScroll ? [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: zoomEndPercent,
        bottom: 0,
        height: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 20 : 15 : 10,
        borderRadius: 8,
        backgroundColor: !stateGlobals.darkMode ? 'rgb(223, 249, 245)' : 'rgb(31, 60, 72)',
        borderColor: !stateGlobals.darkMode ? 'rgb(205, 240, 246)' : 'rgb(38, 128, 136)',
        brushSelect: false,
        handleSize: '100%',
        handleStyle: {
          color: 'rgb(42, 198, 193)',
          borderColor: !stateGlobals.darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(28, 37, 52, 1)'
        },
        textStyle: {
          fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
          color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          fontWeight: 500
        },
        emphasis: {
          handleStyle: {
            color: !stateGlobals.darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(28, 37, 52, 1)',
            borderColor: 'rgb(42, 198, 193)'
          }
        },
        fillerColor: !stateGlobals.darkMode ? 'rgb(205, 240, 246)' : 'rgb(38, 128, 136)',
        dataBackground: {
          lineStyle: {
            opacity: 0.2,
            color: 'rgb(42, 198, 193)'
          },
          areaStyle: {
            opacity: 0.2,
            color: 'rgb(42, 198, 193)'
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
      type: 'scroll', // ✅ Cho phép cuộn ngang
      orient: !legendTop && !stateGlobals.screen_md ? 'vertical' : 'horizontal', // ✅ Xếp nằm ngang trên 1 hàng
      top: 0,                     // ✅ Đưa lên trên cùng
      left: 0,                  // ✅ Canh trái (theo padding X của grid)
      right: 0,                 // Giữ khoảng cách bên phải giống grid
      align: 'left',
      itemWidth: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 14 : 12 : 10,
      itemHeight: 10,  // ✅ Tăng từ 10 lên 14 để có chỗ cho dấu
      lineHeight: 10, 
      icon: 'circle',
      itemGap: !legendTop ? 8 : 10,
      textStyle: { 
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.legend : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(30, 27, 57, 1)' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: fontWeight.legend,
        letterSpacing: '0.1px',
        fontFamily: fontFamily,
        height: textOverflow && legendTop ? 20 : 10,
        lineHeight: textOverflow && legendTop ? 20 : 10
      },
      selector: [
        { type: 'all', title: 'All' },
        { type: 'inverse', title: 'Inv' }
      ],
      selectorPosition: !legendTop ? 'start' : 'end',
      selectorItemGap: 5,
      selectorButtonGap: 8,
      selectorLabel: {
        show: true,
        padding: [3, 8],
        borderRadius: 10,
        borderColor: !stateGlobals.darkMode ? 'rgba(229, 229, 239, 1)' : 'rgba(255, 255, 255, 0.2)',
        color: !stateGlobals.darkMode ? 'rgba(30, 27, 57, 1)' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: 400,
        fontFamily: fontFamily,
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.legend : '11px' : '10.5px'
      },
      data: legendData.map(name => ({
        name,
        itemStyle: {
          color: colorMap[name]
        }
      })),
      selected: selectedSeries
    },

    grid: {
      left: !legendTop && !stateGlobals.screen_md ? !stateGlobals.screen_lg ? left : left - 10 : '1%',
      right: '1%',
      bottom: needsScroll ? (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? (xAxisTitle ? '42px' : '30px') : (xAxisTitle ? '37px' : '25px') : (xAxisTitle ? '32px' : '20px')) : '1%',
      top: !legendTop && !stateGlobals.screen_md ? '5%' : 40,
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: labels,
      name: xAxisTitle,
      nameLocation: 'middle',
      nameGap: !stateGlobals.screen_md ? 25 : 24,
      nameTextStyle: {
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily,
        color: !stateGlobals.darkMode
          ? 'rgba(0, 0, 0, 0.7)'
          : 'rgba(255, 255, 255, 0.9)'
      },
      axisLine: { show: !stateGlobals.darkMode ? true : false, lineStyle: { color: 'rgba(229, 229, 239, 1)' } },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: !stateGlobals.darkMode ? 'rgba(97, 94, 131, 1)' : 'rgba(255, 255, 255, 0.9)',
        fontWeight: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontWeight.axisLabel : '11px' : '10.5px',
        rotate: 0,
        interval: 'auto',
        fontFamily: fontFamily,
        formatter: (value) => value
      },
      splitLine: { show: false },
      boundaryGap: true
    },

    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: !stateGlobals.darkMode ? 'rgba(229, 229, 239, 1)' : 'rgba(255, 255, 255, 0.2)',
          type: !stateGlobals.darkMode ? 'solid' : 'dashed',
          width: 1,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => !stateGlobals.screen_md && !KMB ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : formatKMB(v),
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(97, 94, 131, 1)' : 'rgba(255, 255, 255, 0.9)',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily
      }
    },

    series: series.map((s, index) => {
      const color = colors[s.name] || defaultColors[index % defaultColors.length];
      
      // ✅ Logic show label theo showTopNSeries
      const isTopSeries = !topSeriesNames || topSeriesNames.has(s.name);
      
      return {
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: smooth,
        symbol: 'circle',
        symbolSize: !stateGlobals.screen_md ? symbolSize : 6,
        // showSymbol: isTopSeries,
        lineStyle: {
          color: color,
          width: lineWidth,
          opacity: 1  // ✅ Luôn đậm ban đầu
        },
        itemStyle: {
          color: labelLength===0 ? color : 'transparent',
          borderColor: labelLength===0 ? 'rgba(255, 255, 255, 1)' : 'transparent',
          borderWidth: labelLength===0 ? 2 : 0
        },
        ...(areaStyle && {
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: color + '40' },
                { offset: 1, color: color + '10' }
              ]
            }
          }
        }),
        ...(stack && { stack: 'total' }),
        emphasis: {
          focus: 'series',  // ✅ Tự động mờ các series khác khi hover
          scale: true,
          itemStyle: {
            color: color,
            borderWidth: labelLength===0 ? 3 : 2,
            borderColor: 'rgba(255, 255, 255, 1)',
            shadowBlur: labelLength===0 ? 10 : 0,
            shadowColor: labelLength===0 ? !stateGlobals.darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(225,225,225,0.3)' : '',
          },
          lineStyle: {
            width: lineWidth + 1,  // ✅ Đậm hơn khi hover
            opacity: 1
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, labelOffset],
            formatter: (params) => params.value ? nameChart.includes('%') ? params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : !stateGlobals.screen_md && !KMB ? params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : formatKMB(params.value) : '',
            fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.dataLabel : '11px' : '10.5px',
            fontWeight: fontWeight.dataLabel,
            fontFamily: fontFamily,
            color: color,
            backgroundColor: 'rgba(255,255,255,1)',
            padding: [4, 8],
            borderRadius: 4,
            borderColor: color,
            borderWidth: 1
          }
        },
        label: {
          show: showLabel && isTopSeries,  // ✅ Logic hoàn chỉnh
          position: 'top',
          offset: [0, labelOffset],
          formatter: (params) => params.value ? nameChart.includes('%') ? params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : !stateGlobals.screen_md && !KMB ? params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : formatKMB(params.value) : '',
          fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.dataLabel : '11px' : '10.5px',
          fontWeight: fontWeight.dataLabel,
          fontFamily: fontFamily,
          color: color
        }
      };
    })
  };

  return (
    <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
      <NameChart nameChart={nameChart} description={description} getChartData={getEChartsData} fullScreen={fullScreen} />
        <ReactECharts 
          ref={chartRef}
          option={option} 
          style={{ height: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 350 : 240, width: '100%' }}
          opts={{
            renderer: 'canvas',
            locale: 'VN'
          }}
        />
    </div>
  );
};

export default React.memo(LineChart);
