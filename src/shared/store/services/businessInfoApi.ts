import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface BusinessInfo {
  id?: number;
  friendly_business_name: string;
  legal_business_name: string;
  business_email: string;
  business_phone: string;
  branded_domain?: string;
  business_website?: string;
  business_niche: string;
  business_currency: string;
  business_logo?: string;
  street_address: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
  time_zone: string;
  platform_language: string;
  outbound_language?: string;
  business_type: string;
  business_industry: string;
  business_registration_id_type: string;
  business_registration_number?: string;
  is_not_registered: boolean;
  business_regions: string[];
  representative_first_name: string;
  representative_last_name: string;
  representative_email: string;
  representative_job_position: string;
  representative_phone: string;
  allow_duplicate_contact: boolean;
  primary_search_field: string;
  secondary_search_field?: string;
  location_id?: string;
  api_key?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessInfoResponse {
  success: boolean;
  message: string;
  data: BusinessInfo;
}

export const getBusinessInfo = async (): Promise<BusinessInfoResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get<BusinessInfoResponse>(
    `${API_BASE_URL}/business-info`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

export const updateBusinessInfo = async (data: Partial<BusinessInfo>): Promise<BusinessInfoResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await axios.put<BusinessInfoResponse>(
    `${API_BASE_URL}/business-info`,
    data,
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

export const uploadBusinessLogo = async (file: File): Promise<{ success: boolean; logoUrl: string }> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await axios.post(
    `${API_BASE_URL}/business-info/upload-logo`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  
  return response.data;
};

export const generateApiKey = async (): Promise<{ success: boolean; apiKey: string }> => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_BASE_URL}/business-info/generate-api-key`,
    {},
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};