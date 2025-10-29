import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  getJobs: async () => {
    const response = await apiClient.get('/jobs');
    return response.data;
  },

  getOpportunities: async () => {
    const response = await apiClient.get('/opportunities');
    return response.data;
  },

  getMeasurements: async () => {
    const response = await apiClient.get('/measurements');
    return response.data;
  },

  getProposals: async () => {
    const response = await apiClient.get('/proposals');
    return response.data;
  },

  createJob: async (jobData: any) => {
    const response = await apiClient.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: any) => {
    const response = await apiClient.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  },
};