// src/components/filters/SelectMultiFilter.jsx
import React from 'react';
import Select from 'react-select';
import { useState } from 'react';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';
import iconArrowUpGrayDark from '../../../../assets/icon_arrow_up_gray_dark.png';
import { useDashboardStateGlobals } from '../../../../context/DashboardFilterContext';

const SelectMultiFilter = ({
  options = [],
  value = [],
  onChange,
  label,
  placeholder,
  disabled = false,
  marginBottom,
  horizontalFixed=false
}) => {
  
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

   const darkMode = stateGlobals.darkMode;
   const isMobile = window.innerWidth < 1000;

    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        minHeight: !horizontalFixed ? (!isMobile ? '40px' : '30px') : (!isMobile ? '38px' : '30px'),
        fontSize: !isMobile ? '13px' : '11px',
        borderRadius: '12px',
        outline: 'none',
        boxShadow: 'none',
        border: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(225, 227, 234, 1)',
        backgroundColor: darkMode 
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 1)',
        transition: 'all 0.3s ease-in-out',
        color: darkMode ? 'rgba(249, 250, 251, 1)' : 'rgba(28, 28, 28, 1)',
        ':hover': {
          border: darkMode 
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(225, 227, 234, 1)'
        },
        padding: '0px 8px 0px 2px'
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'rgba(28, 28, 28, 1)'
      }),
      multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#20A7C9',
        border: `1px solid #20A7C9`,
        borderRadius: '6px',
        cursor: 'pointer'
      }),
      multiValueLabel: (provided) => ({
        ...provided,
        color: 'rgba(255, 255, 255, 1)'
      }),
      multiValueRemove: (provided) => ({
        ...provided,
        color: 'rgba(255, 255, 255, 1)',
        borderRadius: '6px',
        ':hover': {
          backgroundColor: '#1a8fb3',
          color: 'rgba(255, 255, 255, 1)',
        }
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: darkMode 
          ? 'rgba(17, 23, 37, 1)'
          : 'rgba(255, 255, 255, 1)',
        border: darkMode 
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(255, 255, 255, 1)',
        marginTop: '4px'
      }),
      option: (provided, state) => {
        const baseBg = darkMode ? 'rgba(17, 23, 37, 1)' : 'rgba(255, 255, 255, 1)';
        const hoverBg = darkMode ? 'rgba(31, 41, 55, 1)' : '#e0e0e0';
        return {
          ...provided,
          fontSize: !isMobile ? '14px' : '12px',
          fontWeight: 500,
          backgroundColor: state.isSelected
            ? '#20A7C9'
            : state.isFocused
            ? hoverBg
            : baseBg,
          color: state.isSelected
            ? 'rgba(255, 255, 255, 1)'
            : darkMode
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(28, 28, 28, 1)'
        };
      },
      placeholder: (provided) => ({
        ...provided,
        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        fontSize: !isMobile ? '14px' : '11.9px',
        fontWeight: 500
      }),
      input: (provided) => ({
        ...provided,
        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        fontSize: !isMobile ? '14px' : '12px',
        fontWeight: 500,
        cursor: 'text',
        transition: 'all 0.3s ease-in-out'
      }),
      dropdownIndicator: (provided) => ({
        ...provided,
        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        ':hover': {
          color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
        },
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer',
        padding: '0px 8px 0px 8px'
      }),
      clearIndicator: (provided, state) => ({
        ...provided,
        color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        ':hover': {
          color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
        },
        transition: 'all 0.3s ease-in-out',
        cursor: 'pointer'
      }),
    };

  const [isOpenFilter, setIsOpenFilter] = useState(true);

  return (
    <div className={`${horizontalFixed ? '' : isOpenFilter ? `${marginBottom}` : ''}`}>
      {!horizontalFixed && (<div onClick={() => setIsOpenFilter(prev => !prev)} className={`flex cursor-pointer group justify-between items-center h-10.5 max-md:h-8 ${isOpenFilter ? 'mb-1' : ''}`}>
                        <label className='cursor-pointer text-[16px] max-md:text-xs text-background-black-child-tab dark:text-color-white-90 transition-all duration-300 font-semibold'>{label}</label>
                        <figure className={`cursor-pointer ${isOpenFilter ? '' : 'rotate-180'}`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2.75 max-md:w-2' alt="Icon Arrow Up Gray" /></figure>
                      </div>)}
      <div className={!horizontalFixed ? 'transition-all duration-300 relative filter-relative overflow-hidden' : ''} data-initial-height="match">
        <div className={!horizontalFixed ? `transition-all duration-300 absolute w-full left-0 filter-absolute ${isOpenFilter ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}` : ''}>
          <Select
            isMulti
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isDisabled={disabled}
            styles={customStyles}
            classNamePrefix="react-select"
            noOptionsMessage={() => "Không có dữ liệu"}
            closeMenuOnSelect={false}
            menuPlacement="auto"
            menuPosition="fixed"
            escapeClearsValue={false}
            openMenuOnFocus={true}
            openMenuOnClick={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectMultiFilter;
