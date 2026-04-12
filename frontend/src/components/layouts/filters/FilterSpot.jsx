// src/components/Filter.jsx
import { useState, useEffect, useCallback } from 'react';
import DateRangeFilter from './components/DataRangeFilter';
import ButtonFilter from './components/ButtonFilter';
import SelectMultiFilter from './components/SelectMultiFilter';
import CheckboxMultiFilter from './components/CheckboxMultiFilter';
import { getYesterday, getDayBeforeYesterday } from '../../../helpers/helper';
import iconXBlack from '../../../assets/icon_x_black.png';
import iconXBlackDark from '../../../assets/icon_x_black_dark.png';
import iconReset from '../../../assets/icon_reset.png';
import iconResetDark from '../../../assets/icon_reset_dark.png';
import GroupFilter from './components/GroupFilter';
import RangeFilter from './components/RangeFilter';
import { useDashboardFilters, useDashboardFilterValues, useDashboardStateGlobals } from '../../../context/DashboardFilterContext';

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
  { value: "VTV10", label: "VTV10" }
];

const ALL_DAYS = [
  { value: "Weekend", label: "Cuối tuần", groupId: "week-type" },
  { value: "InWeek", label: "Ngày thường", groupId: "week-type" },
  { value: "Monday", label: "Thứ hai" },
  { value: "Tuesday", label: "Thứ ba" },
  { value: "Wednesday", label: "Thứ tư" },
  { value: "Thursday", label: "Thứ năm" },
  { value: "Friday", label: "Thứ sáu" },
  { value: "Saturday", label: "Thứ bảy" },
  { value: "Sunday", label: "Chủ nhật" }
];

const ALL_REGIONALS = [
  { value: "Bắc Trung Bộ và Duyên hải miền Trung", label: "Bắc Trung Bộ và Duyên hải miền Trung" },
  { value: "Đồng bằng sông Cửu Long", label: "Đồng bằng sông Cửu Long" },
  { value: "Đồng bằng sông Hồng", label: "Đồng bằng sông Hồng" },
  { value: "Đông Nam Bộ", label: "Đông Nam Bộ" },
  { value: "Tây Nguyên", label: "Tây Nguyên" },
  { value: "Trung du và miền núi phía Bắc", label: "Trung du và miền núi phía Bắc" }
];

const ALL_KEY_CITIES = [
  { value: "4 TP lớn", label: "4 TP lớn" }
];

const ALL_TIMEBANDS = [
  { value: "0h - 1h", label: "0h - 1h" },
  { value: "1h - 2h", label: "1h - 2h" },
  { value: "2h - 3h", label: "2h - 3h" },
  { value: "3h - 4h", label: "3h - 4h" },
  { value: "4h - 5h", label: "4h - 5h" },
  { value: "5h - 6h", label: "5h - 6h" },
  { value: "6h - 7h", label: "6h - 7h" },
  { value: "7h - 8h", label: "7h - 8h" },
  { value: "8h - 9h", label: "8h - 9h" },
  { value: "9h - 10h", label: "9h - 10h" },
  { value: "10h - 11h", label: "10h - 11h" },
  { value: "11h - 12h", label: "11h - 12h" },
  { value: "12h - 13h", label: "12h - 13h" },
  { value: "13h - 14h", label: "13h - 14h" },
  { value: "14h - 15h", label: "14h - 15h" },
  { value: "15h - 16h", label: "15h - 16h" },
  { value: "16h - 17h", label: "16h - 17h" },
  { value: "17h - 18h", label: "17h - 18h" },
  { value: "18h - 19h", label: "18h - 19h" },
  { value: "19h - 20h", label: "19h - 20h" },
  { value: "20h - 21h", label: "20h - 21h" },
  { value: "21h - 22h", label: "21h - 22h" },
  { value: "22h - 23h", label: "22h - 23h" },
  { value: "23h - 24h", label: "23h - 24h" }
];

const ALL_FIRST_LEVELS = [
  { value: "Dành cho trẻ em", label: "Dành cho trẻ em" },
  { value: "Giáo dục - Đào tạo", label: "Giáo dục - Đào tạo" },
  { value: "Giải trí", label: "Giải trí" },
  { value: "Phim dài tập", label: "Phim dài tập" },
  { value: "Sự kiện - Đặc biệt", label: "Sự kiện - Đặc biệt" },
  { value: "Thể thao", label: "Thể thao" },
  { value: "Thời sự - Chính luận", label: "Thời sự - Chính luận" },
  { value: "Tài liệu - Phóng sự", label: "Tài liệu - Phóng sự" },
  { value: "Đời sống", label: "Đời sống" },
  { value: "Quảng cáo", label: "Quảng cáo" },
  { value: "Quảng bá", label: "Quảng bá" }
];

