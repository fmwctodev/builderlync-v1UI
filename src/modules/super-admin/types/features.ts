export type FeatureStatus = 'off' | 'beta' | 'on';
export type RolloutStrategy = 'all' | 'beta' | 'percentage' | 'accounts';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  status: FeatureStatus;
  rollout_type: RolloutStrategy;
  rollout_config: {
    percentage?: number;
    accountIds?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface FeatureOverride {
  id: string;
  feature_key: string;
  account_id: string;
  value: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  account?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
}

export interface FeatureMetadata {
  id: string;
  feature_key: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type TemplateType = 'pipeline' | 'automation' | 'dashboard';

export interface DefaultTemplate {
  id: string;
  key: string;
  type: TemplateType;
  label: string;
  description?: string | null;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureWithStats extends FeatureFlag {
  override_count?: number;
  enabled_accounts?: number;
}

export interface ResolutionInput {
  feature: FeatureFlag;
  accountId: string | null;
  isInternalUser: boolean;
  isBetaAccount: boolean;
  overrides: FeatureOverride[];
}
