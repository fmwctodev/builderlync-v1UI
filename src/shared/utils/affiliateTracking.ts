/**
 * Affiliate referral tracking — public-facing.
 *
 *   1. captureRefFromUrl()   reads ?ref=CODE on every page load and persists it
 *                            in a 60-day cookie + localStorage.
 *   2. getRefCode()          read the active ref (cookie wins over storage).
 *   3. recordAffiliateSignup()  called after a new user/account is created;
 *                              writes a referral row via the public RPC.
 *
 * The RPC `record_affiliate_referral` is a `SECURITY DEFINER` function in the
 * Supabase migration that validates the code against `affiliates.status='active'`
 * before insert, so anonymous calls are safe.
 */

import axios from 'axios';

const COOKIE_NAME = 'bl_aff_ref';
const STORAGE_KEY = 'bl_aff_ref';
const STORAGE_META_KEY = 'bl_aff_ref_meta';
const COOKIE_DAYS = 60;

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

interface RefMeta {
  code: string;
  capturedAt: string;
  sourceUrl?: string;
  utm?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  // SameSite=Lax so it survives navigation but doesn't leak cross-site.
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const target = `${name}=`;
  const parts = document.cookie.split('; ');
  for (const part of parts) {
    if (part.startsWith(target)) {
      try {
        return decodeURIComponent(part.slice(target.length));
      } catch {
        return part.slice(target.length);
      }
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read ?ref=CODE (and optional utm_*) from the current URL, persist to cookie
 * + localStorage. Idempotent — first-touch wins (won't overwrite an existing
 * ref unless `force` is true). Returns the active ref code or null.
 */
export const captureRefFromUrl = (force = false): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('ref') || params.get('aff') || '').trim();
    if (!code) return getRefCode();

    const existing = getRefCode();
    if (existing && !force) return existing;

    const utm: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
      const v = params.get(k);
      if (v) utm[k] = v;
    });

    const meta: RefMeta = {
      code,
      capturedAt: new Date().toISOString(),
      sourceUrl: window.location.href,
      utm,
    };

    setCookie(COOKIE_NAME, code, COOKIE_DAYS);
    try {
      localStorage.setItem(STORAGE_KEY, code);
      localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
    } catch {
      // private mode etc.
    }

    // Best-effort: ping RPC so we have a 'cookie' row even before signup.
    void recordReferralRpc({ code, sourceUrl: meta.sourceUrl, utm: meta.utm });

    return code;
  } catch (err) {
    console.warn('[affiliateTracking] captureRefFromUrl failed:', err);
    return null;
  }
};

export const getRefCode = (): string | null => {
  const c = getCookie(COOKIE_NAME);
  if (c) return c;
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  } catch {
    return null;
  }
};

export const getRefMeta = (): RefMeta | null => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_META_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearRef = () => {
  try {
    setCookie(COOKIE_NAME, '', -1);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_META_KEY);
  } catch {
    // ignore
  }
};

/**
 * After a successful signup, attach the cookied ref to the new user/account.
 * Safe to call even if no ref is set (no-op).
 */
export const recordAffiliateSignup = async (params: {
  userId?: string;
  accountId?: string;
  accountName?: string;
  email?: string;
}): Promise<string | null> => {
  const code = getRefCode();
  if (!code) return null;
  const meta = getRefMeta();
  return recordReferralRpc({
    code,
    email: params.email,
    userId: params.userId,
    accountId: params.accountId,
    accountName: params.accountName,
    sourceUrl: meta?.sourceUrl,
    utm: meta?.utm,
  });
};

// ---------------------------------------------------------------------------
// Internal — call the SECURITY DEFINER RPC via Supabase REST
// ---------------------------------------------------------------------------

const recordReferralRpc = async (args: {
  code: string;
  email?: string;
  userId?: string;
  accountId?: string;
  accountName?: string;
  sourceUrl?: string;
  utm?: Record<string, any>;
}): Promise<string | null> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // No public Supabase config — silently skip. The super-admin can mark
    // referrals as paying manually from the dashboard.
    return null;
  }
  try {
    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/record_affiliate_referral`;
    const { data } = await axios.post(
      url,
      {
        p_code: args.code,
        p_email: args.email || null,
        p_user_id: args.userId || null,
        p_account_id: args.accountId || null,
        p_account_name: args.accountName || null,
        p_source_url: args.sourceUrl || null,
        p_utm: args.utm || {},
      },
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    return typeof data === 'string' ? data : null;
  } catch (err) {
    console.warn('[affiliateTracking] RPC failed:', err);
    return null;
  }
};
