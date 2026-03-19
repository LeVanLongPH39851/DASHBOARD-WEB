import { useState, useEffect } from 'react';
import iconArrowLeftLine from '../../../assets/icon_arrow_left_line.png';
import iconArrowRightLine from '../../../assets/icon_arrow_right_line.png';
import iconArrowDownLine from '../../../assets/icon_arrow_down_line.png';
import iconArrowUpLine from '../../../assets/icon_arrow_up_line.png';
import iconNavLeft from '../../../assets/icon_nav_left.png';
import iconNavUp from '../../../assets/icon_nav_up.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';
import Button from './Button';
import InforFilterItem from './InforFilterItem';
import { getYesterday } from '../../../helpers/helper';
import { FILTER_LABEL } from '../../../utils/label';
import Filter from '../filters/Filter';
import { useDashboardFilters, useDashboardFilterValues, useDashboardStateGlobals } from '../../../context/DashboardFilterContext';

const clearSetAll = (setFilterValues) => {
  setFilterValues(prev => ({...prev, channels: [], events: [], provinces: [], regionals: [], keyCities: [], timebanbs: [], firstLevels: []}))
  const element = document.getElementsByClassName('filter-item');
  if (element){
    Array.from(element).forEach(el => el.style.display = 'none');
  }
}

const InforFilter = ({ filters }) => {

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { filterValues, setFilterValues } = useDashboardFilterValues();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  
  const yesterday = getYesterday();

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
    <section id='inforFilterSticky' className='mx-6 bg-background-dashboard sticky top-46 rounded-b-2xl' style={{zIndex: 100}}>
      <div id='inforFilterRelative' className='transition-all duration-300 w-full'>
        <div id='inforFilter' className={`px-6 py-4 bg-background-light w-full border transition-all duration-300 absolute left-0 border-border-black-10 rounded-2xl ${stateGlobals.isInfor ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
          <div className='flex gap-2 mb-2.5'>
            <Button background={'bg-color-black-100'} color={'text-color-white-90'} src={iconArrowLeftLine} rotate={`${stateGlobals.isOpen ? (!stateGlobals.horizontal ? '' : 'rotate-90') : (!stateGlobals.horizontal ? 'rotate-180' : 'rotate-270')} transition-all duration-300`}
                    heightImage={'h-2.5'} alt='Icon Arrow Down Line' text={`Bộ lọc (${Object.entries(appliedFilters || {}).filter(([, values]) => Array.isArray(values) && values.length > 0).length + 1 || 1})`} click={() => setStateGlobals(prev => ({...prev, isOpen: !prev.isOpen}))} />
            <Button background={'bg-background-black-4'} color={''} src={stateGlobals.horizontal ? iconNavUp : iconNavLeft}
                    widthImage='w-3' heightImage='h-3' alt='Icon Arrow Nav Left' text={''}
                    src2={iconArrowDown} widthImage2='w-2' alt2='Icon Arrow Down' rotate2={`${stateGlobals.horizontal ? '-rotate-90' : ''} transition-all duration-300`} click={() => setStateGlobals(prev => ({...prev, horizontal: !prev.horizontal}))} />
          </div>
          <div id='filterHorizontalRelative' className={`w-full transition-all duration-300 relative ${stateGlobals.horizontal && stateGlobals.isOpen ? 'mb-2.5' : ''}`}>
              <div id='filterHorizontal' className={`w-full absolute left-0 transition-all duration-300 ${stateGlobals.horizontal && stateGlobals.isOpen ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
                {stateGlobals.horizontal && <Filter
                  filters={filters} horizontalFixed={true} />}
              </div>
          </div>
          <div className='flex gap-4 items-center'>
            <ul className='flex gap-2 items-center flex-wrap'>
              <InforFilterItem keyFilter={'Ngày'} nameFilter={'Ngày'} valueFilters={[appliedFilters?.startDate || yesterday, appliedFilters?.endDate || yesterday]} space={' - '} />
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
            <span onClick={() => clearSetAll(setFilterValues)} className='text-sm font-medium text-color-black-50 underline cursor-pointer'>Xóa toàn bộ</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InforFilter;