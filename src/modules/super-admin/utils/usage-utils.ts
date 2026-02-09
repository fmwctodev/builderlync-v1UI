import { UsageLimits, UsageStatus, UsageMetricConfig } from '../types/usage';

export const METRIC_CONFIG: Record<string, UsageMetricConfig> = {
  sms: {
    key: 'sms',
    label: 'SMS Messages',
    unit: 'messages',
    icon: 'MessageCircle',
    description: 'Text messages sent',
  },
  mms: {
    key: 'mms',
    label: 'MMS Messages',
    unit: 'messages',
    icon: 'Image',
    description: 'Multimedia messages sent',
  },
  call_minutes: {
    key: 'call_minutes',
    label: 'Call Minutes',
    unit: 'minutes',
    icon: 'PhoneCall',
    description: 'Total call duration',
  },
  ai_minutes: {
    key: 'ai_minutes',
    label: 'AI Minutes',
    unit: 'minutes',
    icon: 'Brain',
    description: 'AI processing time',
  },
  emails_sent: {
    key: 'emails_sent',
    label: 'Emails Sent',
    unit: 'emails',
    icon: 'Mail',
    description: 'Total emails sent',
  },
  storage_gb: {
    key: 'storage_gb',
    label: 'Storage',
    unit: 'GB',
    icon: 'HardDrive',
    description: 'Storage space used',
  },
  contacts: {
    key: 'contacts',
    label: 'Contacts',
    unit: 'contacts',
    icon: 'Users',
    description: 'Total contacts created',
  },
  jobs_created: {
    key: 'jobs_created',
    label: 'Jobs Created',
    unit: 'jobs',
    icon: 'Briefcase',
    description: 'Jobs created this period',
  },
};

export function calculateEffectiveLimits(
  planLimits: UsageLimits = {},
  overrides: UsageLimits = {}
): UsageLimits {
  const effective: UsageLimits = {};
  const allKeys = new Set([...Object.keys(planLimits), ...Object.keys(overrides)]);

  allKeys.forEach((key) => {
    const k = key as keyof UsageLimits;
    effective[k] = overrides[k] ?? planLimits[k];
  });

  return effective;
}

export function getUsagePercent(used: number, limit: number | undefined): number {
  if (limit === undefined || limit === 0) return 0;
  return Math.round((used / limit) * 100);
}

export function getUsageStatus(used: number, limit: number | undefined): UsageStatus {
  if (limit === undefined || limit === 0) return 'normal';
  const percent = (used / limit) * 100;
  if (percent >= 100) return 'over';
  if (percent >= 80) return 'approaching';
  return 'normal';
}

export function getUsageColor(status: UsageStatus): string {
  switch (status) {
    case 'over':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'approaching':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    default:
      return 'text-green-600 bg-green-50 border-green-200';
  }
}

export function getProgressBarColor(status: UsageStatus): string {
  switch (status) {
    case 'over':
      return 'bg-red-600';
    case 'approaching':
      return 'bg-amber-500';
    default:
      return 'bg-green-600';
  }
}

export function formatUsageValue(value: number, metric: keyof UsageLimits): string {
  if (metric === 'storage_gb') {
    return value.toFixed(2);
  }
  return value.toLocaleString();
}

export function formatLimit(limit: number | undefined): string {
  if (limit === undefined || limit === 0) return 'Unlimited';
  return limit.toLocaleString();
}

export function isApproachingLimit(used: number, limit: number | undefined, threshold = 0.8): boolean {
  if (limit === undefined || limit === 0) return false;
  return used / limit >= threshold && used / limit < 1;
}

export function isOverLimit(used: number, limit: number | undefined): boolean {
  if (limit === undefined || limit === 0) return false;
  return used >= limit;
}

export function hasAnyAlert(usage: UsageLimits, limits: UsageLimits): boolean {
  return Object.keys(usage).some((key) => {
    const k = key as keyof UsageLimits;
    const used = usage[k] || 0;
    const limit = limits[k];
    return isApproachingLimit(used, limit) || isOverLimit(used, limit);
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function formatMonthLabel(monthStr: string): string {
  const date = new Date(monthStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
