import { supabase } from '../../../shared/lib/supabase';
import type { ReputationSettings, ReputationSettingsInput } from '../types';

const DEFAULTS: ReputationSettingsInput = {
  default_ai_tone: 'concise',
  default_signature: '',
  auto_append_signature: false,
  default_temperature: 0.4,
  escalation_email: null,
  escalation_user_id: null,
  sla_hours_positive: 48,
  sla_hours_negative: 12,
};

export async function getSettings(orgId: string): Promise<ReputationSettings> {
  const { data, error } = await supabase
    .from('reputation_settings')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load reputation settings: ${error.message}`);
  }

  if (!data) {
    return {
      id: '',
      org_id: orgId,
      ...DEFAULTS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ReputationSettings;
  }

  return data as ReputationSettings;
}

export async function upsertSettings(
  orgId: string,
  values: Partial<ReputationSettingsInput>
): Promise<ReputationSettings> {
  const { data, error } = await supabase
    .from('reputation_settings')
    .upsert(
      {
        org_id: orgId,
        ...values,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'org_id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save reputation settings: ${error.message}`);
  }

  return data as ReputationSettings;
}
