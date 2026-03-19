// src/components/filters/CheckboxMultiFilter.jsx
import { useState } from 'react';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';
import iconSearch from '../../../../assets/icon_search.png';
import iconX from '../../../../assets/icon_x.png'


const CheckboxMultiFilter = ({
  options = [],
  value = [],
  onChange,
  label,
  disabled = false,
  marginBottom
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

  const [isOpenFilter, setIsOpenFilter] = useState(true);

  return (
    <div className={isOpenFilter ? marginBottom : ''}>
      {/* Label */}
      <div className={`flex justify-between items-center h-10.5 ${isOpenFilter ? 'mb-1' : ''}`}>
        <label className='text-[16px] text-background-black-child-tab font-medium'>{label}</label>
        <figure onClick={() => setIsOpenFilter(prev => !prev)} className={`cursor-pointer transition-all duration-300 ${isOpenFilter ? '' : 'rotate-180'}`}><img src={iconArrowUpGray} className='w-2.75' alt="Icon Arrow Up Gray" /></figure>
      </div>

      <div className={`transition-all duration-300 relative filter-relative overflow-hidden`} data-initial-height="match">
        <div className={`transition-all duration-300 absolute w-full left-0 filter-absolute ${isOpenFilter ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
            {/* Search */}
            <div className='flex items-center gap-2 px-4 py-2.5 mb-1.5 border border-background-line-gray rounded-xl bg-background-light max-h-10'>
                <img src={iconSearch} className='w-3.5 h-3.5' alt="Icon Search" />
                <input
                type='text'
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder='Tìm kiếm...'
                className='w-full text-sm outline-none text-color-black-50 font-medium placeholder:text-color-black-50 bg-transparent'
                />
                {search && (
                <button
                    type='button'
                    onClick={() => setSearch('')}
                    className='text-color-black-50 cursor-pointer'
                >
                    <figure><img src={iconX} alt="Icon X" className='w-2.5' /></figure>
                </button>
                )}
            </div>

            {/* Danh sách checkbox */}
            <ul className='flex flex-col gap-1'>
                {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                    <li
                    key={opt.value}
                    onClick={() => handleToggle(opt)}
                    className={`
                        flex items-center gap-2 px-3 py-1.25 rounded-xl cursor-pointer text-sm font-medium transition-all
                        ${isChecked(opt.value)
                        ? 'bg-[#e8f7fb] text-[#20A7C9]'
                        : 'text-color-check-box hover:bg-background-black-4'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    >
                    <div
                        className={`
                        w-4 h-4 shrink-0 rounded-sm border-2 transition-all
                        flex items-center justify-center
                        ${isChecked(opt.value)
                            ? 'bg-[#20A7C9] border-[#20A7C9]'
                            : 'bg-background-light border-border-black-20'}
                        `}
                    >
                        {isChecked(opt.value) && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        )}
                    </div>
                    {opt.label}
                    </li>

                ))
                ) : (
                <li className='px-3 py-2 text-sm text-[rgba(0,0,0,0.4)]'>Không có dữ liệu</li>
                )}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckboxMultiFilter;
