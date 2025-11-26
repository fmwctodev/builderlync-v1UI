import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Initialization Check:');
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_SUPABASE_URL:', supabaseUrl ? `✓ Set (${supabaseUrl.substring(0, 30)}...)` : '✗ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
  console.error('Please ensure your .env file contains both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('You may need to restart the development server after adding environment variables.');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
}

let supabaseClient = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase client created successfully');
  } else {
    console.error('❌ Cannot create Supabase client - missing credentials');
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
}

export const supabase = supabaseClient;

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return data;
}

export async function signOutEverywhere() {
  if (!supabase) throw new Error('Supabase client not initialized');

  const { error } = await supabase.auth.signOut({ scope: 'global' });

  if (error) throw error;
}
