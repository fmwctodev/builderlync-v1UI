import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export interface BrandColor {
  id?: string;
  color: string;
  name: string;
}

export interface BrandBoard {
  id?: number;
  website: string;
  description: string;
  brand_voice: string;
  target_audience: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  twitter_url?: string;
  google_business_url?: string;
  pinterest_url?: string;
  logo_url?: string;
  brand_colors: BrandColor[];
}

export const brandBoardService = {
  async getBrandBoard(): Promise<{ success: boolean; data: BrandBoard; message?: string }> {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/brand-board`, {
        headers: getAuthHeaders(),
      });
      return { success: true, data: data.data };
    } catch (error: any) {
      return { 
        success: false, 
        data: {
          website: '',
          description: '',
          brand_voice: '',
          target_audience: '',
          brand_colors: []
        },
        message: error.response?.data?.message || 'Failed to load brand board'
      };
    }
  },

  async saveBrandBoard(brandBoard: Partial<BrandBoard>, logoFile?: File): Promise<{ success: boolean; data?: BrandBoard; message?: string }> {
    try {
      const formData = new FormData();
      
      // Add brand board data
      formData.append('website', brandBoard.website || '');
      formData.append('description', brandBoard.description || '');
      formData.append('brand_voice', brandBoard.brand_voice || '');
      formData.append('target_audience', brandBoard.target_audience || '');
      formData.append('facebook_url', brandBoard.facebook_url || '');
      formData.append('instagram_url', brandBoard.instagram_url || '');
      formData.append('youtube_url', brandBoard.youtube_url || '');
      formData.append('tiktok_url', brandBoard.tiktok_url || '');
      formData.append('twitter_url', brandBoard.twitter_url || '');
      formData.append('google_business_url', brandBoard.google_business_url || '');
      formData.append('pinterest_url', brandBoard.pinterest_url || '');
      formData.append('colors', JSON.stringify(brandBoard.brand_colors || []));
      
      // Add logo file if provided
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_BASE_URL}/brand-board`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
      });
      
      return { success: true, data: data.data, message: data.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to save brand board'
      };
    }
  },

  async deleteBrandBoard(): Promise<{ success: boolean; message?: string }> {
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/brand-board`, {
        headers: getAuthHeaders(),
      });
      return { success: true, message: data.message };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete brand board'
      };
    }
  }
};