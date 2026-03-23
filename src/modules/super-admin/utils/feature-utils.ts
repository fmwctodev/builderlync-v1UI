import { FeatureStatus, RolloutStrategy, FeatureFlag } from '../types/features';

export function slugifyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function validateFeatureKey(key: string): boolean {
  return /^[a-z0-9_]+$/.test(key);
}

export function getStatusColor(status: FeatureStatus): string {
  switch (status) {
    case 'on':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'beta':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'off':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getRolloutStrategyLabel(strategy: RolloutStrategy): string {
  switch (strategy) {
    case 'all':
      return 'All Users';
    case 'beta':
      return 'Beta Accounts';
    case 'percentage':
      return 'Percentage Rollout';
    case 'accounts':
      return 'Specific Accounts';
    default:
      return strategy;
  }
}

export function getRolloutStrategyColor(strategy: RolloutStrategy): string {
  switch (strategy) {
    case 'all':
      return 'bg-red-100 text-red-800';
    case 'beta':
      return 'bg-cyan-100 text-cyan-800';
    case 'percentage':
      return 'bg-orange-100 text-orange-800';
    case 'accounts':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function formatRolloutSummary(feature: FeatureFlag): string {
  if (feature.status === 'off') {
    return 'This feature is currently disabled for all accounts.';
  }

  switch (feature.rollout_type) {
    case 'all':
      return 'This feature is available to all accounts.';
    case 'beta':
      return 'This feature is available to beta accounts only.';
    case 'percentage':
      const pct = feature.rollout_config?.percentage || 0;
      return `This feature is available to ${pct}% of accounts.`;
    case 'accounts':
      const count = feature.rollout_config?.accountIds?.length || 0;
      return `This feature is available to ${count} specific account(s).`;
    default:
      return 'Rollout configuration not set.';
  }
}

export function getTemplateTypeColor(type: string): string {
  switch (type) {
    case 'pipeline':
      return 'bg-red-100 text-red-800';
    case 'automation':
      return 'bg-green-100 text-green-800';
    case 'dashboard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function validateTemplateJSON(jsonString: string): { valid: boolean; error?: string; parsed?: any } {
  try {
    const parsed = JSON.parse(jsonString);
    return { valid: true, parsed };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

export function formatTemplateConfig(config: Record<string, any>): string {
  return JSON.stringify(config, null, 2);
}
