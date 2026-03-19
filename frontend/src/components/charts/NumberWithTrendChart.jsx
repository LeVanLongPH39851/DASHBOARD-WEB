import React, { memo, useMemo, useRef, useCallback } from 'react';
import NameChart from '../layouts/components/NameChart';
import iconArrowDown from '../../assets/icon_arrow_down.png';
import iconArrowUp45 from '../../assets/icon_arrow_up_45.png';
import iconArrowDown45 from '../../assets/icon_arrow_down_45.png';
import lineTrend from '../../assets/line_trend.png';
import lineBorderTrend from '../../assets/line_border_trend.png'
import lineTrendDown from '../../assets/line_trend_down.png';
import lineBorderTrendDown from '../../assets/line_border_trend_down.png'
import Loading from '../commons/Loading';

const NumberWithTrendChart = ({
  nameChart,
  description,
  data,
  trendPeriod = 'so với 1 ngày trước',
  unit = '%',
  height = 395,
  icon = false
}) => {
  
  if(data==='isLoading') {
    return (
      <div className={`p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
        <NameChart nameChart={nameChart} description={description} icon={icon} width='w-5.5' backgound='bg-background-succes-type-2' />
        <Loading height={height - 56.5} />
      </div>
    );
  }

  const chartRef = useRef(null);

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

  return (
    <div className={`p-6 bg-background-light border border-border-black-10 rounded-2xl shadow-component`} style={{ height: `${height}px` }}>
      <NameChart nameChart={nameChart} description={description} icon={icon} width='w-5.5' backgound='bg-background-succes-type-2' getChartData={getEChartsData} />
      <div className='flex gap-1 items-center mb-2'><span className='text-color-black-100 font-medium text-sm'>Ngày {currentDate}</span><figure><img src={iconArrowDown} alt="Icon Arrow Down" className='w-2.25' /></figure></div>
      <div className="mb-6 flex items-center gap-3">
        <h4 className='text-5xl text-color-black-100 font-semibold'>{currentValue.toLocaleString(undefined, { maximumFractionDigits: (nameChart.includes('%') ? 2 : 0) })}</h4>
        <div className='flex gap-2 items-center'>
          <div className={`px-2 py-1 rounded-lg flex items-center gap-1 border ${trendPercent > 0 ? 'bg-background-succes-type-1 text-color-succes-type-1 border-border-succes-type-1' : 'bg-background-error text-color-error border-border-error'}`}>
            <span className='text-sm font-semibold'>{trendPercent.toFixed(1)}{unit}</span>
            <figure><img src={trendPercent > 0 ? iconArrowUp45 : iconArrowDown45} alt="Icon Arrow Up 45" className='w-2.25 h-2.25' /></figure>
          </div>
          <span className='text-sm text-color-black-50 font-medium'>{trendPeriod}</span>
        </div>
      </div>
      <figure className='relative'>
        <img src={trendPercent > 0 ? lineBorderTrend : lineBorderTrendDown} className='w-full absolute top-0 left-0' alt="Line Border Trend" />
        <img src={trendPercent > 0 ? lineTrend : lineTrendDown} className='w-full' alt="Line Trend" />
      </figure>
    </div>
  );
};

export default memo(NumberWithTrendChart);