const ALL_PLATFORMS = [
  { value: "SMART_TV", label: "SMART_TV" },
  { value: "PC/LAP", label: "PC/LAP" },
  { value: "MOBILE", label: "MOBILE" },
  { value: "TABLET", label: "TABLET" }
];

const ALL_SPOT_TYPES = [
  { value: "Spot Trailer", label: "Spot Trailer" },
  { value: "Spot Advertisement", label: "Spot Advertisement" },
  { value: "Self-Introduction Ads", label: "Self-Introduction Ads" },
  { value: "Prog. Sponsorship screen", label: "Prog. Sponsorship screen" },
  { value: "Full Screen Popup", label: "Full Screen Popup" },
  { value: "Trailer Mix Ad", label: "Trailer Mix Ad" }
];

const DISABLE_TABS = {
  overview: 'overview',
  revenue: 'revenue',
  effective: 'effective',
  ad_monitoring_report: 'ad_monitoring_report'
}

const FilterSpot = ({ filters, horizontalFixed=false
               }) => {
  
  const toOptions = (items = [], field) =>
  items.map(item => ({
    value: item[field],
    label: item[field],
  }));

  const ALL_PROVINCES = toOptions(filters?.filterProvince, 'province');
  const ALL_PROGRAMS = toOptions(filters?.filterProgram, 'program_name');
  const ALL_PRODUCTS = toOptions(filters?.filterProduct, 'product');
  const ALL_GROUPS = toOptions(filters?.filterGroup, 'group');
  const ALL_CAMPAIGNS = toOptions(filters?.filterCampaign, 'campaign_name');
  const ALL_BRANDS = toOptions(filters?.filterBrand, 'brand');
  const ALL_ADVERTISERS = toOptions(filters?.filterAdvertiser, 'advertiser');
  const ALL_ADCODES = toOptions(filters?.filterAdcode, 'ads_code');

  const { appliedFilters, setAppliedFilters} = useDashboardFilters();
  const { filterValues, setFilterValues } = useDashboardFilterValues();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  useEffect(() => {
    const filterId = document.getElementById('filter');
    
    if (!filterId) return;

    let wasSticky = false;

    const handleScroll = () => {
      const threshold = window.innerWidth < 1025 ? 40 : 60;
      const isSticky = window.scrollY > threshold;

      if (isSticky === wasSticky) return;
      wasSticky = isSticky;

      filterId.classList.remove('top-0', 'top-15', 'max-lg:top-13', 'max-md:top-10');

      if (isSticky) {
        filterId.classList.add('top-0');
      } else {
        filterId.classList.add('top-15', 'max-lg:top-13', 'max-md:top-10');
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stateGlobals.isOpen, stateGlobals.horizontal]);

  useEffect(() => {
    const relatives = document.querySelectorAll('.filter-relative');

    const observers = Array.from(relatives)
      .map(relative => {
        const absolute = relative.querySelector('.filter-absolute');
        if (!absolute) return null;

        const initialHeight = relative.dataset.initialHeight || 'zero'; // lấy từ data attribute

        const updateHeight = () => {
          const isVisible = absolute.classList.contains('visible')
                        && absolute.classList.contains('opacity-100')
                        && absolute.classList.contains('top-0');

          relative.style.height = isVisible ? `${absolute.offsetHeight}px` : '0px';
        };

        // Set height ban đầu
        relative.style.height = initialHeight === 'match'
          ? `${absolute.offsetHeight}px`
          : '0px';

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(absolute);

        const mutationObserver = new MutationObserver(updateHeight);
        mutationObserver.observe(absolute, { attributeFilter: ['class'] });

        return { resizeObserver, mutationObserver };
      })
      .filter(Boolean);

    return () => observers.forEach(({ resizeObserver, mutationObserver }) => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    });
  }, [stateGlobals.horizontal, stateGlobals.currentTab]);

  // Sync context → form
  useEffect(() => {
    if (!appliedFilters) return;

    // ✅ Lookup tables: field → options array
    const lookups = {
      days: ALL_DAYS,
      channels: ALL_CHANNELS,
      provinces: ALL_PROVINCES,
      regionals: ALL_REGIONALS,
      keyCities: ALL_KEY_CITIES,
      timebands: ALL_TIMEBANDS,
      firstLevels: ALL_FIRST_LEVELS,
      programs: ALL_PROGRAMS,
      adCodes: ALL_ADCODES,
      spotTypes: ALL_SPOT_TYPES,
      platforms: ALL_PLATFORMS,
      groups: ALL_GROUPS,
      products: ALL_PRODUCTS,
      brands: ALL_BRANDS,
      advertisers: ALL_ADVERTISERS,
      campaigns: ALL_CAMPAIGNS
    };

    setFilterValues(prev => ({
      ...prev,
      startDate: appliedFilters.startDate || getDayBeforeYesterday(),
      endDate: appliedFilters.endDate || getYesterday(),
      // ✅ Generic map tất cả arrays
      ...Object.fromEntries(
        Object.entries(lookups).map(([field, options]) => [
          field,
          (appliedFilters[field] || []).map(val => 
            options.find(item => item.value === val)
          ).filter(Boolean)
        ])
      )
    }));
  }, [appliedFilters]);

  const handleDateRangeChange = ({ startDate: s, endDate: e }) => {
    setFilterValues(prev => ({...prev, startDate: s, endDate: e}));
  };

  const handleDaysChange = (selectedDays) => {
    
    const normalizedDays = [];
    const groupMap = new Map();

    selectedDays.forEach((day) => {
      if (!day.groupId) {
        normalizedDays.push(day);
        return;
      }

      if (groupMap.has(day.groupId)) {
        const oldIndex = groupMap.get(day.groupId);
        normalizedDays[oldIndex] = day;
      } else {
        groupMap.set(day.groupId, normalizedDays.length);
        normalizedDays.push(day);
      }
    });
    
    setFilterValues((prev) => ({
      ...prev,
      days: normalizedDays,
    }));
  };

  const handleFilterChange = useCallback((field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!filterValues) {
      setAppliedFilters(null);
      return;
    }

    // ✅ Extract keys động từ filterValues (tự động tất cả array fields)
    const arrayFields = Object.keys(filterValues).filter(key => 
      Array.isArray(filterValues[key])  // Chỉ array mới map .value
    );

    const transformed = {
      ...filterValues,
      ...Object.fromEntries(
        arrayFields.map(key => [
          key,
          (filterValues[key] || []).map(item => item.value)
        ])
      )
    };

    setAppliedFilters(transformed);

    if(stateGlobals.screen_md) {
      setStateGlobals(prev => ({...prev, isOpen: !prev.isOpen}))
    }
  };

  const onReset = () => {
    setAppliedFilters(null);
    setFilterValues(null);

    if(stateGlobals.screen_md) {
      setStateGlobals(prev => ({...prev, isOpen: !prev.isOpen}))
    }
  };

  return (
    <>
    <aside className={`${horizontalFixed ? 'w-full' : `${!stateGlobals.isOpen || stateGlobals.horizontal ? 'w-0' : 'w-[16%] max-md:w-0'} h-full`} transition-all duration-300`}>
      <div id='filter' className={`${horizontalFixed ? 'w-full' : `bg-background-light dark:bg-background-dark border-r border-background-line-gray dark:border-background-white-15 w-[16%] max-md:w-[65%] max-md:z-9999 overflow-y-auto fixed left-0 ${!stateGlobals.isOpen || stateGlobals.horizontal ? '-translate-x-full' : ''} top-15 max-lg:top-13 max-md:top-10 max-md:px-4 max-lg:px-5 px-6 pt-4 max-lg:pt-3 max-md:pt-2 pb-20 transition-all duration-300 h-full`}`}>
        {!horizontalFixed && (<div className='flex justify-between items-center h-10.5 max-lg:h-9 max-md:h-8 mb-2 max-lg:mb-1.5 max-md:mb-1'>
          <span className='text-background-black-child-tab dark:text-color-white-90 transition-all duration-300 text-[16px] max-lg:text-sm max-md:text-xs font-semibold'>Bộ lọc</span><figure className='cursor-pointer transition-all duration-300 hover:rotate-180' onClick={() => setStateGlobals(prev => ({...prev, isOpen: !prev.isOpen}))}><img src={!stateGlobals.darkMode ? iconXBlack : iconXBlackDark} className='w-3.25 max-lg:w-2.75 max-md:w-2.5' alt="Icon X Black" /></figure>
        </div>)}
        <form className={`${horizontalFixed ? 'flex flex-wrap gap-2 max-lg:gap-1.75 max-md:gap-1.5 max-md:grid max-md:grid-cols-2 items-center' : ''}`} onSubmit={onSubmit} onReset={onReset}>
          <div className='max-md:col-span-2'>
            <DateRangeFilter
              startDate={filterValues?.startDate || getDayBeforeYesterday()}
              endDate={filterValues?.endDate || getYesterday()}
              onChange={handleDateRangeChange}
              horizontalFixed={horizontalFixed}
            />
          </div>
          
          {!stateGlobals.horizontal ?
          (<CheckboxMultiFilter
            label="Nhóm ngày"
            placeholder="Chọn ngày..."
            options={ALL_DAYS}
            value={filterValues?.days || []}
            onChange={handleDaysChange}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
          />) :
          (<SelectMultiFilter
            label="Nhóm ngày"
            placeholder="Chọn ngày..."
            options={ALL_DAYS}
            value={filterValues?.days || []}
            onChange={handleDaysChange}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          />)}

          {!stateGlobals.horizontal ?
          (<CheckboxMultiFilter
            label="Kênh"
            placeholder="Chọn kênh..."
            options={ALL_CHANNELS}
            value={filterValues?.channels || []}
            onChange={(selected) => handleFilterChange('channels', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
          />) :
          (<SelectMultiFilter
            label="Kênh"
            placeholder="Chọn kênh..."
            options={ALL_CHANNELS}
            value={filterValues?.channels || []}
            onChange={(selected) => handleFilterChange('channels', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          />)}

          {<SelectMultiFilter
            label="Khung giờ"
            placeholder="Chọn khung giờ..."
            options={ALL_TIMEBANDS}
            value={filterValues?.timebands || []}
            onChange={(selected) => handleFilterChange('timebands', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          />}

          {stateGlobals.currentTab !== DISABLE_TABS.effective && (<SelectMultiFilter
            label="Adscode"
            placeholder="Chọn Adscode"
            options={ALL_ADCODES}
            value={filterValues?.adCodes || []}
            onChange={(selected) => handleFilterChange('adCodes', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed} />)}

          {(stateGlobals.currentTab !== DISABLE_TABS.effective && !stateGlobals.horizontal) &&
            (<CheckboxMultiFilter
                label="Loại spot"
                placeholder="Chọn loại spot"
                options={ALL_SPOT_TYPES}
                value={filterValues?.spotTypes || []}
                onChange={(selected) => handleFilterChange('spotTypes', selected)}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            />)}
            
          {(stateGlobals.currentTab !== DISABLE_TABS.effective && stateGlobals.horizontal) &&
            (<SelectMultiFilter
                label="Loại spot"
                placeholder="Chọn loại spot"
                options={ALL_SPOT_TYPES}
                value={filterValues?.spotTypes || []}
                onChange={(selected) => handleFilterChange('spotTypes', selected)}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                horizontalFixed={horizontalFixed}
            />)}

          <SelectMultiFilter
            label="Ngành hàng"
            placeholder="Chọn ngành hàng"
            options={ALL_GROUPS}
            value={filterValues?.groups || []}
            onChange={(selected) => handleFilterChange('groups', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed} />

          <SelectMultiFilter
            label="Nhà quảng cáo"
            placeholder="Chọn nhà quảng cáo"
            options={ALL_ADVERTISERS}
            value={filterValues?.advertisers || []}
            onChange={(selected) => handleFilterChange('advertisers', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed} />

          <SelectMultiFilter
            label="Sản phẩm"
            placeholder="Chọn sản phẩm"
            options={ALL_PRODUCTS}
            value={filterValues?.products || []}
            onChange={(selected) => handleFilterChange('products', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed} />

         <SelectMultiFilter
            label="Nhãn hàng"
            placeholder="Chọn nhãn hàng"
            options={ALL_BRANDS}
            value={filterValues?.brands || []}
            onChange={(selected) => handleFilterChange('brands', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed} />

         <SelectMultiFilter
            label="Chiến dịch"
            placeholder="Chọn Chiến dịch"
            options={ALL_CAMPAIGNS}
            value={filterValues?.campaigns || []}
            onChange={(selected) => handleFilterChange('campaigns', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed} />

          {([DISABLE_TABS.effective, DISABLE_TABS.ad_monitoring_report].includes(stateGlobals.currentTab) && !stateGlobals.horizontal) &&
            (<CheckboxMultiFilter
                label="Thiết bị"
                placeholder="Chọn Thiết bị"
                options={ALL_PLATFORMS}
                value={filterValues?.platforms || []}
                onChange={(selected) => handleFilterChange('platforms', selected)}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            />)}
            
          {([DISABLE_TABS.effective, DISABLE_TABS.ad_monitoring_report].includes(stateGlobals.currentTab) && stateGlobals.horizontal) &&
            (<SelectMultiFilter
                label="Thiết bị"
                placeholder="Chọn Thiết bị"
                options={ALL_PLATFORMS}
                value={filterValues?.platforms || []}
                onChange={(selected) => handleFilterChange('platforms', selected)}
                marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
                horizontalFixed={horizontalFixed}
            />)}

          {!stateGlobals.horizontal ? (<CheckboxMultiFilter
            label="Thể loại"
            placeholder="Chọn thể loại"
            options={ALL_FIRST_LEVELS}
            value={filterValues?.firstLevels || []}
            onChange={(selected) => handleFilterChange('firstLevels', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
          />) :
          (<SelectMultiFilter
            label="Thể loại"
            placeholder="Chọn thể loại"
            options={ALL_FIRST_LEVELS}
            value={filterValues?.firstLevels || []}
            onChange={(selected) => handleFilterChange('firstLevels', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          />)}

          {<SelectMultiFilter
            label="Chương trình"
            placeholder="Chọn chương trình"
            options={ALL_PROGRAMS}
            value={filterValues?.programs || []}
            onChange={(selected) => handleFilterChange('programs', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed} />}

          {(!stateGlobals.horizontal && stateGlobals.currentTab === DISABLE_TABS.effective) && (<GroupFilter title={'Khu vực'} components={[<CheckboxMultiFilter
            label="Vùng"
            placeholder="Chọn vùng"
            options={ALL_REGIONALS}
            value={filterValues?.regionals || []}
            onChange={(selected) => handleFilterChange('regionals', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
          />, <CheckboxMultiFilter
            label="Thành phố lớn"
            placeholder="Chọn TP lớn"
            options={ALL_KEY_CITIES}
            value={filterValues?.keyCities || []}
            onChange={(selected) => handleFilterChange('keyCities', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            isSearch={false}
          />, <SelectMultiFilter
            label="Tỉnh/TP"
            placeholder="Chọn Tỉnh/TP"
            options={ALL_PROVINCES}
            value={filterValues?.provinces || []}
            onChange={(selected) => handleFilterChange('provinces', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          />]} />)}

          {(stateGlobals.horizontal && stateGlobals.currentTab === DISABLE_TABS.effective) &&
          (<><SelectMultiFilter
            label="Vùng"
            placeholder="Chọn vùng"
            options={ALL_REGIONALS}
            value={filterValues?.regionals || []}
            onChange={(selected) => handleFilterChange('regionals', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          /> <SelectMultiFilter
            label="Thành phố lớn"
            placeholder="Chọn TP lớn"
            options={ALL_KEY_CITIES}
            value={filterValues?.keyCities || []}
            onChange={(selected) => handleFilterChange('keyCities', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          />
          <SelectMultiFilter
            label="Tỉnh/TP"
            placeholder="Chọn Tỉnh/TP"
            options={ALL_PROVINCES}
            value={filterValues?.provinces || []}
            onChange={(selected) => handleFilterChange('provinces', selected)}
            marginBottom="mb-4 max-lg:mb-3 max-md:mb-2"
            horizontalFixed={horizontalFixed}
          /></>)}

          <div className={`flex justify-center items-center transition-all duration-700 bg-background-light ${!horizontalFixed ? `dark:bg-background-dark fixed bottom-0 left-0 w-[16%] max-md:w-[65%] border-r border-background-line-gray dark:border-background-white-15 ${!stateGlobals.isOpen || stateGlobals.horizontal ? '-translate-x-full' : ''} shadow-2xl shadow-color-black-50 dark:shadow-color-white-90 py-3 max-lg:py-2.5 max-lg:gap-2 gap-4` : 'gap-1 dark:bg-background-chart-dark max-md:justify-start max-md:col-span-2'}`}>
            <ButtonFilter text={'Áp dụng bộ lọc'} background={'bg-background-primary'} color={'text-background-check-box'} type={'submit'} />
            <ButtonFilter text={'Đặt lại'} background={'bg-background-light dark:bg-transparent'} color={'text-background-black-90 dark:text-color-white-50'} type={'reset'} src={!stateGlobals.darkMode ? iconReset : iconResetDark} alt={'Icon Reset'} width={'w-3 max-lg:w-2.75 max-md:w-2.5'} />
          </div>
        </form>
      </div>
    </aside>
    </>
  );
};

export default FilterSpot;
