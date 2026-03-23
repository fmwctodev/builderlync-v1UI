import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface Activity {
  id: number;
  contactId: number;
  activityType: string;
  title: string;
  description: string;
  metadata: any;
  createdBy: number;
  createdByName: string;
  createdAt: string;
}

export interface ActivitiesResponse {
  success: boolean;
  data: {
    data: Activity[];
    pagination: any;
  };
}

export const getContactActivities = async (contactId: number, page: number = 1, limit: number = 10): Promise<ActivitiesResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<ActivitiesResponse>(
    `${API_BASE_URL}/contacts/${contactId}/activities?page=${page}&limit=${limit}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};