import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Copy } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../shared/store';
import { useGetWidgetsQuery, useGetUserPreferencesQuery, useSavePreferencesMutation } from '../../../shared/store/services/dashboardApi';
import DashboardWidgetSelector from '../components/dashboard/DashboardWidgetSelector';
import { WidgetComponents } from '../components/dashboard/DynamicWidgets';
import type { WidgetWithPreference } from '../types/dashboard';

export default function Dashboard() {
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const { data: widgets = [], isLoading, refetch } = useGetWidgetsQuery(undefined);
  const { data: preferences = [] } = useGetUserPreferencesQuery(user?.id || '', {
    skip: !user?.id
  });
  const [savePreferences, { isLoading: isSaving }] = useSavePreferencesMutation();

  const widgetsWithPrefs: WidgetWithPreference[] = widgets.map(widget => {
    const pref = preferences.find(p => p.widget_key === widget.widget_key);
    return {
      ...widget,
      is_visible: pref ? pref.is_visible : widget.default_visible,
      position: pref ? pref.position : 0
    };
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleApplyWidgets = async (selectedWidgetKeys: string[]) => {
    if (!user?.id) return;

    console.log('Selected widget keys:', selectedWidgetKeys);
    console.log('Total widgets with prefs:', widgetsWithPrefs.length);

    const updates = widgetsWithPrefs.map((widget, index) => ({
      widget_key: widget.widget_key,
      is_visible: selectedWidgetKeys.includes(widget.widget_key),
      position: index
    }));

    console.log('Preferences to save:', updates.filter(u => u.is_visible));

    await savePreferences({ userId: user.id, preferences: updates });
    setShowWidgetSelector(false);
  };

  const visibleWidgets = widgetsWithPrefs
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
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
            <Copy size={16} />
            <span>Clone</span>
          </button> */}

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
              <DashboardWidgetSelector
                selectedWidgetIds={widgetsWithPrefs.filter(w => w.is_visible).map(w => w.widget_key)}
                onApply={handleApplyWidgets}
                onClose={() => setShowWidgetSelector(false)}
              />
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
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
        <div className="space-y-6">
          {/* Group widgets by category */}
          {['jobs', 'opportunities', 'reporting', 'payments', 'appointments'].map(category => {
            const categoryWidgets = visibleWidgets.filter(
              w => w.category === category && w.widget_key !== 'recent_activity' && w.widget_key !== 'upcoming_tasks'
            );
            
            if (categoryWidgets.length === 0) return null;

            const categoryNames: Record<string, string> = {
              jobs: 'Jobs',
              opportunities: 'Opportunities',
              reporting: 'Contacts & General',
              payments: 'Payments',
              appointments: 'Appointments'
            };

            return (
              <div key={category}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {categoryNames[category]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryWidgets.map(widget => {
                    const WidgetComponent = WidgetComponents[widget.widget_key];
                    return WidgetComponent ? (
                      <div key={widget.widget_key} className="animate-fadeIn">
                        <WidgetComponent />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}

          {/* Special widgets (Activity & Tasks) */}
          {hasLargeWidgets && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Activity & Tasks
              </h2>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
