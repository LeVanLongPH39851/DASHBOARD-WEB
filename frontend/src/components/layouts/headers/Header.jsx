import logoVTVRatings from '../../../assets/logo_vtvratings.png';
import logoVTVRatingsDark from '../../../assets/logo_vtvratings_dark.png';
import iconLanguge from '../../../assets/icon_language.png';
import iconArrowDown from '../../../assets/icon_arrow_down.png';
import iconArrowDownDark from '../../../assets/icon_arrow_down_dark.png';
import iconDarkMode from '../../../assets/icon_dark_mode.png';
import iconDarkModeDark from '../../../assets/icon_dark_mode_dark.png';
import iconLanguageDark from '../../../assets/icon_language_dark.png';
import imageUser from '../../../assets/image_user.png';
import { useEffect, useState, useRef } from 'react';
import { useDashboardStateGlobals } from '../../../context/DashboardFilterContext';
import Button from './Button';
import { CUSTOM_CHART } from '../../../utils/customChart';
import iconUserInfor from '../../../assets/icon_user_infor.png';
import iconUserInforDark from '../../../assets/icon_user_infor_dark.png';
import iconLogout from '../../../assets/icon_logout.png';

const Header = () => {
    
    const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
            buttonRef.current && !buttonRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ ESC key close
    useEffect(() => {
        const handleEsc = (event) => {
        if (event.key === 'Escape') {
            setIsDropdownOpen(false);
        }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const handleToggle = () => {
        setIsDropdownOpen(prev => !prev);
    };

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
            const isMobile = window.innerWidth < 1025;
            setStateGlobals(prev => ({ ...prev, isOpen: !isMobile, screen_md: isMobile }));
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

    const handleLogout = () => {
        window.location.href = CUSTOM_CHART.domain + '/logout/';
    };

    const now = new Date();

    const time = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
    });

    const date = now.toLocaleDateString('vi-VN', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
    });
        
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
            <div className='relative z-500 max-md:hidden'>
                <div ref={buttonRef} className='flex items-center gap-2 cursor-pointer' onClick={handleToggle}>
                    <figure>
                        <img src={imageUser} className='w-10 h-10' alt="Image User" />
                    </figure>
                    <div className='flex flex-col justify-between'>
                        <span className='text-[16px] font-medium text-color-gray-800 dark:text-color-white-90 transition-all duration-300'>{time}</span>
                        <span className='text-xs font-medium text-color-gray-600 dark:text-color-white-50 transition-all duration-300'>{date}</span>
                    </div>
                    <figure><img src={!stateGlobals.darkMode ? iconArrowDown : iconArrowDownDark} className={`w-2.25 transition-all duration-300 ${!isDropdownOpen ? '' : 'rotate-180'}`} alt="Icon Arrow Down" /></figure>
                </div>
                <div ref={dropdownRef} className={`${isDropdownOpen ? 'scale-100 opacity-100 origin-top' : 'scale-0 opacity-0 origin-top'} transition-all duration-300 absolute top-full left-0 bg-background-light dark:bg-background-dark flex flex-col border border-border-black-10 dark:border-background-white-15 rounded-xl w-full overflow-hidden`}>
                        <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                            <Button background={'bg-transparent'} color={'text-color-black-100 dark:text-color-white-80'} src={!stateGlobals.darkMode ? iconUserInfor : iconUserInforDark}
                                        widthImage='w-4.5 max-md:w-4' alt='Icon User' text={'vtvguest'} />
                        </div>
                        <div className='hover:bg-background-black-4 dark:hover:bg-color-black-70 transition-all duration-300'>
                            <Button background={'bg-transparent'} color={'text-color-error'} src={iconLogout}
                                        widthImage='w-4.5 max-md:w-4' alt='Icon Logout' text={'Đăng xuất'} click={handleLogout} />
                        </div>
                </div>
            </div>
        </div>
    </header>
  );
};

export default Header;