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
    <section id='inforTabSticky' className={`px-6 max-md:px-4 py-3 flex gap-2.5 h-12 max-md:h-10 items-center sticky top-34 max-md:top-18 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300 border-b ${!stateGlobals.isInfor ? ' border-border-black-10 dark:border-background-white-15' : 'border-transparent'}`} style={{zIndex: 200}}>
        <span className='text-color-black-100 dark:text-color-white-80 transition-all duration-300 font-medium text-sm max-md:text-xs text-nowrap'>{inforTab}</span>
        <div className='w-px h-5 rounded-full bg-background-line-gray'></div>
        <div className='flex items-center gap-1 max-md:hidden'>
            <figure><img src={!stateGlobals.darkMode ? iconCalendar : iconCalendarDark} className='w-3.75' alt="Icon Calendar" /></figure>
            <span className='text-color-black-100 dark:text-color-white-80 transition-all duration-300 font-medium text-sm'>Dữ liệu ngày {formatDate(appliedFilters?.startDate || getYesterday())} - {formatDate(appliedFilters?.endDate || getYesterday())}</span>
            <figure><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} className='w-2.25' alt="Icon Arrow Down" /></figure>
        </div>
        <div className='w-px h-5 rounded-full bg-background-line-gray max-md:hidden'></div>
        <span className='text-color-black-50 font-medium text-sm dark:text-color-white-50 transition-all duration-300 max-md:text-xs text-nowrap'>Ngày xử lý {formatDate(getYesterday())} 09:00</span>
        <div className='flex-1 flex justify-end pr-1'><figure className='p-1 cursor-pointer' onClick={() => setStateGlobals(prev => ({...prev, isInfor: !prev.isInfor}))}><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} className={`w-2.25 max-md:w-2 ${stateGlobals.isInfor ? 'rotate-180' : ''} transition-all duration-300`} alt="Icon Arrow Down" /></figure></div>
        <span id='exportTime' className='absolute top-1/2 -translate-y-1/2 right-20 text-color-error font-semibold text-sm max-md:hidden'></span>
    </section>
  );
};

export default InforTab;