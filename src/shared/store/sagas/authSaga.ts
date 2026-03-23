import { call, put, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { authApi, RegisterRequest, LoginRequest, ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest } from '../services/authApi';
import {
  registerRequest, registerSuccess, registerFailure,
  loginRequest, loginSuccess, loginFailure,
  forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure,
  verifyOtpRequest, verifyOtpSuccess, verifyOtpFailure,
  resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure
} from '../slices/authSlice';
import { supabase, refreshSessionState } from '../../lib/supabase';

function* registerSaga(action: PayloadAction<RegisterRequest>): Generator<any, void, any> {
  try {
    if (!supabase) {
      throw new Error('Authentication service is not available. Please try again later.');
    }

    const { data: supabaseAuth, error: supabaseError } = yield call(
      [supabase.auth, 'signUp'],
      {
        email: action.payload.email,
        password: action.payload.password,
        options: {
          data: {
            full_name: `${action.payload.firstName} ${action.payload.lastName}`,
            first_name: action.payload.firstName,
            last_name: action.payload.lastName,
            company_name: action.payload.companyName,
          },
        },
      }
    );

    if (supabaseError) {
      throw new Error(supabaseError.message);
    }

    if (!supabaseAuth?.user) {
      throw new Error('Account creation failed. Please try again.');
    }

    yield call(refreshSessionState);

    const orgSlug = action.payload.companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50);

    const { error: setupError } = yield call(
      [supabase, 'rpc'],
      'setup_new_organization',
      {
        p_user_id: supabaseAuth.user.id,
        p_org_name: action.payload.companyName,
        p_org_slug: orgSlug,
      }
    );

    if (setupError) {
      console.error('Organization setup failed:', setupError.message);
    }

    try {
      yield call(authApi.register, action.payload);
    } catch (_e) {
      // External API is optional
    }

    const { data: { session } } = yield call([supabase.auth, 'getSession']);

    yield put(registerSuccess({
      user: {
        id: supabaseAuth.user.id,
        email: supabaseAuth.user.email || '',
        user_metadata: supabaseAuth.user.user_metadata,
        app_metadata: supabaseAuth.user.app_metadata,
        created_at: supabaseAuth.user.created_at,
        updated_at: supabaseAuth.user.updated_at,
      },
      token: session?.access_token || '',
    }));
  } catch (error: any) {
    yield put(registerFailure(error.message || 'Registration failed'));
  }
}

