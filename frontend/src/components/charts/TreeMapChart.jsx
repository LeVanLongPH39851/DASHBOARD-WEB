// TreeMapChart.jsx
import React, { memo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NameChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';
import { formatKMB } from '../../utils/formatNumber';
import NoData from '../commons/NoData';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';

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
  childrenVisibleMin = 100
}) => {

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  
  if(data==='isLoading') {
    return (
      <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NameChart nameChart={nameChart} description={description} />
        <Loading height={!stateGlobals.screen_md ? height : 240} />
      </div>
    );
  } else if (!data) {
    return (
      <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
        <NameChart nameChart={nameChart} description={description} />
        <NoData height={!stateGlobals.screen_md ? height : 240} />
      </div>
    );
  }

  const chartRef = useRef(null);

  // TreeMapChart.jsx - getEChartsData giống PieChart (đơn giản & chính xác)
  const getEChartsData = useCallback(() => {
    
    if (!chartRef.current) {
      console.log('❌ No chartRef');
      return { labels: [], series: [] };
    }

    try {
      const instance = chartRef.current.getEchartsInstance();
      const option = instance.getOption();
      
      // ✅ Giống PieChart: lấy legend selected + series data
      const legendSelected = option.legend?.[0]?.selected || {};
      const treeMapData = option.series?.[0]?.data || [];
      
      // Filter theo legend (nếu có)
      const visibleData = Array.isArray(treeMapData) 
        ? treeMapData.filter(item => legendSelected[item.name] !== false)
        : treeMapData;
      
      // ✅ Transform thành {labels, series} format chuẩn Excel
      if (visibleData.length > 0) {
        // Flat TreeMap hoặc children level
        const labels = visibleData.map(item => item.name);
        const series = [{
          name: 'Value',
          data: visibleData.map(item => item.value || 0)
        }];
        
        return { labels, series };
      }
      
    } catch (error) {
      console.error('Lỗi TreeMap data:', error);
    }
    
    // ✅ Fallback giống PieChart
    const { labels = [], series = [] } = data || {};
    return {
      labels,
      series: series.length > 0 ? series : [{
        name: 'Value',
        data: labels.map((_, i) => series[0]?.data?.[i] || 0)
      }]
    };
  }, []); // ✅ Không deps phức tạp


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

  const totalValue = treeData.reduce((sum, item) => {
    if (item.children) {
      return sum + item.children.reduce((s, c) => s + (c.value || 0), 0);
    }
    return sum + (item.value || 0);
  }, 0);
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 0,
      textStyle: {
        fontSize: fontSize.tooltip,
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: !stateGlobals.screen_md ? fontWeight.tooltip : '10.5px',
        fontFamily: fontFamily
      },
      formatter: (params) => {
        const { name, value, treePathInfo } = params;
        const path = treePathInfo
          ?.slice(1)
          .map(p => p.name)
          .join(' > ') || name;

          // ✅ Tính % theo root node hoặc parent tùy depth
        const depth = treePathInfo?.length ?? 1;
        let percent = 0;

        if (depth <= 2) {
          // ✅ Node cấp 1: % so với tổng toàn bộ
          percent = totalValue > 0 ? (value / totalValue) * 100 : 0;
        } else {
          // ✅ Node cấp 2 (nested): % so với parent
          const parentValue = treePathInfo?.[treePathInfo.length - 2]?.value;
          percent = parentValue > 0 ? (value / parentValue) * 100 : 0;
        }

        const formattedValue = value?.toLocaleString(undefined, {
          maximumFractionDigits: nameChart.includes('%') ? 2 : 0
        }) || 0;
        
        return `
           <div style="padding: ${!stateGlobals.screen_md ? '12' : '4'}px ${!stateGlobals.screen_md ? '16' : '8'}px; box-shadow: 0 ${!stateGlobals.screen_md ? '4' : '2'}px ${!stateGlobals.screen_md ? '12' : '4'}px rgba(0,0,0,0.1);">
            <div style="font-weight: 600; font-size: ${!stateGlobals.screen_md ? '13' : '11'}px; color: rgba(0, 0, 0, 0.7);">
              ${path}
            </div>
            <div style="font-weight: 700; color: #059669; font-size: ${!stateGlobals.screen_md ? '12' : '10.5'}px;">
              <span>${value?.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) || 0} <span style="font-size: ${!stateGlobals.screen_md ? '11' : '10'}px">(${percent.toFixed(2)}%)</span></span>
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
        roam: true,
        nodeClick: 'zoomToNode',
        breadcrumb: {
          show: false
        },
        label: {
          show: true,
          fontSize: !stateGlobals.screen_md ? fontSize.label : '10.5px',
          fontWeight: fontWeight.label,
          fontFamily: fontFamily,
          color: 'rgba(255, 255, 255, 1)',
          formatter: (params) => {
            const { name, value } = params;
            return `{name|${name}}:\n{value|${nameChart.includes('%') ? value?.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : !stateGlobals.screen_md ? value?.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) }) : formatKMB(params.value) || 0}}`;
          },
          rich: {
            name: {
              fontSize: !stateGlobals.screen_md ? fontSize.label : '10.5px',
              fontWeight: fontWeight.label,
              color: 'rgba(255, 255, 255, 1)',
            },
            value: {
              fontSize: !stateGlobals.screen_md ? fontSize.label : '10.5px',
              fontWeight: fontWeight.label,
              color: 'rgba(255, 255, 255, 1)'
            }
          }
        },
        itemStyle: {
          borderRadius: !stateGlobals.screen_md ? 16 : 5,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: !stateGlobals.screen_md ? fontSize.label : '10.5px' + 2,
            rich: {
              name: {
                fontSize: !stateGlobals.screen_md ? fontSize.label : '10.5px' + 2
              },
              value: {
                fontSize: !stateGlobals.screen_md ? fontSize.label : '10.5px' + 2
              }
            }
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: !stateGlobals.darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
          }
        },
        levels: [
          {
            itemStyle: {
              borderWidth: 0,
              gapWidth: !stateGlobals.screen_md ? 5 : 1
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
    <div className='p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component'>
      <NameChart nameChart={nameChart} description={description} getChartData={getEChartsData} />
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: !stateGlobals.screen_md ? height : 240, width: '100%' }}
        opts={{
          renderer: 'canvas',
          locale: 'VN'
        }}
      />
    </div>
  );
};

export default React.memo(TreeMapChart);
