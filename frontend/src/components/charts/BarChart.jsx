import React, { memo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NameChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';




const BarChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  colors,
  fontWeight,
  nameChart,
  description,
  orientation,
  displayName=true,
  enableZoom = true, // Option bật/tắt zoom
  maxVisibleItems = 12,
  colorZoom = 'yellow'
}) => {
  
  if(data==='isLoading') {
    return (
      <div className={`${displayName ? 'p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component' : ''}`}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <Loading height={height} />
      </div>
    );
  }

  const { labels = [], series = [] } = data;
  const chartRef = useRef(null);



  const isHorizontal = orientation === 'horizontal';




  // SORT BY TOTAL
  const sorted = React.useMemo(() => {
    return labels
      .map((label, index) => {
        const total = series.reduce(
          (sum, s) => sum + (s.data?.[index] || 0),
          0
        );
        return { label, index, total };
      })
      .sort((a, b) => b.total - a.total);
  }, [labels, series]);




  const sortedLabels = sorted.map(i => i.label);
  const sortedSeries = series.map(s => ({
    ...s,
    data: sorted.map(i => s.data?.[i.index] || 0)
  }));

  const topSeriesIndex = sortedSeries.length - 1;

  // Tính toán có cần dataZoom hay không
  const needsScroll = enableZoom && sortedLabels.length > maxVisibleItems;
  const zoomEndPercent = needsScroll 
    ? Math.round((maxVisibleItems / sortedLabels.length) * 100) 
    : 100;

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
        
        let visibleLabels = sortedLabels;
        let startIndex = 0;
        let endIndex = sortedLabels.length;
        
        // Tính index theo orientation (horizontal = yAxis, vertical = xAxis)
        if (needsScroll && option.dataZoom?.length > 0) {
          startIndex = Math.floor((start / 100) * sortedLabels.length);
          endIndex = Math.floor((end / 100) * sortedLabels.length);
          visibleLabels = sortedLabels.slice(startIndex, endIndex);
        }
        
        return {
          labels: visibleLabels,  // ✅ Chỉ labels đang zoom
          series: (option.series || sortedSeries)
            .filter(s => legendSelected[s.name] !== false)  // ✅ Chỉ series đang visible
            .map(s => ({
              name: s.name,
              data: visibleLabels.map((_, i) => s.data[startIndex + i] || 0)  // ✅ Data theo zoom range
            }))
        };
      } catch (error) {
        console.error('Lỗi lấy BarChart data:', error);
        return { labels: sortedLabels, series: sortedSeries };
      }
    }
    return { labels: sortedLabels, series: sortedSeries };
  }, [sortedLabels, sortedSeries, needsScroll]);




  // ECHARTS OPTION
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { opacity: 0.1 } },
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 0,
      textStyle: { 
        fontSize: fontSize.tooltip,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
      formatter: params => {
        const visibleParams = params
          .filter(p => p.value && p.value !== 0 && p.value !== null && p.value !== undefined)
          .sort((a, b) => b.value - a.value);
        
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
                  ${p.marker}
                  <span style="font-weight: 600; font-size: 12px; margin-right: 4px; color: rgba(0, 0, 0, 0.7);">${p.seriesName}:</span> 
                  <span style="font-size: 12px; font-weight: 500; color: rgba(0, 0, 0, 0.7);">
                    ${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}${topSeriesIndex != 0 ? ` <span style="font-size: 11px;">(${percent}%)</span>` : ''}
                  </span>
                </div>
              `;
            }).join('')}
            ${topSeriesIndex != 0 ? `
              <hr style="margin: 5px 0; border: none; height: 1px; background: rgba(0, 0, 0, 0.1);">
              <div style="font-weight: 700; color: #059669; font-size: 12px;">
                <span>Tổng:</span> <span>${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ` : ''}
          </div>
        `;
      }
    },


    // Thêm dataZoom nếu enableZoom = true
    dataZoom: needsScroll ? [
      {
        type: 'slider',
        show: true,
        [isHorizontal ? 'yAxisIndex' : 'xAxisIndex']: 0,
        start: 0,
        end: zoomEndPercent,
        [isHorizontal ? 'right' : 'bottom']: isHorizontal ? 0 : 0,
        [isHorizontal ? 'width' : 'height']: 20,
        brushSelect: false,
        handleSize: '100%',
        backgroundColor: colorZoom=='yellow' ? 'rgba(255, 247, 217, 1)' : 'rgba(255, 225, 226, 1)',
        borderColor: colorZoom=='yellow' ? 'rgb(252, 233, 167)' : 'rgba(255, 185, 187, 1)',
        borderRadius: 8,
        handleStyle: {
          color: colorZoom=='yellow' ? 'rgba(255, 204, 0, 1)' : 'rgba(255, 56, 60, 1)',
          borderColor: 'rgba(255, 255, 255, 1)'
        },
        textStyle: {
          fontSize: fontSize.axisLabel,
          color: 'rgba(0, 0, 0, 0.7)',
          fontWeight: isHorizontal ? 500 : 600,
          fontFamily: fontFamily
        },
        emphasis: {
          handleStyle: {
            color: 'rgba(255, 255, 255, 1)',
            borderColor:  colorZoom=='yellow' ? 'rgba(255, 204, 0, 1)' : 'rgba(255, 56, 60, 1)'
          }
        },
        fillerColor: colorZoom=='yellow' ? 'rgb(252, 233, 167)' : 'rgba(255, 185, 187, 1)',
        dataBackground: {
          lineStyle: {
            color: colorZoom=='yellow' ? 'rgb(252, 233, 167)' : 'rgba(255, 185, 187, 1)',
            opacity: 0.4
          },
          areaStyle: {
            color: colorZoom=='yellow' ? 'rgb(252, 233, 167)' : 'rgba(255, 185, 187, 1)',
            opacity: 0.4
          }
        }
      },
      {
        type: 'inside',
        [isHorizontal ? 'yAxisIndex' : 'xAxisIndex']: 0,
        start: 0,
        end: zoomEndPercent,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      }
    ] : [],




    legend: {
      show: topSeriesIndex !== 0 ? true : false,
      top: needsScroll && !isHorizontal ? 0 : 0,
      left: 0,
      itemWidth: 14,
      itemHeight: 14,
      itemGap: 10,
      textStyle: { 
        fontSize: fontSize.legend,
        color: 'rgba(30, 27, 57, 1)',
        fontWeight: fontWeight.legend,
        letterSpacing: '0.1px',
        fontFamily: fontFamily
      },
      icon: 'circle',
    },




    grid: {
      left: '1%',
      right: isHorizontal ? (needsScroll ? '12%' : '10%') : '1%',
      bottom: isHorizontal ? '1%' : (needsScroll ? '30px' : '1%'),
      top: topSeriesIndex !== 0 ? 39 : (!isHorizontal ? '4%' : '1%'),
      containLabel: true
    },




    xAxis: isHorizontal ? {
      type: 'value',
      axisLine: { show: false },
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
    } : {
      type: 'category',
      data: sortedLabels,
      axisLine: { show: true, lineStyle: { color: 'rgba(0, 0, 0, 0.2)' } },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.axisLabel,
        rotate: 0,
        interval: 0,
        fontFamily: fontFamily
      },
      splitLine: { show: false }
    },




    yAxis: isHorizontal ? {
      type: 'category',
      data: sortedLabels,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily
      },
      splitLine: { show: false }
    } : {
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




    series: sortedSeries.map((s, idx) => ({
      ...s,
      type: 'bar',
      stack: 'total',
      barWidth: '70%',
      barGap: 0,
      barCategoryGap: '25%',
      itemStyle: {
        color: colors[idx],
        barBorderRadius: isHorizontal ? idx === 0 ? (topSeriesIndex===0 ? [8, 8, 8, 8] : [8, 0, 0, 8]) : (idx === topSeriesIndex ? [0, 8, 8, 0] : 0)
                                      : idx === 0 ? (topSeriesIndex===0 ? [8, 8, 0, 0] : 0) : (idx === topSeriesIndex ? [8, 8, 0, 0] : 0)
      },
      emphasis: {
        itemStyle: { 
          shadowBlur: 15, 
          shadowColor: 'rgba(0,0,0,0.15)',
          opacity: 0.9
        }
      },
      label: {
        show: true,
        position: isHorizontal ? 'right' : 'top',
        offset: isHorizontal ? [3, 0] : [0, -3],
        formatter: (params) => {
          const dataIndex = params.dataIndex;
          const seriesIndex = params.seriesIndex;
          
          // Lấy chart instance
          const chartInstance = chartRef.current?.getEchartsInstance();
          if (!chartInstance) return '';
          
          // Tính tổng của các series đang hiển thị
          let total = 0;
          let highestVisibleIndex = -1;
          
          // Lấy option hiện tại để check series nào đang visible
          const currentOption = chartInstance.getOption();
          const legendSelected = currentOption.legend?.[0]?.selected || {};
          
          // Duyệt từ cuối lên để tìm series cao nhất đang visible
          for (let i = sortedSeries.length - 1; i >= 0; i--) {
            const seriesName = sortedSeries[i].name;
            // Nếu không có trong legendSelected hoặc = true thì đang visible
            if (legendSelected[seriesName] !== false) {
              highestVisibleIndex = i;
              break;
            }
          }
          
          // Tính tổng các series visible
          sortedSeries.forEach((ss, i) => {
            const seriesName = ss.name;
            if (legendSelected[seriesName] !== false) {
              total += ss.data[dataIndex] || 0;
            }
          });
          
          // Chỉ hiện label nếu đây là series cao nhất đang visible
          if (seriesIndex === highestVisibleIndex && total > 0) {
            return total.toLocaleString(undefined, { maximumFractionDigits: 0 });
          }
          return '';
        },
        fontSize: fontSize.dataLabel,
        fontWeight: fontWeight.dataLabel,
        fontFamily: fontFamily,
        color: 'rgba(0, 0, 0, 0.7)',
        // backgroundColor: 'rgba(255,255,255,0.95)',
        backgroundColor: 'transparent',
        borderRadius: 6,
        padding: [2, 6],
        borderWidth: 1,
        // borderColor: 'rgba(0,0,0,0.1)',
        borderColor: 'transparent',
        shadowBlur: 4,
        shadowColor: 'rgba(0,0,0,0.1)'
      }
    }))
  };




  return (
    <div className={`${displayName ? 'p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component' : ''}`}>
      <NameChart nameChart={nameChart} description={description} display={displayName} getChartData={getEChartsData} />
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




export default React.memo(BarChart);
