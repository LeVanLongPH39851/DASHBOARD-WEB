import React, { memo, useMemo } from 'react';
import NameChart from '../layouts/components/NameChart';
import iconArrowDown from '../../assets/icon_arrow_down.png';
import iconArrowUp45 from '../../assets/icon_arrow_up_45.png';
import lineTrend from '../../assets/line_trend.png';
import lineBorderTrend from '../../assets/line_border_trend.png'

const BigNumberWithTrend = ({
  trendlineData = [
    { date: '06/03', value: 8.5 },
    { date: '07/03', value: 8.7 },
    { date: '08/03', value: 8.87 },
    { date: '09/03', value: 8.20 }
  ],
  trendPeriod = 'so với 1 ngày trước',
  unit = '%',
  height = '',
  icon = false
}) => {
  const { currentValue, prevValue, trendPercent } = useMemo(() => {
    if (!trendlineData || trendlineData.length < 2) {
      return { currentValue: 0, prevValue: 0, trendPercent: 0 };
    }
    
    const lastIndex = trendlineData.length - 1;
    const prevIndex = lastIndex - 1;
    
    const currentValue = trendlineData[lastIndex].value;  // max date (09/03)
    const prevValue = trendlineData[prevIndex].value;    // max date -1 (08/03)
    const trendPercent = ((currentValue - prevValue) / prevValue * 100);
    
    return { currentValue, prevValue, trendPercent };
  }, [trendlineData]);

  return (
    <div className={`p-6 ${height} bg-background-light border border-border-black-10 rounded-2xl shadow-component`}>
      <NameChart nameChart={'Rating (%)'} description={'Rating %'} icon={icon} width='w-5.5' backgound='bg-background-succes-type-2' />
      <div className='flex gap-1 items-center mb-2'><span className='text-color-black-100 font-medium text-sm'>Ngày 27/01/2026</span><figure><img src={iconArrowDown} alt="Icon Arrow Down" className='w-2.25' /></figure></div>
      <div className="mb-6 flex items-center gap-3">
        <h4 className='text-5xl text-color-black-100 font-semibold'>{currentValue}</h4>
        <div className='flex gap-2 items-center'>
          <div className={`px-2 py-1 rounded-lg flex items-center gap-1 border ${trendPercent < 0 ? 'bg-background-succes-type-1 text-color-succes-type-1 border-border-succes-type-1' : ''}`}>
            <span className='text-sm font-semibold'>{trendPercent.toFixed(1)}{unit}</span>
            <figure><img src={iconArrowUp45} alt="Icon Arrow Up 45" className='w-2.25 h-2.25' /></figure>
          </div>
          <span className='text-sm text-color-black-50 font-medium'>{trendPeriod}</span>
        </div>
      </div>
      <figure className='relative'>
        <img src={lineBorderTrend} className='w-full absolute top-0 left-0' alt="Line Border Trend" />
        <img src={lineTrend} className='w-full' alt="Line Trend" />
      </figure>
    </div>
  );
};

export default memo(BigNumberWithTrend);
