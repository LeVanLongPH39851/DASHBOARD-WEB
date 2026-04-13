import React, { memo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NameChart from '../layouts/components/NameChart';
import Loading from '../commons/Loading';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';
import { formatKMB } from '../../utils/formatNumber';
import NoData from '../commons/NoData';
import { LABEL_METRIC } from '../../utils/label';




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
  colorZoom = 'yellow',
  suffix = '',
  overflow=false,
  formatterValue = 0,
  heightPlus=0
}) => {
  
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  
  if(data==='isLoading') {
    return (
      <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : ''}`}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <Loading height={ (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 300 : 220) + heightPlus } />
      </div>
    );
  } else if (!data) {
    return (
      <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : ''}`}>
        <NameChart nameChart={nameChart} description={description} display={displayName} />
        <NoData height={ (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 300 : 220) + heightPlus } />
      </div>
    );
  }

  const { labels = [], series = [] } = data;
  const chartRef = useRef(null);



  const isHorizontal = orientation === 'horizontal';


  const parseDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(0);
    
    // Split dd/mm/yyyy
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // month 0-indexed
  };

  // Detect ngày từ labels
  const hasDates = labels.some(label => 
    /^\d{2}\/\d{2}\/\d{4}$/.test(label)
  );

  const hasTimebands = labels.some(label => {
    const match = label.match(/^(\d{2})-(\d{2})$/);
    if (!match) return false;

    const start = Number(match[1]);
    const end = Number(match[2]);

    return start >= 0 && start <= 23 &&
          end >= 0 && end <= 23 &&
          end === start + 1;
  });

  const parseNumericLabel = (label) => {
    const numMatch = label.match(/^[\d\s,.+-]+$/); // Chỉ chứa số, space, dấu thập phân, dấu ±
    return numMatch ? parseFloat(label.replace(/[^\d.,-]/g, '').replace(',', '.')) : NaN;
  };

  // Detect labels dạng số chuỗi
  const hasNumericLabels = labels.some(label => {
    const num = parseNumericLabel(label);
    return !isNaN(num);
  });

  const sorted = React.useMemo(() => {
    if (hasDates || hasTimebands || hasNumericLabels) {
      // Sort theo ngày tăng dần
      return labels
        .map((label, index) => {
          const total = series.reduce((sum, s) => sum + (s.data?.[index] || 0), 0);
          return { label, index, total, date: parseDate(label) };
        })
        .sort((a, b) => a.date - b.date); // ✅ Ngày tăng dần
    } else {
      // Sort by total như cũ
      return labels
        .map((label, index) => {
          const total = series.reduce((sum, s) => sum + (s.data?.[index] || 0), 0);
          return { label, index, total };
        })
        .sort((a, b) => b.total - a.total);
    }
  }, [labels, series]);




  const sortedLabels = sorted.map(i => i.label);
  const sortedSeries = series.map(s => ({
    ...s,
    data: sorted.map(i => s.data?.[i.index] || 0)
  }));

  const topSeriesIndex = sortedSeries.length - 1;

  // Tính toán có cần dataZoom hay không
  const needsScroll = maxVisibleItems!=true ? enableZoom && sortedLabels.length > maxVisibleItems : true;
  const zoomEndPercent = maxVisibleItems!=true ? (needsScroll 
    ? Math.round((maxVisibleItems / sortedLabels.length) * 100) 
    : 100) : 100;

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

  const DEFAULT_COLORS = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', 
    '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#c23531'
  ];

  const getSeriesColor = (seriesItem, idx) => {
    if (Array.isArray(colors)) {
      return colors[idx];
    }

    if (colors && typeof colors === 'object') {
      return colors[seriesItem.name] || colors[seriesItem.label] || DEFAULT_COLORS[0];
    }

    return DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
  };




  // ECHARTS OPTION
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { opacity: 0.1 } },
      backgroundColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 0,
      textStyle: { 
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.tooltip : '11px' : '10.5px',
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
          <div style="padding: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '4'}px ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '16' : '15' : '8'}px; box-shadow: 0 ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '4' : '3' : '2'}px ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '4'}px rgba(0,0,0,0.1);">
            <div style="font-weight: 500; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '13': '12' : '11'}px; color: rgba(0, 0, 0, 0.7);">
              ${visibleParams[0].name}
            </div>
            ${visibleParams.map(p => {
              const percent = total > 0 ? (p.value / total * 100).toFixed(2) : 0;
              return `
                <div style="margin: 2px 0; display: flex; align-items: center;">
                  ${p.marker}
                  <span style="font-weight: 500; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12': '11' : '10.5'}px; margin-right: 4px; color: rgba(0, 0, 0, 0.7);">${LABEL_METRIC[p.seriesName] || p.seriesName}:</span> 
                  <span style="font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '10.5'}px; font-weight: 400; color: rgba(0, 0, 0, 0.7);">
                    ${p.value.toLocaleString(undefined, { maximumFractionDigits: formatterValue })} ${suffix} ${topSeriesIndex != 0 ? ` <span style="font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '11' : '10.5' : '10'}px;">(${percent}%)</span>` : ''}
                  </span>
                </div>
              `;
            }).join('')}
            ${topSeriesIndex != 0 ? `
              <hr style="margin: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '5' : '4.5' : '4'}px 0; border: none; height: 1px; background: rgba(0, 0, 0, 0.1);">
              <div style="font-weight: 600; color: #059669; font-size: ${!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12' : '11' : '10.5'}px;">
                <span>Tổng:</span> <span>${total.toLocaleString(undefined, { maximumFractionDigits: formatterValue })} ${suffix}</span>
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
        [isHorizontal ? 'width' : 'height']: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 20 : 15 : 10,
        brushSelect: false,
        handleSize: '100%',
        backgroundColor: colorZoom=='yellow' ? (!stateGlobals.darkMode ? 'rgba(255, 247, 217, 1)' : 'rgb(62, 63, 45)') : (!stateGlobals.darkMode ? 'rgba(254, 226, 226, 1)' : 'rgb(45, 29, 29)'),
        borderColor: colorZoom=='yellow' ? (!stateGlobals.darkMode ? 'rgb(252, 233, 167)' : 'rgb(159, 135, 39)') : (!stateGlobals.darkMode ? 'rgba(255, 185, 187, 1)' : 'rgb(153, 80, 80)'),
        borderRadius: 8,
        handleStyle: {
          color: colorZoom=='yellow' ? 'rgba(255, 204, 0, 1)' : 'rgba(255, 56, 60, 1)',
          borderColor: !stateGlobals.darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(28, 37, 52, 1)'
        },
        textStyle: {
          fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
          color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          fontWeight: 500,
          fontFamily: fontFamily
        },
        emphasis: {
          handleStyle: {
            color: !stateGlobals.darkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(28, 37, 52, 1)',
            borderColor:  colorZoom=='yellow' ? 'rgba(255, 204, 0, 1)' : 'rgba(255, 56, 60, 1)'
          }
        },
        fillerColor: colorZoom=='yellow' ? (!stateGlobals.darkMode ? 'rgb(252, 233, 167)' : 'rgb(159, 135, 39)') : stateGlobals.darkMode ? 'rgb(153, 80, 80)' : 'rgba(255, 185, 187, 1)',
        dataBackground: {
          lineStyle: {
            color: colorZoom=='yellow' ? 'rgba(255, 204, 0, 1)' : 'rgba(255, 56, 60, 1)',
            opacity: 0.2
          },
          areaStyle: {
            color: colorZoom=='yellow' ? 'rgba(255, 204, 0, 1)' : 'rgba(255, 56, 60, 1)',
            opacity: 0.2
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
      type: 'scroll', // ✅ Cho phép cuộn ngang
      show: topSeriesIndex !== 0 ? true : false,
      top: needsScroll && !isHorizontal ? 0 : 0,
      left: 0,
      itemWidth: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 14 : 12 : 10,
      itemHeight: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? 14 : 12 : 10,
      itemGap: 10,
      textStyle: { 
        fontSize:  !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.legend : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(30, 27, 57, 1)' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: fontWeight.legend,
        letterSpacing: '0.1px',
        fontFamily: fontFamily
      },
      icon: 'circle',
    },




    grid: {
      left: !stateGlobals.screen_md ? '1%' : '1.5%',
      right: isHorizontal ? (needsScroll ? (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '12%' : '11%' : '10%') : (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '10%' : '9.5%' : '9%')) : '1%',
      bottom: isHorizontal ? '1%' : (needsScroll ? (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? '30px' : '25px' : '20px') : '1%'),
      top: topSeriesIndex !== 0 ? (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? 39 : 37 : (isHorizontal ? 27 : 36)) : (!isHorizontal ? '4%' : '1%'),
      containLabel: true
    },




    xAxis: isHorizontal ? {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: !stateGlobals.darkMode ? 'rgba(229, 229, 239, 1)' : 'rgb(61, 69, 82)',
          type: 'dashed',
          width: 1,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => (!stateGlobals.screen_md ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : formatKMB(v)) + ' ' + suffix,
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily
      }
    } : {
      type: 'category',
      data: sortedLabels,
      axisLine: { show: true, lineStyle: { color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)' } },
      axisTick: { show: false },
      axisLabel: { 
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: fontWeight.axisLabel,
        rotate: 0,
        interval: 'auto',
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
        formatter: (value) => {
          if (typeof value !== 'string' || !overflow || !stateGlobals.screen_md) return value;
          return value.length > 15 ? value.slice(0, 15) + '...' : value;
        },
        // show:  !stateGlobals.screen_md ? true : false,
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily
      },
      splitLine: { show: false }
    } : {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)' } },
      axisTick: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: !stateGlobals.darkMode ? 'rgba(229, 229, 239, 1)' : 'rgb(61, 69, 82)',
          type: 'dashed',
          width: 1,
          opacity: 1
        }
      },
      axisLabel: {
        formatter: v => (!stateGlobals.screen_md ? v.toLocaleString(undefined, { maximumFractionDigits: 0 }) : formatKMB(v)) + ' ' + suffix,
        fontSize: !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.axisLabel : '11px' : '10.5px',
        color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        fontWeight: fontWeight.axisLabel,
        fontFamily: fontFamily
      }
    },




    series: sortedSeries.map((s, idx) => ({
      ...s,
      type: 'bar',
      stack: 'total',
      barWidth: '70%',
      barMaxWidth: !stateGlobals.md ? !stateGlobals.screen_lg ? 300 : 250 : 200,
      barGap: 0,
      barCategoryGap: '25%',
      itemStyle: {
        color: getSeriesColor(s, idx),
        barBorderRadius: isHorizontal ? idx === 0 ? (topSeriesIndex===0 ? [8, 8, 8, 8] : [8, 0, 0, 8]) : (idx === topSeriesIndex ? [0, 8, 8, 0] : 0)
                                      : idx === 0 ? (topSeriesIndex===0 ? [8, 8, 0, 0] : 0) : (idx === topSeriesIndex ? [8, 8, 0, 0] : 0)
      },
      emphasis: {
        itemStyle: { 
          shadowBlur: 15,
          shadowColor: !stateGlobals.darkMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)',
          opacity: 0.9
        }
      },
      label: {
        show: true,
        position: isHorizontal ? 'right' : 'top',
        offset: isHorizontal ? [!stateGlobals.screen_md ? !stateGlobals.screen_lg ? 3 : 2 : 0, 0] : [0, !stateGlobals.screen_md ? !stateGlobals.screen_lg ? -3 : -2 : 0],
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
            return (!stateGlobals.screen_md || formatterValue > 0 ? total.toLocaleString(undefined, { maximumFractionDigits: formatterValue }) : formatKMB(total)) + ' ' + suffix;
          }
          return '';
        },
        fontSize:  !stateGlobals.screen_md ? !stateGlobals.screen_lg ? fontSize.dataLabel : '11px' : '10.5px',
        fontWeight: fontWeight.dataLabel,
        fontFamily: fontFamily,
        color: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.8)',
        shadowBlur: 4,
        shadowColor: !stateGlobals.darkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 4)',
      }
    }))
  };




  return (
    <div className={`${displayName ? 'p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component' : ''}`}>
      <NameChart nameChart={nameChart} description={description} display={displayName} getChartData={getEChartsData} />
      <ReactECharts 
        ref={chartRef}
        option={option} 
        style={{ height: (!stateGlobals.screen_md ? !stateGlobals.screen_lg ? height : 300 : 220) + heightPlus, width: '100%' }}
        opts={{
          renderer: 'canvas',
          locale: 'VN'
        }}
      />
    </div>
  );
};




export default React.memo(BarChart);
