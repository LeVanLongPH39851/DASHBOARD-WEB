// src/components/filters/DateRangeFilter.jsx
import { useState, useEffect } from 'react';
import { getYesterday } from '../../../../helpers/helper';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';
import iconArrowUpGrayDark from '../../../../assets/icon_arrow_up_gray_dark.png';
import { useDashboardStateGlobals } from '../../../../context/DashboardFilterContext';

const DateRangeFilter = ({ startDate, endDate, onChange, horizontalFixed=false }) => {
  const yesterday = getYesterday();
  const [localStart, setLocalStart] = useState(startDate || yesterday);
  const [localEnd, setLocalEnd] = useState(endDate || yesterday);

  const getMinStartDate = (endDateStr) => {
    const endDate = new Date(endDateStr);
    endDate.setDate(endDate.getDate() - 60);
    return endDate.toISOString().split('T')[0];
  };

  // Sync props → state khi Filter reset / load từ context
  useEffect(() => {
    if (startDate) setLocalStart(startDate);
    if (endDate) setLocalEnd(endDate);
  }, [startDate, endDate]);

  const validateDates = (newStart, newEnd) => {
    if (newStart > newEnd) {
      return false;
    }
    if (newEnd > yesterday) {
      return false;
    }
    return true;
  };

  const handleStartChange = (e) => {
    const value = e.target.value;
    if (value > localEnd) return; // Prevent if > endDate
    if (value > yesterday) return; // Prevent if > yesterday
    setLocalStart(value);
    onChange?.({ startDate: value, endDate: localEnd });
  };

  const handleEndChange = (e) => {
    const value = e.target.value;
    if (value > localEnd) return; // Prevent if > endDate
    if (value > yesterday) return; // Prevent if > yesterday
    setLocalEnd(value);
    onChange?.({ startDate: localStart, endDate: value });
  };

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  const [isOpenFilter, setIsOpenFilter] = useState(true);

  return (
    <div className={`${horizontalFixed ? '' : isOpenFilter ? `mb-4` : ''}`}>
      {!horizontalFixed && (<div className={`flex justify-between items-center h-10.5 ${isOpenFilter ? 'mb-1' : ''}`}>
                        <label className='text-[16px] text-background-black-child-tab dark:text-color-white-90 transition-all duration-300 font-medium'>Ngày</label>
                        <figure onClick={() => setIsOpenFilter(prev => !prev)} className={`cursor-pointer ${isOpenFilter ? '' : 'rotate-180'}`}><img src={!stateGlobals ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2.75' alt="Icon Arrow Up Gray" /></figure>
                      </div>)}
      <div className={!horizontalFixed ? `transition-all duration-300 relative filter-relative overflow-hidden` : ''} data-initial-height="match">
        <div className={`flex ${horizontalFixed ? 'gap-1' : 'flex-col'} ${!horizontalFixed ? `transition-all duration-300 absolute w-full left-0 filter-absolute ${isOpenFilter ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}` : ''}`}>
          {!horizontalFixed && <label className='text-sm font-medium text-color-black-50 dark:text-color-white-50 transition-all duration-300 mb-1.5'>Từ ngày</label>}
          <input
            className={`px-4 rounded-xl border border-background-line-gray dark:border-background-white-15 text-sm font-medium text-color-black-50 dark:text-color-white-50 transition-all duration-300 dark:bg-background-white-8 outline-none ${horizontalFixed ? 'py-2' : 'mb-2 py-2.25'}`}
            type="date"
            value={localStart}
            min={getMinStartDate(localEnd)}
            max={localEnd}
            onChange={handleStartChange}
          />
          {!horizontalFixed && <label className='text-sm font-medium text-color-black-50 dark:text-color-white-50 transition-all duration-300 mb-1.5'>Đến ngày</label>}
          <input
            className={`px-4 rounded-xl border border-background-line-gray dark:border-background-white-15 text-sm font-medium text-color-black-50 dark:text-color-white-50 transition-all duration-300 dark:bg-background-white-8 outline-none ${horizontalFixed ? 'py-2' : 'py-2.25'}`}
            type="date"
            value={localEnd}
            min={localStart}
            max={yesterday}
            onChange={handleEndChange}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
