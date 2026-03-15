// src/components/filters/DateRangeFilter.jsx
import { useState, useEffect } from 'react';
import { getYesterday } from '../../../../helpers/helper';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';

const DateRangeFilter = ({ startDate, endDate, onChange, horizontal=false }) => {
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

  return (
    <div className={`${horizontal ? '' : 'mb-4'}`}>
      {!horizontal && (<div className='flex justify-between items-center h-10.5 mb-1'>
                        <label className='text-[16px] text-background-black-child-tab font-medium'>Ngày</label>
                        <figure className='cursor-pointer'><img src={iconArrowUpGray} className='w-2.75' alt="Icon Arrow Up Gray" /></figure>
                      </div>)}
      <div className={`flex ${horizontal ? 'gap-1' : 'flex-col'}`}>
        {!horizontal && <label className='text-sm font-medium text-color-black-50 mb-1.5'>Từ ngày</label>}
        <input
          className={`px-4 rounded-xl border border-background-line-gray text-sm font-medium text-color-black-50 outline-none ${horizontal ? 'py-2' : 'mb-2 py-2.25'}`}
          type="date"
          value={localStart}
          min={getMinStartDate(localEnd)}
          max={localEnd}
          onChange={handleStartChange}
        />
        {!horizontal && <label className='text-sm font-medium text-color-black-50 mb-1.5'>Đến ngày</label>}
        <input
          className={`px-4 rounded-xl border border-background-line-gray text-sm font-medium text-color-black-50 outline-none ${horizontal ? 'py-2' : 'py-2.25'}`}
          type="date"
          value={localEnd}
          min={localStart}
          max={yesterday}
          onChange={handleEndChange}
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
