/**
 * CRM Module Supabase Client
 *
 * Re-exports the shared Supabase client to prevent multiple instances
 * and avoid "Multiple GoTrueClient instances" warnings.
 */
import { supabase, getCurrentUser as getUser, getCurrentUserId } from '../../../shared/lib/supabase';

export { supabase };

export async function getCurrentUser() {
  return await getUser();
}