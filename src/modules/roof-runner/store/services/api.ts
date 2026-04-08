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

  getJob: async (id: number | string) => {
    const response = await apiClient.get(`/jobs/${id}`);
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

  updateInstantEstimatorContactSettings: async (id: number, contactSettings: any) => {
    const response = await apiClient.put(`/instant-estimators/${id}/contact-settings`, contactSettings);
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

  getGoogleSolarData: async (publicUrl: string, address: string) => {
    const response = await apiClient.post(`/instant-estimators/public/${publicUrl}/google-solar-data`, { address });
    return response.data;
  },

  getGoogleSolarDataByCoords: async (publicUrl: string, lat: number, lng: number) => {
    const response = await apiClient.post(`/instant-estimators/public/${publicUrl}/google-solar-data-by-coords`, { lat, lng });
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
  },

  // Proposal Templates
  getProposalTemplates: async () => {
    const response = await apiClient.get('/templates');
    return response.data;
  },

  updateLead: async (leadId: string, updates: any) => {
    const response = await apiClient.put(`/instant-estimators/leads/${leadId}`, updates);
    return response.data;
  },

  // JobCam
  getJobsWithMedia: async () => {
    const response = await apiClient.get('/jobcam/jobs-with-media');
    return response.data;
  },

  getJobMedia: async (jobId: string | number, params?: any) => {
    const response = await apiClient.get(`/jobcam/${jobId}/media`, { params });
    return response.data;
  },

  getJobMediaDetail: async (id: string) => {
    const response = await apiClient.get(`/jobcam/media/${id}`);
    return response.data;
  },

  getJobCamStats: async (jobId: string | number) => {
    const response = await apiClient.get(`/jobcam/${jobId}/stats`);
    return response.data;
  },

  updateJobMedia: async (id: string, updates: any) => {
    const response = await apiClient.patch(`/jobcam/media/${id}`, updates);
    return response.data;
  },

  bulkUpdateJobMedia: async (mediaIds: string[], updates: any) => {
    const response = await apiClient.post('/jobcam/media/bulk-update', { mediaIds, updates });
    return response.data;
  },

  bulkDeleteJobMedia: async (mediaIds: string[]) => {
    // We can use the bulk-update endpoint and set is_deleted: true
    const response = await apiClient.post('/jobcam/media/bulk-update', {
      mediaIds,
      updates: { is_deleted: true, deleted_at: new Date().toISOString() }
    });
    return response.data;
  },

  deleteJobMedia: async (id: string) => {
    const response = await apiClient.delete(`/jobcam/media/${id}`);
    return response.data;
  },

  // JobCam Upload
  createUploadSession: async (jobId: string | number, data: any) => {
    const response = await apiClient.post(`/jobcam/${jobId}/upload-session`, data);
    return response.data;
  },

  finalizeUpload: async (data: any) => {
    const response = await apiClient.post('/jobcam/upload/finalize', data);
    return response.data;
  },

  deleteUpload: async (mediaId: string) => {
    const response = await apiClient.delete(`/jobcam/upload/${mediaId}`);
    return response.data;
  },

  // Job Documents (JobCam Files)
  getJobDocuments: async (jobId: string | number) => {
    const response = await apiClient.get(`/jobs/${jobId}/documents`);
    return response.data;
  },

  uploadJobDocument: async (jobId: string | number, data: any) => {
    const response = await apiClient.post(`/job-documents/jobs/${jobId}/documents`, data);
    return response.data;
  },

  deleteJobDocument: async (id: string) => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  downloadJobDocument: (id: string) => {
    return `${API_BASE_URL}/documents/${id}/download?token=${localStorage.getItem('token')}`;
  },

  // Job Attachments
  getJobAttachments: async (jobId: string | number) => {
    const response = await apiClient.get(`/jobs/${jobId}/attachments`);
    return response.data;
  },

  createJobAttachment: async (jobId: string | number, data: any) => {
    const response = await apiClient.post(`/jobs/${jobId}/attachments`, data);
    return response.data;
  },

  deleteJobAttachment: async (jobId: string | number, id: string | number) => {
    const response = await apiClient.delete(`/jobs/${jobId}/attachments/${id}`);
    return response.data;
  },

  downloadJobAttachment: (jobId: string | number, id: string | number) => {
    return `${API_BASE_URL}/jobs/${jobId}/attachments/${id}/download?token=${localStorage.getItem('token')}`;
  },

  // General Document Upload (returns file_path)
  uploadDocumentFile: async (formData: FormData) => {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // JobCam Reports
  getJobReports: async (jobId: string | number) => {
    const response = await apiClient.get('/jobcam/reports', { params: { jobId } });
    return response.data;
  },

  getJobReportDetail: async (id: string) => {
    const response = await apiClient.get(`/jobcam/reports/${id}`);
    return response.data;
  },

  createJobReport: async (data: any) => {
    const response = await apiClient.post('/jobcam/reports', data);
    return response.data;
  },

  updateJobReport: async (id: string, data: any) => {
    const response = await apiClient.patch(`/jobcam/reports/${id}`, data);
    return response.data;
  },

  deleteJobReport: async (id: string) => {
    const response = await apiClient.delete(`/jobcam/reports/${id}`);
    return response.data;
  },

  duplicateJobReport: async (id: string) => {
    const response = await apiClient.post(`/jobcam/reports/${id}/duplicate`);
    return response.data;
  },

  upsertJobReportSection: async (section: any) => {
    const response = await apiClient.post('/jobcam/reports/sections', section);
    return response.data;
  },

  deleteJobReportSection: async (id: string) => {
    const response = await apiClient.delete(`/jobcam/reports/sections/${id}`);
    return response.data;
  },

  // JobCam Share Links
  getJobShareLinks: async (jobId: string | number) => {
    const response = await apiClient.get('/jobcam/share-links', { params: { jobId } });
    return response.data;
  },

  createJobShareLink: async (data: any) => {
    const response = await apiClient.post('/jobcam/share-links', data);
    return response.data;
  },

  revokeJobShareLink: async (id: string) => {
    const response = await apiClient.delete(`/jobcam/share-links/${id}`);
    return response.data;
  },

  // JobCam Activity
  getJobActivity: async (jobId: string | number) => {
    const response = await apiClient.get(`/jobcam/${jobId}/activity`);
    return response.data;
  },

  // JobCam Templates
  getJobCamTemplates: async (type?: string) => {
    const response = await apiClient.get('/jobcam/templates', { params: { type } });
    return response.data;
  },

  getJobCamTemplateDetail: async (id: string) => {
    const response = await apiClient.get(`/jobcam/templates/${id}`);
    return response.data;
  },

  createJobCamTemplate: async (data: any) => {
    const response = await apiClient.post('/jobcam/templates', data, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  updateJobCamTemplate: async (id: string, data: any) => {
    const response = await apiClient.patch(`/jobcam/templates/${id}`, data);
    return response.data;
  },

  deleteJobCamTemplate: async (id: string) => {
    const response = await apiClient.delete(`/jobcam/templates/${id}`);
    return response.data;
  },

  upsertJobCamTemplateItems: async (templateId: string, items: any[]) => {
    const response = await apiClient.post(`/jobcam/templates/${templateId}/items`, items);
    return response.data;
  },

  getJobShotlist: async (jobId: string | number) => {
    const response = await apiClient.get(`/jobcam/${jobId}/shotlist`);
    return response.data;
  },

  createJobShotlist: async (jobId: string | number, data: any) => {
    const response = await apiClient.post(`/jobcam/${jobId}/shotlist`, data);
    return response.data;
  },

  // JobCam Galleries
  getJobGalleries: async (jobId: string | number) => {
    const response = await apiClient.get(`/jobcam/${jobId}/galleries`);
    return response.data;
  },

  createJobGallery: async (jobId: string | number, data: any) => {
    const response = await apiClient.post(`/jobcam/${jobId}/galleries`, data);
    return response.data;
  },

  getGalleryItems: async (id: string) => {
    const response = await apiClient.get(`/jobcam/galleries/${id}/items`);
    return response.data;
  },

  deleteJobGallery: async (id: string) => {
    const response = await apiClient.delete(`/jobcam/galleries/${id}`);
    return response.data;
  },

  addMediaToGallery: async (galleryId: string, mediaIds: string[]) => {
    const response = await apiClient.post(`/jobcam/galleries/${galleryId}/media`, { mediaIds });
    return response.data;
  },

  removeMediaFromGallery: async (galleryId: string, mediaId: string) => {
    const response = await apiClient.delete(`/jobcam/galleries/${galleryId}/media/${mediaId}`);
    return response.data;
  },

  getPublicShareDetails: async (token: string) => {
    const response = await apiClient.get(`/jobcam/public/share/${token}`);
    return response.data;
  },
};