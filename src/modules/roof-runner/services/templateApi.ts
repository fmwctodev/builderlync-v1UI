import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface Template {
  id: string;
  name: string;
  content: any;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateRequest {
  name: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  content?: any;
}

/**
 * Template API Service
 * 
 * BACKEND API ENDPOINTS NEEDED:
 * 
 * 1. GET /api/templates
 *    - Returns: Array of templates
 *    - Response: { success: boolean, data: Template[] }
 * 
 * 2. POST /api/templates
 *    - Body: { name: string }
 *    - Returns: Created template with ID
 *    - Response: { success: boolean, data: Template }
 * 
 * 3. GET /api/templates/:id
 *    - Returns: Single template by ID
 *    - Response: { success: boolean, data: Template }
 * 
 * 4. PUT /api/templates/:id
 *    - Body: { name?: string, content?: any }
 *    - Returns: Updated template
 *    - Response: { success: boolean, data: Template }
 * 
 * 5. DELETE /api/templates/:id
 *    - Returns: Success message
 *    - Response: { success: boolean, message: string }
 */

export const templateApi = {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/templates`);
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
      const response = await axios.post(`${API_BASE_URL}/templates`, data);
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
      const response = await axios.get(`${API_BASE_URL}/templates/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  /**
   * Update template
   */
  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<Template> {
    try {
      const response = await axios.put(`${API_BASE_URL}/templates/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/templates/${id}`);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },
};
