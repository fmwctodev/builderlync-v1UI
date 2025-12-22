import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../shared/store';
import DashboardWidgetCard from './DashboardWidgetCard';
import { widgetStatsService, WidgetStat } from '../../../../shared/store/services/widgetStatsService';

interface DynamicWidgetProps {
  widgetKey: string;
  title: string;
  icon: string;
  defaultSubtitle?: string;
}

const DynamicWidget: React.FC<DynamicWidgetProps> = ({ widgetKey, title, icon, defaultSubtitle }) => {
  const [stat, setStat] = useState<WidgetStat | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchStat = async () => {
      if (!user?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const data = await widgetStatsService.getWidgetStats(user.organization_id, widgetKey);
        setStat(data);
      } catch (error) {
        console.error(`Error fetching stat for ${widgetKey}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchStat();
  }, [widgetKey, user?.organization_id]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <DashboardWidgetCard
      title={title}
      value={stat?.value ?? 0}
      subtitle={stat?.subtitle ?? defaultSubtitle ?? ''}
      icon={icon}
      trend={stat?.trend}
    />
  );
};

export const WidgetComponents: Record<string, React.FC> = {
  // Jobs widgets
  'jobs-total': () => <DynamicWidget widgetKey="jobs-total" title="Total Jobs" icon="Briefcase" />,
  'jobs-created': () => <DynamicWidget widgetKey="jobs-created" title="Jobs Created" icon="Plus" />,
  'jobs-completed': () => <DynamicWidget widgetKey="jobs-completed" title="Completed Jobs" icon="CheckCircle" />,
  'jobs-in-progress': () => <DynamicWidget widgetKey="jobs-in-progress" title="Active Jobs" icon="Briefcase" />,
  'jobs_count': () => <DynamicWidget widgetKey="jobs-total" title="Jobs" icon="Briefcase" defaultSubtitle="Active jobs" />,
  'completed_jobs': () => <DynamicWidget widgetKey="jobs-completed" title="Completed Jobs" icon="CheckCircle" />,
  'active_jobs': () => <DynamicWidget widgetKey="jobs-in-progress" title="Active Jobs" icon="Briefcase" />,

  // Opportunities widgets
  'opportunities-total': () => <DynamicWidget widgetKey="opportunities-total" title="Opportunities" icon="Target" />,
  'opportunities-new': () => <DynamicWidget widgetKey="opportunities-new" title="New Opportunities" icon="TrendingUp" />,
  'opportunities-closed-won': () => <DynamicWidget widgetKey="opportunities-closed-won" title="Closed Won" icon="Award" />,
  'opportunities_pipeline': () => <DynamicWidget widgetKey="opportunities-total" title="Opportunities" icon="Target" defaultSubtitle="Pipeline value" />,

  // Contacts widgets
  'general-total-contacts': () => <DynamicWidget widgetKey="general-total-contacts" title="Total Contacts" icon="Users" />,
  'general-new-contacts': () => <DynamicWidget widgetKey="general-new-contacts" title="New Contacts" icon="UserPlus" />,
  'contacts_total': () => <DynamicWidget widgetKey="general-total-contacts" title="Contacts" icon="Users" defaultSubtitle="Total contacts" />,

  // Payments widgets
  'payments-total-collected': () => <DynamicWidget widgetKey="payments-total-collected" title="Revenue" icon="DollarSign" />,
  'payments-pending': () => <DynamicWidget widgetKey="payments-pending" title="Pending Payments" icon="Clock" />,
  'payments-overdue': () => <DynamicWidget widgetKey="payments-overdue" title="Overdue Payments" icon="AlertCircle" />,
  'revenue_total': () => <DynamicWidget widgetKey="payments-total-collected" title="Revenue" icon="DollarSign" defaultSubtitle="This month" />,
  'pending_payments': () => <DynamicWidget widgetKey="payments-pending" title="Pending Payments" icon="Clock" />,

  // Appointments widgets
  'appointments-total': () => <DynamicWidget widgetKey="appointments-total" title="Upcoming Appointments" icon="Calendar" />,
  'appointments-booked': () => <DynamicWidget widgetKey="appointments-booked" title="Appointments Booked" icon="CalendarCheck" />,
  'today_appointments': () => <DynamicWidget widgetKey="today_appointments" title="Today's Appointments" icon="CalendarDays" />,
  'upcoming_appointments': () => <DynamicWidget widgetKey="appointments-total" title="Upcoming Appointments" icon="Calendar" defaultSubtitle="Next 7 days" />,

  // Static/Complex widgets
  recent_activity: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Recent Activity</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your recent actions</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 mt-2 bg-error-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">You created a new job</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Roof repair for Johnson residence</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 mt-2 bg-success-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">You updated payment status</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">$2,500 from Smith Construction</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 mt-2 bg-primary-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">You added a new contact</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Mike Wilson - Homeowner</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  upcoming_tasks: () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">My Upcoming Tasks</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Tasks assigned to you</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Follow up with ABC Roofing</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Due today</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Send proposal to Johnson</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Due tomorrow</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Schedule site visit</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Due in 2 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
