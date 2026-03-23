import { supabase } from './supabase-client';
import {
  SuperAdminProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types/settings';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function getSuperAdminProfile(
  staffId: string
): Promise<{ success: boolean; data?: SuperAdminProfile; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_profiles')
      .select('*')
      .eq('staff_id', staffId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { data: newProfile, error: createError } = await supabase
        .from('super_admin_profiles')
        .insert({ staff_id: staffId })
        .select()
        .single();

      if (createError) throw createError;
      return { success: true, data: newProfile };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return { success: false, error: error.message };
  }
}

export async function updateSuperAdminProfile(
  staffId: string,
  request: UpdateProfileRequest
): Promise<{ success: boolean; data?: SuperAdminProfile; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_profiles')
      .update(request)
      .eq('staff_id', staffId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

export async function changePassword(
  request: ChangePasswordRequest
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: request.new_password,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return { success: false, error: error.message };
  }
}

export async function enable2FA(
  staffId: string
): Promise<{ success: boolean; data?: { secret: string; qrCode: string; backupCodes: string[] }; error?: string }> {
  try {
    const secret = authenticator.generateSecret();

    const { data: staffData, error: staffError } = await supabase
      .from('super_admin_staff')
      .select('email, first_name, last_name')
      .eq('id', staffId)
      .single();

    if (staffError) throw staffError;

    const otpauth = authenticator.keyuri(
      staffData.email,
      'BuilderLync Super Admin',
      secret
    );

    const qrCode = await QRCode.toDataURL(otpauth);

    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    const { error: updateError } = await supabase
      .from('super_admin_profiles')
      .upsert({
        staff_id: staffId,
        two_factor_enabled: true,
        two_factor_secret: secret,
        backup_codes: backupCodes,
      });

    if (updateError) throw updateError;

    return {
      success: true,
      data: {
        secret,
        qrCode,
        backupCodes,
      },
    };
  } catch (error: any) {
    console.error('Error enabling 2FA:', error);
    return { success: false, error: error.message };
  }
}

export async function disable2FA(
  staffId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('super_admin_profiles')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: null,
      })
      .eq('staff_id', staffId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error disabling 2FA:', error);
    return { success: false, error: error.message };
  }
}

export const profileService = {
  async getProfile(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: staffData, error: staffError } = await supabase
        .from('super_admin_staff')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (staffError) throw staffError;

      if (!staffData) {
        return {
          first_name: '',
          last_name: '',
          email: user.email || '',
          phone: '',
          timezone: 'America/Chicago',
          language: 'en-US',
        };
      }

      const { data: profileData } = await supabase
        .from('super_admin_profiles')
        .select('*')
        .eq('staff_id', staffData.id)
        .maybeSingle();

      return {
        ...staffData,
        ...profileData,
        staff_id: staffData.id,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile(updates: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: staffData } = await supabase
        .from('super_admin_staff')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (!staffData) throw new Error('Staff not found');

      const staffUpdates: any = {};
      const profileUpdates: any = {};

      if (updates.first_name !== undefined) staffUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) staffUpdates.last_name = updates.last_name;
      if (updates.phone !== undefined) staffUpdates.phone = updates.phone;

      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
      if (updates.timezone !== undefined) profileUpdates.timezone = updates.timezone;
      if (updates.language !== undefined) profileUpdates.language = updates.language;
      if (updates.avatar_url !== undefined) profileUpdates.avatar_url = updates.avatar_url;

      if (Object.keys(staffUpdates).length > 0) {
        const { error: staffError } = await supabase
          .from('super_admin_staff')
          .update(staffUpdates)
          .eq('id', staffData.id);

        if (staffError) throw staffError;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('super_admin_profiles')
          .upsert({
            staff_id: staffData.id,
            ...profileUpdates,
          });

        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async uploadAvatar(file: File): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('super-admin-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('super-admin-files')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  async deleteAvatar(avatarUrl: string): Promise<void> {
    try {
      const fileName = avatarUrl.split('/').pop();
      if (!fileName) return;

      const filePath = `avatars/${fileName}`;

      const { error } = await supabase.storage
        .from('super-admin-files')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  },

  async verify2FACode(staffId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('super_admin_profiles')
        .select('two_factor_secret, backup_codes')
        .eq('staff_id', staffId)
        .single();

      if (profileError) throw profileError;

      if (!profileData.two_factor_secret) {
        return { success: false, error: '2FA not enabled' };
      }

      const isValid = authenticator.verify({
        token: code,
        secret: profileData.two_factor_secret,
      });

      if (isValid) {
        return { success: true };
      }

      if (profileData.backup_codes && profileData.backup_codes.includes(code)) {
        const updatedCodes = profileData.backup_codes.filter((c: string) => c !== code);
        await supabase
          .from('super_admin_profiles')
          .update({ backup_codes: updatedCodes })
          .eq('staff_id', staffId);
        return { success: true };
      }

      return { success: false, error: 'Invalid code' };
    } catch (error: any) {
      console.error('Error verifying 2FA code:', error);
      return { success: false, error: error.message };
    }
  },

  async get2FAStatus(staffId: string): Promise<{ success: boolean; data?: { enabled: boolean; hasBackupCodes: boolean }; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('super_admin_profiles')
        .select('two_factor_enabled, backup_codes')
        .eq('staff_id', staffId)
        .maybeSingle();

      if (error) throw error;

      return {
        success: true,
        data: {
          enabled: data?.two_factor_enabled || false,
          hasBackupCodes: (data?.backup_codes?.length || 0) > 0,
        },
      };
    } catch (error: any) {
      console.error('Error getting 2FA status:', error);
      return { success: false, error: error.message };
    }
  },

  async disable2FA(staffId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('super_admin_profiles')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null,
        })
        .eq('staff_id', staffId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      return { success: false, error: error.message };
    }
  },
};
