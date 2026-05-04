import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Copy } from 'lucide-react';
import { dashboardWidgetsApi } from '../../../shared/store/services/dashboardWidgetsApi';
import DashboardWidgetSelector from '../components/dashboard/DashboardWidgetSelector';
import { WidgetComponents } from '../components/dashboard/widgets';
import type { WidgetWithPreference } from '../types/dashboard';
import { useSupabaseUser } from '../../../shared/hooks/useSupabaseUser';
import {
  PageContainer, PageHeader, Section, Button, EmptyState,
} from '../../../shared/components/ui';

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [widgets, setWidgets] = useState<WidgetWithPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading } = useSupabaseUser();

  useEffect(() => {
    if (!userLoading) {
      loadWidgets();
    }
  }, [user, userLoading]);

  const loadWidgets = async () => {
    if (!user?.id) {
      console.log('No user found, skipping widget load');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading widgets for user:', user.id);
      setLoading(true);
      const widgetsWithPrefs = await dashboardWidgetsApi.getWidgetsWithPreferences(user.id);
      console.log('Widgets loaded:', widgetsWithPrefs.length);
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

  if (userLoading || loading) {
    return (
      <PageContainer>
        <PageHeader eyebrow="Home" title="Dashboard" />
        <Section>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-edge-base border-t-signal-500" />
              <p className="mt-4 studio-text-muted">Loading dashboard…</p>
            </div>
          </div>
        </Section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Home"
        title="Dashboard"
        actions={
          <>
            <Button
              variant="secondary"
              leadingIcon={<RefreshCw className={isRefreshing ? 'animate-spin' : undefined} />}
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              Refresh
            </Button>

            <Button variant="secondary" leadingIcon={<Copy />}>
              Clone
            </Button>

            <div className="relative">
              <Button
                variant="primary"
                leadingIcon={<Plus />}
                onClick={() => setShowWidgetSelector(!showWidgetSelector)}
                trailingIcon={
                  visibleWidgets.length > 0 ? (
                    <span className="ml-0.5 px-1.5 py-0 rounded-studio-1 bg-signal-700 text-white text-caption font-mono tabular-nums">
                      {visibleWidgets.length}
                    </span>
                  ) : undefined
                }
              >
                Add Widget
              </Button>

              {showWidgetSelector && (
                <DashboardWidgetSelector
                  selectedWidgetIds={widgets.filter(w => w.is_visible).map(w => w.widget_key)}
                  onApply={handleApplyWidgets}
                  onClose={() => setShowWidgetSelector(false)}
                />
              )}
            </div>
          </>
        }
      />

      {loading ? (
        <Section>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-edge-base border-t-signal-500" />
          </div>
        </Section>
      ) : visibleWidgets.length === 0 ? (
        <Section>
          <EmptyState
            icon={<Plus />}
            title="No widgets selected"
            description='Click "Add Widget" to customize your dashboard.'
            primaryAction={
              <Button variant="primary" leadingIcon={<Plus />} onClick={() => setShowWidgetSelector(true)}>
                Add widget
              </Button>
            }
          />
        </Section>
      ) : (
        <>
          {regularWidgets.length > 0 && (
            <Section>
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
            </Section>
          )}

          {hasLargeWidgets && (
            <Section>
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
            </Section>
          )}
        </>
      )}
    </PageContainer>
  );
}
