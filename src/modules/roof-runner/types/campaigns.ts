export type CampaignType = 'email' | 'sms';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

export type RecipientStatus = 'pending' | 'sent' | 'failed' | 'bounced';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  subject?: string;
  from_name?: string;
  from_email?: string;
  content: string;
  target_audience: TargetAudience;
  scheduled_date?: string;
  sent_at?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TargetAudience {
  filter_type?: 'all' | 'status' | 'opportunities';
  tags?: string[];
  job_statuses?: string[];
  opportunity_stages?: string[];
  pipeline_id?: number;
  job_type?: 'residential' | 'commercial';
  search?: string;
  date_range?: {
    start: string;
    end: string;
  };
  contact_ids?: string[];
  estimated_count?: number;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: RecipientStatus;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CampaignStats {
  id: string;
  campaign_id: string;
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  total_unsubscribed: number;
  last_updated: string;
}

export interface CampaignFormData {
  name: string;
  type: CampaignType;
  subject: string;
  from_name: string;
  from_email: string;
  content: string;
  target_audience: TargetAudience;
  scheduled_date?: string;
  tags: string[];
}

export const CAMPAIGN_TEMPLATES = {
  database_reactivation: {
    name: 'Database Reactivation',
    email_subject: 'We miss you! Special offer inside',
    email_content: `Hi {{first_name}},

We noticed it's been a while since we've heard from you. We wanted to reach out and see if there's anything we can help you with.

As a valued contact, we're offering a special discount on our roofing services this month.

Best regards,
{{company_name}}`,
    sms_content: 'Hi {{first_name}}! We miss you at {{company_name}}. Special offer this month - reply YES for details.',
  },
  follow_up: {
    name: 'Follow-up Sequence',
    email_subject: 'Following up on your roofing inquiry',
    email_content: `Hi {{first_name}},

Thank you for your interest in our roofing services. I wanted to follow up and see if you have any questions.

We're here to help and would love to discuss your project in more detail.

Best regards,
{{company_name}}`,
    sms_content: 'Hi {{first_name}}, following up on your roofing inquiry. Any questions? Text back or call us!',
  },
  proposal_followup: {
    name: 'Proposal Follow-up',
    email_subject: 'Your roofing proposal is ready',
    email_content: `Hi {{first_name}},

Your custom roofing proposal is ready for review. We've included detailed information about the scope of work and pricing.

Please let us know if you have any questions or would like to schedule a call to discuss.

Best regards,
{{company_name}}`,
    sms_content: 'Hi {{first_name}}, your roofing proposal is ready! Check your email or reply to schedule a call.',
  },
};
