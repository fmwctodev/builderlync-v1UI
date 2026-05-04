import { supabaseAdmin, handleSupabaseError } from './supabase-client';
import {
  Affiliate,
  AffiliateFilters,
  AffiliatePayout,
  AffiliatePayoutStatus,
  AffiliateReferral,
  AffiliateStats,
  CreateAffiliateInput,
  UpdateAffiliateInput,
} from '../types/affiliate';

// ----------------------------------------------------------------------------
// Mappers (snake_case DB row -> camelCase domain object)
// ----------------------------------------------------------------------------

const mapAffiliate = (row: any): Affiliate => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone || undefined,
  company: row.company || undefined,
  referralCode: row.referral_code,
  commissionRate: parseFloat(row.commission_rate),
  commissionWindowMonths: row.commission_window_months ?? 12,
  payoutMethod: row.payout_method || 'paypal',
  payoutEmail: row.payout_email || undefined,
  payoutDetails: row.payout_details || {},
  status: row.status || 'active',
  notes: row.notes || undefined,
  tags: row.tags || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapReferral = (row: any): AffiliateReferral => ({
  id: row.id,
  affiliateId: row.affiliate_id,
  affiliateName: row.affiliates?.name,
  affiliateCode: row.affiliates?.referral_code,
  referredEmail: row.referred_email || undefined,
  referredUserId: row.referred_user_id || undefined,
  referredAccountId: row.referred_account_id || undefined,
  referredAccountName: row.referred_account_name || undefined,
  status: row.status,
  cookieAt: row.cookie_at || undefined,
  signedUpAt: row.signed_up_at || undefined,
  firstPaymentAt: row.first_payment_at || undefined,
  churnedAt: row.churned_at || undefined,
  sourceUrl: row.source_url || undefined,
  utm: row.utm || {},
  notes: row.notes || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  accountMrr: row.enterprise_accounts?.mrr
    ? parseFloat(row.enterprise_accounts.mrr)
    : undefined,
  accountStatus: row.enterprise_accounts?.status,
});

