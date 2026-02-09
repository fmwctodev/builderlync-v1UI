export interface UsageLimits {
  sms?: number;
  mms?: number;
  call_minutes?: number;
  ai_minutes?: number;
  emails_sent?: number;
  storage_gb?: number;
  contacts?: number;
  jobs_created?: number;
}

export interface AccountUsageMonthly {
  id: string;
  account_id: string;
  period: string;
  sms_count: number;
  mms_count: number;
  call_minutes: number;
  ai_minutes: number;
  emails_sent: number;
  storage_gb: number;
  contacts?: number;
  jobs_created?: number;
  last_updated_at?: string;
  created_at: string;
}

export interface UsageWithAccount extends AccountUsageMonthly {
  account?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
}

export interface EffectiveUsageRow {
  accountId: string;
  accountName: string;
  accountStatus: string;
  planName: string;
  month: string;
  usage: UsageLimits;
  planLimits: UsageLimits;
  overrideLimits: UsageLimits | null;
  effectiveLimits: UsageLimits;
}

export type UsageStatus = 'normal' | 'approaching' | 'over';

export interface UsageMetricConfig {
  key: keyof UsageLimits;
  label: string;
  unit: string;
  icon: string;
  description: string;
}

export interface LimitOverride {
  id: string;
  account_id: string;
  limits: UsageLimits;
  notes?: string;
  created_at: string;
  updated_at: string;
}
