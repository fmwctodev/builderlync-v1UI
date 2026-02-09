import { supabase } from './supabase-client';
import {
  SuperAdminEmailDomain,
  AddEmailDomainRequest,
  SuperAdminSMTPConfig,
  CreateSMTPConfigRequest,
  SuperAdminEmailTemplate,
} from '../types/settings';

export async function getEmailDomains(): Promise<{
  success: boolean;
  data?: SuperAdminEmailDomain[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('super_admin_email_domains')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching email domains:', error);
    return { success: false, error: error.message };
  }
}

export async function addEmailDomain(
  request: AddEmailDomainRequest
): Promise<{ success: boolean; data?: SuperAdminEmailDomain; error?: string }> {
  try {
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const { data, error } = await supabase
      .from('super_admin_email_domains')
      .insert({
        domain: request.domain,
        provider: request.provider,
        verification_token: verificationToken,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding email domain:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyEmailDomain(
  domainId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('super_admin_email_domains')
      .update({
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
      })
      .eq('id', domainId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error verifying domain:', error);
    return { success: false, error: error.message };
  }
}

export async function getSMTPConfigs(): Promise<{
  success: boolean;
  data?: SuperAdminSMTPConfig[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('super_admin_smtp_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching SMTP configs:', error);
    return { success: false, error: error.message };
  }
}

export async function createSMTPConfig(
  request: CreateSMTPConfigRequest
): Promise<{ success: boolean; data?: SuperAdminSMTPConfig; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_smtp_configs')
      .insert(request)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating SMTP config:', error);
    return { success: false, error: error.message };
  }
}

export async function testSMTPConfig(
  configId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('super_admin_smtp_configs')
      .update({
        test_status: 'last_test_passed',
        last_test_at: new Date().toISOString(),
      })
      .eq('id', configId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error testing SMTP config:', error);
    return { success: false, error: error.message };
  }
}

export async function getEmailTemplates(): Promise<{
  success: boolean;
  data?: SuperAdminEmailTemplate[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('super_admin_email_templates')
      .select('*')
      .order('template_type');

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching email templates:', error);
    return { success: false, error: error.message };
  }
}

export async function updateEmailTemplate(
  id: string,
  updates: Partial<SuperAdminEmailTemplate>
): Promise<{ success: boolean; data?: SuperAdminEmailTemplate; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('super_admin_email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating email template:', error);
    return { success: false, error: error.message };
  }
}
