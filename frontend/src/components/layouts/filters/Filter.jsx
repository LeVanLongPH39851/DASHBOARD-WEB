// src/components/Filter.jsx
import { useState, useEffect } from 'react';
import DateRangeFilter from './components/DataRangeFilter';
import ButtonFilter from './components/ButtonFilter';
import SelectMultiFilter from './components/SelectMultiFilter';
import { getYesterday } from '../../../helpers/helper';
import iconXBlack from '../../../assets/icon_x_black.png';
import iconReset from '../../../assets/icon_reset.png';

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

  useEffect(() => {
    const filterId = document.getElementById('filter');
    if (!filterId) return;

    let wasSticky = false;

    const handleScroll = () => {
      const isSticky = window.scrollY > 60;

      if (isSticky === wasSticky) return;
      wasSticky = isSticky;

      filterId.classList.remove('top-0', 'top-15');
      filterId.classList.add(isSticky ? 'top-0' : 'top-15');
      filterId.style.height = !isSticky ? 'calc(100vh - 60px)' : '100%'
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <aside className={`${horizontal ? 'w-full' : `${!isOpen.isOpen || isOpen.horizontal ? 'w-0' : 'w-[16%]'} h-full`}`}>
      <div id='filter' className={`${horizontal ? 'w-full' : `bg-background-light border-r border-background-line-gray w-[16%] overflow-hidden fixed left-0 ${!isOpen.isOpen || isOpen.horizontal ? '-translate-x-full' : ''} top-15 px-6 pt-4 pb-5 transition-all duration-300`}`} style={{height: !horizontal ? 'calc(100vh - 60px)' : ''}}>
        {!horizontal && (<div className='flex justify-between items-center h-10.5 mb-2'>
          <span className='text-background-black-child-tab text-[16px] font-semibold'>Bộ lọc</span><figure className='cursor-pointer transition-all duration-300 hover:rotate-180' onClick={() => setIsOpen(prev => ({...prev, isOpen: !prev.isOpen}))}><img src={iconXBlack} className='w-3.25' alt="Icon X Black" /></figure>
        </div>)}
        <form className={`${horizontal ? 'flex gap-2 items-center' : ''}`} onSubmit={onSubmit} onReset={onReset}>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateRangeChange}
            horizontal={horizontal}
          />

          <SelectMultiFilter
            label="Kênh"
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
            label="Tỉnh/TP"
            placeholder="Chọn Tỉnh/TP"
            options={ALL_PROVINCES}
            value={provinces}
            onChange={handleProvincesChange}
            marginBottom="mb-4"
            horizontal={horizontal}
          />

          <div className={`flex justify-center items-center bg-background-light ${!horizontal ? 'absolute bottom-0 left-0 w-full shadow-2xl shadow-color-black-50 py-3 gap-4' : 'gap-1'}`}>
            <ButtonFilter text={'Áp dụng bộ lọc'} background={'bg-background-black-90'} color={'text-color-white-90'} type={'submit'} />
            <ButtonFilter text={'Đặt lại'} background={'bg-background-light'} color={'text-background-black-90'} type={'reset'} src={iconReset} alt={'Icon Reset'} width={'w-3'} />
          </div>
        </form>
      </div>
    </aside>
    </>
  );
};

export default Filter;
