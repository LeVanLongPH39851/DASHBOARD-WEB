// LineChart.jsx - showTopNSeries = 0: ẩn value, null: hiện hết
import React, { memo, useRef, useMemo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import NumberChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';

const LineChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  enableZoom = true,
  maxVisibleItems = 10,
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
  legendTop=false
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
  const [selectedSeries, setSelectedSeries] = useState(
    series.reduce((acc, s) => ({ ...acc, [s.name]: true }), {})
  );

  const needsScroll = enableZoom && labels.length > maxVisibleItems;
  const zoomEndPercent = needsScroll 
    ? Math.round((maxVisibleItems / labels.length) * 100) 
    : 100;

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
        crossStyle: { color: 'rgba(0, 0, 0, 0.2)' }
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
        // ✅ Chỉ hiện series CÓ value tại xAxis này
        const visibleParams = params.filter(p => p.value && p.value !== 0 && p.value !== null && p.value !== undefined).sort((a, b) => b.value - a.value);
        const total = visibleParams.reduce((sum, p) => sum + p.value, 0);
        
        if (visibleParams.length === 0) return '';
        
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 600; font-size: 13px; color: rgba(0, 0, 0, 0.7);">
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
                  <span style="font-weight: 600; font-size: 12px; margin-right: 4px; color: rgba(0, 0, 0, 0.7);">${p.seriesName}:</span> 
                  <span style="font-size: 12px; font-weight: 500; color: rgba(0, 0, 0, 0.7);">
                    ${p.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) })} <span style="font-size: 11px;">(${percent}%)</span>
                  </span>
                </div>
              `;
            }).join('')}
            <hr style="margin: 5px 0; border: none; height: 1px; background: rgba(0, 0, 0, 0.1);">
            <div style="font-weight: 700; color: #059669; font-size: 12px;">
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
        height: 20,
        borderRadius: 8,
        backgroundColor: 'rgb(223, 249, 245)',
        borderColor: 'rgb(205, 240, 246)',
        brushSelect: false,
        handleSize: '100%',
        handleStyle: {
          color: 'rgb(42, 198, 193)',
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
            borderColor: 'rgb(42, 198, 193)'
          }
        },
        fillerColor: 'rgb(205, 240, 246)',
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
      orient: !legendTop ? 'vertical' : 'horizontal', // ✅ Xếp nằm ngang trên 1 hàng
      top: 0,                     // ✅ Đưa lên trên cùng
      left: 0,                  // ✅ Canh trái (theo padding X của grid)
      right: 0,                 // Giữ khoảng cách bên phải giống grid
      align: 'left',
      itemWidth: 14,
      itemHeight: 10,
      icon: 'circle',
      itemGap: !legendTop ? 8 : 10,
      textStyle: { 
        fontSize: fontSize.legend,
        color: 'rgba(30, 27, 57, 1)',
        fontWeight: fontWeight.legend,
        letterSpacing: '0.1px',
        fontFamily: fontFamily
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
      left: !legendTop ? left : '1%',
      right: '1%',
      bottom: needsScroll ? '30px' : '1%',
      top: !legendTop ? '5%' : 40,
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: true, lineStyle: { color: 'rgba(229, 229, 239, 1)' } },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: 'rgba(97, 94, 131, 1)',
        fontWeight: fontWeight.axisLabel,
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
          color: 'rgba(229, 229, 239, 1)',
          type: 'solid',
          width: 1,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => v.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        fontSize: fontSize.axisLabel,
        color: 'rgba(97, 94, 131, 1)',
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
        symbolSize: symbolSize,
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
            shadowColor: labelLength===0 ? 'rgba(0,0,0,0.3)' : '',
          },
          lineStyle: {
            width: lineWidth + 1,  // ✅ Đậm hơn khi hover
            opacity: 1
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, labelOffset],
            formatter: (params) => params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : '',
            fontSize: fontSize.dataLabel,
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
          formatter: (params) => params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : '',
          fontSize: fontSize.dataLabel,
          fontWeight: fontWeight.dataLabel,
          fontFamily: fontFamily,
          color: color
        }
      };
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

export default React.memo(LineChart);
