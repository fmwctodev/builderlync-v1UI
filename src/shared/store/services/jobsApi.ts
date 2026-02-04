import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface Job {
  id: number;
  name: string;
  location: string;
  customerId?: number | null;
  customer_id?: number | null;
  assignees: number[];
  assigneeUsers?: Array<{
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  }>;
  jobOwner: number;
  job_owner?: number | null;
  jobOwnerUser?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  customer?: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    company: string;
  };
  workflowStages: string;
  workflow_stages?: string;
  closeDate: string;
  close_date?: string;
  jobValue: number;
  job_value?: string;
  source: string;
  details: string;
  createdBy: number;
  created_by?: number;
  insuranceEnabled: boolean;
  insurance_enabled?: boolean;
  insuranceCompany: string;
  insurance_company?: string;
  policyAccountNumber: string;
  policy_account_number?: string;
  claimNumber: string;
  claim_number?: string;
  dateOfLoss: string;
  date_of_loss?: string | null;
  typeOfDamage: string;
  type_of_damage?: string;
  claimAmount: number;
  claim_amount?: string;
  deductible: number;
  claimDetails: string;
  claim_details?: string;
  measurementsId: number | null;
  measurements_id?: number | null;
  proposalsId: number | null;
  proposals_id?: number | null;
  pdfSignerId: number | null;
  pdf_signer_id?: number | null;
  materialOrdersId: number | null;
  material_orders_id?: number | null;
  workOrdersId: number | null;
  work_orders_id?: number | null;
  invoiceId: number | null;
  invoice_id?: number | null;
  jobCostingsId: number | null;
  job_costings_id?: number | null;
  attachmentsId: number | null;
  attachments_id?: number | null;
  instantEstimateId: number | null;
  instant_estimate_id?: number | null;
  integrationsId: number | null;
  integrations_id?: number | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  createdByName: string;
  editedByName: string | null;
  editedBy: number | null;
  edited_by?: number | null;
  jobType?: 'residential' | 'commercial' | 'insurance';
  contactId?: number | null;
  contact_id?: number | null;
  contactName?: string | null;
  distance?: number | null;
  latitude?: string;
  longitude?: string;
  is_deleted?: boolean;
  deleted_by?: number | null;
  deleted_at?: string | null;
}

export interface JobsResponse {
  success: boolean;
  data: {
    data: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CreateJobRequest {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  customerId?: number | null;
  assignees: number[];
  jobOwner: number | null;
  workflowStages: string;
  closeDate?: string;
  jobValue: number;
  source: string;
  details: string;
  insuranceEnabled: boolean;
  insuranceCompany: string;
  policyAccountNumber: string;
  claimNumber: string;
  dateOfLoss?: string;
  typeOfDamage: string;
  claimAmount: number;
  deductible: number;
  claimDetails: string;
  createdBy: number | null;
  editedBy?: number | null;
  jobType?: 'residential' | 'commercial' | 'insurance';
  contactId?: number | null;
  contactName?: string | null;
}

class JobsApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getJobs(page: number = 1, limit: number = 10, filters?: {
    jobType?: string;
    workflowStage?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    assignees?: number[];
    stages?: string[];
    updatedDate?: string[];
    closeDate?: string[];
    leadSources?: string[];
  }): Promise<JobsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.jobType && filters.jobType !== 'all') {
      params.append('jobType', filters.jobType);
    }
    if (filters?.workflowStage) {
      params.append('workflowStage', filters.workflowStage);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.assignees && filters.assignees.length > 0) {
      params.append('assignees', filters.assignees.join(','));
    }
    if (filters?.stages && filters.stages.length > 0) {
      params.append('stages', filters.stages.join(','));
    }
    if (filters?.updatedDate && filters.updatedDate.length > 0) {
      params.append('updatedDate', filters.updatedDate.join(','));
    }
    if (filters?.closeDate && filters.closeDate.length > 0) {
      params.append('closeDate', filters.closeDate.join(','));
    }
    if (filters?.leadSources && filters.leadSources.length > 0) {
      params.append('leadSources', filters.leadSources.join(','));
    }

    return this.makeRequest(`/jobs?${params}`);
  }

  async getNearbyJobs(latitude: number, longitude: number, radius: number = 25): Promise<JobsResponse> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    });

    return this.makeRequest(`/jobs?${params}`);
  }

  async createJob(jobData: CreateJobRequest) {
    return this.makeRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: number, jobData: CreateJobRequest) {
    return this.makeRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: number) {
    return this.makeRequest(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobById(id: number) {
    return this.makeRequest(`/jobs/${id}`);
  }
}

const jobsApiService = new JobsApiService();

export const getJobs = jobsApiService.getJobs.bind(jobsApiService);
export const getNearbyJobs = jobsApiService.getNearbyJobs.bind(jobsApiService);
export const createJob = jobsApiService.createJob.bind(jobsApiService);
export const updateJob = jobsApiService.updateJob.bind(jobsApiService);
export const deleteJob = jobsApiService.deleteJob.bind(jobsApiService);
export const getJobById = jobsApiService.getJobById.bind(jobsApiService);