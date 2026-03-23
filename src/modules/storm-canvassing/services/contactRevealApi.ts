import { supabase } from '../../../shared/lib/supabase';
import type { ContactReveal, Door, ContactProvider } from '../types';
import { createContactProvider, mapContactRevealResultToEntity } from '../providers/contactProvider';

export interface RevealResult {
  reveal: ContactReveal;
  fromCache: boolean;
  creditsCharged: number;
}

export async function revealContact(
  organizationId: string,
  doorId: string,
  userId: string
): Promise<RevealResult> {
  const cachedReveal = await getExistingReveal(organizationId, doorId);
  if (cachedReveal) {
    return {
      reveal: cachedReveal,
      fromCache: true,
      creditsCharged: 0,
    };
  }

  const settings = await getOrgSettings(organizationId);
  const cost = settings.contact_reveal_cost;
  const cacheHours = settings.contact_reveal_cache_hours;

  const balance = await getCreditBalance(organizationId);
  if (balance < cost) {
    throw new Error('Insufficient credits for contact reveal');
  }

  const { data: door, error: doorError } = await supabase
    .from('doors')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('id', doorId)
    .single();

  if (doorError || !door) {
    throw new Error('Door not found');
  }

  const provider = createContactProvider({
    provider: settings.default_contact_provider,
    hailtraceApiKey: settings.hailtrace_api_key,
    hailReconApiKey: settings.hail_recon_api_key,
  });

  const contactResult = await provider.revealContact(door as Door);

  const revealEntity = mapContactRevealResultToEntity(
    contactResult,
    organizationId,
    doorId,
    settings.default_contact_provider,
    userId,
    cost,
    cacheHours
  );

  const { data: reveal, error: revealError } = await supabase
    .from('contact_reveals')
    .insert(revealEntity)
    .select()
    .single();

  if (revealError) {
    throw new Error(`Failed to save contact reveal: ${revealError.message}`);
  }

  await supabase.rpc('record_contact_reveal_credit', {
    p_org_id: organizationId,
    p_reveal_id: reveal.id,
    p_cost: cost,
    p_user_id: userId,
  });

  return {
    reveal,
    fromCache: false,
    creditsCharged: cost,
  };
}

export async function getExistingReveal(
  organizationId: string,
  doorId: string
): Promise<ContactReveal | null> {
  const { data, error } = await supabase.rpc('check_contact_reveal_cache', {
    p_org_id: organizationId,
    p_door_id: doorId,
  });

  if (error) {
    console.error('Error checking reveal cache:', error);
    return null;
  }

  return data || null;
}

export async function getRevealsForDoor(
  organizationId: string,
  doorId: string
): Promise<ContactReveal[]> {
  const { data, error } = await supabase
    .from('contact_reveals')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('door_id', doorId)
    .order('revealed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reveals: ${error.message}`);
  }

  return data || [];
}

export async function getCreditBalance(organizationId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_credit_balance', {
    p_org_id: organizationId,
  });

  if (error) {
    throw new Error(`Failed to get credit balance: ${error.message}`);
  }

  return data || 0;
}

export async function topUpCredits(
  organizationId: string,
  amount: number,
  reason: string,
  adminUserId: string
): Promise<number> {
  const currentBalance = await getCreditBalance(organizationId);
  const newBalance = currentBalance + amount;

  const { error } = await supabase.from('credit_ledger').insert({
    organization_id: organizationId,
    ledger_type: 'TOPUP',
    delta: amount,
    reason,
    balance_after: newBalance,
    created_by: adminUserId,
  });

  if (error) {
    throw new Error(`Failed to top up credits: ${error.message}`);
  }

  return newBalance;
}

export async function adjustCredits(
  organizationId: string,
  delta: number,
  reason: string,
  adminUserId: string
): Promise<number> {
  const currentBalance = await getCreditBalance(organizationId);
  const newBalance = currentBalance + delta;

  const { error } = await supabase.from('credit_ledger').insert({
    organization_id: organizationId,
    ledger_type: 'ADJUSTMENT',
    delta,
    reason,
    balance_after: newBalance,
    created_by: adminUserId,
  });

  if (error) {
    throw new Error(`Failed to adjust credits: ${error.message}`);
  }

  return newBalance;
}

export async function getCreditLedgerHistory(
  organizationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  entries: Array<{
    id: string;
    ledger_type: string;
    delta: number;
    reason?: string;
    balance_after?: number;
    created_at: string;
    created_by?: string;
  }>;
  total: number;
}> {
  const { data, error, count } = await supabase
    .from('credit_ledger')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch credit ledger: ${error.message}`);
  }

  return {
    entries: data || [],
    total: count || 0,
  };
}

async function getOrgSettings(organizationId: string): Promise<{
  contact_reveal_cache_hours: number;
  contact_reveal_cost: number;
  default_contact_provider: ContactProvider;
  hailtrace_api_key?: string;
  hail_recon_api_key?: string;
}> {
  const { data, error } = await supabase
    .from('canvass_org_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching org settings:', error);
  }

  return {
    contact_reveal_cache_hours: data?.contact_reveal_cache_hours || 720,
    contact_reveal_cost: data?.contact_reveal_cost || 1,
    default_contact_provider: data?.default_contact_provider || 'MOCK',
    hailtrace_api_key: data?.hailtrace_api_key,
    hail_recon_api_key: data?.hail_recon_api_key,
  };
}
