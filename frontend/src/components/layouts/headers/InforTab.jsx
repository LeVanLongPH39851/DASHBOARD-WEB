import iconCalendar from '../../../assets/icon_calendar.png';
import iconCalendarDark from '../../../assets/icon_calendar_dark.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';
import iconArrowDownDark from '../../../assets/icon_arrow_down_dark.png';
import { useDashboardFilters, useDashboardStateGlobals } from '../../../context/DashboardFilterContext';
import { getYesterday, formatDate } from '../../../helpers/helper';

const InforTab = ({ inforTab }) => {

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  return (
    <section id='inforTabSticky' className={`px-6 max-lg:px-5 max-md:px-4 py-3 flex gap-2.5 max-lg:gap-2 h-12 max-lg:h-11 max-md:h-10 items-center sticky top-34 max-lg:top-[111.93px] max-md:top-18 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300 border-b ${!stateGlobals.isInfor ? ' border-border-black-10 dark:border-background-white-15' : 'border-transparent'}`} style={{zIndex: 200}}>
        <span className='text-color-black-100 dark:text-color-white-80 transition-all duration-300 font-normal text-sm max-lg:text-[13px] max-md:text-xs text-nowrap'>{inforTab}</span>
        <div className='w-px h-5 rounded-full bg-background-line-gray'></div>
        <div className='flex items-center gap-1 max-md:hidden'>
            <figure><img src={!stateGlobals.darkMode ? iconCalendar : iconCalendarDark} className='w-3.75 max-lg:w-3.5' alt="Icon Calendar" /></figure>
            <span className='text-color-black-100 dark:text-color-white-80 transition-all duration-300 font-normal text-sm max-lg:text-[13px]'>Dữ liệu đến ngày {formatDate(getYesterday())}</span>
        </div>
        <div className='w-px h-5 rounded-full bg-background-line-gray max-md:hidden'></div>
        <span className='text-color-black-50 font-normal text-sm max-lg:text-[13px] dark:text-color-white-50 transition-all duration-300 max-md:text-xs text-nowrap max-md:hidden'>Ngày xử lý {formatDate(new Date())} 09:00</span>
        <span className='text-color-black-50 font-normal text-sm dark:text-color-white-50 transition-all duration-300 max-md:text-xs text-nowrap hidden max-md:inline'>{formatDate(new Date())} 09:00</span>
        <div className='flex-1 flex justify-end pr-1'><figure className='p-1 cursor-pointer' onClick={() => setStateGlobals(prev => ({...prev, isInfor: !prev.isInfor}))}><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} className={`w-2.25 max-md:w-2 ${stateGlobals.isInfor ? 'rotate-180' : ''} transition-all duration-300`} alt="Icon Arrow Down" /></figure></div>
        <span id='exportTime' className='absolute top-1/2 -translate-y-1/2 right-20 text-color-error font-semibold text-sm max-lg:text-[13px] max-md:hidden'></span>
    </section>
  );
};

export default InforTab;