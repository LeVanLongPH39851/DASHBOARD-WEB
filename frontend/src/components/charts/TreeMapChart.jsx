// TreeMapChart.jsx
import React, { memo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import Label from '../layouts/components/NameChart';

const TreeMapChart = ({
  data,
  height,
  fontSize,
  fontFamily,
  fontWeight,
  nameChart,
  description,
  colors,
  colorSaturation = [0.3, 0.6],
  visibleMin = 300,
  childrenVisibleMin = 100,
  showBreadcrumb = false
}) => {
  const chartRef = useRef(null);

  // Default colors nếu không truyền
  const defaultColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

  const colorPalette = colors.length > 0 ? colors : defaultColors;

  // Transform data format
  const transformData = (inputData) => {
    const { labels = [], series = [] } = inputData;
    
    if (series.length === 0) return [];

    // Nếu data đơn giản: 1 series với labels
    if (series.length === 1) {
      return labels.map((label, index) => ({
        name: label,
        value: series[0].data[index] || 0
      }));
    }

    // Nếu data phức tạp: nested structure
    return series.map((s, idx) => ({
      name: s.name,
      children: labels.map((label, i) => ({
        name: label,
        value: s.data[i] || 0
      })).filter(item => item.value > 0)
    })).filter(item => item.children.length > 0);
  };

  const treeData = transformData(data);

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        fontSize: fontSize.tooltip,
        color: '#1f2937',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
      formatter: (params) => {
        const { name, value, treePathInfo } = params;
        const path = treePathInfo
          ?.slice(1)
          .map(p => p.name)
          .join(' > ') || name;
        
        return `
          <div style="padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${path}
            </div>
            <div style="font-weight: 600; color: #059669; font-size: 15px;">
              <span>Value:</span> 
              <span style="margin-left: 8px;">${value?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0}</span>
            </div>
          </div>
        `;
      }
    },

    series: [
      {
        name: nameChart,
        type: 'treemap',
        data: treeData,
        visibleMin: visibleMin,
        childrenVisibleMin: childrenVisibleMin,
        roam: false,
        nodeClick: 'zoomToNode',
        breadcrumb: {
          show: showBreadcrumb,
          bottom: 10,
          left: 'center',
          itemStyle: {
            color: '#64748b',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            shadowBlur: 4,
            shadowColor: 'rgba(0,0,0,0.1)'
          },
          emphasis: {
            itemStyle: {
              color: '#3b82f6',
              borderColor: '#3b82f6'
            }
          }
        },
        label: {
          show: true,
          fontSize: fontSize.label,
          fontWeight: fontWeight.label,
          fontFamily: fontFamily,
          color: '#fff',
          formatter: (params) => {
            const { name, value } = params;
            return `{name|${name}}\n{value|${value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}}`;
          },
          rich: {
            name: {
              fontSize: fontSize.label + 2,
              fontWeight: 700,
              color: '#fff',
              padding: [0, 0, 4, 0]
            },
            value: {
              fontSize: fontSize.label,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.9)'
            }
          }
        },
        upperLabel: {
          show: true,
          height: 30,
          color: '#fff',
          fontSize: fontSize.label + 1,
          fontWeight: 700
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
          gapWidth: 2
        },
        emphasis: {
          label: {
            show: true,
            fontSize: fontSize.label + 2,
            fontWeight: 700
          },
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0,0,0,0.3)',
            borderColor: '#fff',
            borderWidth: 3
          },
          upperLabel: {
            show: true,
            fontSize: fontSize.label + 2
          }
        },
        levels: [
          {
            itemStyle: {
              borderWidth: 0,
              gapWidth: 5
            }
          },
          {
            itemStyle: {
              gapWidth: 1
            },
            colorSaturation: colorSaturation
          }
        ],
        color: colorPalette
      }
    ]
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
          locale: 'VN'
        }}
      />
    </div>
  );
};

export default React.memo(TreeMapChart);
