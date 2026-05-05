import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface MaterialOrder {
  id: number;
  purchase_order: string;
  job_id?: number | null;
  branch_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialOrdersResponse {
  success: boolean;
  message: string;
  data: MaterialOrder[];
}

export const getMaterialOrders = async (): Promise<MaterialOrdersResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<MaterialOrdersResponse>(
    `${API_BASE_URL}/abc-supply/orders`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getMaterialOrdersByJobId = async (jobId: number): Promise<MaterialOrdersResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<MaterialOrdersResponse>(
    `${API_BASE_URL}/jobs/${jobId}/material-orders`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};
