// Supabase removed from frontend - all database operations go through backend API
export const supabase = null;

export async function getCurrentUser() {
  return null;
}

export async function getCurrentUserId(): Promise<string | null> {
  return null;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  throw new Error('Use backend API for password update');
}

export async function signOutEverywhere() {
  throw new Error('Use backend API for sign out');
}