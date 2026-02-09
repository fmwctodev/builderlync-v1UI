export interface SuperAdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'operations' | 'support';
  name: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface SuperAdminSession {
  id: string;
  email: string;
  role: string;
  name: string;
  timestamp: number;
  expiresAt: number;
}

export interface EnterpriseAccount {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  status: 'trial' | 'active' | 'past_due' | 'suspended';
  plan: 'Starter' | 'Pro' | 'Enterprise';
  billingCycle: 'monthly' | 'annual';
  createdAt: string;
  renewalDate: string;
  seatsUsed: number;
  seatsLimit: number;
  mrr: number;
  arr: number;
  tags: string[];
  healthScore: number;
  lastLoginAt?: string;
  metadata?: Record<string, any>;
  provisioningStatus?: 'pending' | 'provisioning' | 'active' | 'failed';
  provisionedAt?: string;
  provisioningError?: string;
  organizationId?: string;
  ownerUserId?: string;
  ownerPlatformUserId?: string;
}

export interface AccountModule {
  id: string;
  accountId: string;
  moduleName: string;
  enabled: boolean;
  settings?: Record<string, any>;
  enabledAt?: string;
  enabledBy?: string;
}

export interface IntegrationConnection {
  id: string;
  accountId: string;
  provider: 'Twilio' | 'QuickBooks' | 'EagleView' | 'ABC' | 'SRS' | 'Beacon' | 'Google' | 'Microsoft';
  connected: boolean;
  status: 'healthy' | 'warning' | 'error' | 'disconnected';
  lastSyncAt?: string;
  connectedAt?: string;
  config?: Record<string, any>;
  errorMessage?: string;
}

export interface UsageTracking {
  id: string;
  accountId: string;
  period: string;
  smsCount: number;
  mmsCount: number;
  callMinutes: number;
  aiMinutes: number;
  emailsSent: number;
  storageGb: number;
}

export interface UsageLimits {
  id: string;
  accountId: string;
  smsLimit: number;
  callLimit: number;
  aiLimit: number;
  emailLimit: number;
  storageLimit: number;
  overrideReason?: string;
  overrideBy?: string;
  overrideUntil?: string;
}

export interface UsageSummary {
  accountId: string;
  accountName: string;
  plan: string;
  period: string;
  smsCount: number;
  mmsCount: number;
  callMinutes: number;
  aiMinutes: number;
  emailsSent: number;
  storageUsedGB: number;
  limits: UsageLimits;
  percentages: {
    sms: number;
    calls: number;
    ai: number;
    emails: number;
    storage: number;
  };
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  status: 'off' | 'beta' | 'on';
  rolloutType: 'all' | 'beta' | 'percentage' | 'accounts';
  rolloutConfig: {
    percentage?: number;
    accountIds?: string[];
  };
}

export interface PlanDefinition {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  description?: string;
  includedModules: string[];
  limits: {
    sms: number;
    callMinutes: number;
    aiMinutes: number;
    email: number;
    storage: number;
    seats: number;
  };
  displayOrder: number;
  active: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorType: 'super_admin' | 'account_admin' | 'system';
  actorId?: string;
  actorName: string;
  action: string;
  targetType: 'account' | 'user' | 'billing' | 'feature' | 'integration' | 'settings' | 'system';
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface BillingSnapshot {
  id: string;
  accountId: string;
  plan: string;
  priceMonthly: number;
  billingCycle: 'monthly' | 'annual';
  lastInvoiceDate?: string;
  lastInvoiceAmount?: number;
  nextBillingDate?: string;
  isPastDue: boolean;
  outstandingAmount: number;
}

export interface IntegrationHealth {
  id: string;
  provider: 'Twilio' | 'QuickBooks' | 'EagleView' | 'ABC' | 'SRS' | 'Beacon' | 'Email' | 'AI';
  status: 'healthy' | 'warning' | 'error';
  lastCheckAt: string;
  lastIncidentAt?: string;
  message?: string;
  affectedAccounts: number;
  metadata?: Record<string, any>;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  accountId?: string;
  accountName?: string;
  subject: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'closed';
  assignedTo?: string;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NpsFeedback {
  id: string;
  accountId?: string;
  accountName?: string;
  score: number;
  comment?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  followedUp: boolean;
  createdAt: string;
}

export interface DashboardKPI {
  label: string;
  value: number | string;
  trend?: number;
  trendDirection?: 'up' | 'down';
  icon?: string;
}

export interface AccountFilters {
  search?: string;
  status?: string;
  plan?: string;
  tags?: string[];
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  accountId?: string;
  lastLogin?: string;
}

export interface AuditFilters {
  dateFrom?: string;
  dateTo?: string;
  actorType?: string;
  actor?: string;
  actionType?: string;
  targetType?: string;
}

export type UserStatus = 'active' | 'invited' | 'disabled';
export type RoleScope = 'global' | 'account';
export type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

export type RolePermissions = {
  [moduleKey: string]: PermissionLevel;
};

export interface AccountSummary {
  id: string;
  name: string;
  status: string;
  plan: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  scope: RoleScope;
  account_id?: string | null;
  is_default: boolean;
  permissions: RolePermissions;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  full_name?: string | null;
  status: UserStatus;
  last_login_at?: string | null;
  created_at: string;
  updated_at?: string;
  account_id: string;
  account?: AccountSummary;
  role_id?: string | null;
  role?: Role;
  invited_at?: string | null;
  invited_by?: string | null;
  metadata?: Record<string, any>;
}

export * from './billing';
export * from './usage';
export * from './features';
export * from './integrations';
export * from './security';
export * from './support';
