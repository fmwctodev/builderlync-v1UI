import { supabase } from '../../../../shared/lib/supabase';
import type { SocialAccount, SocialProvider } from '../types';

export async function getSocialAccounts(organizationId: string): Promise<SocialAccount[]> {
  const { data, error } = await supabase
    .from('sierra_social_accounts')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSocialAccountById(id: string): Promise<SocialAccount | null> {
  const { data, error } = await supabase
    .from('sierra_social_accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getSocialAccountsByProvider(
  orgId: string,
  provider: SocialProvider
): Promise<SocialAccount[]> {
  const { data, error } = await supabase
    .from('sierra_social_accounts')
    .select('*')
    .eq('organization_id', orgId)
    .eq('provider', provider)
    .eq('status', 'connected');
  if (error) throw error;
  return data ?? [];
}

export async function disconnectSocialAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_accounts')
    .update({
      status: 'disconnected',
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSocialAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from('sierra_social_accounts')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getSocialStats(organizationId: string): Promise<{
  connectedAccounts: number;
  scheduledPosts: number;
  postedThisWeek: number;
  failedPosts: number;
}> {
  const [accountsRes, scheduledRes, postedRes, failedRes] = await Promise.all([
    supabase
      .from('sierra_social_accounts')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'connected'),
    supabase
      .from('sierra_social_posts')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .in('status', ['scheduled', 'queued']),
    supabase
      .from('sierra_social_posts')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'posted')
      .gte('posted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from('sierra_social_posts')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'failed'),
  ]);

  return {
    connectedAccounts: accountsRes.count ?? 0,
    scheduledPosts: scheduledRes.count ?? 0,
    postedThisWeek: postedRes.count ?? 0,
    failedPosts: failedRes.count ?? 0,
  };
}

export async function connectViaLate(
  provider: SocialProvider,
  successUrl?: string,
  failureUrl?: string
): Promise<{ url: string }> {
  const { data, error } = await supabase.functions.invoke('late-connect', {
    body: {
      provider,
      success_redirect_url: successUrl ?? `${window.location.origin}/marketing?tab=sierra-social`,
      failure_redirect_url: failureUrl ?? `${window.location.origin}/marketing?tab=sierra-social`,
    },
  });
  if (error) throw error;
  return data?.data ?? data;
}

export async function reconnectViaLate(
  accountId: string,
  provider: SocialProvider
): Promise<{ url: string }> {
  const { data, error } = await supabase.functions.invoke('late-connect', {
    body: {
      provider,
      reconnect_account_id: accountId,
      success_redirect_url: `${window.location.origin}/marketing?tab=sierra-social`,
      failure_redirect_url: `${window.location.origin}/marketing?tab=sierra-social`,
    },
  });
  if (error) throw error;
  return data?.data ?? data;
}

export function getProviderDisplayName(provider: SocialProvider): string {
  const names: Record<SocialProvider, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    google_business: 'Google Business',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    reddit: 'Reddit',
  };
  return names[provider];
}

export function getProviderColor(provider: SocialProvider): string {
  const colors: Record<SocialProvider, string> = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    google_business: '#4285F4',
    tiktok: '#000000',
    youtube: '#FF0000',
    reddit: '#FF4500',
  };
  return colors[provider];
}
