export type ReportScope = 'my' | 'team' | 'org';
export type ReportCategory = 'sales' | 'marketing' | 'ops' | 'reputation' | 'finance' | 'projects' | 'custom';
export type AIReportStatus = 'running' | 'complete' | 'failed';

export interface ReportPlanTimeframe {
  preset?: string;
  start: string;
  end: string;
}

export interface ReportPlanDataSource {
  module: string;
  entities: string[];
  fields: string[];
}

export interface ReportPlanAggregation {
  metric: string;
  operation: string;
  field: string;
  filters?: Array<{ field: string; op: string; value: string | number | boolean }>;
}

export interface ReportPlanGroupBy {
  name: string;
  field: string;
  metric: string;
  limit?: number;
}

export interface ReportPlanChart {
  chart_id: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  series: Array<{ label: string; metric: string }>;
  x: string;
}

export interface ReportPlanTable {
  table_id: string;
  type: 'summary' | 'breakdown';
  columns: string[];
  limit?: number;
}

export interface ReportPlan {
  type: 'report_plan';
  report_name: string;
  report_category: ReportCategory;
  scope: ReportScope;
  timeframe: ReportPlanTimeframe;
  data_sources: ReportPlanDataSource[];
  aggregations: ReportPlanAggregation[];
  group_bys: ReportPlanGroupBy[];
  charts: ReportPlanChart[];
  tables: ReportPlanTable[];
  privacy_rules: {
    no_raw_rows: boolean;
    top_n_only: boolean;
    max_groups: number;
  };
}

export interface ReportComposeKPI {
  label: string;
  value: number | string;
  delta_pct?: number | null;
  trend?: 'up' | 'down' | 'flat';
  format?: 'number' | 'currency' | 'percentage';
}

export interface ReportComposeChart {
  chart_id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  config: Record<string, unknown>;
  data: Array<Record<string, unknown>>;
}

export interface ReportComposeTable {
  table_id: string;
  title: string;
  columns: Array<{ key: string; label: string; format?: string }>;
  rows: Array<Record<string, unknown>>;
}

export interface DashboardCard {
  card_id: string;
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'flat';
  delta_pct?: number | null;
  category?: ReportCategory;
  module_links?: string[];
  reportId?: string;
}

export interface ReportCompose {
  type: 'report_compose';
  title: string;
  executive_summary: string;
  kpis: ReportComposeKPI[];
  charts: ReportComposeChart[];
  tables: ReportComposeTable[];
  insights: string[];
  recommendations: string[];
  dashboard_cards: DashboardCard[];
}

export interface AIReport {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  scope: ReportScope;
  report_category: ReportCategory;
  report_name: string;
  timeframe_start: string | null;
  timeframe_end: string | null;
  status: AIReportStatus;
  plan_json: ReportPlan | null;
  result_json: ReportCompose | null;
  rendered_html: string | null;
  csv_data: string | null;
  parent_report_id: string | null;
  prompt: string;
  data_sources_used: string[];
  filters_applied: Record<string, unknown>;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  delete_at: string | null;
  created_by_user?: { id: string; email: string; full_name?: string };
  children?: AIReport[];
}

export interface AIReportSchedule {
  id: string;
  organization_id: string;
  user_id: string;
  report_plan_template_json: Record<string, unknown>;
  original_report_id: string | null;
  cadence_days: number;
  next_run_at: string;
  last_run_at: string | null;
  is_active: boolean;
  report_name_template: string;
  scope: ReportScope;
  prompt_template: string;
  created_at: string;
  updated_at: string;
  user?: { id: string; email: string; full_name?: string };
  original_report?: AIReport;
}

export interface AIReportFilters {
  category?: ReportCategory;
  scope?: ReportScope;
  status?: AIReportStatus;
  search?: string;
}

export interface AIReportStats {
  totalReports: number;
  runningReports: number;
  scheduledReports: number;
  lastGeneratedDate: string | null;
}

export interface GenerateReportRequest {
  prompt: string;
  scope: ReportScope;
  timeframe: {
    type: 'preset' | 'custom';
    preset?: string;
    customStart?: string;
    customEnd?: string;
  };
  parent_report_id?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  report_id: string;
  report?: AIReport;
  error?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  reportId?: string;
  report?: AIReport;
  isLoading?: boolean;
}

export const SUGGESTED_PROMPTS = [
  'Sales performance report for last 30 days',
  'Revenue breakdown by source this quarter',
  'Outstanding invoices and overdue payments',
  'Contact acquisition trends this month',
  'Task completion rates by team member',
  'Appointment show rate analysis',
  'Marketing form conversion funnel',
  'Customer review sentiment summary',
  'Pipeline health and deal velocity',
  'AI agent usage and performance metrics',
];

export const TIMEFRAME_OPTIONS = [
  { value: 'last_7_days',  label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month',   label: 'This Month' },
  { value: 'last_month',   label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year',    label: 'This Year' },
];

export const SCOPE_OPTIONS = [
  { value: 'my',   label: 'My Data' },
  { value: 'team', label: 'Team Data' },
  { value: 'org',  label: 'Organization Data' },
];

export const CADENCE_OPTIONS = [
  { value: 7,  label: 'Every 7 days' },
  { value: 14, label: 'Every 14 days' },
  { value: 30, label: 'Every 30 days' },
  { value: 60, label: 'Every 60 days' },
  { value: 90, label: 'Every 90 days' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  sales:      'Sales',
  marketing:  'Marketing',
  ops:        'Operations',
  reputation: 'Reputation',
  finance:    'Finance',
  projects:   'Projects',
  custom:     'Custom',
};

export const CHART_COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
  '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6',
];

export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  complete: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Complete' },
  running:  { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20',    label: 'Running' },
  failed:   { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',     label: 'Failed' },
};

export function getScopeLabel(scope: string): string {
  const option = SCOPE_OPTIONS.find(o => o.value === scope);
  return option ? option.label : scope;
}

export function getReportCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}
