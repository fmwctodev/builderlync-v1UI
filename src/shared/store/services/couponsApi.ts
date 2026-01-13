import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface Coupon {
  id: number;
  coupon_name: string;
  coupon_code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  start_date: string;
  end_date?: string;
  maximum_redemptions?: number;
  times_used: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
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
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export const getCoupons = async (): Promise<Coupon[]> => {
  const response = await makeRequest('/coupons');
  return response.data;
};

export const getActiveCoupons = async (): Promise<Coupon[]> => {
  const response = await makeRequest('/coupons/active');
  return response.data;
};

export const validateCoupon = async (code: string): Promise<Coupon> => {
  const response = await makeRequest(`/coupons/validate/${code}`);
  return response.data;
};

export const createCoupon = async (coupon: Partial<Coupon>): Promise<Coupon> => {
  const response = await makeRequest('/coupons', {
    method: 'POST',
    body: JSON.stringify(coupon),
  });
  return response.data;
};

export const updateCoupon = async (id: number, coupon: Partial<Coupon>): Promise<Coupon> => {
  const response = await makeRequest(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(coupon),
  });
  return response.data;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await makeRequest(`/coupons/${id}`, {
    method: 'DELETE',
  });
};
