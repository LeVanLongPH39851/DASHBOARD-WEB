import { useState, useEffect } from 'react';
import iconArrowLeftLine from '../../../assets/icon_arrow_left_line.png';
import iconArrowLefLineDark from '../../../assets/icon_arrow_left_line_dark.png';
import iconArrowRightLine from '../../../assets/icon_arrow_right_line.png';
import iconArrowDownLine from '../../../assets/icon_arrow_down_line.png';
import iconArrowUpLine from '../../../assets/icon_arrow_up_line.png';
import iconNavLeft from '../../../assets/icon_nav_left.png';
import iconNavLeftDark from '../../../assets/icon_nav_left_dark.png';
import iconNavUpDark from '../../../assets/icon_nav_up_dark.png';
import iconNavUp from '../../../assets/icon_nav_up.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';
import iconArrowDownDark from '../../../assets/icon_arrow_down_dark.png';
import Button from './Button';
import InforFilterItem from './InforFilterItem';
import { getYesterday, getDayBeforeYesterday } from '../../../helpers/helper';
import { FILTER_LABEL } from '../../../utils/label';
import Filter from '../filters/Filter';
import { formatDate } from '../../../helpers/helper';
import { useDashboardFilters, useDashboardFilterValues, useDashboardStateGlobals } from '../../../context/DashboardFilterContext';

const clearSetAll = (setFilterValues, setAppliedFilters) => {
  setFilterValues(null);
  setAppliedFilters(null);
}

const InforFilter = ({ filters, FilterComponent = Filter, nameFilter = 'FilterRating' }) => {

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { filterValues, setFilterValues } = useDashboardFilterValues();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  
  const yesterday = getYesterday();
  const beforeYesterday = getDayBeforeYesterday();

  useEffect(() => {
    const pairs = [
      {
        relative: document.getElementById('filterHorizontalRelative'),
        absolute: document.getElementById('filterHorizontal'),
        initialHeight: 'zero', // 'zero' | 'match'
      },
      {
        relative: document.getElementById('inforFilterRelative'),
        absolute: document.getElementById('inforFilter'),
        initialHeight: 'match', // 'zero' | 'match'
      },
    ];

    const observers = pairs
      .filter(({ relative, absolute }) => relative && absolute)
      .map(({ relative, absolute, initialHeight }) => {
        const updateHeight = () => {
          const isVisible = absolute.classList.contains('visible')
                        && absolute.classList.contains('opacity-100')
                        && absolute.classList.contains('top-0');

          relative.style.height = isVisible ? `${absolute.offsetHeight}px` : '0px';
        };

        // Set height ban đầu theo option
        if (initialHeight === 'match') {
          relative.style.height = `${absolute.offsetHeight}px`;
        } else {
          relative.style.height = '0px';
        }

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(absolute);

        const mutationObserver = new MutationObserver(updateHeight);
        mutationObserver.observe(absolute, { attributeFilter: ['class'] });

        return { resizeObserver, mutationObserver };
      });

    return () => observers.forEach(({ resizeObserver, mutationObserver }) => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    });
  }, []);
  
  return (
    <section id='inforFilterSticky' className='mx-6 max-lg:mx-5 max-md:mx-4 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300 sticky top-41.25 max-lg:top-[137.56px] max-md:top-22.25 rounded-b-2xl' style={{zIndex: 100}}>
      <div id='inforFilterRelative' className='transition-all duration-300 w-full'>
        <div id='inforFilter' className={`px-6 max-lg:px-5 max-md:px-4 py-4 max-lg:py-3 max-md:py-2.5 bg-background-light dark:bg-background-chart-dark w-full border transition-all duration-300 absolute left-0 border-border-black-10 dark:border-background-white-15 rounded-2xl ${stateGlobals.isInfor ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
          <div className='flex gap-2 mb-2.5 max-lg:mb-2 max-md:mb-1.5'>
            <Button background={'bg-background-primary-2'} color={'text-background-check-box'} src={iconArrowLefLineDark} rotate={`${stateGlobals.isOpen ? (!stateGlobals.horizontal ? '' : 'rotate-90') : (!stateGlobals.horizontal ? 'rotate-180' : 'rotate-270')} transition-all duration-300`}
                    heightImage={'h-2.5 max-lg:h-2.25 max-md:h-2'} alt='Icon Arrow Down Line' text={`Bộ lọc (${Object.entries(appliedFilters || {}).filter(([, values]) => Array.isArray(values) && values.length > 0).length + 1 || 1})`} click={() => setStateGlobals(prev => ({...prev, isOpen: !prev.isOpen}))} />
            <Button background={'bg-background-black-4 dark:bg-background-white-15'} color={''} src={stateGlobals.horizontal ? (!stateGlobals.darkMode ? iconNavUp : iconNavUpDark) : (!stateGlobals.darkMode ? iconNavLeft : iconNavLeftDark)}
                    widthImage='w-3 max-lg:w-2.75 max-md:w-2.5' heightImage='h-3 max-lg:h-2.75 max-md:h-2.5' alt='Icon Arrow Nav Left' text={''}
                    src2={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} widthImage2='w-2 max-lg:w-1.75 max-md:w-1.5' alt2='Icon Arrow Down' rotate2={`${stateGlobals.horizontal ? '-rotate-90' : ''} transition-all duration-300`} click={() => setStateGlobals(prev => ({...prev, horizontal: !prev.horizontal}))} />
          </div>
          <div id='filterHorizontalRelative' className={`w-full overflow-hidden transition-all duration-300 relative ${stateGlobals.horizontal && stateGlobals.isOpen ? 'mb-2.5 max-lg:mb-2 max-md:mb-1.5' : ''}`}>
              <div id='filterHorizontal' className={`w-full absolute left-0 transition-all duration-300 ${stateGlobals.horizontal && stateGlobals.isOpen ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
                {stateGlobals.horizontal && <FilterComponent
                  filters={filters} horizontalFixed={true} />}
              </div>
          </div>
          <div className='flex gap-4 max-lg:gap-3 max-md:gap-2 items-center flex-wrap'>
            <ul className='flex gap-2 items-center flex-wrap'>
              <InforFilterItem keyFilter={'Ngày'} nameFilter={'Ngày'} valueFilters={[formatDate(appliedFilters?.startDate || (nameFilter == 'FilterRating' ? yesterday : beforeYesterday)), formatDate(appliedFilters?.endDate || yesterday)]} space={' - '} />
              {appliedFilters && (
                Object.entries(appliedFilters).filter(([, values]) => Array.isArray(values) && values.length > 0)
                  .map(([key, values]) => (
                  <InforFilterItem
                    key={key}
                    keyFilter={key}
                    nameFilter={FILTER_LABEL[key] || key}
                    valueFilters={values}
                    space={', '}
                  />
                ))
              )}
            </ul>
            {Object.entries(appliedFilters || {}).filter(([, values]) => Array.isArray(values) && values.length > 0).length > 0 &&
              <span id='clearAll' onClick={() => clearSetAll(setFilterValues, setAppliedFilters)} className='text-sm max-lg:text-[13px] max-md:text-xs font-normal text-color-black-50 dark:text-color-white-50 transition-all duration-300 underline cursor-pointer'>Xóa toàn bộ</span>
            }
          </div>
        </div>
      </div>
    </section>
  );
};

export default InforFilter;