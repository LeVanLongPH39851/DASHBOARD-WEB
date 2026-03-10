// src/components/Filter.jsx
import { useState, useEffect } from 'react';
import DateRangeFilter from './components/DataRangeFilter';
import ButtonFilter from './components/ButtonFilter';
import SelectMultiFilter from './components/SelectMultiFilter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faCircleArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getYesterday } from '../../../helpers/helper';

const ALL_CHANNELS = [
  { value: "VTV1", label: "VTV1" },
  { value: "VTV2", label: "VTV2" },
  { value: "VTV3", label: "VTV3" },
  { value: "VTV4", label: "VTV4" },
  { value: "VTV5", label: "VTV5" },
  { value: "VTV5 Tây Nam Bộ", label: "VTV5 Tây Nam Bộ" },
  { value: "VTV5 Tây Nguyên", label: "VTV5 Tây Nguyên" },
  { value: "VTV7", label: "VTV7" },
  { value: "VTV8", label: "VTV8" },
  { value: "VTV9", label: "VTV9" },
  { value: "VTV Cần Thơ", label: "VTV Cần Thơ" }
];

const ALL_EVENTS = [
  { value: "Live", label: "Live" },
  { value: "TSV", label: "TSV" }
];

const DISABLE_TABS = {
  overview: 'overview',
  channel: 'channel',
  program: 'program',
  rating_by_minute: 'rating_by_minute'
}

const Filter = ({ isOpen, setIsOpen, currentTab, filters, appliedFilters, setAppliedFilters,
                  channels, setChannels, events, setEvents, provinces, setProvinces, horizontal=false
               }) => {
  
  const ALL_PROVINCES = filters.filterProvince.map(item => ({
    value: item.province,
    label: item.province
  }));

  const [startDate, setStartDate] = useState(getYesterday());
  const [endDate, setEndDate] = useState(getYesterday());

  // Sync context → form
  useEffect(() => {
    if (appliedFilters) {
      setStartDate(appliedFilters.startDate || getYesterday());
      setEndDate(appliedFilters.endDate || getYesterday());
      setChannels(
        (appliedFilters.channels || [])
          .map(val => ALL_CHANNELS.find(ch => ch.value === val))
          .filter(Boolean)
      );
      setEvents(
        (appliedFilters.events || [])
          .map(val => ALL_EVENTS.find(ev => ev.value === val))
          .filter(Boolean)
      );
      setProvinces(
        (appliedFilters.provinces || [])
          .map(val => ALL_PROVINCES.find(pr => pr.value === val))
          .filter(Boolean)
      );
    }
  }, [appliedFilters]);

  const handleDateRangeChange = ({ startDate: s, endDate: e }) => {
    setStartDate(s);
    setEndDate(e);
  };

  const handleChannelsChange = (selectedChannels) => {
    setChannels(selectedChannels);
  };

  const handleEventsChange = (selectedEvents) => {
    setEvents(selectedEvents);
  };

  const handleProvincesChange = (selectedProvinces) => {
    setProvinces(selectedProvinces);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const hasDate = Boolean(startDate && endDate);
    const channelValues = channels.map(ch => ch.value);
    const hasChannels = channelValues.length > 0;
    const eventValues = events.map(ev => ev.value);
    const hasEvents = eventValues.length > 0;
    const provinceValues = provinces.map(pr => pr.value);
    const hasProvinces = provinceValues.length > 0;
    const hasAny = hasDate || hasChannels || hasEvents || hasProvinces;
    
    setAppliedFilters(
      hasAny ? { startDate, endDate, channels: channelValues, events: eventValues, provinces:  provinceValues} : null
    );
  };

  const onReset = () => {
    const y = getYesterday();
    setStartDate(y);
    setEndDate(y);
    setChannels([]);
    setEvents([]);
    setProvinces([]);
    setAppliedFilters(null);
  };

  return (
    <>
    <div onClick={() => setIsOpen(prev => ({...prev, isOpen: !prev.isOpen}))} className={`text-[#20A7C9] cursor-pointer text-right fixed left-0.5 top-1/2 -translate-y-1/2 transition-all duration-300 ${isOpen.isOpen || isOpen.horizontal ? 'invisible opacity-0' : 'visible opacity-100'}`}><FontAwesomeIcon icon={faCircleArrowRight} /></div>
    <aside className={`${horizontal ? 'w-full' : `${!isOpen.isOpen || isOpen.horizontal ? 'w-0' : 'w-[15%]'} h-full`} `}>
      <div className={`${horizontal ? 'w-full' : `bg-background-dark h-full w-[15%] fixed left-0 ${!isOpen.isOpen || isOpen.horizontal ? '-translate-x-full' : ''} top-15 px-3 py-5 transition-all duration-300`}`}>
        {!horizontal && <div onClick={() => setIsOpen(prev => ({...prev, isOpen: !prev.isOpen}))} className='text-white cursor-pointer text-right mb-1'><FontAwesomeIcon icon={faCircleArrowLeft} /></div>}
        <form className={`${horizontal ? 'grid grid-cols-7 gap-2 items-center' : ''}`} onSubmit={onSubmit} onReset={onReset}>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeChange}
            horizontal={horizontal}
          />

          <SelectMultiFilter
            label="KÊNH"
            placeholder="Chọn kênh..."
            options={ALL_CHANNELS}
            value={channels}
            onChange={handleChannelsChange}
            marginBottom="mb-4"
            horizontal={horizontal}
          />

          {(currentTab != DISABLE_TABS.rating_by_minute && <SelectMultiFilter
            label="Live/TSV"
            placeholder="Chọn event..."
            options={ALL_EVENTS}
            value={events}
            onChange={handleEventsChange}
            marginBottom="mb-4"
            horizontal={horizontal}
          />)}

          {/* <SelectMultiFilter
            label="VÙNG"
            placeholder="Chọn vùng..."
            options={ALL_REGIONALS}
            value={regionals}
            onChange={handleRegionalsChange}
            marginBottom="mb-4"
          />

          <SelectMultiFilter
            label="THÀNH PHỐ LỚN"
            placeholder="Chọn TP lớn..."
            options={ALL_KEY_CITES}
            value={regionals}
            onChange={handleKeyCitesChange}
            marginBottom="mb-4"
          /> */}

          <SelectMultiFilter
            label="TỈNH/TP"
            placeholder="Chọn Tỉnh/TP"
            options={ALL_PROVINCES}
            value={provinces}
            onChange={handleProvincesChange}
            marginBottom="mb-4"
            horizontal={horizontal}
          />

          <div className='flex justify-center gap-1'>
            <ButtonFilter text={'Apply filters'} background={'bg-[#20A7C9]'} color={'text-white'} type={'submit'} />
            <ButtonFilter text={'Clear all'} background={'bg-[#E0E0E0]'} color={'text-[#666666]'} type={'reset'} />
          </div>
        </form>
      </div>
    </aside>
    </>
  );
};

export default Filter;
