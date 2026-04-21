export type JobType = 'Residential' | 'Commercial' | 'Industrial' | 'Multifamily';

export type JobStage = 
  | 'New Job'
  | 'Proposal Sent'
  | 'Proposal Signed'
  | 'Scheduled'
  | 'In Progress'
  | 'Payments/Invoicing'
  | 'Job Completed'
  | 'Closed Lost';

export interface Job {
  id: string;
  title: string;
  contact_id: string;
  contact?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  job_type: JobType;
  value: number;
  stage: JobStage;
  status: 'active' | 'archived';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  assigned_to?: string;
  source?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}