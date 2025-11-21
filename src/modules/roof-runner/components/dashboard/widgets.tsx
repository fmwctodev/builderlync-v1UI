import React from 'react';
import DashboardWidgetCard from './DashboardWidgetCard';

export const WidgetComponents: Record<string, React.FC> = {
  jobs_count: () => (
    <DashboardWidgetCard
      title="Jobs"
      value={23}
      subtitle="Active jobs"
      icon="Briefcase"
    />
  ),

  revenue_total: () => (
    <DashboardWidgetCard
      title="Revenue"
      value="$12,450"
      subtitle="This mont"
      icon="DollarSign"
      trend={{ value: 12, isPositive: true }}
    />
  ),

  opportunities_pipeline: () => (
    <DashboardWidgetCard
      title="Opportunities"
      value="$45,230"
      subtitle="Pipeline value"
      icon="Target"
    />
  ),

  contacts_total: () => (
    <DashboardWidgetCard
      title="Contacts"
      value={1247}
      subtitle="Total contacts"
      icon="Users"
    />
  ),

  customer_acquisition_cost: () => (
    <DashboardWidgetCard
      title="Customer Acquisition Cost"
      value="$333"
      subtitle="Per closed job"
      icon="TrendingUp"
    />
  ),

  average_job_cost: () => (
    <DashboardWidgetCard
      title="Average Job Cost"
      value="$8,750"
      subtitle="Last 30 days"
      icon="DollarSign"
    />
  ),

  lead_conversion_rate: () => (
    <DashboardWidgetCard
      title="Lead Conversion"
      value="18.5%"
      subtitle="Leads to jobs"
      icon="Percent"
    />
  ),

  marketing_roi: () => (
    <DashboardWidgetCard
      title="Marketing ROI"
      value="4.2x"
      subtitle="Return on ad spend"
      icon="TrendingUp"
      trend={{ value: 8, isPositive: true }}
    />
  ),

  campaign_performance: () => (
    <DashboardWidgetCard
      title="Campaign Performance"
      value="87%"
      subtitle="Avg. campaign success rate"
      icon="BarChart3"
    />
  ),

  ad_spend: () => (
    <DashboardWidgetCard
      title="Ad Spend"
      value="$3,450"
      subtitle="This month"
      icon="CreditCard"
    />
  ),

  lead_sources: () => (
    <DashboardWidgetCard
      title="Lead Sources"
      value={8}
      subtitle="Active channels"
      icon="Users"
    />
  ),

  website_traffic: () => (
    <DashboardWidgetCard
      title="Website Traffic"
      value="12.5K"
      subtitle="Visitors this month"
      icon="Globe"
    />
  ),

  active_jobs: () => (
    <DashboardWidgetCard
      title="Active Jobs"
      value={15}
      subtitle="In progress"
      icon="Briefcase"
    />
  ),

  completed_jobs: () => (
    <DashboardWidgetCard
      title="Completed Jobs"
      value={8}
      subtitle="This month"
      icon="CheckCircle"
    />
  ),

  jobs_by_status: () => (
    <DashboardWidgetCard
      title="Jobs by Status"
      value="5/15/3"
      subtitle="New/Active/Completed"
      icon="PieChart"
    />
  ),

  jobs_timeline: () => (
    <DashboardWidgetCard
      title="Upcoming Milestones"
      value={7}
      subtitle="Next 7 days"
      icon="Calendar"
    />
  ),

  opportunities_by_stage: () => (
    <DashboardWidgetCard
      title="Opportunities by Stage"
      value={12}
      subtitle="Across all stages"
      icon="Layers"
    />
  ),

  win_rate: () => (
    <DashboardWidgetCard
      title="Win Rate"
      value="32%"
      subtitle="Closed opportunities"
      icon="Award"
    />
  ),

  average_deal_size: () => (
    <DashboardWidgetCard
      title="Average Deal Size"
      value="$15,500"
      subtitle="Per opportunity"
      icon="DollarSign"
    />
  ),

  opportunities_forecast: () => (
    <DashboardWidgetCard
      title="Revenue Forecast"
      value="$125K"
      subtitle="Expected this quarter"
      icon="TrendingUp"
    />
  ),

  pending_payments: () => (
    <DashboardWidgetCard
      title="Pending Payments"
      value="$8,200"
      subtitle="Awaiting payment"
      icon="Clock"
    />
  ),

  revenue_by_period: () => (
    <DashboardWidgetCard
      title="Revenue Trend"
      value="$45K"
      subtitle="Last 30 days"
      icon="BarChart"
    />
  ),

  outstanding_invoices: () => (
    <DashboardWidgetCard
      title="Outstanding Invoices"
      value={5}
      subtitle="Unpaid invoices"
      icon="FileText"
    />
  ),

  payment_methods: () => (
    <DashboardWidgetCard
      title="Payment Methods"
      value="3"
      subtitle="Active methods"
      icon="CreditCard"
    />
  ),

  upcoming_appointments: () => (
    <DashboardWidgetCard
      title="Upcoming Appointments"
      value={12}
      subtitle="Next 7 days"
      icon="Calendar"
    />
  ),

  appointment_types: () => (
    <DashboardWidgetCard
      title="Appointment Types"
      value={4}
      subtitle="Different types"
      icon="PieChart"
    />
  ),

  appointment_completion: () => (
    <DashboardWidgetCard
      title="Completion Rate"
      value="92%"
      subtitle="Appointments completed"
      icon="CheckCircle"
    />
  ),

  today_appointments: () => (
    <DashboardWidgetCard
      title="Today's Appointments"
      value={3}
      subtitle="Scheduled for today"
      icon="CalendarDays"
    />
  ),

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
