import { useState, useEffect, useRef, useCallback } from 'react';

export default function ParentTabs({
  tabs,
  defaultTab,
  variant = 'default',
  uniqueId = 'parent-tab',
  sticky = true,
  stickyTop = 148,
  zIndex = 'z-100',
  onTabChange
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef([]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);  // ← Callback ra ngoài
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
      container: 'relative flex border-b border-border-black-10 px-6 gap-7 h-12',
      button: (isActive) => `py-2 font-medium text-[16px] transition-colors duration-300 cursor-pointer ${
        isActive ? 'text-color-primary-700' : 'text-color-black-50 hover:text-gray-700'
      }`,
      underline: 'absolute -bottom-px block h-[3px] bg-color-primary-700 transition-all duration-400 ease-out rounded-full'
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
  const stickyClasses = sticky ? `sticky ${zIndex} bg-background-light shadow-xs` : '';

  return (
    <div>
      <div className={`${currentVariant.container} ${stickyClasses}`} style={sticky ? { top: stickyTop } : {}}>
        {tabs.map((tab, index) => (
          <button
            key={`${uniqueId}-${tab.id}`}
            ref={el => { tabsRef.current[index] = el; }}
            onClick={() => handleTabChange(tab.id)}
            className={currentVariant.button(activeTab === tab.id)}
          >
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