const mapPayout = (row: any): AffiliatePayout => ({
  id: row.id,
  affiliateId: row.affiliate_id,
  affiliateName: row.affiliates?.name,
  periodStart: row.period_start,
  periodEnd: row.period_end,
  amountDue: parseFloat(row.amount_due),
  currency: row.currency || 'USD',
  dueDate: row.due_date,
  status: row.status,
  approvedAt: row.approved_at || undefined,
  approvedBy: row.approved_by || undefined,
  paidAt: row.paid_at || undefined,
  paidBy: row.paid_by || undefined,
  paymentReference: row.payment_reference || undefined,
  breakdown: row.breakdown || [],
  notes: row.notes || undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const toSnakeAffiliate = (input: CreateAffiliateInput | UpdateAffiliateInput) => {
  const out: Record<string, any> = {};
  if (input.name !== undefined) out.name = input.name;
  if (input.email !== undefined) out.email = input.email;
  if (input.phone !== undefined) out.phone = input.phone;
  if (input.company !== undefined) out.company = input.company;
  if (input.referralCode !== undefined) out.referral_code = input.referralCode;
  if (input.commissionRate !== undefined) out.commission_rate = input.commissionRate;
  if (input.commissionWindowMonths !== undefined)
    out.commission_window_months = input.commissionWindowMonths;
  if (input.payoutMethod !== undefined) out.payout_method = input.payoutMethod;
  if (input.payoutEmail !== undefined) out.payout_email = input.payoutEmail;
  if (input.payoutDetails !== undefined) out.payout_details = input.payoutDetails;
  if (input.status !== undefined) out.status = input.status;
  if (input.notes !== undefined) out.notes = input.notes;
  if (input.tags !== undefined) out.tags = input.tags;
  return out;
};

export const generateReferralCode = (name?: string): string => {
  const base = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12);
  const rand = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${rand}` : rand.toUpperCase();
};

export const buildAffiliateLink = (referralCode: string): string => {
  if (typeof window === 'undefined') return `?ref=${referralCode}`;
  const origin = window.location.origin.replace(/\/$/, '');
  return `${origin}/auth/signup?ref=${encodeURIComponent(referralCode)}`;
};

// ----------------------------------------------------------------------------
// Affiliates CRUD
// ----------------------------------------------------------------------------

export const getAffiliates = async (filters?: AffiliateFilters): Promise<Affiliate[]> => {
  try {
    let query = supabaseAdmin
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.search) {
      const s = filters.search.replace(/'/g, "''");
      query = query.or(
        `name.ilike.%${s}%,email.ilike.%${s}%,referral_code.ilike.%${s}%,company.ilike.%${s}%`
      );
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapAffiliate);
  } catch (err) {
    console.error('getAffiliates error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const getAffiliateById = async (id: string): Promise<Affiliate | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ? mapAffiliate(data) : null;
  } catch (err) {
    console.error('getAffiliateById error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const createAffiliate = async (input: CreateAffiliateInput): Promise<Affiliate> => {
  try {
    const code = input.referralCode?.trim() || generateReferralCode(input.name);
    const payload = {
      ...toSnakeAffiliate({ ...input, referralCode: code }),
      commission_rate: input.commissionRate ?? 0.20,
      commission_window_months: input.commissionWindowMonths ?? 12,
      status: input.status ?? 'active',
      payout_method: input.payoutMethod ?? 'paypal',
      tags: input.tags ?? [],
    };

    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return mapAffiliate(data);
  } catch (err) {
    console.error('createAffiliate error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const updateAffiliate = async (
  id: string,
  updates: UpdateAffiliateInput
): Promise<Affiliate> => {
  try {
    const payload = toSnakeAffiliate(updates);
    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapAffiliate(data);
  } catch (err) {
    console.error('updateAffiliate error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const deleteAffiliate = async (id: string): Promise<void> => {
  try {
    const { error } = await supabaseAdmin.from('affiliates').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.error('deleteAffiliate error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const isReferralCodeAvailable = async (
  code: string,
  excludeAffiliateId?: string
): Promise<boolean> => {
  try {
    let query = supabaseAdmin.from('affiliates').select('id').eq('referral_code', code);
    if (excludeAffiliateId) query = query.neq('id', excludeAffiliateId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length === 0;
  } catch (err) {
    console.error('isReferralCodeAvailable error:', err);
    return false;
  }
};

// ----------------------------------------------------------------------------
// Referrals
// ----------------------------------------------------------------------------

export const getReferrals = async (affiliateId?: string): Promise<AffiliateReferral[]> => {
  try {
    let query = supabaseAdmin
      .from('affiliate_referrals')
      .select(`
        *,
        affiliates (name, referral_code),
        enterprise_accounts:referred_account_id (mrr, status)
      `)
      .order('created_at', { ascending: false });
    if (affiliateId) query = query.eq('affiliate_id', affiliateId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapReferral);
  } catch (err) {
    console.error('getReferrals error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const updateReferral = async (
  id: string,
  updates: Partial<AffiliateReferral>
): Promise<AffiliateReferral> => {
  try {
    const payload: Record<string, any> = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.firstPaymentAt !== undefined) payload.first_payment_at = updates.firstPaymentAt;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.referredAccountId !== undefined)
      payload.referred_account_id = updates.referredAccountId;

    const { data, error } = await supabaseAdmin
      .from('affiliate_referrals')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        affiliates (name, referral_code),
        enterprise_accounts:referred_account_id (mrr, status)
      `)
      .single();
    if (error) throw error;
    return mapReferral(data);
  } catch (err) {
    console.error('updateReferral error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const syncReferralPayingStatus = async (): Promise<number> => {
  try {
    const { data, error } = await supabaseAdmin.rpc('sync_affiliate_referral_paying_status');
    if (error) throw error;
    return Number(data) || 0;
  } catch (err) {
    console.error('syncReferralPayingStatus error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

// ----------------------------------------------------------------------------
// Payouts
// ----------------------------------------------------------------------------

export const getPayouts = async (affiliateId?: string): Promise<AffiliatePayout[]> => {
  try {
    let query = supabaseAdmin
      .from('affiliate_payouts')
      .select(`
        *,
        affiliates (name)
      `)
      .order('period_end', { ascending: false });
    if (affiliateId) query = query.eq('affiliate_id', affiliateId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapPayout);
  } catch (err) {
    console.error('getPayouts error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const accruePayouts = async (
  periodStart?: string,
  periodEnd?: string
): Promise<number> => {
  try {
    const { data, error } = await supabaseAdmin.rpc('accrue_affiliate_payouts', {
      p_period_start: periodStart || null,
      p_period_end: periodEnd || null,
    });
    if (error) throw error;
    return Number(data) || 0;
  } catch (err) {
    console.error('accruePayouts error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

export const updatePayoutStatus = async (
  id: string,
  status: AffiliatePayoutStatus,
  extras: { paymentReference?: string; notes?: string; actorId?: string } = {}
): Promise<AffiliatePayout> => {
  try {
    const payload: Record<string, any> = { status };
    if (status === 'approved') {
      payload.approved_at = new Date().toISOString();
      if (extras.actorId) payload.approved_by = extras.actorId;
    }
    if (status === 'paid') {
      payload.paid_at = new Date().toISOString();
      if (extras.actorId) payload.paid_by = extras.actorId;
      if (extras.paymentReference) payload.payment_reference = extras.paymentReference;
    }
    if (extras.notes !== undefined) payload.notes = extras.notes;

    const { data, error } = await supabaseAdmin
      .from('affiliate_payouts')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        affiliates (name)
      `)
      .single();
    if (error) throw error;
    return mapPayout(data);
  } catch (err) {
    console.error('updatePayoutStatus error:', err);
    throw new Error(handleSupabaseError(err));
  }
};

// ----------------------------------------------------------------------------
// Stats (computed client-side from referrals + payouts)
// ----------------------------------------------------------------------------

export const computeStats = (
  affiliate: Affiliate,
  referrals: AffiliateReferral[],
  payouts: AffiliatePayout[]
): AffiliateStats => {
  const mine = referrals.filter((r) => r.affiliateId === affiliate.id);
  const totalReferrals = mine.length;
  const signedUp = mine.filter((r) => r.status === 'signed_up' || r.status === 'paying').length;
  const paying = mine.filter((r) => r.status === 'paying').length;
  const churned = mine.filter((r) => r.status === 'churned').length;

  const myPayouts = payouts.filter((p) => p.affiliateId === affiliate.id);
  const lifetimeEarned = myPayouts.reduce(
    (sum, p) => (p.status === 'void' ? sum : sum + p.amountDue),
    0
  );
  const pendingPayout = myPayouts
    .filter((p) => p.status === 'accrued' || p.status === 'approved')
    .reduce((sum, p) => sum + p.amountDue, 0);
  const paidOut = myPayouts
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountDue, 0);

  const monthlyAccrual = mine
    .filter((r) => r.status === 'paying' && r.accountMrr)
    .reduce((sum, r) => sum + (r.accountMrr || 0) * affiliate.commissionRate, 0);

  return {
    affiliateId: affiliate.id,
    totalReferrals,
    signedUp,
    paying,
    churned,
    lifetimeEarned,
    pendingPayout,
    paidOut,
    monthlyAccrual,
  };
};
