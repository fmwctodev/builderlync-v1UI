import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronRight, Search, Check, Minus } from 'lucide-react';
import { getAuthToken } from '../../../../shared/utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

interface DashboardWidgetSelectorProps {
  selectedWidgetIds: string[];
  onApply: (selectedWidgetIds: string[]) => void;
  onClose: () => void;
}

interface Widget {
  widget_key: string;
  name: string;
  description?: string;
  category: string;
}

const DashboardWidgetSelector: React.FC<DashboardWidgetSelectorProps> = ({
  selectedWidgetIds,
  onApply,
  onClose,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set(selectedWidgetIds));
  const [searchQuery, setSearchQuery] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/dashboard/widgets`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setWidgets(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching widgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  const categorizedWidgets = useMemo(() => {
    const categories: Record<string, { label: string; widgets: Widget[] }> = {};
    
    widgets.forEach(widget => {
      if (!categories[widget.category]) {
        const categoryLabels: Record<string, string> = {
          jobs: 'Jobs',
          opportunities: 'Opportunities',
          reporting: 'Contacts & General',
          payments: 'Payments',
          appointments: 'Appointments'
        };
        categories[widget.category] = {
          label: categoryLabels[widget.category] || widget.category,
          widgets: []
        };
      }
      categories[widget.category].widgets.push(widget);
    });

    return Object.entries(categories).map(([id, data]) => ({
      id,
      label: data.label,
      widgets: data.widgets
    }));
  }, [widgets]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleWidget = (widgetKey: string) => {
    const newSelected = new Set(selectedWidgets);
    if (newSelected.has(widgetKey)) {
      newSelected.delete(widgetKey);
    } else {
      newSelected.add(widgetKey);
    }
    setSelectedWidgets(newSelected);
  };

  const toggleCategorySelection = (categoryWidgets: Widget[]) => {
    const categoryWidgetIds = categoryWidgets.map((w) => w.widget_key);
    const allSelected = categoryWidgetIds.every((id) => selectedWidgets.has(id));
    const newSelected = new Set(selectedWidgets);

    if (allSelected) {
      categoryWidgetIds.forEach((id) => newSelected.delete(id));
    } else {
      categoryWidgetIds.forEach((id) => newSelected.add(id));
    }
    setSelectedWidgets(newSelected);
  };

  const getCategorySelectionState = (categoryWidgets: Widget[]): 'none' | 'partial' | 'all' => {
    const categoryWidgetIds = categoryWidgets.map((w) => w.widget_key);
    const selectedCount = categoryWidgetIds.filter((id) => selectedWidgets.has(id)).length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryWidgetIds.length) return 'all';
    return 'partial';
  };

  const getSelectedCountForCategory = (categoryWidgets: Widget[]): number => {
    return categoryWidgets.filter((w) => selectedWidgets.has(w.widget_key)).length;
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categorizedWidgets;

    const query = searchQuery.toLowerCase();
    return categorizedWidgets.map((category) => {
      const matchesCategory = category.label.toLowerCase().includes(query);
      const matchedWidgets = category.widgets.filter((widget) =>
        widget.name.toLowerCase().includes(query) ||
        widget.description?.toLowerCase().includes(query)
      );

      if (matchesCategory || matchedWidgets.length > 0) {
        return {
          ...category,
          widgets: matchesCategory ? category.widgets : matchedWidgets,
        };
      }
      return null;
    }).filter((cat): cat is typeof categorizedWidgets[0] => cat !== null);
  }, [searchQuery, categorizedWidgets]);

  const handleApplyChanges = () => {
    onApply(Array.from(selectedWidgets));
    onClose();
  };

  const handleClearAll = () => {
    setSelectedWidgets(new Set());
  };

  const totalSelectedWidgets = selectedWidgets.size;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Dashboard Widgets
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select widgets to display on your dashboard
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {filteredCategories.map((category, index) => {
                const isExpanded = expandedCategories.has(category.id);
                const selectionState = getCategorySelectionState(category.widgets);
                const selectedCount = getSelectedCountForCategory(category.widgets);

                return (
                  <div
                    key={category.id}
                    className={index !== filteredCategories.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                  >
                    <div className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectionState === 'all' ? 'bg-primary-50 dark:bg-primary-900/20' :
                      selectionState === 'partial' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'
                    }`}>
                      <div className="flex items-center space-x-3 flex-1">
                        <button onClick={() => toggleCategory(category.id)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors">
                          <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''} ${
                            selectionState !== 'none' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        </button>
                        <button onClick={() => toggleCategorySelection(category.widgets)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectionState === 'all' ? 'bg-primary-600 border-primary-600' :
                          selectionState === 'partial' ? 'bg-blue-600 border-blue-600' :
                          'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                        }`}>
                          {selectionState === 'all' && <Check className="w-3 h-3 text-white" />}
                          {selectionState === 'partial' && <Minus className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => toggleCategory(category.id)}>
                          <span className="text-lg font-medium text-gray-900 dark:text-white">{category.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedCount > 0 && (
                          <span className="flex items-center justify-center px-2 h-8 bg-blue-500 text-white rounded-full text-sm font-medium">
                            {selectedCount}
                          </span>
                        )}
                        <span className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium">
                          {category.widgets.length}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        {category.widgets.map((widget, widgetIndex) => (
                          <div
                            key={widget.widget_key}
                            className={`flex items-start space-x-3 px-4 py-3 pl-16 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                              widgetIndex !== category.widgets.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                            }`}
                            onClick={() => toggleWidget(widget.widget_key)}
                          >
                            <button
                              className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                selectedWidgets.has(widget.widget_key) ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWidget(widget.widget_key);
                              }}
                            >
                              {selectedWidgets.has(widget.widget_key) && <Check className="w-2.5 h-2.5 text-white" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{widget.name}</div>
                              {widget.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{widget.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredCategories.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No widgets found matching your search.</p>
            </div>
          )}

          {totalSelectedWidgets > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                    {totalSelectedWidgets} widget{totalSelectedWidgets !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <button onClick={handleClearAll} className="text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline">
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleApplyChanges} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgetSelector;
