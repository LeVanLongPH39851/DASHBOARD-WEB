import React, { memo } from 'react';
import ReactECharts from 'echarts-for-react';
import InconInfor from '../layouts/components/IconInfor';

const BarChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  colors,
  fontWeight,
  description
}) => {
  const { labels = [], series = [] } = data;

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

  // ECHARTS OPTION - FONT TO HƠN + TOOLTIP TRẮNG
  const option = {
    // textStyle: { 
    //   fontFamily, 
    //   fontWeight: 400,
    //   fontSize: 14  // Font chung tăng từ 12 → 14
    // },
    
    // TOOLTIP NỀN TRẮNG
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { opacity: 0.1 } },
      backgroundColor: 'rgba(255,255,255,0.95)',  // ← TRẮNG
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { 
        fontSize: fontSize.tooltip,  // 15px
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
        fontSize: fontSize.legend,  // 16px
        color: '#64748b',
        fontWeight: fontWeight.legend
      }
    },

    grid: {
      left: '3%',
      right: '12%',
      bottom: '10%',
      top: 20,
      containLabel: true
    },

    xAxis: {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e5e7eb',   // xám nhạt đẹp
          type: 'dashed',     // dashed hoặc solid
          width: 1,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => v.toLocaleString(),
        fontSize: fontSize.axisLabel,  // 14px
        color: '#6b7280',
        fontWeight: fontWeight.axisLabel
      }
    },

    yAxis: {
      type: 'category',
      data: sortedLabels,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: fontSize.axisLabel,  // 14px
        color: '#374151',
        fontWeight: fontWeight.axisLabel
      },
      splitLine: { show: false }
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
      label: idx === sortedSeries.length - 1
        ? {
            show: true,
            position: 'right',
            offset: [12, 0],
            formatter: params => {
              const index = params.dataIndex;
              const total = sortedSeries.reduce(
                (sum, ss) => sum + (ss.data[index] || 0),
                0
              );
              return total.toLocaleString();
            },
            fontSize: fontSize.dataLabel,  // 14px
            fontWeight: fontWeight.dataLabel,
            fontFamily,
            color: '#1e293b',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 6,
            padding: [4, 10],
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.1)',
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.1)'
          }
        : { show: false }
    }))
  };

  return (
    <div className="bg-background-light rounded-xl">
      <div className='p-6 text-2xl font-bold tracking-[-4%] leading-[100%] text-color-dark flex items-center'>
        <span>Rating by Market</span><InconInfor description={description} />
      </div>
      <ReactECharts 
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
