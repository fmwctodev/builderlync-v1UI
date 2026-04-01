import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../shared/store';
import DashboardWidgetCard from './DashboardWidgetCard';
import { widgetStatsService, WidgetStat } from '../../../../shared/store/services/widgetStatsService';
import { AIInsightWidget } from './AIInsightWidget';

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
      try {
        // Fallback to empty string if organization_id is missing, API will handle it via token
        const orgId = user?.organization_id ? String(user.organization_id) : '';
        const data = await widgetStatsService.getWidgetStats(orgId, widgetKey);
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
  // --- JOBS ---
  'jobs-total': () => <DynamicWidget widgetKey="jobs-total" title="Total Jobs" icon="Briefcase" />,
  'jobs-created': () => <DynamicWidget widgetKey="jobs-created" title="Jobs Created" icon="Plus" />,
  'jobs-completed': () => <DynamicWidget widgetKey="jobs-completed" title="Jobs Completed" icon="CheckCircle" />,
  'jobs-in-progress': () => <DynamicWidget widgetKey="jobs-in-progress" title="Jobs In Progress" icon="Loader" />,
  'jobs-scheduled': () => <DynamicWidget widgetKey="jobs-scheduled" title="Jobs Scheduled" icon="Calendar" />,
  'jobs-lost': () => <DynamicWidget widgetKey="jobs-lost" title="Jobs Lost" icon="XCircle" />,
  'jobs-won': () => <DynamicWidget widgetKey="jobs-won" title="Jobs Won" icon="Award" />,
  'jobs-cancelled': () => <DynamicWidget widgetKey="jobs-cancelled" title="Jobs Cancelled" icon="XOctagon" />,
  'jobs-total-value': () => <DynamicWidget widgetKey="jobs-total-value" title="Total Job Value" icon="DollarSign" />,
  'jobs-avg-value': () => <DynamicWidget widgetKey="jobs-avg-value" title="Avg Job Value" icon="Percent" />,

  // --- OPPORTUNITIES ---
  'opportunities-total': () => <DynamicWidget widgetKey="opportunities-total" title="Total Opportunities" icon="Target" />,
  'opportunities-new': () => <DynamicWidget widgetKey="opportunities-new" title="New Opportunities" icon="TrendingUp" />,
  'opportunities-closed-won': () => <DynamicWidget widgetKey="opportunities-closed-won" title="Closed Won" icon="Award" />,
  'opportunities-closed-lost': () => <DynamicWidget widgetKey="opportunities-closed-lost" title="Closed Lost" icon="XCircle" />,
  'opportunities-pipeline-value': () => <DynamicWidget widgetKey="opportunities-pipeline-value" title="Pipeline Value" icon="DollarSign" />,
  'opportunities-avg-deal-size': () => <DynamicWidget widgetKey="opportunities-avg-deal-size" title="Avg Deal Size" icon="Percent" />,
  'opportunities-conversion-rate': () => <DynamicWidget widgetKey="opportunities-conversion-rate" title="Conversion Rate" icon="Activity" />,

  // --- CONTACTS ---
  'general-total-contacts': () => <DynamicWidget widgetKey="general-total-contacts" title="Total Contacts" icon="Users" />,
  'general-new-contacts': () => <DynamicWidget widgetKey="general-new-contacts" title="New Contacts" icon="UserPlus" />,
  'general-new-leads': () => <DynamicWidget widgetKey="general-new-leads" title="New Leads" icon="Star" />,

  // --- PAYMENTS ---
  'payments-total-collected': () => <DynamicWidget widgetKey="payments-total-collected" title="Total Collected" icon="DollarSign" />,
  'payments-pending': () => <DynamicWidget widgetKey="payments-pending" title="Pending Payments" icon="Clock" />,
  'payments-overdue': () => <DynamicWidget widgetKey="payments-overdue" title="Overdue Payments" icon="AlertCircle" />,
  'payments-total-invoiced': () => <DynamicWidget widgetKey="payments-total-invoiced" title="Total Invoiced" icon="FileText" />,
  'payments-outstanding-invoice': () => <DynamicWidget widgetKey="payments-outstanding-invoice" title="Outstanding Invoices" icon="FileMinus" />,

  // --- APPOINTMENTS ---
  'appointments-total': () => <DynamicWidget widgetKey="appointments-total" title="Total Appointments" icon="Calendar" />,
  'appointments-booked': () => <DynamicWidget widgetKey="appointments-booked" title="Appointments Booked" icon="CalendarCheck" />,
  'appointments-completed': () => <DynamicWidget widgetKey="appointments-completed" title="Appointments Completed" icon="CheckSquare" />,
  'appointments-no-show': () => <DynamicWidget widgetKey="appointments-no-show" title="No-Show" icon="UserX" />,
  'appointments-cancellations': () => <DynamicWidget widgetKey="appointments-cancellations" title="Cancellations" icon="X" />,

  // --- MARKETING (Visitor Data) ---
  'visitor-total': () => <DynamicWidget widgetKey="visitor-total" title="Total Visitors" icon="Globe" />,
  'visitor-unique': () => <DynamicWidget widgetKey="visitor-unique" title="Unique Visitors" icon="Users" />,
  'visitor-lead-conversion-rate': () => <DynamicWidget widgetKey="visitor-lead-conversion-rate" title="Lead Conversion" icon="TrendingUp" />,
  'visitor-form-submissions': () => <DynamicWidget widgetKey="visitor-form-submissions" title="Form Submissions" icon="FileText" />,

  // --- MARKETING (Emails) ---
  'emails-sent': () => <DynamicWidget widgetKey="emails-sent" title="Emails Sent" icon="Mail" />,
  'emails-opens': () => <DynamicWidget widgetKey="emails-opens" title="Email Opens" icon="MailOpen" />,
  'emails-open-rate': () => <DynamicWidget widgetKey="emails-open-rate" title="Open Rate" icon="Percent" />,
  'emails-click-rate': () => <DynamicWidget widgetKey="emails-click-rate" title="Click Rate" icon="MousePointer" />,

  // --- MARKETING (Meta Ads) ---
  'meta-ads-total-spend': () => <DynamicWidget widgetKey="meta-ads-total-spend" title="Ad Spend" icon="DollarSign" />,
  'meta-ads-impressions': () => <DynamicWidget widgetKey="meta-ads-impressions" title="Impressions" icon="Eye" />,
  'meta-ads-clicks': () => <DynamicWidget widgetKey="meta-ads-clicks" title="Clicks" icon="MousePointer" />,
  'meta-ads-ctr': () => <DynamicWidget widgetKey="meta-ads-ctr" title="CTR" icon="Percent" />,
  'meta-ads-leads-generated': () => <DynamicWidget widgetKey="meta-ads-leads-generated" title="Ad Leads" icon="UserPlus" />,
  'meta-ads-cost-per-lead': () => <DynamicWidget widgetKey="meta-ads-cost-per-lead" title="Cost per Lead" icon="DollarSign" />,

  // --- REPORTING (Calls) ---
  'calls-total': () => <DynamicWidget widgetKey="calls-total" title="Total Calls" icon="Phone" />,
  'calls-missed': () => <DynamicWidget widgetKey="calls-missed" title="Missed Calls" icon="PhoneMissed" />,
  'calls-duration-avg': () => <DynamicWidget widgetKey="calls-duration-avg" title="Avg Duration" icon="Clock" />,

  // --- REPORTING (Conversations) ---
  'conversations-total': () => <DynamicWidget widgetKey="conversations-total" title="Total Conversations" icon="MessageSquare" />,
  'conversations-new': () => <DynamicWidget widgetKey="conversations-new" title="New Conversations" icon="MessageCircle" />,
  'conversations-open': () => <DynamicWidget widgetKey="conversations-open" title="Open Conversations" icon="MessageSquare" />,
  'conversations-response-time-avg': () => <DynamicWidget widgetKey="conversations-response-time-avg" title="Avg Response Time" icon="Clock" />,

  // --- ANALYTICS ---
  'analytics-global-funnel-conversion': () => <DynamicWidget widgetKey="analytics-global-funnel-conversion" title="Funnel Conversion" icon="Filter" />,
  'analytics-acquisition-cost': () => <DynamicWidget widgetKey="analytics-acquisition-cost" title="Acquisition Cost" icon="DollarSign" />,
  'analytics-revenue-forecast': () => <DynamicWidget widgetKey="analytics-revenue-forecast" title="Revenue Forecast" icon="TrendingUp" />,
  'analytics-revenue-per-lead': () => <DynamicWidget widgetKey="analytics-revenue-per-lead" title="Rev per Lead" icon="DollarSign" />,
  'analytics-revenue-per-job': () => <DynamicWidget widgetKey="analytics-revenue-per-job" title="Rev per Job" icon="DollarSign" />,
  'analytics-customer-lifetime-value': () => <DynamicWidget widgetKey="analytics-customer-lifetime-value" title="Lifetime Value" icon="UserCheck" />,
  'analytics-cost-per-acquisition': () => <DynamicWidget widgetKey="analytics-cost-per-acquisition" title="CPA" icon="DollarSign" />,

  // --- AI & INSIGHTS ---
  'ai-latest-insight': () => <AIInsightWidget />,

  // --- STATIC / COMPLEX WIDGETS ---
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
          {/* Mock content preserverd */}
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Follow up with ABC Roofing</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Due today</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};
