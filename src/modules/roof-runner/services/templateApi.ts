import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export interface Section {
  id: string;
  name: string;
  type: string;
  order: number;
  active: boolean;
  subsections?: string[];
  content?: {
    photos?: string[];
    pdfs?: { name: string; url: string }[];
  };
}

export interface TemplateSettings {
  optionTitle: string;
  optionDescription: string;
  itemSectionTitle: string;
  upgradesTitle: string;
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  defaultMargin: string;
  minimumMargin: string;
  coverContent: string;
  companyLogo?: string;
}

export interface TemplateContent {
  templateName: string;
  sections: Section[];
  items: any[];
  upgrades: any[];
  settings: TemplateSettings;
}

export interface Template {
  id: string;
  name: string;
  content: TemplateContent;
  created_at: string;
  updated_at: string;
  last_modified_at: string;
  organization_id?: string;
  created_by?: string;
  is_default: boolean;
  summary?: {
    sectionCount: number;
    itemCount: number;
    upgradeCount: number;
  };
}

export interface CreateTemplateRequest {
  name: string;
  organization_id?: string;
  content?: TemplateContent;
}

export interface UpdateTemplateRequest {
  name?: string;
  content?: TemplateContent;
  last_modified_at?: string;
}

export interface DuplicateTemplateRequest {
  name?: string;
  organization_id?: string;
}

export interface SetDefaultRequest {
  organization_id?: string;
}

export interface MediaUploadResponse {
  url: string;
  name: string;
  type: 'photo' | 'pdf';
}

export interface LogoUploadResponse {
  url: string;
}

export interface ConflictError {
  code: 'CONFLICT';
  message: string;
  details: {
    serverLastModified: string;
    clientLastModified: string;
  };
}

/**
 * Template API Service
 * Implements all template management endpoints with conflict detection,
 * file uploads, and organization-level default templates.
 */

export const templateApi = {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Create a new template
   */
  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    try {
      const response = await axios.post(`${API_BASE_URL}/templates`, data, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<Template> {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  /**
   * Update template with conflict detection
   */
  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<Template> {
    try {
      const response = await axios.put(`${API_BASE_URL}/templates/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ success: false; error: ConflictError }>;
      if (axiosError.response?.status === 409) {
        throw axiosError.response.data.error;
      }
      console.error('Error updating template:', error);
      throw error;
    }
  },

  /**
   * Duplicate an existing template
   */
  async duplicateTemplate(id: string, data?: DuplicateTemplateRequest): Promise<Template> {
    try {
      const response = await axios.post(`${API_BASE_URL}/templates/${id}/duplicate`, data || {}, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  },

  /**
   * Set template as organization default
   */
  async setDefaultTemplate(id: string, data?: SetDefaultRequest): Promise<Template> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/templates/${id}/set-default`, data || {}, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error setting default template:', error);
      throw error;
    }
  },

  /**
   * Upload media (photo or PDF) to template section
   */
  async uploadMedia(
    templateId: string,
    file: File,
    sectionId: string,
    type: 'photo' | 'pdf'
  ): Promise<MediaUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sectionId', sectionId);
      formData.append('type', type);

      const response = await axios.post(
        `${API_BASE_URL}/templates/${templateId}/media`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  /**
   * Upload company logo to template
   */
  async uploadLogo(templateId: string, file: File): Promise<LogoUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/templates/${templateId}/logo`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  /**
   * Delete media from template section
   */
  async deleteMedia(
    templateId: string,
    sectionId: string,
    mediaUrl: string,
    type: 'photo' | 'pdf'
  ): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/templates/${templateId}/media`, {
        headers: getAuthHeaders(),
        data: { sectionId, mediaUrl, type }
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  },

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/templates/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },
};
