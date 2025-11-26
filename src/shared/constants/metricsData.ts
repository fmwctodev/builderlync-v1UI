export interface MetricWidget {
  id: string;
  label: string;
  description?: string;
  dashboardEnabled?: boolean;
  reportingEnabled?: boolean;
  defaultVisible?: boolean;
}

export interface MetricCategory {
  id: string;
  label: string;
  count: number;
  hasInfo?: boolean;
  dashboardCategory?: string;
  widgets: MetricWidget[];
}

export const METRICS_CATEGORIES: MetricCategory[] = [
  {
    id: 'jobs',
    label: 'Jobs',
    count: 15,
    dashboardCategory: 'jobs',
    widgets: [
      { id: 'jobs-total', label: 'Total Jobs', description: 'Total number of jobs in the system', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'jobs-created', label: 'Jobs Created', description: 'New jobs created in date range', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'jobs-completed', label: 'Jobs Completed', description: 'Successfully completed jobs', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'jobs-in-progress', label: 'Jobs In Progress', description: 'Currently active jobs', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-scheduled', label: 'Jobs Scheduled', description: 'Jobs scheduled for future dates', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-lost', label: 'Jobs Lost', description: 'Jobs that were lost or cancelled', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-won', label: 'Jobs Won', description: 'Successfully won jobs', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-cancelled', label: 'Jobs Cancelled', description: 'Cancelled jobs', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-by-stage', label: 'Jobs by Stage', description: 'Jobs breakdown by pipeline stage', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-avg-value', label: 'Average Job Value', description: 'Average monetary value per job', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'jobs-total-value', label: 'Total Job Value', description: 'Total value of all jobs', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'jobs-materials-ordered', label: 'Materials Ordered Jobs', description: 'Jobs with materials ordered', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-started', label: 'Jobs Started', description: 'Jobs that have been started', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-awaiting-invoice', label: 'Jobs Awaiting Invoice', description: 'Jobs pending invoice creation', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'jobs-invoiced', label: 'Jobs Invoiced', description: 'Jobs that have been invoiced', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'appointments',
    label: 'Appointments',
    count: 15,
    dashboardCategory: 'appointments',
    widgets: [
      { id: 'appointments-total', label: 'Total Appointments', description: 'Total appointments in date range', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'appointments-booked', label: 'Appointments Booked', description: 'Newly booked appointments', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'appointments-completed', label: 'Appointments Completed', description: 'Completed appointments', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-no-show', label: 'Appointments No-Show', description: 'No-show appointments', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-conversion-rate', label: 'Appointment Conversion Rate', description: 'Percentage of appointments that convert', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'appointments-source-breakdown', label: 'Appointment Source Breakdown', description: 'Appointments by source', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-type-breakdown', label: 'Appointment Type Breakdown', description: 'Appointments by type', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-cancellations', label: 'Appointment Cancellations', description: 'Cancelled appointments', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-first-time', label: 'First-Time Appointments', description: 'First appointments with new customers', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-repeat', label: 'Repeat Appointments', description: 'Appointments with returning customers', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-avg-time-to-first', label: 'Avg Time to First Appointment', description: 'Average time from lead to first appointment', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-per-sales-rep', label: 'Appointments per Sales Rep', description: 'Appointments by sales representative', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-per-lead-source', label: 'Appointments per Lead Source', description: 'Appointments by lead source', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-daily-trend', label: 'Daily Appointment Trend', description: 'Appointment trends over time', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'appointments-pipeline-flow', label: 'Appointment Pipeline Flow', description: 'Appointment flow through pipeline', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    count: 17,
    dashboardCategory: 'opportunities',
    widgets: [
      { id: 'opportunities-total', label: 'Total Opportunities', description: 'Total opportunities in pipeline', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'opportunities-new', label: 'New Opportunities', description: 'Newly created opportunities', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'opportunities-by-stage', label: 'Opportunities by Stage', description: 'Opportunities breakdown by stage', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-closed-won', label: 'Closed Won', description: 'Successfully closed opportunities', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'opportunities-closed-lost', label: 'Closed Lost', description: 'Lost opportunities', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-pipeline-value', label: 'Pipeline Value', description: 'Total value of open opportunities', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'opportunities-avg-deal-size', label: 'Average Deal Size', description: 'Average opportunity value', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-conversion-rate', label: 'Opportunity Conversion Rate', description: 'Win rate percentage', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'opportunities-by-source', label: 'Opportunities by Source', description: 'Opportunities by lead source', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-by-rep', label: 'Opportunities by Rep', description: 'Opportunities by sales rep', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-created-per-day', label: 'Opportunities Created per Day', description: 'Daily opportunity creation trend', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-requiring-follow-up', label: 'Opportunities Requiring Follow-Up', description: 'Opportunities needing attention', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-overdue', label: 'Overdue Opportunities', description: 'Opportunities past expected close date', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-conversion-velocity', label: 'Conversion Velocity (Days to Close)', description: 'Average days to close deals', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-win-rate', label: 'Opportunity Win Rate', description: 'Percentage of won opportunities', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-lost-reason', label: 'Lost Reason Breakdown', description: 'Reasons for lost opportunities', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'opportunities-weighted-pipeline', label: 'Weighted Pipeline Value', description: 'Pipeline value weighted by probability', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'visitor-data',
    label: 'Visitor Data',
    count: 13,
    dashboardCategory: 'marketing',
    widgets: [
      { id: 'visitor-total', label: 'Total Website Visitors', description: 'Total website visitors', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'visitor-unique', label: 'Unique Visitors', description: 'Unique visitor count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'visitor-returning', label: 'Returning Visitors', description: 'Returning visitor count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-page-views', label: 'Page Views', description: 'Total page views', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-avg-session-duration', label: 'Avg Session Duration', description: 'Average time on site', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-bounce-rate', label: 'Bounce Rate', description: 'Percentage of single-page visits', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-form-submissions', label: 'Form Submissions', description: 'Total form submissions', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'visitor-chat-conversations', label: 'Chat Widget Conversations', description: 'Chat conversations initiated', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-click-to-call', label: 'Click-to-Call Events', description: 'Click-to-call interactions', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-lead-conversion-rate', label: 'Lead Conversion Rate', description: 'Visitor to lead conversion rate', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'visitor-utm-source-breakdown', label: 'UTM Source Breakdown', description: 'Traffic by UTM source', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-traffic-by-device', label: 'Traffic by Device', description: 'Traffic by device type', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'visitor-traffic-by-time', label: 'Traffic by Time of Day', description: 'Traffic patterns by time', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'emails',
    label: 'Emails',
    count: 11,
    dashboardCategory: 'marketing',
    widgets: [
      { id: 'emails-sent', label: 'Emails Sent', description: 'Total emails sent', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'emails-delivered', label: 'Emails Delivered', description: 'Successfully delivered emails', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'emails-opens', label: 'Email Opens', description: 'Total email opens', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'emails-open-rate', label: 'Email Open Rate', description: 'Percentage of emails opened', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'emails-click-rate', label: 'Email Click Rate', description: 'Percentage of emails clicked', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'emails-replies', label: 'Email Replies', description: 'Email replies received', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'emails-bounces', label: 'Email Bounces', description: 'Bounced emails', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'emails-unsubscribes', label: 'Email Unsubscribes', description: 'Unsubscribe count', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'emails-automation-triggers', label: 'Email Automation Triggers', description: 'Automated email triggers', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'emails-by-campaign', label: 'Emails by Campaign', description: 'Email performance by campaign', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'emails-performance-score', label: 'Email Performance Score', description: 'Overall email performance score', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'calls',
    label: 'Calls',
    count: 13,
    dashboardCategory: 'reporting',
    widgets: [
      { id: 'calls-total', label: 'Total Calls', description: 'Total call volume', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'calls-outbound', label: 'Outbound Calls', description: 'Outbound call count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-inbound', label: 'Inbound Calls', description: 'Inbound call count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-missed', label: 'Missed Calls', description: 'Missed call count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'calls-answered', label: 'Answered Calls', description: 'Answered call count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-voicemails', label: 'Voicemails', description: 'Voicemail count', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-duration-avg', label: 'Call Duration Avg', description: 'Average call duration', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-by-rep', label: 'Calls by Rep', description: 'Calls by representative', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-by-source', label: 'Calls by Source', description: 'Calls by source', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-first-call-resolution', label: 'First-Call Resolution', description: 'Issues resolved on first call', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-conversion-to-appointment', label: 'Call Conversion to Appointment', description: 'Calls that result in appointments', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-caller-id-breakdown', label: 'Caller ID Breakdown', description: 'Calls by caller ID', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'calls-outcomes', label: 'Call Outcomes', description: 'Call outcome distribution', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'conversations',
    label: 'Conversations',
    count: 12,
    dashboardCategory: 'reporting',
    widgets: [
      { id: 'conversations-total', label: 'Total Conversations', description: 'Total conversation count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'conversations-new', label: 'New Conversations', description: 'New conversations started', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'conversations-open', label: 'Open Conversations', description: 'Currently open conversations', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'conversations-closed', label: 'Closed Conversations', description: 'Closed conversations', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'conversations-response-time-avg', label: 'Response Time Avg', description: 'Average response time', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'conversations-first-reply-time', label: 'First Reply Time', description: 'Average first reply time', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'conversations-channel-breakdown', label: 'Conversation Channel Breakdown', description: 'Conversations by channel', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'conversations-sms-sent', label: 'SMS Sent', description: 'SMS messages sent', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'conversations-sms-delivered', label: 'SMS Delivered', description: 'SMS messages delivered', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'conversations-sms-replies', label: 'SMS Replies', description: 'SMS replies received', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'conversations-chatbot-interactions', label: 'Chatbot Interactions', description: 'Chatbot conversation count', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'conversations-to-lead-conversion', label: 'Conversation-to-Lead Conversion', description: 'Conversations that become leads', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    count: 17,
    dashboardCategory: 'payments',
    widgets: [
      { id: 'payments-total-collected', label: 'Total Payments Collected', description: 'Total revenue collected', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'payments-pending', label: 'Pending Payments', description: 'Payments pending', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'payments-overdue', label: 'Overdue Payments', description: 'Overdue payment amount', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'payments-failed', label: 'Failed Payments', description: 'Failed payment count', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-partial', label: 'Partial Payments', description: 'Partial payment count', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-avg-value', label: 'Avg Payment Value', description: 'Average payment amount', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-methods-used', label: 'Payment Methods Used', description: 'Payment methods breakdown', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-total-invoiced', label: 'Total Invoiced Amount', description: 'Total amount invoiced', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'payments-outstanding-invoice', label: 'Outstanding Invoice Total', description: 'Outstanding invoice amount', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'payments-collection-rate', label: 'Payment Collection Rate', description: 'Percentage of payments collected', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-refunds-issued', label: 'Refunds Issued', description: 'Total refund amount', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-deposits-collected', label: 'Deposits Collected', description: 'Total deposit amount', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-by-job', label: 'Payment by Job', description: 'Payments by job', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-by-sales-rep', label: 'Payment by Sales Rep', description: 'Payments by sales rep', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-by-customer', label: 'Payment by Customer', description: 'Payments by customer', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-timing', label: 'Payment Timing (Days to Pay)', description: 'Average days to payment', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'payments-trend-line', label: 'Payment Trend Line', description: 'Payment trends over time', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'meta-ads',
    label: 'Meta Ads',
    count: 16,
    dashboardCategory: 'marketing',
    widgets: [
      { id: 'meta-ads-total-spend', label: 'Total Spend', description: 'Total ad spend', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'meta-ads-impressions', label: 'Impressions', description: 'Total ad impressions', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'meta-ads-clicks', label: 'Clicks', description: 'Total ad clicks', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'meta-ads-ctr', label: 'CTR', description: 'Click-through rate', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'meta-ads-cpc', label: 'CPC', description: 'Cost per click', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-cpm', label: 'CPM', description: 'Cost per thousand impressions', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-leads-generated', label: 'Leads Generated', description: 'Leads from ads', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'meta-ads-cost-per-lead', label: 'Cost per Lead', description: 'Cost per lead generated', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'meta-ads-cost-per-appointment', label: 'Cost per Appointment', description: 'Cost per appointment booked', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-frequency', label: 'Ad Frequency', description: 'Average ad frequency', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-landing-page-conversion', label: 'Landing Page Conversion Rate', description: 'Landing page conversion rate', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-form-completion', label: 'Form Completion Rate', description: 'Ad form completion rate', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-by-campaign', label: 'Ads by Campaign', description: 'Performance by campaign', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-best-performing-creative', label: 'Best Performing Creative', description: 'Top performing ad creative', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-roas', label: 'ROAS', description: 'Return on ad spend', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'meta-ads-lead-quality-score', label: 'Lead Quality Score', description: 'Quality score of leads from ads', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'general',
    label: 'General',
    count: 14,
    hasInfo: true,
    dashboardCategory: 'reporting',
    widgets: [
      { id: 'general-total-contacts', label: 'Total Contacts', description: 'Total contacts in system', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'general-new-contacts', label: 'New Contacts', description: 'New contacts added', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'general-duplicate-contacts', label: 'Duplicate Contacts', description: 'Duplicate contact count', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'general-contact-source-breakdown', label: 'Contact Source Breakdown', description: 'Contacts by source', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'general-new-leads', label: 'New Leads', description: 'New leads generated', dashboardEnabled: true, reportingEnabled: true, defaultVisible: true },
      { id: 'general-lead-to-opportunity-rate', label: 'Lead-to-Opportunity Rate', description: 'Lead conversion rate', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'general-crm-activity-count', label: 'CRM Activity Count', description: 'Total CRM activities', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'general-tasks-created', label: 'Tasks Created', description: 'New tasks created', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'general-tasks-completed', label: 'Tasks Completed', description: 'Tasks completed', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'general-reminders-overdue', label: 'Reminders Overdue', description: 'Overdue reminders', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'general-automations-triggered', label: 'Automations Triggered', description: 'Automation trigger count', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'general-users-active', label: 'Users Active', description: 'Active user count', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'general-team-performance-overview', label: 'Team Performance Overview', description: 'Overall team performance', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'general-system-health-metrics', label: 'System Health Metrics', description: 'System health indicators', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    count: 18,
    dashboardCategory: 'reporting',
    widgets: [
      { id: 'analytics-global-funnel-conversion', label: 'Global Funnel Conversion Rate', description: 'Overall funnel conversion', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-acquisition-cost', label: 'Acquisition Cost Across Channels', description: 'Cost to acquire customers', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-channel-performance', label: 'Channel Performance Comparison', description: 'Performance by channel', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-lead-velocity-rate', label: 'Lead Velocity Rate', description: 'Rate of lead growth', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-revenue-forecast', label: 'Revenue Forecast', description: 'Projected revenue', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-revenue-per-lead', label: 'Revenue per Lead', description: 'Average revenue per lead', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-revenue-per-job', label: 'Revenue per Job', description: 'Average revenue per job', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-lost-revenue', label: 'Lost Revenue (Job Losses)', description: 'Revenue from lost jobs', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-follow-up-performance', label: 'Follow-Up Performance', description: 'Follow-up effectiveness', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-automations-performance', label: 'Automations Performance Score', description: 'Automation effectiveness', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-attribution-model', label: 'Attribution Model Breakdown', description: 'Attribution analysis', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-heatmap-time-of-day', label: 'Heatmap by Time of Day', description: 'Activity by time of day', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-heatmap-weekday', label: 'Heatmap by Weekday', description: 'Activity by day of week', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-ga4-data-imports', label: 'GA4 Data Imports', description: 'Google Analytics data', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-cross-channel-roi', label: 'Cross-Channel ROI', description: 'ROI across channels', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-multi-touch-attribution', label: 'Multi-Touch Attribution', description: 'Multi-touch attribution model', dashboardEnabled: false, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-customer-lifetime-value', label: 'Customer Lifetime Value', description: 'Average customer lifetime value', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
      { id: 'analytics-cost-per-acquisition', label: 'Cost per Acquisition', description: 'Cost to acquire customer', dashboardEnabled: true, reportingEnabled: true, defaultVisible: false },
    ],
  },
];

export function getMetricsForDashboard(): MetricCategory[] {
  return METRICS_CATEGORIES.map(category => ({
    ...category,
    widgets: category.widgets.filter(w => w.dashboardEnabled)
  })).filter(category => category.widgets.length > 0);
}

export function getMetricsForReporting(): MetricCategory[] {
  return METRICS_CATEGORIES.map(category => ({
    ...category,
    widgets: category.widgets.filter(w => w.reportingEnabled)
  }));
}

export function getDefaultDashboardWidgets(): string[] {
  const defaultWidgets: string[] = [];
  METRICS_CATEGORIES.forEach(category => {
    category.widgets.forEach(widget => {
      if (widget.dashboardEnabled && widget.defaultVisible) {
        defaultWidgets.push(widget.id);
      }
    });
  });
  return defaultWidgets;
}
