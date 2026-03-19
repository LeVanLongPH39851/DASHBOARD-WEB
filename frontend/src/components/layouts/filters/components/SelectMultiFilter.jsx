// src/components/filters/SelectMultiFilter.jsx
import React from 'react';
import Select from 'react-select';
import { useState } from 'react';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';

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

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '38px',
      minWidth: '200px',
      maxWidth: '350px',
      fontSize: '13px',
      borderRadius: '12px',
      outline: 'none',
      boxShadow: 'none',
      border: '1px solid rgba(225, 227, 234, 1)',
      ':hover': {
        border: '1px solid rgba(225, 227, 234, 1)'
      },
      padding: horizontalFixed ? '0px 8px 0px 2px' : '1px 8px 1px 2px'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 1)',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#20A7C9',
      border: '1px solid #20A7C9',
      borderRadius: '6px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 1)',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 1)',
      borderRadius: '6px',
      ':hover': {
        backgroundColor: '#1a8fb3',
        color: 'rgba(255, 255, 255, 1)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      border: '1px solid rgba(255, 255, 255, 1)',
      marginTop: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '14px',
      fontWeight: 500,
      backgroundColor: state.isSelected 
        ? '#20A7C9' 
        : state.isFocused 
        ? '#e0e0e0' 
        : 'rgba(255, 255, 255, 1)',
      color: state.isSelected ? 'rgba(255, 255, 255, 1)' : 'rgba(28, 28, 28, 1)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(0, 0, 0, 0.5)',
      fontSize: '14px',
      fontWeight: 500
    }),
    input: (provided) => ({
      ...provided,
      color: 'rgba(0, 0, 0, 0.5)',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'text'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'rgba(0, 0, 0, 0.5)'
    }),
  };

  const [isOpenFilter, setIsOpenFilter] = useState(true);

  return (
    <div className={`${horizontalFixed ? '' : isOpenFilter ? `${marginBottom}` : ''}`}>
      {!horizontalFixed && (<div className={`flex justify-between items-center h-10.5 ${isOpenFilter ? 'mb-1' : ''}`}>
                        <label className='text-[16px] text-background-black-child-tab font-medium'>{label}</label>
                        <figure onClick={() => setIsOpenFilter(prev => !prev)} className={`cursor-pointer ${isOpenFilter ? '' : 'rotate-180'}`}><img src={iconArrowUpGray} className='w-2.75' alt="Icon Arrow Up Gray" /></figure>
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
