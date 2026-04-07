// src/components/filters/RangeFilter.jsx
import { useMemo, useState, useEffect } from 'react';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';
import iconArrowUpGrayDark from '../../../../assets/icon_arrow_up_gray_dark.png';
import { useDashboardStateGlobals } from '../../../../context/DashboardFilterContext';

const RangeFilter = ({
  value = { min: '', max: '' },
  onChange,
  label,
  min = 0,
  max = 60,
  step = 1,
  disabled = false,
  marginBottom,
  horizontalFixed=false,
  formatValue = (v) => v?.toLocaleString?.() ?? v,
}) => {
  const { stateGlobals } = useDashboardStateGlobals();
  const [isOpenFilter, setIsOpenFilter] = useState(true);

  const [localMin, setLocalMin] = useState(value?.min ?? min);
  const [localMax, setLocalMax] = useState(value?.max ?? max);

  useEffect(() => {
    setLocalMin(value?.min ?? min);
    setLocalMax(value?.max ?? max);
  }, [value, min, max]);

  const safeMin = Number(localMin);
  const safeMax = Number(localMax);

  const minPercent = useMemo(
    () => ((safeMin - min) / (max - min)) * 100,
    [safeMin, min, max]
  );

  const maxPercent = useMemo(
    () => ((safeMax - min) / (max - min)) * 100,
    [safeMax, min, max]
  );

  const handleMinInput = (newMin) => {
    if (disabled) return;
    const nextMin = Math.min(Number(newMin), safeMax);
    setLocalMin(nextMin);
    onChange?.({ min: nextMin, max: safeMax });
  };

  const handleMaxInput = (newMax) => {
    if (disabled) return;
    const nextMax = Math.max(Number(newMax), safeMin);
    setLocalMax(nextMax);
    onChange?.({ min: safeMin, max: nextMax });
  };

  return (
    <div className={`${horizontalFixed ? '' : isOpenFilter ? `${marginBottom}` : ''}`}>
      {!horizontalFixed && (<div onClick={() => setIsOpenFilter(prev => !prev)} className={`flex cursor-pointer group justify-between items-center h-10.5 max-md:h-8 ${isOpenFilter ? 'mb-1' : ''}`}>
                              <label className='cursor-pointer text-[16px] max-md:text-xs text-background-black-child-tab dark:text-color-white-90 transition-all duration-300 font-semibold'>{label}</label>
                              <figure className={`cursor-pointer transition-all duration-300 ${isOpenFilter ? '' : 'rotate-180'}`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2.75 max-md:w-2' alt="Icon Arrow Up Gray" /></figure>
                            </div>)}
      <div className={!horizontalFixed ? 'transition-all duration-300 relative filter-relative overflow-hidden' : ''} data-initial-height="match">
        <div className={!horizontalFixed ? `transition-all duration-300 absolute w-full left-0 filter-absolute ${isOpenFilter ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}` : ''}>
          {!horizontalFixed && (<div className='flex items-center gap-2 mb-1'>
                                    <input
                                    type='number'
                                    value={localMin}
                                    min={min}
                                    max={safeMax}
                                    step={step}
                                    disabled={disabled}
                                    onChange={(e) => handleMinInput(e.target.value)}
                                    className='w-1/2 px-3 py-2 max-md:py-1.5 text-sm max-md:text-xs rounded-xl border border-background-line-gray dark:border-background-white-15 bg-background-light dark:bg-background-white-8 outline-none text-color-black-50 dark:text-color-white-50 transition-all duration-300'
                                    />
                                    <input
                                    type='number'
                                    value={localMax}
                                    min={safeMin}
                                    max={max}
                                    step={step}
                                    disabled={disabled}
                                    onChange={(e) => handleMaxInput(e.target.value)}
                                    className='w-1/2 px-3 py-2 max-md:py-1.5 text-sm max-md:text-xs rounded-xl border border-background-line-gray dark:border-background-white-15 bg-background-light dark:bg-background-white-8 outline-none text-color-black-50 dark:text-color-white-50 transition-all duration-300'
                                    />
                                </div>)}
          <div className={`relative h-6 max-md:h-5 flex items-center ${horizontalFixed ? 'w-34 max-md:w-full' : ''}`}>
            <div className={`absolute w-full ${!horizontalFixed ? 'h-1.5' : 'h-1.25'} h-1.5 max-md:h-1 rounded-full bg-background-black-4 dark:bg-background-white-15`} />
            <div
              className={`absolute ${!horizontalFixed ? 'h-1.5' : 'h-1.25'} max-md:h-1 rounded-full bg-color-neotam dark:bg-color-primary-700`}
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            />
            <input
              type='range'
              min={min}
              max={max}
              step={step}
              value={localMin}
              disabled={disabled}
              onChange={(e) => handleMinInput(e.target.value)}
              className={`absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none ${!horizontalFixed ? '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4' : '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5'} max-md:[&::-webkit-slider-thumb]:h-3 max-md:[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-color-neotam dark:[&::-webkit-slider-thumb]:bg-color-primary-700 [&::-webkit-slider-thumb]:cursor-pointer`}
            />
            <input
              type='range'
              min={min}
              max={max}
              step={step}
              value={localMax}
              disabled={disabled}
              onChange={(e) => handleMaxInput(e.target.value)}
              className={`absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none ${!horizontalFixed ? '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4' : '[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5'} max-md:[&::-webkit-slider-thumb]:h-3 max-md:[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-color-neotam dark:[&::-webkit-slider-thumb]:bg-color-primary-700 [&::-webkit-slider-thumb]:cursor-pointer`}
            />
          </div>
          <div className='flex justify-between mt-1 max-md:mt-0 text-xs max-md:text-[10px] text-color-black-50 dark:text-color-white-50 transition-all duration-300'>
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeFilter;