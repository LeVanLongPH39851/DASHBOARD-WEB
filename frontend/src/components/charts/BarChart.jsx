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
  orientation
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
        fontWeight: fontWeight.tooltip
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
                <span style="font-size: 15px; font-weight: 500;">${p.value.toLocaleString()}</span>
              </div>
            `).join('')}
            <hr style="margin: 10px 0; border: none; height: 1px; background: #e5e7eb;">
            <div style="font-weight: 700; color: #059669; font-size: 16px;">
              <span>Total:</span> <span>${total.toLocaleString()}</span>
            </div>
          </div>
        `;
      }
    },


    legend: {
      bottom: 10,
      itemWidth: 14,
      itemHeight: 14,
      textStyle: { 
        fontSize: fontSize.legend,
        color: '#64748b',
        fontWeight: fontWeight.legend
      }
    },


    grid: {
      left: '3%',
      right: isHorizontal ? '12%' : '4%',
      bottom: isHorizontal ? '10%' : '15%',
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
        formatter: v => v.toLocaleString(),
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
        rotate: 45,
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
        fontWeight: fontWeight.axisLabel
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
        formatter: v => v.toLocaleString(),
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
        offset: isHorizontal ? [12, 0] : [0, -10],
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
            return total.toLocaleString();
          }
          return '';
        },
        fontSize: fontSize.dataLabel,
        fontWeight: fontWeight.dataLabel,
        fontFamily,
        color: '#1e293b',
        // backgroundColor: 'rgba(255,255,255,0.95)',
        backgroundColor: 'transparent',
        borderRadius: 6,
        padding: [4, 10],
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
