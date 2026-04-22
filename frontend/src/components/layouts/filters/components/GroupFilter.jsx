import React from "react";
import { useState } from 'react';
import iconArrowUpGray from '../../../../assets/icon_arrow_up_gray.png';
import iconArrowUpGrayDark from '../../../../assets/icon_arrow_up_gray_dark.png';
import { useDashboardStateGlobals } from '../../../../context/DashboardFilterContext';

const GroupFilter = ({ title, components = [] }) => {

  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  const [isOpenFilter, setIsOpenFilter] = useState(true);

  return (
    <div>
      <div onClick={() => setIsOpenFilter(prev => !prev)} className={`flex cursor-pointer group justify-between items-center h-10.5 max-lg:h-9 max-md:h-8 ${isOpenFilter ? 'mb-1' : ''}`}>
        <label className='cursor-pointer text-[16px] max-lg:text-sm max-md:text-xs text-color-p-login dark:text-color-white-50 transition-all duration-300 font-medium'>{title}</label>
        <figure className={`cursor-pointer transition-all duration-300 ${isOpenFilter ? '' : 'rotate-180'}`}><img src={!stateGlobals.darkMode ? iconArrowUpGray : iconArrowUpGrayDark} className='w-2.75 max-lg:w-2.5 max-md:w-2' alt="Icon Arrow Up Gray" /></figure>
      </div>
      <div className={`transition-all duration-400 relative filter-relative overflow-hidden`} data-initial-height="match">
          <div className={`transition-all duration-300 absolute w-full left-0 filter-absolute ${isOpenFilter ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
          {components.map((comp, index) => (
            <React.Fragment key={index}>{comp}</React.Fragment>
          ))}
          </div>
      </div>
    </div>
  );
};

export default GroupFilter;