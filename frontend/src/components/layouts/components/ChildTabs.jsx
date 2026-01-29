import { useState } from 'react';

/**
 * Component Tab tái sử dụng
 * @param {Array} tabs - Mảng các tab [{ id, label, content }]
 * @param {string} defaultTab - Tab mặc định (optional)
 * @param {string} variant - Style variant: 'default' | 'pills' | 'bg' (optional)
 */
export default function ChildTabs({ tabs, defaultTab, variant = 'default' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  // Style variants
  const variants = {
    default: {
      container: 'flex mb-2',
      button: (isActive) => `px-6 py-1 font-medium text-md transition-colors cursor-pointer ${
        isActive
          ? 'border-b-2 border-color-light text-color-light bg-background-dark rounded-4xl'
          : 'text-gray-500 hover:text-gray-700 rounded-4xl'
      }`,
    },
    pills: {
      container: 'flex gap-2 mb-2',
      button: (isActive) => `px-6 py-1 rounded-full font-medium text-md transition-all ${
        isActive
          ? 'bg-background-dark text-color-light shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`,
    },
    bg: {
      container: 'flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg',
      button: (isActive) => `flex-1 px-6 py-2 rounded-md font-medium text-sm transition-all ${
        isActive
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`,
    },
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div>
      {/* Tab Headers */}
      <div className={currentVariant.container}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={currentVariant.button(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}