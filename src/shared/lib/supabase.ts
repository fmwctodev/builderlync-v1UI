import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://okzwagpdhdmqvhmmnwiw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function getCurrentUser() {
  return null;
}

export async function getCurrentUserId(): Promise<string | null> {
  return null;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  throw new Error('Use manual API for password update');
}

export async function signOutEverywhere() {
  throw new Error('Use manual API for sign out');
}