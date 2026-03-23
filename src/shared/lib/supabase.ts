import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

  if (import.meta.env.PROD) {
    console.error('🚨 PRODUCTION ERROR: Configure environment variables in your hosting provider (Netlify/Vercel)');
  }
}

let supabaseClient: SupabaseClient | null = null;
let authInitialized = false;
let authReadyPromise: Promise<void> | null = null;
let currentSession: any = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'builderlynk-auth',
      }
    });
    console.log('✅ Supabase client created successfully with auth persistence');

    authReadyPromise = new Promise<void>((resolve) => {
      if (!supabaseClient) {
        resolve();
        return;
      }

      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        authInitialized = true;
        currentSession = session;
        if (session) {
          console.log('✅ Session restored from storage:', {
            userId: session.user.id,
            email: session.user.email,
            expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
          });
        } else {
          console.log('ℹ️ No existing session found - user needs to log in');
        }
        resolve();
      }).catch((error) => {
        console.error('❌ Error checking initial session:', error);
        authInitialized = true;
        currentSession = null;
        resolve();
      });
    });
  } else {
    console.error('❌ Cannot create Supabase client - missing credentials');
  }
} catch (error) {
  console.error('❌ Error creating Supabase client:', error);
}

export const supabase = supabaseClient;

export async function waitForAuth(): Promise<void> {
  if (authInitialized) return;
  if (authReadyPromise) {
    await authReadyPromise;
  }
}

export async function hasValidSession(): Promise<boolean> {
  if (!supabase) return false;

  await waitForAuth();

  if (currentSession) {
    return true;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error checking session:', error);
    return false;
  }

  currentSession = session;
  return !!session;
}

export async function requireAuth(): Promise<void> {
  const hasSession = await hasValidSession();
  if (!hasSession) {
    throw new Error('Authentication required. Please log in to continue.');
  }
}

export function isAuthReady(): boolean {
  return authInitialized;
}

export async function getCurrentUser() {
  if (!supabase) return null;

  await waitForAuth();

  if (currentSession?.user) {
    return currentSession.user;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;

  await waitForAuth();

  if (currentSession?.user?.id) {
    return currentSession.user.id;
  }

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

/**
 * Refreshes the current session state
 * Call this after login/logout to ensure session state is up-to-date
 */
export async function refreshSessionState(): Promise<void> {
  if (!supabase) return;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error refreshing session state:', error);
      currentSession = null;
      return;
    }

    currentSession = session;
    authInitialized = true;

    if (session) {
      console.log('✅ Session state refreshed:', {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
      });
    } else {
      console.log('ℹ️ No active session');
    }
  } catch (error) {
    console.error('Error refreshing session state:', error);
    currentSession = null;
  }
}

/**
 * Clears the current session state
 * Call this after logout to ensure session state is cleared
 */
export function clearSessionState(): void {
  currentSession = null;
  console.log('✅ Session state cleared');
}
