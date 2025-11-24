import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Copy } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store';
import { dashboardWidgetsApi } from '../../../shared/store/services/dashboardWidgetsApi';
import WidgetSelectorDropdown from '../components/dashboard/WidgetSelectorDropdown';
import { WidgetComponents } from '../components/dashboard/widgets';
import type { WidgetWithPreference } from '../types/dashboard';

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [widgets, setWidgets] = useState<WidgetWithPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadWidgets();
  }, [user]);

  const loadWidgets = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const widgetsWithPrefs = await dashboardWidgetsApi.getWidgetsWithPreferences(user.id);
      setWidgets(widgetsWithPrefs);
    } catch (error) {
      console.error('Error loading widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadWidgets();
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleApplyWidgets = async (selectedWidgetKeys: string[]) => {
    if (!user?.id) return;

    try {
      const updates = widgets.map((widget, index) => ({
        widget_key: widget.widget_key,
        is_visible: selectedWidgetKeys.includes(widget.widget_key),
        position: index
      }));

      await dashboardWidgetsApi.updateUserPreferences(user.id, updates);
      await loadWidgets();
    } catch (error) {
      console.error('Error updating widget preferences:', error);
    }
  };

  const visibleWidgets = widgets
    .filter(w => w.is_visible)
    .sort((a, b) => a.position - b.position);

  const hasActivityWidget = visibleWidgets.some(w => w.widget_key === 'recent_activity');
  const hasTasksWidget = visibleWidgets.some(w => w.widget_key === 'upcoming_tasks');
  const hasLargeWidgets = hasActivityWidget || hasTasksWidget;

  const regularWidgets = visibleWidgets.filter(
    w => w.widget_key !== 'recent_activity' && w.widget_key !== 'upcoming_tasks'
  );
  const largeWidgets = visibleWidgets.filter(
    w => w.widget_key === 'recent_activity' || w.widget_key === 'upcoming_tasks'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Home</span> / <span className="text-gray-900 dark:text-white">Dashboard</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

        <div className="flex gap-2 relative">
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            <Copy size={16} />
            <span>Clone</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowWidgetSelector(!showWidgetSelector)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              <Plus size={16} />
              <span>Add Widget</span>
              {visibleWidgets.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary-700 rounded-full">
                  {visibleWidgets.length}
                </span>
              )}
            </button>

            {showWidgetSelector && (
              <WidgetSelectorDropdown
                widgets={widgets}
                onApply={handleApplyWidgets}
                onClose={() => setShowWidgetSelector(false)}
              />
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : visibleWidgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Plus size={48} className="mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No widgets selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Click "Add Widget" to customize your dashboard
          </p>
        </div>
      ) : (
        <>
          {regularWidgets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularWidgets.map(widget => {
                const WidgetComponent = WidgetComponents[widget.widget_key];
                return WidgetComponent ? (
                  <div key={widget.widget_key} className="animate-fadeIn">
                    <WidgetComponent />
                  </div>
                ) : null;
              })}
            </div>
          )}

          {hasLargeWidgets && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {largeWidgets.map(widget => {
                const WidgetComponent = WidgetComponents[widget.widget_key];
                return WidgetComponent ? (
                  <div key={widget.widget_key} className="animate-fadeIn">
                    <WidgetComponent />
                  </div>
                ) : null;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
