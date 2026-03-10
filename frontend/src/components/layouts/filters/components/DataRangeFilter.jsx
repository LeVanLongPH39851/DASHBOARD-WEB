// src/components/filters/DateRangeFilter.jsx
import { useState, useEffect } from 'react';
import { getYesterday } from '../../../../helpers/helper';

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
    <div className={`${horizontal ? '' : 'p-4 bg-[#1a1a1a] border border-[#404040] rounded-md mb-4'}`}>
      {!horizontal && (<label className='text-sm text-white mb-2 block font-bold'>NGÀY</label>)}
      <div className={`grid grid-cols-2 gap-1.5 ${horizontal ? 'p-1.75 border border-border-black-10 rounded-sm' : ''}`}>
        <input
          className={`bg-white px-2 py-0.5 rounded-xs text-[11px] outline-none ${horizontal ? 'border border-border-black-10' : ''}`}
          type="date"
          value={localStart}
          min={getMinStartDate(localEnd)}
          max={localEnd}
          onChange={handleStartChange}
        />
        <input
          className={`bg-white px-2 py-0.5 rounded-xs text-[11px] outline-none ${horizontal ? 'border border-border-black-10' : ''}`}
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
