/**
 * Sierra AI Module Supabase Client
 *
 * Re-exports the shared Supabase client to prevent multiple instances
 * and avoid "Multiple GoTrueClient instances" warnings.
 */
import { supabase, getCurrentUser as getUser, getCurrentUserId } from '../../../shared/lib/supabase';

export { supabase };

export async function getCurrentUser() {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');
  return user;
}

export async function getUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');
  return userId;
}
