/**
 * Logout Flag Management
 *
 * Prevents race conditions during logout by using a sessionStorage flag
 * to indicate that a logout is in progress. This ensures AuthRoute doesn't
 * cause redirect loops when checking session state during logout.
 */

const LOGOUT_FLAG_KEY = 'builderlynk-logout-in-progress';

/**
 * Sets the logout flag to indicate logout is in progress
 */
export function setLogoutFlag(): void {
  try {
    sessionStorage.setItem(LOGOUT_FLAG_KEY, 'true');
  } catch (error) {
    console.error('Failed to set logout flag:', error);
  }
}

/**
 * Checks if logout is currently in progress
 */
export function hasLogoutFlag(): boolean {
  try {
    return sessionStorage.getItem(LOGOUT_FLAG_KEY) === 'true';
  } catch (error) {
    console.error('Failed to check logout flag:', error);
    return false;
  }
}

/**
 * Clears the logout flag
 */
export function clearLogoutFlag(): void {
  try {
    sessionStorage.removeItem(LOGOUT_FLAG_KEY);
  } catch (error) {
    console.error('Failed to clear logout flag:', error);
  }
}

/**
 * Force logout utility - clears all auth state even if API calls fail
 * Use this to ensure users can always logout regardless of network issues
 */
export async function forceLogout(supabaseSignOut: () => Promise<void>): Promise<void> {
  // Set flag immediately
  setLogoutFlag();

  // Try to sign out with timeout
  const signOutPromise = supabaseSignOut();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Logout timeout')), 5000)
  );

  try {
    await Promise.race([signOutPromise, timeoutPromise]);
    console.log('✅ Supabase signOut successful');
  } catch (error) {
    console.warn('⚠️ Supabase signOut failed or timed out, forcing local logout:', error);
  }

  // Clear all auth-related storage (always execute, even if signOut failed)
  try {
    // Clear custom auth storage key
    localStorage.removeItem('builderlynk-auth');

    // Clear all possible Supabase auth keys (they use project ID in key name)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];

    if (projectRef) {
      // Clear various Supabase storage keys
      localStorage.removeItem(`sb-${projectRef}-auth-token`);
      localStorage.removeItem(`sb-${projectRef}-auth-token-code-verifier`);
      localStorage.removeItem(`supabase.auth.token`);
    }

    // Clear all keys that start with 'sb-' or 'supabase'
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear session storage completely
    sessionStorage.clear();

    console.log('✅ All auth storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}
