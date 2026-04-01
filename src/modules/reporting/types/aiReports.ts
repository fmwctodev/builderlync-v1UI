// src/modules/reporting/types/aiReports.ts

export type ReportStatus = 'running' | 'complete' | 'failed';
export type ReportScope = 'my' | 'team' | 'org';

export interface AIReport {
  id: string;
  organization_id: string;
  created_by_user_id?: string;
  report_name: string;
  prompt?: string;
  report_category?: string;
  scope: ReportScope;
  timeframe: any;
  status: ReportStatus;
  result_json?: ReportResult;
  error_message?: string;
  download_url?: string;
  parent_report_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportResult {
  executive_summary?: string;
  kpis?: ReportKPI[];
  charts?: ReportChartConfig[];
  tables?: ReportTableConfig[];
}

export interface ReportKPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export interface ReportChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  series: { key: string; name: string; color?: string }[];
}

export interface ReportTableConfig {
  id: string;
  title: string;
  columns: { key: string; header: string; type?: 'string' | 'number' | 'currency' }[];
  data: any[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  reportId?: string;
  report?: AIReport;
}

export interface GenerateReportRequest {
  prompt: string;
  scope: ReportScope;
  timeframe: {
    type: 'preset' | 'custom';
    preset?: string;
    start?: string;
    end?: string;
  };
  parent_report_id?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  report_id: string;
  error?: string;
}

export interface AIReportFilters {
  category?: string;
  scope?: ReportScope;
  status?: ReportStatus;
  search?: string;
}

export const SUGGESTED_PROMPTS = [
  "Analyze our sales growth over the last 6 months",
  "Show me which lead sources have the best conversion rate",
  "Compare job performance between different teams",
  "Generate an executive summary of our Q1 revenue",
  "Analyze invoice payment delays by customer",
  "Provide a breakdown of task completion times"
];

export const TIMEFRAME_OPTIONS = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'last_90_days', label: 'Last 90 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
];

export const SCOPE_OPTIONS = [
  { value: 'my', label: 'My Data Only' },
  { value: 'team', label: 'My Team' },
  { value: 'org', label: 'Organization-wide' }
];

export const CATEGORY_LABELS: Record<string, string> = {
  sales: 'Sales Performance',
  operations: 'Operational Efficiency',
  financial: 'Financial Health',
  crm: 'Customer Insights',
  custom: 'Custom Report'
};

export const STATUS_STYLES: Record<ReportStatus, { bg: string; text: string; label: string }> = {
  running: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Analyzing...' },
  complete: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Complete' },
  failed: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', label: 'Failed' },
};

