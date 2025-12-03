import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface Job {
  id: number;
  name: string;
  location: string;
  assignees: string[];
  jobOwner: string;
  workflowStages: string;
  closeDate: string;
  jobValue: number;
  source: string;
  details: string;
  createdBy: string;
  insuranceEnabled: boolean;
  insuranceCompany: string;
  policyAccountNumber: string;
  claimNumber: string;
  dateOfLoss: string;
  typeOfDamage: string;
  claimAmount: number;
  deductible: number;
  claimDetails: string;
  measurementsId: number | null;
  proposalsId: number | null;
  pdfSignerId: number | null;
  materialOrdersId: number | null;
  workOrdersId: number | null;
  invoiceId: number | null;
  jobCostingsId: number | null;
  attachmentsId: number | null;
  instantEstimateId: number | null;
  integrationsId: number | null;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  editedByName: string | null;
  editedBy: string | null;
  jobType?: 'residential' | 'commercial' | 'insurance';
  contactId?: number | null;
  contactName?: string | null;
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
  assignees: string[];
  jobOwner: string;
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
  createdBy: string;
  createdByName: string;
  editedBy: string;
  editedByName: string;
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

  async getJobs(page: number = 1, limit: number = 10): Promise<JobsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
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
export const createJob = jobsApiService.createJob.bind(jobsApiService);
export const updateJob = jobsApiService.updateJob.bind(jobsApiService);
export const deleteJob = jobsApiService.deleteJob.bind(jobsApiService);
export const getJobById = jobsApiService.getJobById.bind(jobsApiService);