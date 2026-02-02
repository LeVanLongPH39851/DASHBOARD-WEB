import React, { memo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import Label from '../layouts/components/NameChart';




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
  enableZoom = true, // Option bật/tắt zoom
  maxVisibleItems = 11 // Số items hiển thị tối đa khi zoom bật
}) => {
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


  // Tính toán có cần dataZoom hay không
  const needsScroll = enableZoom && sortedLabels.length > maxVisibleItems;
  const zoomEndPercent = needsScroll 
    ? Math.round((maxVisibleItems / sortedLabels.length) * 100) 
    : 100;




  // ECHARTS OPTION
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { opacity: 0.1 } },
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
        const total = params.reduce((sum, p) => sum + p.value, 0);
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${params[0].name}
            </div>
            ${params.map(p => `
              <div style="margin: 4px 0; display: flex; align-items: center;">
                ${p.marker} 
                <span style="font-weight: 600; margin-right: 8px; color: #374151;">${p.seriesName}:</span> 
                <span style="font-size: 15px; font-weight: 500;">${p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            `).join('')}
            <hr style="margin: 10px 0; border: none; height: 1px; background: #e5e7eb;">
            <div style="font-weight: 700; color: #059669; font-size: 16px;">
              <span>Total:</span> <span>${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
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
        [isHorizontal ? 'right' : 'bottom']: isHorizontal ? 0 : 50,
        [isHorizontal ? 'width' : 'height']: 20,
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
        [isHorizontal ? 'yAxisIndex' : 'xAxisIndex']: 0,
        start: 0,
        end: zoomEndPercent,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false
      }
    ] : [],




    legend: {
      bottom: needsScroll && !isHorizontal ? 80 : 10,
      itemWidth: 14,
      itemHeight: 14,
      textStyle: { 
        fontSize: fontSize.legend,
        color: '#64748b',
        fontWeight: fontWeight.legend
      }
    },




    grid: {
      left: isHorizontal ? '3%' : '8%',
      right: isHorizontal ? (needsScroll ? '10%' : '12%') : '4%',
      bottom: isHorizontal ? '10%' : (needsScroll ? '120px' : '15%'),
      top: 20,
      containLabel: true
    },




    xAxis: isHorizontal ? {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
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
    } : {
      type: 'category',
      data: sortedLabels,
      axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,
        color: '#374151',
        fontWeight: fontWeight.axisLabel,
        rotate: 0,
        interval: 0
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
        color: '#374151',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily
      },
      splitLine: { show: false }
    } : {
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




    series: sortedSeries.map((s, idx) => ({
      ...s,
      type: 'bar',
      stack: 'total',
      barWidth: '70%',
      barGap: 0,
      barCategoryGap: '25%',
      itemStyle: {
        color: colors[idx]
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
        color: '#1e293b',
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




export default React.memo(BarChart);
