// src/components/filters/RangeFilter.jsx
import { useMemo, useState, useEffect } from 'react';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';
import iconArrowUpGrayDark from '../../../../assets/icon_arrow_up_gray_dark.png';
import { useDashboardStateGlobals } from '../../../../context/DashboardFilterContext';

const RangeFilter = ({
  value = { min: 0, max: 1439 },
  onChange,
  label,
  min = 0,
  max = 1439,
  step = 1,
  disabled = false,
  marginBottom,
  horizontalFixed=false,
  minGap = 0
}) => {
  const { stateGlobals } = useDashboardStateGlobals();
  
  const openFilter = sessionStorage.getItem('open_filters') ? JSON.parse(sessionStorage.getItem('open_filters')).includes(label) : false;
  const [isOpenFilter, setIsOpenFilter] = useState(openFilter);

  const clamp = (val, minVal, maxVal) => Math.min(Math.max(val, minVal), maxVal);

  const toTime = (minutes) => {
    if (minutes === '' || minutes === null || minutes === undefined) return '';
    const m = Number(minutes);
    if (Number.isNaN(m)) return '';
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const timeToSlider = (time) => {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) return null;
    const [hh, mm] = time.split(':').map(Number);
    return hh * 60 + mm;
  };

  const defaultFormatValue = (v) => toTime(v);

  const [localMin, setLocalMin] = useState(value?.min ?? min);
  const [localMax, setLocalMax] = useState(value?.max ?? max);
  const [localMinText, setLocalMinText] = useState(toTime(value?.min ?? min));
  const [localMaxText, setLocalMaxText] = useState(toTime(value?.max ?? max));

  useEffect(() => {
    const nextMinRaw = value?.min ?? min;
    const nextMaxRaw = value?.max ?? max;

    let nextMin = clamp(nextMinRaw, min, max - minGap);
    let nextMax = clamp(nextMaxRaw, min + minGap, max);

    if (nextMin >= nextMax) {
      if (nextMin + minGap <= max) {
        nextMax = nextMin + minGap;
      } else {
        nextMin = nextMax - minGap;
      }
    }

    setLocalMin(nextMin);
    setLocalMax(nextMax);
    setLocalMinText(toTime(nextMin));
    setLocalMaxText(toTime(nextMax));
  }, [value, min, max, minGap]);

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

    if (newMin === '') {
      setLocalMin('');
      return;
    }

    const parsedMin = parseInt(newMin, 10);
    const nextMin = Math.min(parsedMin, safeMax - minGap);
    setLocalMin(nextMin);
    setLocalMinText(toTime(nextMin));
    onChange?.({ min: nextMin, max: safeMax });
  };

  const handleMaxInput = (newMax) => {
    if (disabled) return;

    if (newMax === '') {
      setLocalMax('');
      return;
    }

    const parsedMax = parseInt(newMax, 10);
    const nextMax = Math.max(parsedMax, safeMin + minGap);
    setLocalMax(nextMax);
    setLocalMaxText(toTime(nextMax));
    onChange?.({ min: safeMin, max: nextMax });
  };

  const handleMinInputText = (newMin) => {
    if (disabled) return;
    if (newMin.length > 5 || (newMin[0] && !/^[0-2]/.test(newMin[0])) || (newMin[1] && (newMin[0] < 2 ? !/\d/.test(newMin[1]) : !/^[0-4]/.test(newMin[1]))) || (newMin[2] && newMin[2] !== ':') || (newMin[3] && !/^[0-5]/.test(newMin[3])) || (newMin[4] && !/\d/.test(newMin[4]))) return;
    const nextMin = timeToSlider(newMin);
    const currentMax = timeToSlider(localMaxText);
    if (nextMin !== null && currentMax !== null && nextMin > currentMax) return;
    setLocalMinText(newMin);
    if (newMin.length == 5) {
      const parsedMin = parseInt(nextMin, 10);
      const nextMinFinal = Math.min(parsedMin, safeMax - minGap);
      if (nextMin !== null) setLocalMin(nextMinFinal);
      if (nextMin !== null) onChange?.({ min: nextMinFinal, max: safeMax });
    }
  };

  const handleMaxInputText = (newMax) => {
    if (disabled) return;
    if (newMax.length > 5 || (newMax[0] && !/^[0-2]/.test(newMax[0])) || (newMax[1] && (newMax[0] < 2 ? !/\d/.test(newMax[1]) : !/^[0-4]/.test(newMax[1]))) || (newMax[2] && newMax[2] !== ':') || (newMax[3] && !/^[0-5]/.test(newMax[3])) || (newMax[4] && !/\d/.test(newMax[4]))) return;
    const nextMax = timeToSlider(newMax);
    const currentMin = timeToSlider(localMinText);
    if (nextMax !== null && currentMin !== null && nextMax < currentMin) return;
    setLocalMaxText(newMax);
    if (newMax.length == 5) {
      const parsedMax = parseInt(nextMax, 10);
      const nextMaxFinal = Math.max(parsedMax, safeMin + minGap);
      if (nextMax !== null) setLocalMax(nextMaxFinal);
      if (nextMax !== null) onChange?.({ min: safeMin, max: nextMaxFinal });
    }
  };

  const next = (newValue, state) => {
    if (disabled) return;
  };

  const prev = (newValue, state) => {
    if (disabled) return;
  };

  return (
    <div className={`${horizontalFixed ? '' : isOpenFilter ? `${marginBottom}` : ''}`}>
      {!horizontalFixed && (<div onClick={() => {setIsOpenFilter(prev => !prev);
                                                const sessionOpen = isOpenFilter ? JSON.stringify([...(JSON.parse(sessionStorage.getItem('open_filters') || '[]')).filter(item => item !== label)]) : JSON.stringify([...(JSON.parse(sessionStorage.getItem('open_filters') || '[]')), label]);
                                                sessionStorage.setItem('open_filters', sessionOpen);}}
                              className={`flex cursor-pointer group justify-between items-center h-10.5 max-lg:h-9 max-md:h-8 ${isOpenFilter ? 'mb-1' : ''}`}>
                              <label className='cursor-pointer text-[16px] max-lg:text-sm max-md:text-xs text-background-black-child-tab dark:text-color-white-90 transition-all duration-300 font-medium'>{label}</label>
                              <figure className={`cursor-pointer transition-all duration-300 ${isOpenFilter ? '' : 'rotate-180'}`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2.75 max-lg:w-2.5 max-md:w-2' alt="Icon Arrow Up Gray" /></figure>
                            </div>)}
      <div className={!horizontalFixed ? 'transition-all duration-300 relative filter-relative overflow-hidden' : ''} data-initial-height="match">
        <div className={!horizontalFixed ? `transition-all duration-300 absolute w-full left-0 filter-absolute ${isOpenFilter ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}` : ''}>
          {!horizontalFixed && (<div className='flex items-center gap-2 max-lg:gap-1.5 mb-1'>
                                    <div className='w-1/2 relative'>
                                      <input
                                      type='text'
                                      value={localMinText}
                                      placeholder='HH:mm'
                                      required
                                      disabled={disabled}
                                      onChange={(e) => handleMinInputText(e.target.value)}
                                      className='w-full px-3 py-2 max-lg:py-1.75 max-md:py-1.5 text-sm max-lg:text-[13px] max-md:text-xs rounded-xl border border-background-line-gray dark:border-background-white-15 bg-background-light dark:bg-background-white-8 outline-none text-color-black-50 dark:text-color-white-50 transition-all duration-300'
                                      />
                                      <figure className={`cursor-pointer transition-all duration-300 absolute top-2.5 max-lg:top-2.25 max-md:top-2 px-1 right-2`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2 max-lg:w-1.75 max-md:w-1.5' alt="Icon Arrow Up Gray" /></figure>
                                      <figure className={`cursor-pointer transition-all duration-300 absolute bottom-2.5 max-lg:bottom-2.25 px-1 max-md:bottom-2 right-2 rotate-180`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2 max-lg:w-1.75 max-md:w-1.5' alt="Icon Arrow Up Gray" /></figure>
                                    </div>
                                    <div className='w-1/2 relative'>
                                      <input
                                      type='text'
                                      value={localMaxText}
                                      placeholder='HH:mm'
                                      required
                                      disabled={disabled}
                                      onChange={(e) => handleMaxInputText(e.target.value)}
                                      className='w-full px-3 py-2 max-lg:py-1.75 max-md:py-1.5 text-sm max-lg:text-[13px] max-md:text-xs rounded-xl border border-background-line-gray dark:border-background-white-15 bg-background-light dark:bg-background-white-8 outline-none text-color-black-50 dark:text-color-white-50 transition-all duration-300'
                                      />
                                      <figure className={`cursor-pointer transition-all duration-300 absolute top-2.5 max-lg:top-2.25 max-md:top-2 px-1 right-2`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2 max-lg:w-1.75 max-md:w-1.5' alt="Icon Arrow Up Gray" /></figure>
                                      <figure className={`cursor-pointer transition-all duration-300 absolute bottom-2.5 max-lg:bottom-2.25 px-1 max-md:bottom-2 right-2 rotate-180`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2 max-lg:w-1.75 max-md:w-1.5' alt="Icon Arrow Up Gray" /></figure>
                                    </div>
                                </div>)}
          <div className={`relative h-6 max-lg:h-5.5 max-md:h-5 flex items-center ${horizontalFixed ? 'w-34 max-lg:w-32 max-md:w-full' : ''}`}>
            <div className={`absolute w-full h-1.25 max-lg:h-1 max-md:h-1 rounded-full bg-background-black-4 dark:bg-background-white-15`} />
            <div
              className={`absolute h-1.25 max-lg:h-1 max-md:h-1 rounded-full bg-color-neotam dark:bg-color-primary-700`}
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
              className={`absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 max-md:[&::-webkit-slider-thumb]:h-3 max-md:[&::-webkit-slider-thumb]:w-3 max-lg:[&::-webkit-slider-thumb]:h-3.25 max-lg:[&::-webkit-slider-thumb]:w-3.25 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-color-neotam dark:[&::-webkit-slider-thumb]:bg-color-primary-700 [&::-webkit-slider-thumb]:cursor-pointer`}
            />
            <input
              type='range'
              min={min}
              max={max}
              step={step}
              value={localMax}
              disabled={disabled}
              onChange={(e) => handleMaxInput(e.target.value)}
              className={`absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 max-md:[&::-webkit-slider-thumb]:h-3 max-md:[&::-webkit-slider-thumb]:w-3 max-lg:[&::-webkit-slider-thumb]:h-3.25 max-lg:[&::-webkit-slider-thumb]:w-3.25 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-color-neotam dark:[&::-webkit-slider-thumb]:bg-color-primary-700 [&::-webkit-slider-thumb]:cursor-pointer`}
            />
          </div>
          <div className='flex justify-between mt-1 max-lg:mt-0.75 max-md:mt-0 text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 transition-all duration-300'>
            <span>{defaultFormatValue(min)}</span>
            <span>{defaultFormatValue(max)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeFilter;