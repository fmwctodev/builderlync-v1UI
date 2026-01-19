const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface MeasurementData {
  id?: number;
  company_name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdBy?: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const measurementsApi = {
  async getMeasurements(): Promise<MeasurementData | null> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/measurements`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch measurements');
      }

      const result: ApiResponse<MeasurementData> = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error fetching measurements:', error);
      return null;
    }
  },

  async createOrUpdateMeasurement(data: Omit<MeasurementData, 'id' | 'createdBy' | 'createdByName' | 'createdAt' | 'updatedAt'>): Promise<MeasurementData | null> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/measurements`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save measurements');
      }

      const result: MeasurementData = await response.json();
      return result;
    } catch (error) {
      console.error('Error saving measurements:', error);
      return null;
    }
  },
};