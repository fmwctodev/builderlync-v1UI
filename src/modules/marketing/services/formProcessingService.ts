import { supabase } from '../../../shared/lib/supabase';
import type {
  MarketingForm,
  FormSubmission,
  FormSubmissionMetadata,
} from '../types/forms';

export const formProcessingService = {
  async processSubmission(
    form: MarketingForm,
    submissionData: Record<string, any>,
    metadata: FormSubmissionMetadata
  ): Promise<{ success: boolean; submissionId: string; error?: string }> {
    try {
      const submissionId = crypto.randomUUID();

      const submission: Partial<FormSubmission> = {
        id: submissionId,
        organization_id: form.organization_id,
        form_id: form.id,
        submission_data: submissionData,
        metadata,
        status: 'pending',
      };

      const { error: insertError } = await supabase
        .from('form_submissions')
        .insert([submission]);

      if (insertError) {
        console.error('Error inserting submission:', insertError);
        throw insertError;
      }

      this.processSubmissionAsync(submissionId, form, submissionData, metadata);

      return { success: true, submissionId };
    } catch (error) {
      console.error('Error processing submission:', error);
      return {
        success: false,
        submissionId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async processSubmissionAsync(
    submissionId: string,
    form: MarketingForm,
    submissionData: Record<string, any>,
    metadata: FormSubmissionMetadata
  ): Promise<void> {
    try {
      const contact = await this.createOrUpdateContact(
        form.organization_id,
        submissionData,
        metadata
      );

      let opportunityId: string | undefined;

      if (form.pipeline_id && contact) {
        opportunityId = await this.createOpportunity(
          form.organization_id,
          form.pipeline_id,
          form.stage_id,
          contact.id,
          submissionData
        );
      }

      await supabase
        .from('form_submissions')
        .update({
          status: 'processed',
          contact_id: contact?.id,
          opportunity_id: opportunityId,
          processed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (form.settings?.notifications?.enabled) {
        await this.sendNotifications(form, submissionData, contact);
      }
    } catch (error) {
      console.error('Error in async processing:', error);

      await supabase
        .from('form_submissions')
        .update({
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);
    }
  },

  async createOrUpdateContact(
    organizationId: string,
    submissionData: Record<string, any>,
    metadata: FormSubmissionMetadata
  ): Promise<{ id: string; email: string } | null> {
    try {
      const email = this.extractEmail(submissionData);
      const phone = this.extractPhone(submissionData);

      if (!email && !phone) {
        console.warn('No email or phone found in submission');
        return null;
      }

      let existingContact = null;

      if (email) {
        const { data } = await supabase
          .from('contacts')
          .select('id, email')
          .eq('organization_id', organizationId)
          .eq('email', email)
          .maybeSingle();

        existingContact = data;
      }

      if (!existingContact && phone) {
        const { data } = await supabase
          .from('contacts')
          .select('id, email')
          .eq('organization_id', organizationId)
          .eq('phone', phone)
          .maybeSingle();

        existingContact = data;
      }

      if (existingContact) {
        return existingContact;
      }

      const firstName = submissionData.first_name || submissionData.firstName || '';
      const lastName = submissionData.last_name || submissionData.lastName || '';
      const fullName = submissionData.name || submissionData.full_name ||
                       (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'Unknown');

      const nameParts = fullName.trim().split(' ');
      const first_name = firstName || nameParts[0] || 'Unknown';
      const last_name = lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

      const contactData = {
        organization_id: organizationId,
        first_name,
        last_name,
        full_name: fullName,
        email: email || '',
        phone: phone || '',
        company: submissionData.company || submissionData.company_name || '',
        address: submissionData.address || '',
        type: 'lead',
        label_or_role: 'Lead',
        source: 'website',
        tags: ['form-lead'],
      };

      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select('id, email')
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }

      return newContact;
    } catch (error) {
      console.error('Error in createOrUpdateContact:', error);
      return null;
    }
  },

  async createOpportunity(
    organizationId: string,
    pipelineId: string,
    stageId: string | undefined,
    contactId: string,
    submissionData: Record<string, any>
  ): Promise<string | undefined> {
    try {
      let targetStageId = stageId;

      if (!targetStageId) {
        const { data: stages } = await supabase
          .from('pipeline_stages')
          .select('id')
          .eq('pipeline_id', pipelineId)
          .order('order_index', { ascending: true })
          .limit(1);

        if (stages && stages.length > 0) {
          targetStageId = stages[0].id;
        }
      }

      if (!targetStageId) {
        console.warn('No stage found for pipeline');
        return undefined;
      }

      const opportunityName = submissionData.opportunity_name ||
                             submissionData.project_name ||
                             `New Lead - ${submissionData.name || submissionData.email || 'Unknown'}`;

      const opportunityData = {
        organization_id: organizationId,
        pipeline_id: pipelineId,
        stage_id: targetStageId,
        name: opportunityName,
        status: 'active',
        priority: 'medium',
        source: 'website',
        notes: this.generateNotesFromSubmission(submissionData),
      };

      const { data: opportunity, error: oppError } = await supabase
        .from('opportunities')
        .insert([opportunityData])
        .select('id')
        .single();

      if (oppError) {
        console.error('Error creating opportunity:', oppError);
        throw oppError;
      }

      await supabase
        .from('opportunity_contacts')
        .insert([{
          opportunity_id: opportunity.id,
          contact_id: contactId,
          role: 'primary',
        }]);

      return opportunity.id;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      return undefined;
    }
  },

  extractEmail(data: Record<string, any>): string | null {
    const emailFields = ['email', 'email_address', 'emailAddress', 'contact_email'];

    for (const field of emailFields) {
      if (data[field] && typeof data[field] === 'string') {
        return data[field];
      }
    }

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.includes('@')) {
        return value;
      }
    }

    return null;
  },

  extractPhone(data: Record<string, any>): string | null {
    const phoneFields = ['phone', 'phone_number', 'phoneNumber', 'contact_phone', 'mobile'];

    for (const field of phoneFields) {
      if (data[field] && typeof data[field] === 'string') {
        return data[field];
      }
    }

    return null;
  },

  generateNotesFromSubmission(data: Record<string, any>): string {
    const notes: string[] = ['Form Submission Details:', ''];

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'email' && key !== 'phone' && key !== 'name' && key !== 'first_name' && key !== 'last_name') {
        const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
        notes.push(`${capitalizedLabel}: ${value}`);
      }
    }

    return notes.join('\n');
  },

  async sendNotifications(
    form: MarketingForm,
    submissionData: Record<string, any>,
    contact: { id: string; email: string } | null
  ): Promise<void> {
    try {
      const recipients = form.settings?.notifications?.recipients || [];

      if (recipients.length === 0) {
        return;
      }

      console.log('TODO: Send email notifications to:', recipients);
      console.log('Submission data:', submissionData);
      console.log('Contact:', contact);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  },

  validateSubmission(
    form: MarketingForm,
    submissionData: Record<string, any>
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const field of form.fields) {
      const value = submissionData[field.id];

      if (field.validation?.required && !value) {
        errors[field.id] = field.validation.customError || `${field.label} is required`;
        continue;
      }

      if (value && field.validation) {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors[field.id] = 'Invalid email address';
          }
        }

        if (field.type === 'phone') {
          const phoneRegex = /^[\d\s\-\(\)\+]+$/;
          if (!phoneRegex.test(value)) {
            errors[field.id] = 'Invalid phone number';
          }
        }

        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors[field.id] = `Must be at least ${field.validation.minLength} characters`;
        }

        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors[field.id] = `Must be no more than ${field.validation.maxLength} characters`;
        }

        if (field.validation.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors[field.id] = field.validation.customError || 'Invalid format';
          }
        }

        if (field.type === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors[field.id] = 'Must be a valid number';
          } else {
            if (field.validation.min !== undefined && numValue < field.validation.min) {
              errors[field.id] = `Must be at least ${field.validation.min}`;
            }
            if (field.validation.max !== undefined && numValue > field.validation.max) {
              errors[field.id] = `Must be no more than ${field.validation.max}`;
            }
          }
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};
