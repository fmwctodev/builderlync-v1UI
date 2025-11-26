import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

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
  createdBy: number;
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
  jobType?: 'residential' | 'commercial' | 'insurance';
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
  createdBy: number;
  createdByName: string;
  editedBy: number;
  editedByName: string;
  jobType?: 'residential' | 'commercial' | 'insurance';
}

export const getJobs = async (page: number = 1, limit: number = 10): Promise<JobsResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<JobsResponse>(
    `${API_BASE_URL}/jobs?page=${page}&limit=${limit}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  console.log('Fetched jobs data:', response.data);
  if (response.data?.data?.data && response.data.data.data.length > 0) {
    console.log('Sample job data with jobType:', response.data.data.data[0]);
  }

  return response.data;
};

export const createJob = async (jobData: CreateJobRequest) => {
  const token = localStorage.getItem('token');
  
  const payload: any = { ...jobData };
  if (!payload.closeDate) delete payload.closeDate;
  if (!payload.dateOfLoss) delete payload.dateOfLoss;

  const response = await axios.post(
    `${API_BASE_URL}/jobs`,
    payload,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateJob = async (id: number, jobData: CreateJobRequest) => {
  const token = localStorage.getItem('token');

  const payload: any = { ...jobData };
  if (!payload.closeDate) delete payload.closeDate;
  if (!payload.dateOfLoss) delete payload.dateOfLoss;

  console.log('Updating job with payload:', payload);
  console.log('Job Type being sent:', payload.jobType);

  const response = await axios.put(
    `${API_BASE_URL}/jobs/${id}`,
    payload,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  console.log('Update response:', response.data);

  return response.data;
};

export const deleteJob = async (id: number) => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_BASE_URL}/jobs/${id}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getJobById = async (id: number) => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API_BASE_URL}/jobs/${id}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};