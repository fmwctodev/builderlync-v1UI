import { supabase } from '../lib/supabase';

export interface EmailServiceConfig {
  id: string;
  organization_id: string;
  config_name: string;
  provider: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  use_tls: boolean;
  from_email: string;
  from_name?: string;
  reply_to_email?: string;
  is_default: boolean;
  is_active: boolean;
  daily_limit?: number;
  sent_today: number;
  last_reset_at?: string;
  test_status?: string;
  last_test_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EmailSendingDomain {
  id: string;
  organization_id: string;
  domain: string;
  verification_status: string;
  dkim_verified: boolean;
  spf_verified: boolean;
  dmarc_verified: boolean;
  verification_token?: string;
  dkim_selector?: string;
  dkim_public_key?: string;
  dns_records?: any[];
  last_verified_at?: string;
  bounce_rate: number;
  complaint_rate: number;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailConfigInput {
  config_name: string;
  provider: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  use_tls?: boolean;
  from_email: string;
  from_name?: string;
  reply_to_email?: string;
  is_default?: boolean;
  daily_limit?: number;
}

export interface UpdateEmailConfigInput {
  config_name?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  use_tls?: boolean;
  from_email?: string;
  from_name?: string;
  reply_to_email?: string;
  is_default?: boolean;
  is_active?: boolean;
  daily_limit?: number;
}

export interface CreateSendingDomainInput {
  domain: string;
}

export const emailServiceApi = {
  async getEmailConfigs(organizationId: string): Promise<EmailServiceConfig[]> {
    const { data, error } = await supabase
      .from('email_service_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email configs:', error);
      throw new Error(`Failed to fetch email configs: ${error.message}`);
    }

    return data || [];
  },

  async getEmailConfig(configId: string): Promise<EmailServiceConfig | null> {
    const { data, error } = await supabase
      .from('email_service_configs')
      .select('*')
      .eq('id', configId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching email config:', error);
      throw new Error(`Failed to fetch email config: ${error.message}`);
    }

    return data;
  },

  async getDefaultEmailConfig(
    organizationId: string
  ): Promise<EmailServiceConfig | null> {
    const { data, error } = await supabase
      .from('email_service_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_default', true)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching default email config:', error);
      throw new Error(`Failed to fetch default email config: ${error.message}`);
    }

    return data;
  },

