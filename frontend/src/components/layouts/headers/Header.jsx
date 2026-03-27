import logoVTVRatings from '../../../assets/logo_vtvratings.png';
import logoVTVRatingsDark from '../../../assets/logo_vtvratings_dark.png';
import iconLanguge from '../../../assets/icon_language.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';
import iconArrowDownDark from '../../../assets/icon_arrow_down_dark.png';
import iconDarkMode from '../../../assets/icon_dark_mode.png';
import iconDarkModeDark from '../../../assets/icon_dark_mode_dark.png';
import iconLanguageDark from '../../../assets/icon_language_dark.png';
import imageUser from '../../../assets/image_user.png';
import { useEffect } from 'react';
import { useDashboardStateGlobals } from '../../../context/DashboardFilterContext';
import { CUSTOM_CHART } from '../../../utils/customChart';

const Header = () => {

    const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme && savedTheme === 'dark') {
            setStateGlobals(prev => ({...prev, darkMode: true}));
            document.documentElement.classList.add('dark');
        } else {
            setStateGlobals(prev => ({...prev, darkMode: false}));
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        let timeoutId;
        
        const checkMobile = () => {
            // ✅ Cancel timeout cũ
            clearTimeout(timeoutId);
            
            // ✅ Debounce manual 150ms
            timeoutId = setTimeout(() => {
            const isMobile = window.innerWidth < 1000;
            setStateGlobals(prev => ({ ...prev, screen_md: isMobile }));
            }, 150);
        };

        // ✅ Initial check ngay lập tức
        checkMobile();
        
        // ✅ Listen resize
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            clearTimeout(timeoutId); // ✅ Cleanup timeout
        };
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !stateGlobals.darkMode;
        setStateGlobals(prev => ({...prev, darkMode: newDarkMode}));

        
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

  return (
    <header className="h-15 max-md:h-10 bg-background-light dark:bg-background-dark transition-all duration-300 px-6 max-md:px-4 py-px flex justify-between items-center border-b border-border-black-10 dark:border-background-white-15">
        <a href={`${CUSTOM_CHART.domain}/superset/welcome/`}>
            <figure>
                <img src={!stateGlobals.darkMode ? logoVTVRatings : logoVTVRatingsDark} className='h-14.5 max-md:h-9.5' alt="Logo VTVRatings" />
            </figure>
        </a>
        <div className='flex items-center'>
            <div className='flex items-center gap-2 max-md:gap-1'>
                <div className='flex items-center gap-2 py-2 px-4 max-md:px-2'>
                    <figure><img src={!stateGlobals.darkMode ? iconLanguge : iconLanguageDark} className='w-4 max-md:w-3 h-4 max-md:h-3' alt="Icon Language" /></figure>
                    <span className='text-[16px] max-md:text-xs font-medium text-color-black-100 dark:text-color-white-90 transition-all duration-300'>English</span>
                    <figure><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} className='w-2.25' alt="Icon Arrow Down" /></figure>
                </div>
                <figure className='p-2 max-md:pr-0 cursor-pointer' onClick={toggleDarkMode} title={stateGlobals.darkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
                    <img src={!stateGlobals.darkMode ? iconDarkMode : iconDarkModeDark} className='w-4.5 max-md:w-3.5 h-4.5 max-md:h-3.5' alt="Icon Dark Mode" />
                </figure>
            </div>
            <div className='w-px h-6 rounded-full bg-background-line-gray mx-2 max-md:hidden'></div>
            <div className='flex items-center gap-2 max-md:hidden'>
                <figure>
                    <img src={imageUser} className='w-10 h-10' alt="Image User" />
                </figure>
                <div className='flex flex-col justify-between'>
                    <span className='text-[16px] font-medium text-color-gray-800 dark:text-color-white-90 transition-all duration-300'>07:25:11 AM</span>
                    <span className='text-xs font-medium text-color-gray-600 dark:text-color-white-50 transition-all duration-300'>April 27, 2023</span>
                </div>
                <figure><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} className='w-2.25' alt="Icon Arrow Down" /></figure>
            </div>
        </div>
    </header>
  );
};

export default Header;