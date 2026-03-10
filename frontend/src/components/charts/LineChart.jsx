// LineChart.jsx - showTopNSeries = 0: ẩn value, null: hiện hết
import React, { memo, useRef, useMemo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import Label from '../layouts/components/NameChart';

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
  labelOffset = -12,
  showTopNSeries  // ✅ 0 = ẩn hết value, null = hiện hết, số = top N
}) => {
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
        crossStyle: { color: '#999' }
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
        // ✅ Chỉ hiện series CÓ value tại xAxis này
        const visibleParams = params.filter(p => p.value && p.value !== 0 && p.value !== null && p.value !== undefined);
        
        if (visibleParams.length === 0) return '';
        
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${visibleParams[0].name}
            </div>
            ${visibleParams.map(p => `
              <div style="margin: 4px 0; display: flex; align-items: center;">
                ${p.marker} 
                <span style="font-weight: 600; margin-right: 8px; color: #374151;">${p.seriesName}:</span> 
                <span style="font-size: 15px; font-weight: 500;">${p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
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
        bottom: 50,
        height: 20,
        brushSelect: false,
        handleSize: '80%',
        handleStyle: { color: '#3b82f6' },
        textStyle: { fontSize: 12, color: '#64748b' },
        borderColor: '#e5e7eb',
        fillerColor: 'rgba(59, 130, 246, 0.1)',
        dataBackground: {
         lineStyle: { color: '#3b82f6', opacity: 0.3 },
         areaStyle: { color: '#3b82f6', opacity: 0.1 }
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
      orient: 'horizontal', // ✅ Xếp nằm ngang trên 1 hàng
      top: 10,                     // ✅ Đưa lên trên cùng
      left: '3%',                  // ✅ Canh trái (theo padding X của grid)
      right: '4%',                 // Giữ khoảng cách bên phải giống grid
      align: 'left',
      itemWidth: 14,
      itemHeight: 14,
      icon: 'circle',
      itemGap: 10,
      textStyle: { 
        fontSize: fontSize.legend,
        color: '#64748b',
        fontWeight: fontWeight.legend
      },
      data: legendData,
      selected: selectedSeries
    },

    grid: {
      left: '3%',
      right: '4%',
      bottom: needsScroll ? '120px' : '80px',
      top: 60,
      containLabel: true
    },

    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: '#374151',
        fontWeight: fontWeight.axisLabel,
        rotate: 0,
        interval: 'auto',
        formatter: (value) => value
      },
      splitLine: { show: false },
      boundaryGap: false
    },

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
        showSymbol: isTopSeries,
        lineStyle: {
          color: color,
          width: lineWidth,
          opacity: 1  // ✅ Luôn đậm ban đầu
        },
        itemStyle: {
          color: color,
          borderWidth: 2,
          borderColor: '#fff'
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
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
            borderWidth: 3,
            borderColor: '#fff'
          },
          lineStyle: {
            width: lineWidth + 1,  // ✅ Đậm hơn khi hover
            opacity: 1
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, labelOffset],
            formatter: (params) => params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '',
            fontSize: fontSize.dataLabel,
            fontWeight: fontWeight.dataLabel,
            fontFamily: fontFamily,
            color: color,
            backgroundColor: 'rgba(255,255,255,0.9)',
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
          formatter: (params) => params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '',
          fontSize: fontSize.dataLabel,
          fontWeight: fontWeight.dataLabel,
          fontFamily: fontFamily,
          color: color
        }
      };
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

export default React.memo(LineChart);
