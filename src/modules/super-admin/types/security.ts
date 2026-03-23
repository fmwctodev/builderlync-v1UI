export type AuditActorType = 'super_admin' | 'account_admin' | 'user' | 'system';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_type: AuditActorType;
  actor_id?: string | null;
  actor_email?: string | null;
  actor_name?: string | null;
  account_id?: string | null;
  resource_type: string;
  resource_id?: string | null;
  action: string;
  description?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata: Record<string, any>;
  account?: {
    id: string;
    name: string;
    status: string;
  };
}

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id: string;
  created_at: string;
  type: string;
  severity: SecurityEventSeverity;
  user_id?: string | null;
  account_id?: string | null;
  source_ip?: string | null;
  location?: string | null;
  user_agent?: string | null;
  description?: string | null;
  metadata: Record<string, any>;
  acknowledged: boolean;
  acknowledged_by?: string | null;
  acknowledged_at?: string | null;
  account?: {
    id: string;
    name: string;
    status: string;
  };
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface SecuritySettings {
  id: string;
  enforce_mfa: boolean;
  mfa_required_for: string[];
  restrict_superadmin_ip: boolean;
  superadmin_ip_allowlist: string[];
  allow_data_export: boolean;
  require_reason_for_export: boolean;
  session_timeout_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface UserSecurityProfile {
  user_id: string;
  mfa_enabled: boolean;
  last_mfa_enrolled_at?: string | null;
  last_password_change_at?: string | null;
  last_login_ip?: string | null;
  last_login_at?: string | null;
  failed_login_count: number;
  last_failed_login_at?: string | null;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
  };
  account?: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
}

export interface SecurityStats {
  totalUsers: number;
  mfaEnabledCount: number;
  mfaEnabledPercent: number;
  adminMfaEnabledCount: number;
  adminMfaEnabledPercent: number;
  highRiskUsers: number;
  stalePasswordUsers: number;
  totalEvents: number;
  unacknowledgedEvents: number;
  criticalEvents: number;
}

export interface AuditLogFilters {
  search?: string;
  actorType?: AuditActorType | 'all';
  resourceType?: string;
  dateRange?: 'day' | 'week' | 'month' | 'all';
  action?: string;
}

export interface SecurityEventFilters {
  severity?: SecurityEventSeverity | 'all';
  status?: 'all' | 'acknowledged' | 'unacknowledged';
  type?: string;
  dateRange?: 'day' | 'week' | 'month' | 'all';
}

export interface MfaFilters {
  search?: string;
  mfaStatus?: 'all' | 'enabled' | 'disabled';
  riskLevel?: 'all' | 'high' | 'stale';
}
