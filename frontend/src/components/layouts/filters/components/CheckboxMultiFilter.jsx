// src/components/filters/CheckboxMultiFilter.jsx
import { useState } from 'react';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';
import iconSearch from '../../../../assets/icon_search.png';
import iconSearchDark from '../../../../assets/icon_search_dark.png';
import iconX from '../../../../assets/icon_x.png';
import iconXDark from '../../../../assets/icon_x_dark.png';
import iconArrowUpGrayDark from '../../../../assets/icon_arrow_up_gray_dark.png';
import { useDashboardStateGlobals } from '../../../../context/DashboardFilterContext';


const CheckboxMultiFilter = ({
  options = [],
  value = [],
  onChange,
  label,
  disabled = false,
  marginBottom,
  isSearch = true
}) => {

  const [search, setSearch] = useState('');

  const isChecked = (optValue) => value.some(v => v.value === optValue);

  const handleToggle = (opt) => {
    if (disabled) return;
    const newValue = isChecked(opt.value)
      ? value.filter(v => v.value !== opt.value)
      : [...value, opt];
    onChange(newValue);
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  const [isOpenFilter, setIsOpenFilter] = useState(true);

  return (
    <div className={isOpenFilter ? marginBottom : ''}>
      {/* Label */}
      <div  onClick={() => setIsOpenFilter(prev => !prev)} className={`flex cursor-pointer group justify-between items-center h-10.5 max-md:h-8 ${isOpenFilter ? 'mb-1' : ''}`}>
        <label className='cursor-pointer text-[16px] max-md:text-xs text-background-black-child-tab dark:text-color-white-90 transition-all duration-300 font-semibold'>{label}</label>
        <figure className={`cursor-pointer transition-all duration-300 ${isOpenFilter ? '' : 'rotate-180'}`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2.75 max-md:w-2' alt="Icon Arrow Up Gray" /></figure>
      </div>

      <div className={`transition-all duration-300 relative filter-relative overflow-hidden`} data-initial-height="match">
        <div className={`transition-all duration-300 absolute w-full left-0 filter-absolute ${isOpenFilter ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
            {/* Search */}
            {isSearch && (<div className='flex items-center gap-2 px-4 max-md:px-3 py-2.5 max-md:py-1.5 mb-1.5 border border-background-line-gray rounded-xl bg-background-light dark:border-background-white-15 transition-all duration-300 dark:bg-background-white-8 max-h-10'>
                <img src={!stateGlobals.darkMode ? iconSearch : iconSearchDark} className='w-3.5 h-3.5 max-md:w-3 max-md:h-3' alt="Icon Search" />
                <input
                type='text'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Tìm kiếm...'
                className='w-full text-sm max-md:text-xs outline-none text-color-black-50 font-medium placeholder:text-color-black-50 dark:text-color-white-50 dark:placeholder:text-color-white-50 bg-transparent transition-all duration-300'
                />
                {search && (
                <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='cursor-pointer'
                >
                    <figure><img src={!stateGlobals.darkMode ? iconX : iconXDark} alt="Icon X" className='w-2.5 max-md:w-2' /></figure>
                </button>
                )}
            </div>)}

            {/* Danh sách checkbox */}
            <ul className='flex flex-col gap-1'>
                {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                    <li
                    key={opt.value}
                    onClick={() => handleToggle(opt)}
                    className={`
                        flex items-center gap-2 px-3 max-md:px-2 py-1.25 max-md:py-1 rounded-xl cursor-pointer text-sm max-md:text-xs font-medium transition-all duration-300
                        ${isChecked(opt.value)
                        ? 'bg-[#e8f7fb] text-[#20A7C9]'
                        : 'text-color-check-box dark:text-color-white-90 dark:hover:bg-background-hover-dark hover:bg-background-black-4'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    >
                    <div
                        className={`
                        w-4 max-md:w-3 h-4 max-md:h-3 shrink-0 rounded-sm border-2 transition-all duration-300
                        flex items-center justify-center
                        ${isChecked(opt.value)
                            ? 'bg-[#20A7C9] border-[#20A7C9]'
                            : 'bg-background-light dark:border-background-white-15 border-border-black-20 dark:bg-background-white-15'}
                        `}
                    >
                        {isChecked(opt.value) && (
                        <svg viewBox="0 0 10 8" className="w-2.5 max-md:w-2 h-2.5 max-md:h-2" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        )}
                    </div>
                    {opt.label}
                    </li>
                ))
                ) : (
                <li className='px-3 max-md:px-2 py-2 max-md:py-1 text-sm max-md:text-xs text-[rgba(0,0,0,0.4)] dark:text-color-white-90 transition-all duration-300'>Không có dữ liệu</li>
                )}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckboxMultiFilter;
