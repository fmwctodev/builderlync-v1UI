import { useState, useRef, useEffect } from 'react';
import { Search, Check, X } from 'lucide-react';
import type { WidgetWithPreference, WidgetCategory } from '../../types/dashboard';
import { WIDGET_CATEGORIES } from '../../types/dashboard';

interface WidgetSelectorDropdownProps {
  widgets: WidgetWithPreference[];
  onApply: (selectedWidgets: string[]) => void;
  onClose: () => void;
}

export default function WidgetSelectorDropdown({
  widgets,
  onApply,
  onClose
}: WidgetSelectorDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(
    new Set(widgets.filter(w => w.is_visible).map(w => w.widget_key))
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const toggleWidget = (widgetKey: string) => {
    const newSelected = new Set(selectedWidgets);
    if (newSelected.has(widgetKey)) {
      newSelected.delete(widgetKey);
    } else {
      newSelected.add(widgetKey);
    }
    setSelectedWidgets(newSelected);
  };

  const toggleCategory = (category: WidgetCategory) => {
    const categoryWidgets = widgets.filter(w => w.category === category);
    const allSelected = categoryWidgets.every(w => selectedWidgets.has(w.widget_key));

    const newSelected = new Set(selectedWidgets);
    categoryWidgets.forEach(widget => {
      if (allSelected) {
        newSelected.delete(widget.widget_key);
      } else {
        newSelected.add(widget.widget_key);
      }
    });
    setSelectedWidgets(newSelected);
  };

  const handleApply = () => {
    onApply(Array.from(selectedWidgets));
    onClose();
  };

  const filteredWidgets = widgets.filter(widget =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const widgetsByCategory = Object.keys(WIDGET_CATEGORIES).reduce((acc, category) => {
    const categoryWidgets = filteredWidgets.filter(w => w.category === category);
    if (categoryWidgets.length > 0) {
      acc[category as WidgetCategory] = categoryWidgets;
    }
    return acc;
  }, {} as Record<WidgetCategory, WidgetWithPreference[]>);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-[600px] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Widgets
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Selected count */}
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {selectedWidgets.size} widget{selectedWidgets.size !== 1 ? 's' : ''} selected
        </div>
      </div>

      {/* Widget list */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(widgetsByCategory).map(([category, categoryWidgets]) => {
          const categoryKey = category as WidgetCategory;
          const categoryInfo = WIDGET_CATEGORIES[categoryKey];
          const allCategorySelected = categoryWidgets.every(w => selectedWidgets.has(w.widget_key));
          const someCategorySelected = categoryWidgets.some(w => selectedWidgets.has(w.widget_key));

          return (
            <div key={category} className="mb-4">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between px-3 py-2 mb-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    allCategorySelected
                      ? 'bg-primary-600 border-primary-600'
                      : someCategorySelected
                      ? 'bg-primary-300 border-primary-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {allCategorySelected && <Check size={12} className="text-white" />}
                    {someCategorySelected && !allCategorySelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {categoryInfo.label}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {categoryWidgets.filter(w => selectedWidgets.has(w.widget_key)).length}/{categoryWidgets.length}
                </span>
              </button>

              {/* Category widgets */}
              <div className="space-y-1 ml-6">
                {categoryWidgets.map(widget => (
                  <button
                    key={widget.widget_key}
                    onClick={() => toggleWidget(widget.widget_key)}
                    className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className={`flex-shrink-0 mt-0.5 w-4 h-4 border-2 rounded flex items-center justify-center ${
                      selectedWidgets.has(widget.widget_key)
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedWidgets.has(widget.widget_key) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {widget.name}
                      </div>
                      {widget.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {widget.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(widgetsByCategory).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No widgets found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
}
