/**
 * Super Admin Supabase / API client.
 *
 * Provides:
 *  - `supabase`        — public Supabase client (anon key)
 *  - `supabaseAdmin`   — privileged Supabase client (service-role if available,
 *                        otherwise falls back to anon — RLS still applies)
 *  - `apiClient`       — backend REST helper (kept for legacy code paths)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env
  .VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Single null-safe stub used when env vars are missing in dev/preview builds.
// All `.from(...)` etc. calls return errors via the Supabase client itself
// rather than throwing on a null receiver.
const buildStub = (): SupabaseClient => {
  const reason =
    'Supabase client not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
  console.warn('[supabase-client]', reason);
  // Cast to SupabaseClient — every method returns an error-shaped object.
  // This avoids "Cannot read properties of null" runtime crashes.
  const stub: any = new Proxy(
    {},
    {
      get() {
        return () => stub;
      },
    }
  );
  stub.from = () => stub;
  stub.rpc = async () => ({ data: null, error: { message: reason } });
  stub.select = () => stub;
  stub.insert = () => stub;
  stub.update = () => stub;
  stub.delete = () => stub;
  stub.upsert = () => stub;
  stub.eq = () => stub;
  stub.neq = () => stub;
  stub.in = () => stub;
  stub.is = () => stub;
  stub.not = () => stub;
  stub.or = () => stub;
  stub.order = () => stub;
  stub.limit = () => stub;
  stub.range = () => stub;
  stub.overlaps = () => stub;
  stub.single = async () => ({ data: null, error: { message: reason } });
  stub.maybeSingle = async () => ({ data: null, error: { message: reason } });
  stub.then = (resolve: (v: any) => void) =>
    Promise.resolve({ data: [], error: { message: reason } }).then(resolve);
  return stub as SupabaseClient;
};

const buildClient = (key: string): SupabaseClient =>
  createClient(SUPABASE_URL as string, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

export const supabase: SupabaseClient =
  SUPABASE_URL && SUPABASE_ANON_KEY ? buildClient(SUPABASE_ANON_KEY) : buildStub();

// Prefer service-role key when present (super-admin only — never bundled in
// public-facing builds). Fall back to anon so the codebase doesn't crash.
export const supabaseAdmin: SupabaseClient =
  SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)
    ? buildClient(SUPABASE_SERVICE_ROLE_KEY || (SUPABASE_ANON_KEY as string))
    : buildStub();

export const isServiceRoleConfigured = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

export const getServiceRoleErrorMessage = (): string =>
  isServiceRoleConfigured()
    ? ''
    : 'Service role key not configured. Set VITE_SUPABASE_SERVICE_ROLE_KEY for full super-admin access.';

// Backend REST helper retained for legacy code paths.
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  put: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
};

export const handleSupabaseError = (error: any): string => {
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};
