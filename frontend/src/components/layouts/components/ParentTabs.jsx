import { useState, useEffect, useRef, useCallback } from 'react';
import { useDashboardStateGlobals } from '../../../context/DashboardFilterContext';

export default function ParentTabs({
  tabs,
  defaultTab,
  variant = 'default',
  uniqueId = 'parent-tab',
  sticky = true,
  stickyTop = 'top-22 max-lg:top-[71.93px]',
  zIndex = 'z-100',
  countTab = 'max-md:grid-cols-4',
}) {
  
  tabs = tabs.filter(Boolean);
  const { stateGlobals, setStateGlobals } = useDashboardStateGlobals();
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef([]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setStateGlobals(prev => ({...prev, currentTab: tabId}));
  };

  // Update underline sau khi DOM render
  const updateUnderlinePosition = useCallback(() => {
    requestAnimationFrame(() => {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
      const currentTab = tabsRef.current[activeIndex];
      if (currentTab) {
        setUnderlineStyle({
          left: currentTab.offsetLeft,
          width: currentTab.clientWidth
        });
      }
    });
  }, [activeTab, tabs]);

  // Effect khi activeTab thay đổi HOẶC tabs mount xong
  useEffect(() => {
    // Delay 0ms để DOM render xong
    const timeoutId = setTimeout(updateUnderlinePosition, 0);
    return () => clearTimeout(timeoutId);
  }, [updateUnderlinePosition]);

  // Resize listener
  useEffect(() => {
    window.addEventListener('resize', updateUnderlinePosition);
    return () => window.removeEventListener('resize', updateUnderlinePosition);
  }, [updateUnderlinePosition]);

  const variants = {
    default: {
      container: `relative flex border-b border-border-black-10 dark:border-transparent max-md:shadow-2xl max-md:shadow-color-black-70 max-md:dark:shadow-none max-md:border-transparent max-md:w-full transition-colors duration-300 px-6 max-lg:px-5 max-md:px-4 gap-7 max-lg:gap-6 max-md:gap-0 h-12 max-lg:h-10 max-md:h-15.5 max-md:grid ${countTab}`,
      button: (isActive) => `py-2 text-nowrap uppercase max-md:normal-case font-medium text-[16px] max-lg:text-sm max-md:text-xs transition-colors duration-300 cursor-pointer flex gap-2 max-lg:gap-1.5 max-md:flex-col max-md:justify-center items-center ${
        isActive ? 'text-color-primary-700 font-semibold' : 'text-color-black-50 dark:text-color-white-50 hover:text-gray-700 hover:text-gray-700 dark:hover:text-color-white-80'
      }`,
      underline: 'absolute -bottom-px max-md:-top-px block h-[3px] bg-color-primary-700 transition-all duration-400 ease-out rounded-full'
    },
    // ... giữ nguyên pills, bg
    pills: {
      container: 'flex gap-3 mb-6 relative',
      button: (isActive) => `px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 ${
        isActive ? 'bg-color-primary-700 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`,
      underline: ''
    },
    bg: {
      container: 'flex gap-2 mb-6 bg-gray-100 p-2 rounded-xl relative',
      button: (isActive) => `flex-1 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
        isActive ? 'bg-white text-color-primary-700 shadow-md' : 'text-gray-600 hover:text-gray-900'
      }`,
      underline: ''
    }
  };

  const currentVariant = variants[variant] || variants.default;
  const showUnderline = variant === 'default';
  const stickyClasses = sticky ? `sticky max-md:fixed max-md:left-0 max-md:bottom-0 max-md:top-auto ${zIndex} bg-background-light transition-all duration-300 dark:bg-background-dark shadow-xs` : '';

  return (
    <div>
      <div className={`${currentVariant.container} ${stickyClasses} ${stickyTop}`}>
        {tabs.map((tab, index) => (
          <button
            key={`${uniqueId}-${tab.id}`}
            ref={el => { tabsRef.current[index] = el; }}
            onClick={() => handleTabChange(tab.id)}
            className={currentVariant.button(activeTab === tab.id)}
          >
            <figure><img src={activeTab !== tab.id ? tab.icon : tab.iconActive} className='w-5' alt="Icon" /></figure>
            {tab.label}
          </button>
        ))}
        
        {showUnderline && (
          <span 
            className={currentVariant.underline}
            style={underlineStyle}
          />
        )}
      </div>

      <div>{tabs.find(tab => tab.id === activeTab)?.content}</div>
    </div>
  );
}
