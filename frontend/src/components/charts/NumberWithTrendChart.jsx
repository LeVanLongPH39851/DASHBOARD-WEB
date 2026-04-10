import React, { memo, useMemo, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import NameChart from '../layouts/components/NameChart';
import iconArrowDown from '../../assets/icon_arrow_down.png';
import iconArrowDownDark from '../../assets/icon_arrow_down_dark.png';
import iconArrowUp45 from '../../assets/icon_arrow_up_45.png';
import iconArrowDown45 from '../../assets/icon_arrow_down_45.png';
import lineTrend from '../../assets/line_trend.png';
import lineBorderTrend from '../../assets/line_border_trend.png'
import lineTrendDown from '../../assets/line_trend_down.png';
import lineTrendDark from '../../assets/line_trend_dark.png';
import lineTrendDownDark from '../../assets/line_trend_down_dark.png';
import lineBorderTrendDown from '../../assets/line_border_trend_down.png'
import Loading from '../commons/Loading';
import { useDashboardStateGlobals } from '../../context/DashboardFilterContext';

const NumberWithTrendChart = ({
  nameChart,
  description,
  fontSize,
  fontFamily,
  fontWeight,
  data,
  trendPeriod = 'so với 1 ngày trước',
  unit = '%',
  height = '',
  icon = false,
  suffix = ''
}) => {
  
  if(data==='isLoading') {
    return (
      <div className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
        <NameChart nameChart={nameChart} description={description} icon={icon} width='w-5.5' backgound='bg-background-succes-type-2 dark:bg-background-succes-type-2-dark' />
        <Loading height={270} />
      </div>
    );
  }

  const getEChartsData = useCallback(() => {
    
    if (!data || data.length === 0) {
      return { labels: [], series: [] };
    }

    // Transform data thành {labels, series} format chuẩn Excel
    const labels = data.map(item => item.date || `Ngày ${data.indexOf(item) + 1}`);
    const series = [{
      name: 'Value',  // ✅ Fixed name, bỏ nameChart
      data: data.map(item => item.value || 0)
    }];

    return { labels, series };
  }, [data]);  // ✅ Chỉ deps data

  const { currentValue, trendPercent, currentDate } = useMemo(() => {
    if (!data || data.length < 2) {
      return { currentValue: 0, trendPercent: 0, currentDate: '' };
    }

    const lastIndex = data.length - 1;
    const currentValue = data[lastIndex].value;
    const prevValue    = data[lastIndex - 1].value;
    const trendPercent = ((currentValue - prevValue) / prevValue * 100);
    const currentDate  = data[lastIndex].date; // ← lấy từ data

    return { currentValue, trendPercent, currentDate };
  }, [data]);

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  const chartOption = useMemo(() => {
    const chartData = data?.map(item => item.value || 0) || [];
    const chartLabels = data?.map(item => item.date || '') || [];
    const lineColor = trendPercent > 0 ? 'rgba(47, 196, 198, 1)' : 'rgba(255, 56, 60, 1)';

    return {
      animation: true,
      grid: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: chartLabels,
        show: false,
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        show: false
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 0,
        textStyle: { 
        fontSize: !stateGlobals.screen_md ? fontSize.tooltip : '10.5px',
        color: 'rgba(0, 0, 0, 0.7)',
        fontWeight: fontWeight.tooltip,
        fontFamily: fontFamily
      },
        formatter: (params) => {
          const p = params?.[0];
          if (!p) return '';
          const totalX = data.reduce((sum, item) => sum + (item.value || 0), 0);
          const percent = totalX > 0 ? ((p.value / totalX) * 100).toFixed(1) : 0;
          return `
            <div style="padding: 4px 8px;">
              <div style="font-weight: 500; font-size: ${!stateGlobals.screen_md ? '13' : '11'}px; color: rgba(0, 0, 0, 0.7); margin-bottom: 2px;">
                ${p.axisValue}
              </div>
              <span style="font-size: ${!stateGlobals.screen_md ? '12' : '10.5'}px; font-weight: 400; color: rgba(0, 0, 0, 0.7);">
                ${p.value.toLocaleString(undefined, { maximumFractionDigits: nameChart.includes('%') ? 2 : 0 })} ${suffix} <span style="font-size: ${!stateGlobals.screen_md ? '11' : '10'}px;">(${percent}%)</span>
              </span>
            </div>
            `;
        }
      },
      series: [
        {
          type: 'line',
          data: chartData,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: lineColor,
            width: 3
          },
          itemStyle: {
            color: lineColor
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: !stateGlobals.darkMode ? [
                { offset: 0, color: trendPercent < 0 ? 'rgba(255, 56, 60, 0.7)' : 'rgba(134, 225, 227, 1)' },
                { offset: 0.47, color: trendPercent < 0 ? 'rgba(255, 56, 60, 0.4)' : 'rgba(201, 242, 242, 1)' },
                { offset: 1, color: trendPercent < 0 ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 1)' }
              ] :
              [
                { offset: 0, color: trendPercent < 0 ? 'rgba(255, 56, 60, 0.7)' : 'rgb(134, 225, 227, 1)'},
                { offset: 1, color: trendPercent < 0 ? 'rgba(255, 56, 60, 0)' : 'rgb(134, 225, 227, 0)' }
              ]
            }
          }
        }
      ]
    };
  }, [data, trendPercent]);
  
  return (
    <div className={`p-6 max-md:p-4 bg-background-light dark:bg-background-chart-dark dark:border-transparent transition-all duration-300 border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
      <NameChart nameChart={nameChart} description={description} icon={icon} width='w-5.5' backgound='bg-background-succes-type-2 dark:bg-background-succes-type-2-dark' getChartData={getEChartsData} />
      <div className='flex items-center mb-2'><span className='text-color-black-100 dark:text-color-white-50 transition-all duration-300 font-normal text-sm max-md:text-xs'>Ngày {currentDate}</span></div>
      <div className="mb-6 flex items-center gap-3 max-md:gap-2">
        <h4 className='text-5xl max-md:text-4xl text-color-black-100 dark:text-color-white-90 transition-all duration-300 font-semibold'>{currentValue.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) })} {suffix}</h4>
        <div className='flex gap-2 items-center'>
          <div className={`px-2 py-1 rounded-lg flex items-center gap-1 border ${trendPercent > 0 ? 'bg-background-succes-type-1 text-color-succes-type-1 border-border-succes-type-1 dark:bg-background-succes-type-1-dark dark:text-color-succes-type-1-dark dark:border-border-succes-type-1-dark' : 'bg-background-error text-color-error border-border-error'}`}>
            <span className='text-sm max-md:text-xs font-semibold'>{trendPercent.toFixed(1)}{unit}</span>
            <figure><img src={trendPercent > 0 ? iconArrowUp45 : iconArrowDown45} alt="Icon Arrow Up 45" className='w-2.25 h-2.25' /></figure>
          </div>
          <span className='text-sm max-md:text-xs text-color-black-50 dark:text-color-white-50 transition-all duration-300 font-normal'>{trendPeriod}</span>
        </div>
      </div>
      <div className="w-full">
        <ReactECharts
          option={chartOption}
          style={{ width: '100%', height: !stateGlobals.screen_md ? 170 : 115 }}
          opts={{ renderer: 'canvas', locale: 'VN' }}
        />
      </div>
    </div>
  );
};

export default memo(NumberWithTrendChart);
