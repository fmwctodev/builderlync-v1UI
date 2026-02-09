export interface SuperAdminPermissions {
  overview?: {
    view?: boolean;
    export?: boolean;
  };
  accounts?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    manage_billing?: boolean;
    suspend?: boolean;
  };
  users?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    manage_roles?: boolean;
    impersonate?: boolean;
  };
  billing?: {
    view?: boolean;
    edit_plans?: boolean;
    process_payments?: boolean;
    refunds?: boolean;
    export?: boolean;
  };
  usage?: {
    view?: boolean;
    edit_limits?: boolean;
    export?: boolean;
  };
  features?: {
    view?: boolean;
    toggle_flags?: boolean;
    manage_overrides?: boolean;
  };
  integrations?: {
    view?: boolean;
    manage?: boolean;
    view_health?: boolean;
    test_connections?: boolean;
  };
  security?: {
    view_audit?: boolean;
    manage_permissions?: boolean;
    view_sessions?: boolean;
    force_logout?: boolean;
  };
  support?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    close?: boolean;
    assign?: boolean;
    manage_feedback?: boolean;
  };
  system?: {
    view_health?: boolean;
    manage_settings?: boolean;
    view_logs?: boolean;
    deploy?: boolean;
  };
  settings?: {
    view?: boolean;
    manage_staff?: boolean;
    manage_roles?: boolean;
    system_config?: boolean;
  };
}

export interface SuperAdminRoleTemplate {
  id: string;
  name: string;
  description: string;
  role_type: string;
  permissions: SuperAdminPermissions;
  is_system_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuperAdminRole {
  id: string;
  template_id: string | null;
  name: string;
  description: string;
  permissions: SuperAdminPermissions;
  is_custom: boolean;
  staff_count: number;
  is_deletable: boolean;
  created_at: string;
  updated_at: string;
  template?: SuperAdminRoleTemplate;
}

export interface SuperAdminStaff {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  status: 'active' | 'inactive' | 'pending';
  avatar_url: string | null;
  last_login_at: string | null;
  invited_at: string;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
  roles?: SuperAdminRole[];
}

export interface SuperAdminStaffRoleAssignment {
  id: string;
  staff_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by: string | null;
  role?: SuperAdminRole;
  staff?: SuperAdminStaff;
}

export interface CreateStaffRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id?: string;
  send_invitation?: boolean;
}

export interface UpdateStaffRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  avatar_url?: string;
}

export interface CreateRoleRequest {
  template_id?: string;
  name: string;
  description: string;
  permissions: SuperAdminPermissions;
  is_custom?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: SuperAdminPermissions;
}

export interface StaffFilters {
  search?: string;
  status?: string;
  role_id?: string;
  page?: number;
  limit?: number;
}

export interface SuperAdminProfile {
  id: string;
  staff_id: string;
  bio: string | null;
  timezone: string;
  language: string;
  avatar_url: string | null;
  email_signature: string | null;
  notification_preferences: {
    email_alerts?: boolean;
    digest_frequency?: string;
  };
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  backup_codes: string[] | null;
  password_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  bio?: string;
  timezone?: string;
  language?: string;
  avatar_url?: string;
  email_signature?: string;
  notification_preferences?: {
    email_alerts?: boolean;
    digest_frequency?: string;
  };
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface SuperAdminIntegration {
  id: string;
  integration_name: 'twilio' | 'stripe' | 'jira' | 'google_workspace';
  status: 'connected' | 'disconnected' | 'error';
  credentials: Record<string, any>;
  configuration: Record<string, any>;
  oauth_tokens: Record<string, any>;
  last_sync_at: string | null;
  last_error: string | null;
  connected_at: string | null;
  connected_by: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UpdateIntegrationRequest {
  credentials?: Record<string, any>;
  configuration?: Record<string, any>;
  oauth_tokens?: Record<string, any>;
}

export interface SuperAdminEmailDomain {
  id: string;
  domain: string;
  provider: 'google_workspace' | 'custom_smtp';
  verification_status: 'pending' | 'verified' | 'failed';
  verification_token: string | null;
  dkim_selector: string | null;
  dkim_public_key: string | null;
  dkim_verified: boolean;
  spf_verified: boolean;
  dmarc_verified: boolean;
  dns_records: any[];
  is_default: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddEmailDomainRequest {
  domain: string;
  provider: 'google_workspace' | 'custom_smtp';
}

export interface SuperAdminSMTPConfig {
  id: string;
  config_name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  use_tls: boolean;
  from_email: string;
  from_name: string | null;
  reply_to_email: string | null;
  is_active: boolean;
  daily_limit: number;
  sent_today: number;
  last_reset_at: string;
  test_status: string | null;
  last_test_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSMTPConfigRequest {
  config_name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  use_tls: boolean;
  from_email: string;
  from_name?: string;
  reply_to_email?: string;
  daily_limit?: number;
}

export interface SuperAdminEmailTemplate {
  id: string;
  template_name: string;
  template_type: 'account_invitation' | 'password_reset' | 'billing_notification' | 'system_alert';
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[];
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
