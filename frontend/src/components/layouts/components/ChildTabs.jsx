import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ChildTabs với hiệu ứng smooth background slide
 */
export default function ChildTabs({ tabs, defaultTab, variant = 'default' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [bgStyle, setBgStyle] = useState({ left: 0, width: 0, top: 0, height: 0 });
  const tabsRef = useRef([]);

  // Update background position
  const updateBgPosition = useCallback(() => {
    requestAnimationFrame(() => {
      const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
      const currentTab = tabsRef.current[activeIndex];
      if (currentTab) {
        setBgStyle({
          left: currentTab.offsetLeft,
          width: currentTab.clientWidth,
          top: currentTab.offsetTop,
          height: currentTab.offsetHeight
        });
      }
    });
  }, [activeTab, tabs]);

  // Update khi tab thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(updateBgPosition, 0);
    return () => clearTimeout(timeoutId);
  }, [updateBgPosition]);

  // Resize handler
  useEffect(() => {
    window.addEventListener('resize', updateBgPosition);
    return () => window.removeEventListener('resize', updateBgPosition);
  }, [updateBgPosition]);

  // Style variants với background overlay
  const variants = {
    default: {
      container: 'relative flex gap-1 mb-6 overflow-hidden rounded-2xl p-1 bg-background-black-4 dark:bg-background-white-8 w-fit transition-all duration-300',
      button: (isActive) => `relative px-6 py-2 font-medium text-sm transition-all duration-300 cursor-pointer z-10 ${
        isActive
          ? 'text-color-light dark:text-background-check-box font-medium'
          : 'text-color-gray-600 dark:text-color-white-50 hover:text-gray-700 dark:hover:text-gray-100'
      }`,
      background: 'absolute inset-0 bg-background-black-child-tab dark:bg-color-white-80 rounded-2xl transition-all duration-500 ease-out'
    },
    pills: {
      container: 'flex gap-2 mb-2',
      button: (isActive) => `px-6 py-1 rounded-full font-medium text-md transition-all duration-300 z-10 ${
        isActive
          ? 'bg-background-dark text-color-light shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`,
      background: ''
    },
    bg: {
      container: 'flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg relative',
      button: (isActive) => `relative flex-1 px-6 py-2 rounded-md font-medium text-sm transition-all duration-300 z-10 ${
        isActive
          ? 'bg-white text-blue-600 shadow-sm font-semibold'
          : 'text-gray-600 hover:text-gray-900'
      }`,
      background: 'absolute inset-0 bg-white rounded-md transition-all duration-500 ease-out shadow-inner'
    }
  };

  const currentVariant = variants[variant] || variants.default;
  const showBgOverlay = ['default', 'bg'].includes(variant);

  return (
    <div>
      {/* Tab Headers */}
      <div className={currentVariant.container} style={{ position: 'relative' }}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => { tabsRef.current[index] = el; }}
            onClick={() => setActiveTab(tab.id)}
            className={currentVariant.button(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
        
        {showBgOverlay && (
          <div 
            className={currentVariant.background}
            style={bgStyle}
          />
        )}
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
