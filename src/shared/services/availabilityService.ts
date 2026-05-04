import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';
const getAccessToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken');

const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export interface AvailabilityWorkingHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled?: boolean;
}

export interface AvailabilityPreferences {
  meeting_location?: string;
  custom_location?: string;
  timezone?: string | null;
}

export interface AvailabilityPayload {
  workingHours: AvailabilityWorkingHour[];
  preferences: AvailabilityPreferences;
}

export const availabilityService = {
  async getAvailability(): Promise<AvailabilityPayload> {
    const { data } = await axios.get(`${API_BASE_URL}/profile/availability`, {
      headers: getAuthHeaders(),
    });

    return (
      data?.data || {
        workingHours: [],
        preferences: {
          meeting_location: 'google_meet',
          custom_location: '',
          timezone: null,
        },
      }
    );
  },

  async saveAvailability(payload: AvailabilityPayload): Promise<void> {
    await axios.put(`${API_BASE_URL}/profile/availability`, payload, {
      headers: getAuthHeaders(),
    });
  },
};
