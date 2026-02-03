// ParentTabs.jsx
import { useState } from 'react';

/**
 * Component ParentTabs - Tabs cha KHÔNG link với nhau
 * 1 tab cha có thể có nhiều charts
 * 
 * @param {Array} tabs - Mảng các tab [{ id, label, content }]
 *   - content: Có thể là JSX với nhiều charts
 * @param {string} defaultTab - Tab cha mặc định (optional)
 * @param {string} variant - Style variant: 'default' | 'pills' | 'bg' (optional)
 * @param {string} uniqueId - ID duy nhất để phân biệt các ParentTabs (REQUIRED)
 * @param {boolean} sticky - Bật sticky header (optional)
 * @param {string} stickyTop - Khoảng cách từ top khi sticky: '0' | '64px' | '80px' (optional)
 * @param {string} zIndex - z-index cho sticky: 'z-10' | 'z-20' | 'z-30' (optional)
 */
export default function ParentTabs({ 
  tabs, 
  defaultTab, 
  variant = 'default',
  uniqueId = 'parent-tab',
  sticky = true, // ✅ Bật/tắt sticky
  stickyTop = '0', // ✅ Khoảng cách từ top
  zIndex = 'z-10' // ✅ z-index
}) {
  // ✅ Mỗi ParentTabs có state riêng (KHÔNG share với ParentTabs khác)
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  // Style variants
  const variants = {
    default: {
      container: 'flex mb-6 border-b-2 border-gray-200',
      button: (isActive) => `px-8 py-3 font-semibold text-lg transition-colors cursor-pointer ${
        isActive
          ? 'border-b-4 border-blue-600 text-blue-600 -mb-0.5'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`,
    },
    pills: {
      container: 'flex gap-3 mb-6',
      button: (isActive) => `px-8 py-3 rounded-full font-semibold text-lg transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`,
    },
    bg: {
      container: 'flex gap-2 mb-6 bg-gray-100 p-2 rounded-xl',
      button: (isActive) => `flex-1 px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
        isActive
          ? 'bg-white text-blue-600 shadow-md'
          : 'text-gray-600 hover:text-gray-900'
      }`,
    },
  };

  const currentVariant = variants[variant] || variants.default;

  // ✅ Sticky classes
  const stickyClasses = sticky 
    ? `sticky ${zIndex} bg-white` 
    : '';

  return (
    <div>
      {/* Tab Headers - Có thể sticky */}
      <div 
        className={`${currentVariant.container} ${stickyClasses}`}
        style={sticky ? { top: stickyTop } : {}} // ✅ Dynamic top
      >
        {tabs.map((tab) => (
          <button
            key={`${uniqueId}-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={currentVariant.button(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content - Có thể chứa nhiều charts */}
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
