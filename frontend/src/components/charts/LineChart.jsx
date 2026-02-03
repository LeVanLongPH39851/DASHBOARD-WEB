// LineChart.jsx
import React, { memo, useRef, useMemo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import Label from '../layouts/components/NameChart';

const LineChart = ({
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
  nameChart = 'Line Chart',
  description = '',
  enableZoom = true,
  maxVisibleItems = 10,
  colors = {},
  showLabel = true,
  smooth = true,
  symbolSize = 6,
  lineWidth = 3,
  areaStyle = false,
  stack = false,
  labelOffset = -12,
  showTopNSeries = 3
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

  // ✅ Calculate top N from SELECTED series only
  const topSeriesNames = useMemo(() => {
    if (!showTopNSeries) return null;
    
    const visibleSeries = series.filter(s => selectedSeries[s.name]);
    
    const seriesWithTotal = visibleSeries.map(s => ({
      name: s.name,
      total: s.data.reduce((sum, val) => sum + (val || 0), 0)
    }));
    
    const sorted = seriesWithTotal.sort((a, b) => b.total - a.total);
    return new Set(sorted.slice(0, showTopNSeries).map(s => s.name));
  }, [series, showTopNSeries, selectedSeries]);

  // ✅ Listen to legend select event
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
    color: series.map((s, i) => colors[s.name] || defaultColors[i % defaultColors.length]),

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
      icon: 'circle',
      textStyle: { 
        fontSize: fontSize.legend,
        color: '#64748b',
        fontWeight: fontWeight.legend
      },
      data: series.map(s => s.name),
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
      const isTopSeries = !topSeriesNames || topSeriesNames.has(s.name);
      
      return {
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: smooth,
        // ✅ KEY FIX: Luôn có symbol, chỉ control showSymbol
        symbol: 'circle',
        symbolSize: symbolSize,
        showSymbol: isTopSeries, // ✅ false = ẩn, true = hiện
        lineStyle: {
          color: color,
          width: lineWidth,
          opacity: isTopSeries ? 1 : 0.5
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
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: color + '40' },
                { offset: 1, color: color + '10' }
              ]
            }
          }
        }),
        ...(stack && { stack: 'total' }),
        // ✅ EMPHASIS: Hiện symbol + label khi hover (TẤT CẢ series)
        emphasis: {
          focus: 'series',
          scale: true,
          // ✅ Force show symbol khi hover
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
            borderWidth: 3,
            borderColor: '#fff'
          },
          lineStyle: {
            width: lineWidth + 1,
            opacity: 1
          },
          // ✅ Show label khi hover (cho TẤT CẢ series)
          label: {
            show: true,
            position: 'top',
            offset: [0, labelOffset],
            formatter: (params) => {
              return params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '';
            },
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
        // ✅ BLUR: Khi hover series khác
        blur: {
          lineStyle: {
            opacity: 0.2
          },
          itemStyle: {
            opacity: 0.2
          }
        },
        // ✅ Label mặc định (chỉ top series)
        label: {
          show: showLabel && isTopSeries,
          position: 'top',
          offset: [0, labelOffset],
          formatter: (params) => {
            return params.value ? params.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '';
          },
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