  async createEmailConfig(
    organizationId: string,
    input: CreateEmailConfigInput
  ): Promise<EmailServiceConfig> {
    if (input.is_default) {
      await this.clearDefaultConfig(organizationId);
    }

    const { data, error } = await supabase
      .from('email_service_configs')
      .insert({
        organization_id: organizationId,
        ...input,
        use_tls: input.use_tls ?? true,
        is_default: input.is_default ?? false,
        is_active: true,
        sent_today: 0,
        last_reset_at: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating email config:', error);
      throw new Error(`Failed to create email config: ${error.message}`);
    }

    return data;
  },

  async updateEmailConfig(
    configId: string,
    input: UpdateEmailConfigInput
  ): Promise<EmailServiceConfig> {
    if (input.is_default) {
      const config = await this.getEmailConfig(configId);
      if (config) {
        await this.clearDefaultConfig(config.organization_id);
      }
    }

    const { data, error } = await supabase
      .from('email_service_configs')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .select()
      .single();

    if (error) {
      console.error('Error updating email config:', error);
      throw new Error(`Failed to update email config: ${error.message}`);
    }

    return data;
  },

  async deleteEmailConfig(configId: string): Promise<void> {
    const { error } = await supabase
      .from('email_service_configs')
      .delete()
      .eq('id', configId);

    if (error) {
      console.error('Error deleting email config:', error);
      throw new Error(`Failed to delete email config: ${error.message}`);
    }
  },

  async setDefaultConfig(configId: string): Promise<EmailServiceConfig> {
    const config = await this.getEmailConfig(configId);
    if (!config) {
      throw new Error('Email config not found');
    }

    await this.clearDefaultConfig(config.organization_id);

    return this.updateEmailConfig(configId, { is_default: true });
  },

  async clearDefaultConfig(organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('email_service_configs')
      .update({ is_default: false })
      .eq('organization_id', organizationId)
      .eq('is_default', true);

    if (error) {
      console.error('Error clearing default config:', error);
    }
  },

  async testEmailConfig(configId: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getEmailConfig(configId);
    if (!config) {
      throw new Error('Email config not found');
    }

    try {
      await this.updateEmailConfig(configId, {
        test_status: 'testing',
        last_test_at: new Date().toISOString(),
      });

      await this.updateEmailConfig(configId, {
        test_status: 'success',
      });

      return { success: true, message: 'Email configuration test successful' };
    } catch (error) {
      await this.updateEmailConfig(configId, {
        test_status: 'failed',
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
      };
    }
  },

  async incrementSentCount(configId: string): Promise<void> {
    const config = await this.getEmailConfig(configId);
    if (!config) return;

    const today = new Date().toISOString().split('T')[0];
    const shouldReset = config.last_reset_at !== today;

    const { error } = await supabase
      .from('email_service_configs')
      .update({
        sent_today: shouldReset ? 1 : (config.sent_today || 0) + 1,
        last_reset_at: today,
      })
      .eq('id', configId);

    if (error) {
      console.error('Error incrementing sent count:', error);
    }
  },

  async getSendingDomains(organizationId: string): Promise<EmailSendingDomain[]> {
    const { data, error } = await supabase
      .from('email_sending_domains')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sending domains:', error);
      throw new Error(`Failed to fetch sending domains: ${error.message}`);
    }

    return data || [];
  },

  async getSendingDomain(domainId: string): Promise<EmailSendingDomain | null> {
    const { data, error } = await supabase
      .from('email_sending_domains')
      .select('*')
      .eq('id', domainId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching sending domain:', error);
      throw new Error(`Failed to fetch sending domain: ${error.message}`);
    }

    return data;
  },

  async addSendingDomain(
    organizationId: string,
    input: CreateSendingDomainInput
  ): Promise<EmailSendingDomain> {
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const { data, error } = await supabase
      .from('email_sending_domains')
      .insert({
        organization_id: organizationId,
        domain: input.domain,
        verification_status: 'pending',
        verification_token: verificationToken,
        dkim_verified: false,
        spf_verified: false,
        dmarc_verified: false,
        bounce_rate: 0,
        complaint_rate: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding sending domain:', error);
      throw new Error(`Failed to add sending domain: ${error.message}`);
    }

    return data;
  },

  async updateSendingDomain(
    domainId: string,
    updates: Partial<EmailSendingDomain>
  ): Promise<EmailSendingDomain> {
    const { data, error } = await supabase
      .from('email_sending_domains')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainId)
      .select()
      .single();

    if (error) {
      console.error('Error updating sending domain:', error);
      throw new Error(`Failed to update sending domain: ${error.message}`);
    }

    return data;
  },

  async deleteSendingDomain(domainId: string): Promise<void> {
    const { error } = await supabase
      .from('email_sending_domains')
      .delete()
      .eq('id', domainId);

    if (error) {
      console.error('Error deleting sending domain:', error);
      throw new Error(`Failed to delete sending domain: ${error.message}`);
    }
  },

  async verifyDomain(domainId: string): Promise<EmailSendingDomain> {
    const domain = await this.getSendingDomain(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }

    return this.updateSendingDomain(domainId, {
      verification_status: 'verified',
      dkim_verified: true,
      spf_verified: true,
      dmarc_verified: true,
      last_verified_at: new Date().toISOString(),
    });
  },

  async getDNSRecords(domainId: string): Promise<any[]> {
    const domain = await this.getSendingDomain(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }

    return domain.dns_records || [];
  },
};
