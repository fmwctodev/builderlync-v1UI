import { supabase } from '../../lib/supabase';

export interface VerificationCode {
  id: string;
  contact_id: string;
  verification_type: 'phone' | 'email';
  code: string;
  expires_at: string;
  verified_at?: string;
  attempts: number;
  created_at: string;
}

export const sendVerificationCode = async (
  contactId: string,
  verificationType: 'phone' | 'email',
  contactValue: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase.from('verification_codes').insert({
      contact_id: contactId,
      verification_type: verificationType,
      code,
      expires_at: expiresAt.toISOString(),
      user_id: user.user.id,
      attempts: 0
    });

    if (error) {
      console.error('Error creating verification code:', error);
      return { success: false, error: error.message };
    }

    console.log(`Verification code ${code} sent to ${contactValue} (${verificationType})`);

    return { success: true };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
};

export const verifyCode = async (
  contactId: string,
  verificationType: 'phone' | 'email',
  code: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: verificationCodes, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('contact_id', contactId)
      .eq('verification_type', verificationType)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !verificationCodes || verificationCodes.length === 0) {
      return { success: false, error: 'No verification code found' };
    }

    const verificationRecord = verificationCodes[0];

    if (new Date(verificationRecord.expires_at) < new Date()) {
      return { success: false, error: 'Verification code has expired' };
    }

    if (verificationRecord.attempts >= 5) {
      return { success: false, error: 'Too many attempts. Please request a new code.' };
    }

    if (verificationRecord.code !== code) {
      await supabase
        .from('verification_codes')
        .update({ attempts: verificationRecord.attempts + 1 })
        .eq('id', verificationRecord.id);

      return { success: false, error: 'Invalid verification code' };
    }

    const now = new Date().toISOString();

    await supabase
      .from('verification_codes')
      .update({ verified_at: now })
      .eq('id', verificationRecord.id);

    const updateField = verificationType === 'phone' ? 'phone_verified' : 'email_verified';
    const updateDateField = verificationType === 'phone' ? 'phone_verified_at' : 'email_verified_at';

    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        [updateField]: true,
        [updateDateField]: now
      })
      .eq('id', contactId);

    if (updateError) {
      console.error('Error updating contact verification status:', updateError);
      return { success: false, error: 'Failed to update verification status' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { success: false, error: 'Failed to verify code' };
  }
};

export const checkVerificationStatus = async (
  contactId: string
): Promise<{
  phoneVerified: boolean;
  emailVerified: boolean;
  phoneVerifiedAt?: string;
  emailVerifiedAt?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('phone_verified, email_verified, phone_verified_at, email_verified_at')
      .eq('id', contactId)
      .single();

    if (error || !data) {
      return {
        phoneVerified: false,
        emailVerified: false
      };
    }

    return {
      phoneVerified: data.phone_verified || false,
      emailVerified: data.email_verified || false,
      phoneVerifiedAt: data.phone_verified_at,
      emailVerifiedAt: data.email_verified_at
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return {
      phoneVerified: false,
      emailVerified: false
    };
  }
};

export const cleanupExpiredCodes = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('cleanup_expired_verification_codes');

    if (error) {
      console.error('Error cleaning up expired codes:', error);
    }
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
};
