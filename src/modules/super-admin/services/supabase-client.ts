/**
 * Super Admin Supabase Client
 *
 * Re-exports the shared Supabase client to prevent multiple GoTrueClient instances.
 * Admin client is separate and configured to NOT manage auth state.
 */
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../shared/lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL environment variable');
}

// Re-export shared client (DO NOT create a new one)
export { supabase };

// Check if service role key is configured
export const isServiceRoleConfigured = (): boolean => {
  return !!supabaseServiceRoleKey && supabaseServiceRoleKey !== supabaseAnonKey;
};

// Get helpful error message for missing service role key
export const getServiceRoleErrorMessage = (): string => {
  return `
Service Role Key Required:

The account provisioning system requires elevated permissions that only the
Supabase service role key can provide. Without it, operations like creating
auth users will fail with "User not allowed" errors.

To fix this:
1. Go to your Supabase Dashboard
2. Navigate to Settings > API
3. Copy the "service_role" key (NOT the anon key)
4. Add it to your .env file:
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
5. Restart your development server

Note: The service role key should be kept secret and only used server-side.
For this admin panel, it's acceptable to use it in the authenticated context.
  `.trim();
};

// Admin client for elevated permissions - configured to NOT interfere with auth
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (error?.code === 'PGRST301') {
    return 'Permission denied. Please contact support.';
  }
  if (error?.code === '42501') {
    return 'Insufficient permissions for this operation.';
  }
  return 'An unexpected error occurred';
};
