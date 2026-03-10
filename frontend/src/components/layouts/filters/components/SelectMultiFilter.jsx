// src/components/filters/SelectMultiFilter.jsx
import React from 'react';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '36px',
    fontSize: '13px',
    borderRadius: '4px',
    outline: 'none',
    boxShadow: 'none'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#20A7C9',
    border: '1px solid #20A7C9',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'white',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'white',
    ':hover': {
      backgroundColor: '#1a8fb3',
      color: 'white',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'white',
    border: '1px solid white',
    marginTop: '4px',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',
    backgroundColor: state.isSelected 
      ? '#20A7C9' 
      : state.isFocused 
      ? '#e0e0e0' 
      : 'white',
    color: state.isSelected ? 'white' : '#333',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#aaa',
    fontSize: '13px',
  }),
  input: (provided) => ({
    ...provided,
    color: '#333',
    fontSize: '13px',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#ccc',
  }),
};

const SelectMultiFilter = ({
  options = [],
  value = [],
  onChange,
  label,
  placeholder,
  disabled = false,
  marginBottom,
  horizontal=false
}) => {
  
  return (
    <div className={`${!horizontal ? `p-4 bg-[#1a1a1a] border border-[#404040] rounded-md ${marginBottom}` : ''}`}>
      {!horizontal && (<label className='text-sm text-white mb-2 block font-bold'>{label}</label>)}
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
  );
};

export default SelectMultiFilter;
