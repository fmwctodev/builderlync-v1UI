import React, { useState, useMemo } from 'react';
import { X, ChevronRight, Info, Search, Check, Minus } from 'lucide-react';
import { getMetricsForReporting, MetricCategory, MetricWidget } from '../../../shared/constants/metricsData';

interface ReportMetricsModalProps {
  show: boolean;
  onClose: () => void;
  onCreateReport: (selectedWidgets: string[]) => void;
}

const ReportMetricsModal: React.FC<ReportMetricsModalProps> = ({
  show,
  onClose,
  onCreateReport,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleWidget = (widgetId: string) => {
    const newSelected = new Set(selectedWidgets);
    if (newSelected.has(widgetId)) {
      newSelected.delete(widgetId);
    } else {
      newSelected.add(widgetId);
    }
    setSelectedWidgets(newSelected);
  };

  const toggleCategorySelection = (category: MetricCategory) => {
    const categoryWidgetIds = category.widgets.map((w) => w.id);
    const allSelected = categoryWidgetIds.every((id) => selectedWidgets.has(id));
    const newSelected = new Set(selectedWidgets);

    if (allSelected) {
      categoryWidgetIds.forEach((id) => newSelected.delete(id));
    } else {
      categoryWidgetIds.forEach((id) => newSelected.add(id));
    }
    setSelectedWidgets(newSelected);
  };

  const getCategorySelectionState = (category: MetricCategory): 'none' | 'partial' | 'all' => {
    const categoryWidgetIds = category.widgets.map((w) => w.id);
    const selectedCount = categoryWidgetIds.filter((id) => selectedWidgets.has(id)).length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryWidgetIds.length) return 'all';
    return 'partial';
  };

  const getSelectedCountForCategory = (category: MetricCategory): number => {
    return category.widgets.filter((w) => selectedWidgets.has(w.id)).length;
  };

  const METRICS_CATEGORIES = useMemo(() => getMetricsForReporting(), []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return METRICS_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return METRICS_CATEGORIES.map((category) => {
      const matchesCategory = category.label.toLowerCase().includes(query);
      const matchedWidgets = category.widgets.filter((widget) =>
        widget.label.toLowerCase().includes(query)
      );

      if (matchesCategory || matchedWidgets.length > 0) {
        return {
          ...category,
          widgets: matchesCategory ? category.widgets : matchedWidgets,
        };
      }
      return null;
    }).filter((cat): cat is MetricCategory => cat !== null);
  }, [searchQuery, METRICS_CATEGORIES]);

  const handleCreateReport = () => {
    onCreateReport(Array.from(selectedWidgets));
    setSelectedWidgets(new Set());
    setExpandedCategories(new Set());
    setSearchQuery('');
    onClose();
  };

  const handleClearAll = () => {
    setSelectedWidgets(new Set());
  };

  const totalSelectedWidgets = selectedWidgets.size;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Report Metrics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select one or more metrics to include in your custom report
          </p>

          <div className="space-y-0 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {filteredCategories.map((category, index) => {
              const isExpanded = expandedCategories.has(category.id);
              const selectionState = getCategorySelectionState(category);
              const selectedCount = getSelectedCountForCategory(category);

              return (
                <div
                  key={category.id}
                  className={`${
                    index !== filteredCategories.length - 1
                      ? 'border-b border-gray-200 dark:border-gray-700'
                      : ''
                  }`}
                >
                  {/* Category Header */}
                  <div
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectionState === 'all'
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : selectionState === 'partial'
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <ChevronRight
                          className={`w-5 h-5 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          } ${
                            selectionState !== 'none'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => toggleCategorySelection(category)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectionState === 'all'
                            ? 'bg-red-600 border-red-600'
                            : selectionState === 'partial'
                            ? 'bg-red-600 border-red-600'
                            : 'border-gray-300 dark:border-gray-600 hover:border-red-500'
                        }`}
                      >
                        {selectionState === 'all' && <Check className="w-3 h-3 text-white" />}
                        {selectionState === 'partial' && <Minus className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex items-center space-x-2 flex-1 cursor-pointer" onClick={() => toggleCategory(category.id)}>
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {category.label}
                        </span>
                        {category.hasInfo && (
                          <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedCount > 0 && (
                        <span className="flex items-center justify-center px-2 h-8 bg-red-600 text-white rounded-full text-sm font-medium">
                          {selectedCount}
                        </span>
                      )}
                      <span className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full text-sm font-medium">
                        {category.count}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Widgets */}
                  {isExpanded && (
                    <div className="bg-paper dark:bg-canvas border-t border-gray-200 dark:border-gray-700">
                      {category.widgets.map((widget, widgetIndex) => (
                        <div
                          key={widget.id}
                          className={`flex items-center space-x-3 px-4 py-3 pl-16 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                            widgetIndex !== category.widgets.length - 1
                              ? 'border-b border-gray-200 dark:border-gray-700'
                              : ''
                          }`}
                          onClick={() => toggleWidget(widget.id)}
                        >
                          <button
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              selectedWidgets.has(widget.id)
                                ? 'bg-red-600 border-red-600'
                                : 'border-gray-300 dark:border-gray-600 hover:border-red-500'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWidget(widget.id);
                            }}
                          >
                            {selectedWidgets.has(widget.id) && (
                              <Check className="w-2.5 h-2.5 text-white" />
                            )}
                          </button>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {widget.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No metrics found matching your search.</p>
            </div>
          )}

          {/* Selection Summary */}
          {totalSelectedWidgets > 0 && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">
                    {totalSelectedWidgets} widget{totalSelectedWidgets !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {METRICS_CATEGORIES.filter(
                      (cat) => getSelectedCountForCategory(cat) > 0
                    ).length}{' '}
                    categor{METRICS_CATEGORIES.filter((cat) => getSelectedCountForCategory(cat) > 0).length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
                <button
                  onClick={handleClearAll}
                  className="text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-paper dark:bg-canvas">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateReport}
            disabled={totalSelectedWidgets === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              totalSelectedWidgets === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Create Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportMetricsModal;
