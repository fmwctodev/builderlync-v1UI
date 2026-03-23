import { supabase } from '../lib/supabase';

export interface SyncUserRequest {
  email: string;
  password: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  email: string;
  userId?: string;
}

export interface AuthStatusResult {
  hasExternalAuth: boolean;
  hasSupabaseAuth: boolean;
  externalUserEmail?: string;
  supabaseUserEmail?: string;
  needsSync: boolean;
}

export async function checkAuthStatus(): Promise<AuthStatusResult> {
  try {
    const externalAuthData = localStorage.getItem('auth');
    let externalUser = null;

    if (externalAuthData) {
      try {
        const decrypted = atob(externalAuthData);
        const parsed = JSON.parse(decrypted);
        externalUser = parsed.user;
      } catch (e) {
        console.warn('Could not parse external auth data');
      }
    }

    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    return {
      hasExternalAuth: !!externalUser,
      hasSupabaseAuth: !!supabaseUser,
      externalUserEmail: externalUser?.email,
      supabaseUserEmail: supabaseUser?.email,
      needsSync: !!externalUser && !supabaseUser,
    };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return {
      hasExternalAuth: false,
      hasSupabaseAuth: false,
      needsSync: false,
    };
  }
}

export async function syncUserToSupabase(request: SyncUserRequest): Promise<SyncResult> {
  try {
    if (!request.email || !request.password) {
      return {
        success: false,
        message: 'Email and password are required',
        email: request.email,
      };
    }

    if (request.password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters',
        email: request.email,
      };
    }

    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === request.email);

    if (userExists) {
      return {
        success: false,
        message: 'User already exists in Supabase',
        email: request.email,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return {
        success: false,
        message: error.message || 'Failed to create Supabase user',
        email: request.email,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'User creation failed - no user returned',
        email: request.email,
      };
    }

    return {
      success: true,
      message: 'User successfully synced to Supabase',
      email: request.email,
      userId: data.user.id,
    };
  } catch (error: any) {
    console.error('Error syncing user:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      email: request.email,
    };
  }
}

export async function signInToSupabase(email: string, password: string): Promise<SyncResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
        email,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Sign in failed - no user returned',
        email,
      };
    }

    return {
      success: true,
      message: 'Successfully signed in to Supabase',
      email,
      userId: data.user.id,
    };
  } catch (error: any) {
    console.error('Error signing in to Supabase:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      email,
    };
  }
}

export async function getCurrentExternalUser(): Promise<{ email: string; firstName: string; lastName: string } | null> {
  try {
    const authData = localStorage.getItem('auth');
    if (!authData) return null;

    const decrypted = atob(authData);
    const parsed = JSON.parse(decrypted);

    if (parsed.user) {
      return {
        email: parsed.user.email,
        firstName: parsed.user.firstName,
        lastName: parsed.user.lastName,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting current external user:', error);
    return null;
  }
}
