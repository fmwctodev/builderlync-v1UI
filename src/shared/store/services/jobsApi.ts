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
  insuranceEnabled: boolean;
  insuranceCompany: string;
  policyAccountNumber: string;
  claimNumber: string;
  dateOfLoss: string;
  typeOfDamage: string;
  claimAmount: number;
  deductible: number;
  claimDetails: string;
  createdBy: number;
  createdByName: string;
  editedBy: number;
  editedByName: string;
  createdAt: string;
  updatedAt: string;
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
  closeDate: string;
  jobValue: number;
  source: string;
  details: string;
  insuranceEnabled: boolean;
  insuranceCompany: string;
  policyAccountNumber: string;
  claimNumber: string;
  dateOfLoss: string;
  typeOfDamage: string;
  claimAmount: number;
  deductible: number;
  claimDetails: string;
  createdBy: number;
  createdByName: string;
  editedBy: number;
  editedByName: string;
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

  return response.data;
};

export const createJob = async (jobData: CreateJobRequest) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/jobs`,
    jobData,
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

  const response = await axios.put(
    `${API_BASE_URL}/jobs/${id}`,
    jobData,
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