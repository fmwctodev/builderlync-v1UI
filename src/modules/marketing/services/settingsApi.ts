import { supabase } from '../../../shared/lib/supabase';
import type { ApprovalMode } from '../types/marketing';

const DEMO_ORG_ID = 'a0000000-0000-0000-0000-000000000001';

function resolveOrgId(orgId: string | null | undefined): string {
  if (!orgId || orgId === 'dev-org-id') return DEMO_ORG_ID;
  return orgId;
}

export interface MarketingSettings {
  approval_mode: ApprovalMode;
  budget_guard_enabled: boolean;
  daily_cap: number;
  monthly_cap: number;
  notifications: {
    new_lead: boolean;
    action_queued: boolean;
    pixel_issue: boolean;
    budget_alert: boolean;
    weekly_summary: boolean;
    anomaly_detected: boolean;
  };
}

const DEFAULT_SETTINGS: MarketingSettings = {
  approval_mode: 'recommend_and_approve',
  budget_guard_enabled: true,
  daily_cap: 500,
  monthly_cap: 8000,
  notifications: {
    new_lead: true,
    action_queued: true,
    pixel_issue: true,
    budget_alert: true,
    weekly_summary: true,
    anomaly_detected: true,
  },
};

export const settingsApi = {
  async getSettings(orgId: string | null): Promise<MarketingSettings> {
    const organizationId = resolveOrgId(orgId);
    const { data, error } = await supabase
      .from('marketing_approval_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return DEFAULT_SETTINGS;

    return {
      approval_mode: (data.approval_mode as ApprovalMode) || DEFAULT_SETTINGS.approval_mode,
      budget_guard_enabled: data.budget_guardrails_enabled ?? DEFAULT_SETTINGS.budget_guard_enabled,
      daily_cap: data.daily_cap ?? DEFAULT_SETTINGS.daily_cap,
      monthly_cap: data.monthly_cap ?? DEFAULT_SETTINGS.monthly_cap,
      notifications: (data.notifications as MarketingSettings['notifications']) || DEFAULT_SETTINGS.notifications,
    };
  },

  async saveSettings(
    settings: MarketingSettings,
    orgId: string | null
  ): Promise<void> {
    const organizationId = resolveOrgId(orgId);
    const { error } = await supabase
      .from('marketing_approval_settings')
      .upsert(
        {
          organization_id: organizationId,
          approval_mode: settings.approval_mode,
          budget_guardrails_enabled: settings.budget_guard_enabled,
          daily_cap: settings.daily_cap,
          monthly_cap: settings.monthly_cap,
          notifications: settings.notifications,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id' }
      );
    if (error) throw error;
  },
};
