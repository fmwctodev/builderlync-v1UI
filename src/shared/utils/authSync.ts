import { supabase, hasValidSession } from '../lib/supabase';
import { store } from '../../modules/roof-runner/store';
import { logout as reduxLogout } from '../store/slices/authSlice';

export interface AuthStatus {
  hasReduxAuth: boolean;
  hasSupabaseAuth: boolean;
  isAuthenticated: boolean;
  needsSync: boolean;
}

export async function getAuthStatus(): Promise<AuthStatus> {
  const reduxState = store.getState();
  const hasReduxAuth = !!(reduxState.auth.user && reduxState.auth.token);
  const hasSupabaseAuth = await hasValidSession();

  return {
    hasReduxAuth,
    hasSupabaseAuth,
    isAuthenticated: hasReduxAuth || hasSupabaseAuth,
    needsSync: hasReduxAuth !== hasSupabaseAuth,
  };
}

export async function syncAuthSystems(): Promise<void> {
  const status = await getAuthStatus();

  if (!status.needsSync) {
    return;
  }

  if (status.hasReduxAuth && !status.hasSupabaseAuth) {
    console.warn('⚠️ Redux auth exists but Supabase session is missing.');
    console.warn('This may indicate the user logged in via external API but does not have a Supabase account.');
    console.warn('Database operations requiring Supabase auth will fail.');
  }

  if (!status.hasReduxAuth && status.hasSupabaseAuth) {
    console.warn('⚠️ Supabase session exists but Redux auth is missing.');
    console.warn('This may indicate incomplete logout or session restoration.');
  }
}

export async function clearAllAuth(): Promise<void> {
  try {
    if (supabase) {
      await supabase.auth.signOut();
      console.log('✅ Supabase session cleared');
    }
  } catch (error) {
    console.error('Error clearing Supabase session:', error);
  }

  try {
    store.dispatch(reduxLogout());
    console.log('✅ Redux auth cleared');
  } catch (error) {
    console.error('Error clearing Redux auth:', error);
  }

  localStorage.removeItem('auth');
  localStorage.removeItem('token');
  localStorage.removeItem('builderlynk-auth');

  console.log('✅ All authentication cleared');
}

export async function validateAuthOrRedirect(): Promise<boolean> {
  const status = await getAuthStatus();

  if (!status.isAuthenticated) {
    window.location.href = '/auth/login';
    return false;
  }

  if (status.needsSync) {
    await syncAuthSystems();
  }

  return true;
}
