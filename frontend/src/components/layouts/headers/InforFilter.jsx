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

const clearSetAll = (setChannels, setEvents, setProvinces) => {
  setChannels([]);
  setEvents([]);
  setProvinces([]);
  const element = document.getElementsByClassName('filter-item');
  if (element){
    Array.from(element).forEach(el => el.style.display = 'none');
  }
}

const InforFilter = ({ inforFilter, setInforFilter, filters, channels, events, provinces, setChannels, setEvents, setProvinces, currentTab, isOpen, setIsOpen }) => {
  const yesterday = getYesterday();
  
  return (
    <section className='mx-6 bg-background-dashboard sticky top-46 rounded-b-2xl' style={{zIndex: 100}}>
      <div className={`px-6 py-4 bg-background-light border border-border-black-10 rounded-2xl ${!isOpen.isInfor ? 'hidden' : ''}`}>
        <div className='flex gap-2 mb-2.5'>
          <Button background={'bg-color-black-100'} color={'text-color-white-90'} src={iconArrowLeftLine} rotate={`${isOpen.isOpen ? (!isOpen.horizontal ? '' : 'rotate-90') : (!isOpen.horizontal ? 'rotate-180' : 'rotate-270')} transition-all duration-300`}
                  heightImage={'h-2.5'} alt='Icon Arrow Down Line' text={`Bộ lọc (${Object.entries(inforFilter || {}).filter(([, values]) => Array.isArray(values) && values.length > 0).length + 1 || 1})`} click={() => setIsOpen(prev => ({...prev, isOpen: !prev.isOpen}))} />
          <Button background={'bg-background-black-4'} color={''} src={isOpen.horizontal ? iconNavUp : iconNavLeft}
                  widthImage='w-3' heightImage='h-3' alt='Icon Arrow Nav Left' text={''}
                  src2={iconArrowDown} widthImage2='w-2' alt2='Icon Arrow Down' rotate2={`${isOpen.horizontal ? '-rotate-90' : ''} transition-all duration-300`} click={() => setIsOpen(prev => ({...prev, horizontal: !prev.horizontal}))} />
        </div>
        <div className={`w-full transition-all duration-300 relative ${isOpen.horizontal && isOpen.isOpen ? 'min-h-9.5 mb-2.5' : 'min-h-0'}`}>
            <div className={`w-full absolute left-0 transition-all duration-300 ${isOpen.horizontal && isOpen.isOpen ? 'visible opacity-100 top-0' : 'invisible opacity-0 -top-1/2'}`}>
              <Filter isOpen={isOpen} setIsOpen={setIsOpen} currentTab={currentTab}
                filters={filters} appliedFilters={inforFilter} setAppliedFilters={setInforFilter}
                channels={channels} setChannels={setChannels} events={events} setEvents={setEvents}
                provinces={provinces} setProvinces={setProvinces} horizontal={true} />
            </div>
        </div>
        <div className='flex gap-4 items-center'>
          <ul className='flex gap-2 items-center flex-wrap'>
            <InforFilterItem keyFilter={'Ngày'} nameFilter={'Ngày'} valueFilters={[inforFilter?.startDate || yesterday, inforFilter?.endDate || yesterday]} space={' - '} />
            {inforFilter && (
              Object.entries(inforFilter).filter(([, values]) => Array.isArray(values) && values.length > 0)
                .map(([key, values]) => (
                <InforFilterItem
                  keyFilter={key}
                  nameFilter={FILTER_LABEL[key] || key}
                  valueFilters={values}
                  space={', '}
                  setChannels={setChannels}
                  setEvents={setEvents}
                  setProvinces={setProvinces}
                />
              ))
            )}
          </ul>
          <span onClick={() => clearSetAll(setChannels, setEvents, setProvinces)} className='text-sm font-medium text-color-black-50 underline cursor-pointer'>Xóa toàn bộ</span>
        </div>
      </div>
    </section>
  );
};

export default InforFilter;