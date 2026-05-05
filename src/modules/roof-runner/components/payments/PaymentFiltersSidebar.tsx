import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSection {
  title: string;
  type: 'radio' | 'checkbox';
  options: FilterOption[];
  selectedValues: string[];
}

interface PaymentFiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sections: FilterSection[];
  onApply: (sections: FilterSection[]) => void;
  onReset?: () => void;
}

const PaymentFiltersSidebar: React.FC<PaymentFiltersSidebarProps> = ({
  isOpen,
  onClose,
  sections,
  onApply,
  onReset,
}) => {
  const [localSections, setLocalSections] = useState<FilterSection[]>(sections);

  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  if (!isOpen) return null;

  const handleOptionChange = (sectionIndex: number, value: string) => {
    const newSections = [...localSections];
    const section = newSections[sectionIndex];

    if (section.type === 'radio') {
      section.selectedValues = [value];
    } else {
      const currentValues = section.selectedValues || [];
      section.selectedValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
    }

    setLocalSections(newSections);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filter & Sort
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {localSections.map((section, index) => (
          <div key={index} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {section.title}
            </h4>
            <div className="space-y-2">
              {section.options.map((option) => {
                const isSelected = section.selectedValues?.includes(option.value);
                return (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type={section.type}
                      name={section.title}
                      checked={isSelected}
                      onChange={() => handleOptionChange(index, option.value)}
                      className="mr-2 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => onApply(localSections)}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            Apply Filters
          </button>
          {onReset && (
            <button
              onClick={onReset}
              className="w-full px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentFiltersSidebar;
