import React, { memo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import Label from '../layouts/components/NameChart';

const PieChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  colors, // Hỗ trợ cả array và object
  enableLegend = true,
  donut, // true = donut chart, false = pie chart
  innerRadius, // % cho donut
  labelDisplay = 'percent', // NEW: 'percent', 'label', 'label-percent', 'percent-label'
}) => {
  const chartRef = useRef(null);
  const { labels = [], values = [], series = [] } = data;

  // Dùng series nếu có, fallback về labels + values
  const pieSeriesData = series.length > 0 
    ? series 
    : labels.map((name, i) => ({
        name,
        value: values[i] || 0,
      }));

  // Helper function để lấy màu theo tên label (ưu tiên colorFirstLevel object)
  const getColorForItem = (name, index) => {
    // Nếu colors là object (colorFirstLevel), lấy màu theo tên
    if (colors && typeof colors === 'object' && !Array.isArray(colors)) {
      return colors[name] || colors[`${name}`.trim()] || '#3b82f6';
    }
    // Nếu là array, lấy theo index
    return colors?.[index % (colors?.length || 10)] || '#3b82f6';
  };
  
  // Helper function để format label theo option
  const getLabelFormatter = () => {
    switch (labelDisplay) {
      case 'percent':
        return '{c|{d}%}';
      case 'label':
        return '{b|{b}}';
      case 'label-percent':
        return '{b|{b}}\n{c|{d}%}';  // ✅ Chỉ 1 backslash
      case 'percent-label':
        return '{c|{d}%}\n{b|{b}}';  // ✅ Chỉ 1 backslash
      default:
        return '{b|{b}}\n{c|{d}%}';  // ✅ Chỉ 1 backslash
    }
  };

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        fontSize: fontSize?.tooltip || 13,
        color: '#1f2937',
        fontWeight: fontWeight?.tooltip || 500,
        fontFamily: fontFamily,
      },
      formatter: (params) => {
        const percent = params.percent;
        const total = pieSeriesData.reduce((sum, d) => sum + (d.value || 0), 0);
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); min-width: 140px;">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${params.name}
            </div>
            <div style="margin: 4px 0; display: flex; align-items: center;">
              ${params.marker}
              <span style="font-weight: 600; margin-right: 8px; color: #374151;">${params.seriesName}:</span>
              <span style="font-size: 15px; font-weight: 500;">${params.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div style="font-size: 14px; color: #059669; font-weight: 700;">
              ${(percent || 0).toFixed(1)}% (${(params.value * 100 / total).toFixed(1)}%)
            </div>
          </div>
        `;
      },
    },

    legend: enableLegend ? {
      orient: 'vertical',
      right: 20,
      top: 40,
      bottom: 20,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: fontSize?.legend || 12,
        color: '#64748b',
        fontWeight: fontWeight?.legend || 400,
      },
    } : {
      show: false,
    },

    series: [{
      name: nameChart,
      type: 'pie',
      radius: donut ? [innerRadius + '%', '75%'] : ['0%', '75%'],
      avoidLabelOverlap: false,
      center: ['40%', '50%'],
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowColor: 'rgba(0,0,0,0.2)',
        },
      },
      label: {
        show: true,
        position: 'outer',
        formatter: getLabelFormatter(),
        fontSize: fontSize?.dataLabel || 12,
        fontWeight: fontWeight?.dataLabel || 500,
        fontFamily: fontFamily,
        color: '#1e293b',
        rich: {
          b: {
            fontSize: fontSize?.dataLabel || 12,
            fontWeight: fontWeight?.dataLabel || 500,
            height: 24,
            lineHeight: 24,
            color: '#1e293b', // ✅ Màu tên label (xám)
          },
          c: {
            fontSize: fontSize?.dataLabel || 14,
            fontWeight: 'bold',
            // ✅ MÀU % GIỐNG colors - HIỂN THỊ MẶC ĐỊNH (không cần hover)
            color: (params) => getColorForItem(params.name, params.dataIndex),
            height: 20,
            lineHeight: 20,
          },
        },
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 8,
        lineStyle: {
          // ✅ Label line cũng lấy màu từ colors
          color: (params) => getColorForItem(params.name, params.dataIndex),
          width: 2,
          type: 'solid',
        },
      },
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2,
      },
      data: pieSeriesData.map((item, idx) => ({
        ...item,
        itemStyle: {
          color: getColorForItem(item.name, idx), // ✅ Slice màu từ colors
        },
      })),
    }],
  };

  return (
    <div className="bg-background-light rounded-xl">
      <Label nameChart={nameChart} description={description} />
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height, width: '100%' }}
        opts={{
          renderer: 'canvas',
          locale: 'VN',
        }}
      />
    </div>
  );
};

export default memo(PieChart);
