import { supabase, handleSupabaseError } from './supabase-client';
import { UsageTracking, UsageLimits, UsageSummary } from '../types';

export const getUsageByAccount = async (accountId: string, months: number = 3): Promise<UsageTracking[]> => {
  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('account_id', accountId)
      .order('period', { ascending: false })
      .limit(months);

    if (error) throw error;

    return (data || []).map(usage => ({
      id: usage.id,
      accountId: usage.account_id,
      period: usage.period,
      smsCount: usage.sms_count,
      mmsCount: usage.mms_count,
      callMinutes: usage.call_minutes,
      aiMinutes: usage.ai_minutes,
      emailsSent: usage.emails_sent,
      storageGb: parseFloat(usage.storage_gb),
    }));
  } catch (error) {
    console.error('Error fetching usage:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getUsageLimits = async (accountId: string): Promise<UsageLimits | null> => {
  try {
    const { data, error } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      accountId: data.account_id,
      smsLimit: data.sms_limit,
      callLimit: data.call_limit,
      aiLimit: data.ai_limit,
      emailLimit: data.email_limit,
      storageLimit: parseFloat(data.storage_limit),
      overrideReason: data.override_reason,
      overrideBy: data.override_by,
      overrideUntil: data.override_until,
    };
  } catch (error) {
    console.error('Error fetching usage limits:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const updateUsageLimits = async (
  accountId: string,
  limits: Omit<UsageLimits, 'id' | 'accountId'>,
  overrideReason: string,
  overrideBy: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('usage_limits')
      .upsert({
        account_id: accountId,
        sms_limit: limits.smsLimit,
        call_limit: limits.callLimit,
        ai_limit: limits.aiLimit,
        email_limit: limits.emailLimit,
        storage_limit: limits.storageLimit,
        override_reason: overrideReason,
        override_by: overrideBy,
        override_until: limits.overrideUntil,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'account_id'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating usage limits:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getAllUsageSummaries = async (): Promise<UsageSummary[]> => {
  try {
    const { data: accounts, error: accountsError } = await supabase
      .from('enterprise_accounts')
      .select('id, name, plan')
      .in('status', ['active', 'past_due']);

    if (accountsError) throw accountsError;

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

    const summaries: UsageSummary[] = [];

    for (const account of accounts || []) {
      const [usageData, limitsData] = await Promise.all([
        supabase
          .from('usage_tracking')
          .select('*')
          .eq('account_id', account.id)
          .eq('period', currentMonth)
          .maybeSingle(),
        supabase
          .from('usage_limits')
          .select('*')
          .eq('account_id', account.id)
          .maybeSingle(),
      ]);

      const usage = usageData.data;
      const limits = limitsData.data;

      if (usage && limits) {
        summaries.push({
          accountId: account.id,
          accountName: account.name,
          plan: account.plan,
          period: usage.period,
          smsCount: usage.sms_count,
          mmsCount: usage.mms_count,
          callMinutes: usage.call_minutes,
          aiMinutes: usage.ai_minutes,
          emailsSent: usage.emails_sent,
          storageUsedGB: parseFloat(usage.storage_gb),
          limits: {
            id: limits.id,
            accountId: limits.account_id,
            smsLimit: limits.sms_limit,
            callLimit: limits.call_limit,
            aiLimit: limits.ai_limit,
            emailLimit: limits.email_limit,
            storageLimit: parseFloat(limits.storage_limit),
          },
          percentages: {
            sms: (usage.sms_count / limits.sms_limit) * 100,
            calls: (usage.call_minutes / limits.call_limit) * 100,
            ai: (usage.ai_minutes / limits.ai_limit) * 100,
            emails: (usage.emails_sent / limits.email_limit) * 100,
            storage: (parseFloat(usage.storage_gb) / parseFloat(limits.storage_limit)) * 100,
          },
        });
      }
    }

    return summaries;
  } catch (error) {
    console.error('Error fetching usage summaries:', error);
    throw new Error(handleSupabaseError(error));
  }
};