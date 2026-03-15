import iconCalendar from '../../../assets/icon_calendar.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';

const InforTab = ({ inforTab, isOpen , setIsOpen}) => {
  return (
    <section className={`px-6 py-3 flex gap-2.5 h-12 items-center sticky top-34 bg-background-dashboard ${!isOpen.isInfor ? 'border-b border-border-black-10' : ''}`} style={{zIndex: 200}}>
        <span className='text-color-black-100 font-semibold text-sm'>{inforTab}</span>
        <div className='w-px h-5 rounded-full bg-background-line-gray'></div>
        <div className='flex items-center gap-1'>
            <figure><img src={iconCalendar} className='w-3.75' alt="Icon Calendar" /></figure>
            <span className='text-color-black-100 font-semibold text-sm'>Dữ liệu ngày 27/01/2026 - 27/01/2026</span>
            <figure><img src={iconArrowDown} className='w-2.25' alt="Icon Arrow Down" /></figure>
        </div>
        <div className='w-px h-5 rounded-full bg-background-line-gray'></div>
        <span className='text-color-black-50 font-semibold text-sm'>Ngày xử lý 30/01/2026 05:11</span>
        <div className='flex-1 flex justify-end pr-1 cursor-pointer'><figure className='p-1' onClick={() => setIsOpen(prev => ({...prev, isInfor: !prev.isInfor}))}><img src={iconArrowDown} className={`w-2.25 ${isOpen.isInfor ? 'rotate-180' : ''} transition-all duration-300`} alt="Icon Arrow Down" /></figure></div>
    </section>
  );
};

export default InforTab;