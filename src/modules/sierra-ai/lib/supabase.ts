/**
 * Sierra AI Module Supabase Client
 *
 * Supabase removed from frontend - all database operations go through backend API
 */
export const supabase = null;

export async function getCurrentUser() {
  throw new Error('Use backend API for user authentication');
}

export async function getUserId(): Promise<string> {
  throw new Error('Use backend API for user authentication');
}
