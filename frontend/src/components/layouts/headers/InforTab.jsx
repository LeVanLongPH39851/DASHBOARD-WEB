import iconCalendar from '../../../assets/icon_calendar.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';
import { useDashboardFilters, useDashboardStateGlobals } from '../../../context/DashboardFilterContext';
import { getYesterday, formatDate } from '../../../helpers/helper';

const InforTab = ({ inforTab }) => {

  const { appliedFilters, setAppliedFilters } = useDashboardFilters();
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

  return (
    <section id='inforTabSticky' className={`px-6 py-3 flex gap-2.5 h-12 items-center sticky top-34 bg-background-dashboard ${!stateGlobals.isInfor ? 'border-b border-border-black-10' : ''}`} style={{zIndex: 200}}>
        <span className='text-color-black-100 font-semibold text-sm'>{inforTab}</span>
        <div className='w-px h-5 rounded-full bg-background-line-gray'></div>
        <div className='flex items-center gap-1'>
            <figure><img src={iconCalendar} className='w-3.75' alt="Icon Calendar" /></figure>
            <span className='text-color-black-100 font-semibold text-sm'>Dữ liệu ngày {formatDate(appliedFilters?.startDate || getYesterday())} - {formatDate(appliedFilters?.endDate || getYesterday())}</span>
            <figure><img src={iconArrowDown} className='w-2.25' alt="Icon Arrow Down" /></figure>
        </div>
        <div className='w-px h-5 rounded-full bg-background-line-gray'></div>
        <span className='text-color-black-50 font-semibold text-sm'>Ngày xử lý {formatDate(getYesterday())} 09:00</span>
        <div className='flex-1 flex justify-end pr-1'><figure className='p-1 cursor-pointer' onClick={() => setStateGlobals(prev => ({...prev, isInfor: !prev.isInfor}))}><img src={iconArrowDown} className={`w-2.25 ${stateGlobals.isInfor ? 'rotate-180' : ''} transition-all duration-300`} alt="Icon Arrow Down" /></figure></div>
        <span id='exportTime' className='absolute top-1/2 -translate-y-1/2 right-20 text-color-error font-semibold text-sm'></span>
    </section>
  );
};

export default InforTab;