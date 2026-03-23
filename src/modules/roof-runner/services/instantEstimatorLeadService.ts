import { supabase } from '../../../shared/lib/supabase';
import { instantEstimatorSettingsApi } from './instantEstimatorSettingsApi';
import { opportunitiesApi } from './opportunitiesApi';
import { pipelinesApi } from './pipelinesApi';
import { getEmbeddedPipelineId } from '../constants/embeddedPipelines';
import type { CreateLeadData, LeadPipelineType, InstantEstimatorLead } from '../types/instantEstimatorSettings';
import type { OpportunityFormData, JobType } from '../types/opportunities';

export interface LeadToOpportunityConfig {
  organizationId: string;
  estimatorId: string;
  estimatorName: string;
  defaultJobOwnerId?: string | null;
  pipelineType: LeadPipelineType;
  webhookEnabled?: boolean;
  webhookUrl?: string | null;
  notificationEmail?: string | null;
}

export interface LeadConversionResult {
  lead: InstantEstimatorLead;
  opportunityId: string;
  success: boolean;
  message: string;
}

export const instantEstimatorLeadService = {
  async createLeadAndOpportunity(
    leadData: CreateLeadData,
    config: LeadToOpportunityConfig
  ): Promise<LeadConversionResult> {
    try {
      const lead = await instantEstimatorSettingsApi.createLead(config.organizationId, {
        ...leadData,
        pipeline_type: config.pipelineType,
      });

      const pipelineId = getEmbeddedPipelineId(config.pipelineType as JobType);

      const pipeline = await pipelinesApi.getPipelineById(pipelineId);
      if (!pipeline) {
        throw new Error(`Pipeline not found for type: ${config.pipelineType}`);
      }

      const newLeadStage = pipeline.stages?.find(
        (s) => s.name.toLowerCase().includes('new lead')
      );
      if (!newLeadStage) {
        throw new Error('New Lead stage not found in pipeline');
      }

      const opportunityName = `${config.estimatorName} - ${leadData.contact_name || 'New Lead'}`;

      const opportunityData: OpportunityFormData = {
        opportunity_name: opportunityName,
        pipeline_id: pipelineId,
        stage_id: newLeadStage.id,
        status: 'open',
        value: leadData.estimated_price || 0,
        owner_id: config.defaultJobOwnerId || null,
        source: 'Instant Estimator',
        contact_name: leadData.contact_name || '',
        contact_email: leadData.contact_email || null,
        contact_phone: leadData.contact_phone || null,
        property_address: leadData.property_address || null,
        property_city: leadData.property_city || null,
        property_state: leadData.property_state || null,
        property_zip: leadData.property_zip || null,
        tags: ['instant-estimator', config.pipelineType.toLowerCase()],
      };

      const opportunity = await opportunitiesApi.createOpportunity(
        opportunityData,
        config.organizationId
      );

      await instantEstimatorSettingsApi.updateLeadStatus(lead.id, 'converted', opportunity.id);

      if (config.webhookEnabled && config.webhookUrl) {
        this.triggerWebhook(config.webhookUrl, {
          event: 'lead_created',
          lead,
          opportunity_id: opportunity.id,
          estimator_id: config.estimatorId,
          estimator_name: config.estimatorName,
          timestamp: new Date().toISOString(),
        }).catch((err) => console.error('Webhook trigger failed:', err));
      }

      if (config.notificationEmail) {
        this.sendLeadNotification(config.notificationEmail, {
          leadName: leadData.contact_name || 'New Lead',
          leadEmail: leadData.contact_email,
          leadPhone: leadData.contact_phone,
          propertyAddress: leadData.property_address,
          estimatorName: config.estimatorName,
          estimatedPrice: leadData.estimated_price,
          pipelineType: config.pipelineType,
        }).catch((err) => console.error('Email notification failed:', err));
      }

      return {
        lead,
        opportunityId: opportunity.id,
        success: true,
        message: 'Lead created and converted to opportunity successfully',
      };
    } catch (error) {
      console.error('Error creating lead and opportunity:', error);
      throw error;
    }
  },

  async triggerWebhook(
    url: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Webhook trigger error:', error);
      throw error;
    }
  },

  async sendLeadNotification(
    email: string,
    data: {
      leadName: string;
      leadEmail?: string | null;
      leadPhone?: string | null;
      propertyAddress?: string | null;
      estimatorName: string;
      estimatedPrice?: number | null;
      pipelineType: LeadPipelineType;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `New ${data.pipelineType} Lead from ${data.estimatorName}`,
          html: `
            <h2>New Lead from Instant Estimator</h2>
            <p><strong>Estimator:</strong> ${data.estimatorName}</p>
            <p><strong>Pipeline:</strong> ${data.pipelineType}</p>
            <hr />
            <h3>Contact Information</h3>
            <p><strong>Name:</strong> ${data.leadName}</p>
            ${data.leadEmail ? `<p><strong>Email:</strong> ${data.leadEmail}</p>` : ''}
            ${data.leadPhone ? `<p><strong>Phone:</strong> ${data.leadPhone}</p>` : ''}
            ${data.propertyAddress ? `<p><strong>Property:</strong> ${data.propertyAddress}</p>` : ''}
            ${data.estimatedPrice ? `<p><strong>Estimated Value:</strong> $${data.estimatedPrice.toLocaleString()}</p>` : ''}
          `,
        },
      });

      if (error) {
        console.error('Email notification error:', error);
      }
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  },

  async getLeadsByPipelineType(
    organizationId: string,
    pipelineType: LeadPipelineType
  ): Promise<InstantEstimatorLead[]> {
    return instantEstimatorSettingsApi.getLeads(organizationId, { pipeline_type: pipelineType });
  },

  async dismissLead(leadId: string): Promise<InstantEstimatorLead> {
    return instantEstimatorSettingsApi.updateLeadStatus(leadId, 'dismissed');
  },
};
