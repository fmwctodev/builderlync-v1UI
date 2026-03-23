import { supabase } from '../lib/supabase';

export async function runAuthDiagnostics() {
  console.group('🔍 Authentication Diagnostics');

  try {
    console.log('1️⃣ Checking Supabase client...');
    if (!supabase) {
      console.error('❌ Supabase client is not initialized!');
      console.groupEnd();
      return;
    }
    console.log('✅ Supabase client is initialized');

    console.log('\n2️⃣ Checking session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    } else if (!sessionData?.session) {
      console.warn('⚠️ No active session found');
      console.log('   → User needs to log in');
    } else {
      console.log('✅ Active session found:');
      console.log('   - User ID:', sessionData.session.user.id);
      console.log('   - Email:', sessionData.session.user.email);
      console.log('   - Expires at:', new Date(sessionData.session.expires_at! * 1000).toLocaleString());
    }

    console.log('\n3️⃣ Checking localStorage...');
    const storageKey = 'builderlynk-auth';
    const storedAuth = localStorage.getItem(`sb-${storageKey.replace('builderlynk-', '')}-auth-token`);
    if (storedAuth) {
      console.log('✅ Auth token found in localStorage');
      try {
        const parsed = JSON.parse(storedAuth);
        console.log('   - Access token exists:', !!parsed?.access_token);
        console.log('   - Refresh token exists:', !!parsed?.refresh_token);
      } catch (e) {
        console.error('   ❌ Failed to parse stored auth token');
      }
    } else {
      console.warn('⚠️ No auth token in localStorage');
    }

    console.log('\n4️⃣ Checking user via getUser()...');
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ Error getting user:', userError);
    } else if (!userData?.user) {
      console.warn('⚠️ No user returned from getUser()');
    } else {
      console.log('✅ User data retrieved:');
      console.log('   - User ID:', userData.user.id);
      console.log('   - Email:', userData.user.email);
    }

    console.log('\n5️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('role_templates')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database query failed:', testError.message);
      console.log('   Error details:', testError);
    } else {
      console.log('✅ Database connection successful');
    }

  } catch (error) {
    console.error('❌ Unexpected error during diagnostics:', error);
  }

  console.groupEnd();
}

if (typeof window !== 'undefined') {
  (window as any).runAuthDiagnostics = runAuthDiagnostics;
  console.log('💡 Run window.runAuthDiagnostics() in the console to check auth status');
}
