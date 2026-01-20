import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  getJobs: async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/jobs?page=${page}&limit=${limit}`);
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

  // Instant Estimators API
  getInstantEstimators: async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/instant-estimators?page=${page}&limit=${limit}`);
    return response.data;
  },

  createInstantEstimator: async (data: { name: string }) => {
    const response = await apiClient.post('/instant-estimators', data);
    return response.data;
  },

  renameInstantEstimator: async (id: number, data: { name: string }) => {
    const response = await apiClient.put(`/instant-estimators/${id}/rename`, data);
    return response.data;
  },

  duplicateInstantEstimator: async (id: number) => {
    const response = await apiClient.post(`/instant-estimators/${id}/duplicate`);
    return response.data;
  },

  deleteInstantEstimator: async (id: number) => {
    const response = await apiClient.delete(`/instant-estimators/${id}`);
    return response.data;
  },

  getInstantEstimator: async (id: number) => {
    const response = await apiClient.get(`/instant-estimators/${id}`);
    console.log("get instant estimator ", response.data);
    return response.data;
  },

  updateInstantEstimatorQuestions: async (id: number, questions: any[]) => {
    const response = await apiClient.put(`/instant-estimators/${id}/questions`, { questions });
    return response.data;
  },

  updateInstantEstimatorMaterials: async (id: number, materials: any[]) => {
    const response = await apiClient.put(`/instant-estimators/${id}/materials`, { materials });
    return response.data;
  },

  addInstantEstimatorMaterial: async (id: number, material: any) => {
    const response = await apiClient.post(`/instant-estimators/${id}/materials`, material);
    return response.data;
  },

  updateInstantEstimatorMaterial: async (id: number, materialId: string, material: any) => {
    const response = await apiClient.put(`/instant-estimators/${id}/materials/${materialId}`, material);
    return response.data;
  },

  deleteInstantEstimatorMaterial: async (id: number, materialId: string) => {
    const response = await apiClient.delete(`/instant-estimators/${id}/materials/${materialId}`);
    return response.data;
  },

  updateInstantEstimatorPricingSettings: async (id: number, pricingSettings: any) => {
    const response = await apiClient.put(`/instant-estimators/${id}/pricing-settings`, pricingSettings);
    return response.data;
  },

  updateInstantEstimatorAdditionalSettings: async (id: number, additionalSettings: any) => {
    const response = await apiClient.put(`/instant-estimators/${id}/additional-settings`, additionalSettings);
    return response.data;
  },

  updateInstantEstimator: async (id: number, data: any) => {
    const response = await apiClient.put(`/instant-estimators/${id}`, data);
    return response.data;
  },

  getInstantEstimatorByPublicUrl: async (publicUrl: string) => {
    const response = await apiClient.get(`/instant-estimators/public/${publicUrl}`);
    return response.data;
  },

  generateEstimate: async (publicUrl: string, formData: any) => {
    const response = await apiClient.post(`/instant-estimators/public/${publicUrl}/generate-estimate`, formData);
    return response.data;
  },

  getGeneratedEstimate: async (leadId: string) => {
    const response = await apiClient.get(`/instant-estimators/public/estimate/${leadId}`);
    return response.data;
  },

  requestProposal: async (leadId: string, materialId: string) => {
    const response = await apiClient.post(`/instant-estimators/public/estimate/${leadId}/request-proposal`, { materialId });
    return response.data;
  },

  requestPropertyData: async (publicUrl: string, address: string) => {
    const response = await apiClient.post(`/instant-estimators/public/${publicUrl}/property-data`, { address });
    return response.data;
  },

  getPropertyDataResult: async (publicUrl: string, requestId: string) => {
    const response = await apiClient.get(`/instant-estimators/public/${publicUrl}/property-data/${requestId}`);
    return response.data;
  },

  getBusinessProfile: async () => {
    const response = await apiClient.get('/organizations/profile');
    return response.data;
  },
  // Material Templates
  getMaterialTemplates: async () => {
    const response = await apiClient.get('/instant-estimators/material-templates');
    return response.data;
  },

  addMaterialTemplate: async (data: any) => {
    const response = await apiClient.post('/instant-estimators/material-templates', data);
    return response.data;
  },

  deleteMaterialTemplate: async (id: string) => {
    const response = await apiClient.delete(`/instant-estimators/material-templates/${id}`);
    return response.data;
  },

  // Pipelines
  getPipelines: async () => {
    const response = await apiClient.get('/pipelines');
    return response.data;
  },

  getPipelineStages: async (pipelineId: string) => {
    const response = await apiClient.get(`/pipelines/${pipelineId}/stages`);
    return response.data;
  },

  // Staff
  getStaff: async () => {
    const response = await apiClient.get('/staff?limit=100');
    return response.data;
  }
};