function* loginSaga(action: PayloadAction<LoginRequest>): Generator<any, void, any> {
  try {
    let supabaseAuthSuccess = false;
    let shouldMigrateUser = false;

    // Step 1: Try Supabase authentication first (preferred method)
    if (supabase) {
      const { data: supabaseAuth, error: supabaseError } = yield call(
        [supabase.auth, 'signInWithPassword'],
        {
          email: action.payload.email,
          password: action.payload.password,
        }
      );

      if (supabaseError) {
        // Any Supabase error means we should try external API as fallback
        // This includes: user not found, invalid credentials, database errors, permission issues
        console.warn('⚠️ Supabase authentication failed, will try external API:', supabaseError.message);
        shouldMigrateUser = true;
        // Continue to external API authentication
      } else if (supabaseAuth?.session) {
        // Supabase auth succeeded
        supabaseAuthSuccess = true;
        console.log('✅ Supabase session established successfully');
        yield call(refreshSessionState);
      }
    }

    // Step 2: Authenticate with external API
    // (Either as fallback for legacy users, or for backward compatibility)
    let externalApiSuccess = false;
    let externalApiData: any = null;

    try {
      const response = yield call(authApi.login, action.payload);
      externalApiData = response.data;
      externalApiSuccess = true;
      console.log('✅ External API authentication successful');
    } catch (apiError: any) {
      console.warn('⚠️ External API login failed:', apiError.message);

      // If Supabase succeeded but external API failed, that's OK
      if (supabaseAuthSuccess) {
        console.log('ℹ️ Continuing with Supabase session only');
        // Create user object from Supabase data
        const { data: { user } } = yield call([supabase.auth, 'getUser']);
        if (user) {
          const { data: { session } } = yield call([supabase.auth, 'getSession']);
          yield put(loginSuccess({
            user: {
              id: user.id,
              email: user.email || '',
              user_metadata: user.user_metadata,
              app_metadata: user.app_metadata,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
            token: session?.access_token || 'supabase-session',
          }));
          return;
        }
      }

      // Both failed - show error
      yield put(loginFailure(apiError.message || 'Invalid email or password. Please try again.'));
      return;
    }

    // Step 3: If external API succeeded but Supabase didn't, migrate the user
    if (externalApiSuccess && !supabaseAuthSuccess && shouldMigrateUser && supabase) {
      console.log('🔄 Migrating legacy user to Supabase...');

      try {
        // Try to create the user directly - simpler approach that doesn't require admin API
        console.log('ℹ️ Creating new Supabase account for user...');

        const { data: newUser, error: signUpError } = yield call(
          [supabase.auth, 'signUp'],
          {
            email: action.payload.email,
            password: action.payload.password,
            options: {
              data: {
                full_name: externalApiData.user?.name || externalApiData.user?.email?.split('@')[0] || 'User',
                migrated_from_external_api: true,
                migration_date: new Date().toISOString(),
              },
            },
          }
        );

        if (signUpError) {
          // Check if error is "user already exists" (race condition or previous migration)
          const isUserExistsError = signUpError.message.toLowerCase().includes('already') ||
                                   signUpError.message.toLowerCase().includes('registered') ||
                                   signUpError.message.toLowerCase().includes('exist');

          if (isUserExistsError) {
            console.log('ℹ️ User already exists in Supabase, attempting sign in...');

            // Try signing in since user already exists
            const { data: signInData, error: signInError} = yield call(
              [supabase.auth, 'signInWithPassword'],
              {
                email: action.payload.email,
                password: action.payload.password,
              }
            );

            if (!signInError && signInData?.session) {
              console.log('✅ Successfully signed into existing Supabase account');
              yield call(refreshSessionState);
              supabaseAuthSuccess = true;

              // Check if user has an organization, create one if missing
              try {
                const { data: finalOrgMembers } = yield supabase
                  .from('organization_members')
                  .select('organization_id')
                  .eq('user_id', signInData.user.id)
                  .limit(1);

                if (!finalOrgMembers || finalOrgMembers.length === 0) {
                  console.log('ℹ️ User has no organization, creating one...');

                  const companyName = externalApiData.user?.company_name ||
                                     externalApiData.user?.name ||
                                     externalApiData.user?.email?.split('@')[0] ||
                                     'My Company';

                  const orgSlug = companyName
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim()
                    .substring(0, 50);

                  const { data: organizationId, error: setupError } = yield call(
                    [supabase, 'rpc'],
                    'setup_new_organization',
                    {
                      p_user_id: signInData.user.id,
                      p_org_name: companyName,
                      p_org_slug: orgSlug,
                    }
                  );

                  if (setupError) {
                    console.error('⚠️ Organization setup failed:', setupError.message);
                  } else {
                    console.log('✅ Organization created for existing user:', organizationId);
                  }
                }
              } catch (orgCheckError: any) {
                console.error('⚠️ Error checking/creating organization:', orgCheckError);
              }
            } else {
              console.warn('⚠️ User exists but sign-in failed:', signInError?.message);
              console.log('ℹ️ User will continue with external API only');
            }
          } else {
            console.error('⚠️ User migration to Supabase failed:', signUpError.message);
            console.log('ℹ️ User will continue with external API authentication only');
          }
        } else if (newUser?.user) {
          console.log('✅ User successfully migrated to Supabase');

          // Set up organization for migrated user
          try {
            const companyName = externalApiData.user?.company_name ||
                               externalApiData.user?.name ||
                               externalApiData.user?.email?.split('@')[0] ||
                               'My Company';

            const orgSlug = companyName
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()
              .substring(0, 50);

            console.log('🏢 Setting up organization for migrated user...');

            const { data: organizationId, error: setupError } = yield call(
              [supabase, 'rpc'],
              'setup_new_organization',
              {
                p_user_id: newUser.user.id,
                p_org_name: companyName,
                p_org_slug: orgSlug,
              }
            );

            if (setupError) {
              console.error('⚠️ Organization setup failed:', setupError.message);
            } else {
              console.log('✅ Organization created for migrated user:', organizationId);
            }
          } catch (orgError: any) {
            console.error('⚠️ Error creating organization:', orgError);
          }

          // Now sign them in to Supabase
          const { data: signInData, error: signInError } = yield call(
            [supabase.auth, 'signInWithPassword'],
            {
              email: action.payload.email,
              password: action.payload.password,
            }
          );

          if (!signInError && signInData?.session) {
            console.log('✅ User signed into Supabase after migration');
            yield call(refreshSessionState);
            supabaseAuthSuccess = true;
          }
        }
      } catch (migrationError: any) {
        console.error('⚠️ Error during user migration:', migrationError);
        // Non-fatal, continue with external API auth
      }
    }

    // Step 4: Dispatch success - prioritize Supabase user data if available
    if (externalApiSuccess || supabaseAuthSuccess) {
      if (supabaseAuthSuccess) {
        // Use Supabase user data
        const { data: { user } } = yield call([supabase.auth, 'getUser']);
        const { data: { session } } = yield call([supabase.auth, 'getSession']);

        if (user) {
          yield put(loginSuccess({
            user: {
              id: user.id,
              email: user.email || '',
              user_metadata: user.user_metadata,
              app_metadata: user.app_metadata,
              created_at: user.created_at,
              updated_at: user.updated_at,
            },
            token: session?.access_token || 'supabase-session',
          }));
          console.log('✅ Login complete with Supabase authentication');
          return;
        }
      }

      // Fallback to external API data
      if (externalApiSuccess) {
        yield put(loginSuccess(externalApiData));
        console.log('⚠️ Login complete with external API only (Supabase session not established)');
      }
    }

  } catch (error: any) {
    console.error('❌ Unexpected login error:', error);
    yield put(loginFailure(error.message || 'An unexpected error occurred. Please try again.'));
  }
}

function* forgotPasswordSaga(action: PayloadAction<ForgotPasswordRequest>): Generator<any, void, any> {
  try {
    yield call(authApi.forgotPassword, action.payload);
    yield put(forgotPasswordSuccess(action.payload.email));
  } catch (error: any) {
    yield put(forgotPasswordFailure(error.message || 'Failed to send OTP'));
  }
}

function* verifyOtpSaga(action: PayloadAction<VerifyOtpRequest>): Generator<any, void, any> {
  try {
    const response = yield call(authApi.verifyOtp, action.payload);
    console.log('OTP verification response:', JSON.stringify(response));
    yield put(verifyOtpSuccess(response.data.token));
  } catch (error: any) {
    yield put(verifyOtpFailure(error.message || 'OTP verification failed'));
  }
}

function* resetPasswordSaga(action: PayloadAction<ResetPasswordRequest>): Generator<any, void, any> {
  try {
    yield call(authApi.resetPassword, action.payload);
    yield put(resetPasswordSuccess());
  } catch (error: any) {
    yield put(resetPasswordFailure(error.message || 'Password reset failed'));
  }
}

export function* watchAuthSagas() {
  yield takeEvery(registerRequest.type, registerSaga);
  yield takeEvery(loginRequest.type, loginSaga);
  yield takeEvery(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeEvery(verifyOtpRequest.type, verifyOtpSaga);
  yield takeEvery(resetPasswordRequest.type, resetPasswordSaga);
}