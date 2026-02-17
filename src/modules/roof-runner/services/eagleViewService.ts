interface EagleViewOrderRequest {
  orderReports: {
    reportAddresses: {
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      latitude: number;
      longitude: number;
      addressType: number;
    };
    buildingId: string;
    primaryProductId: number;
    deliveryProductId: number;
    addOnProductIds: number[];
    measurementInstructionType: number;
    reportAttributes: Record<string, any>;
    claimNumber?: string;
    claimInfo?: string;
    batchId?: string;
    catId?: string;
    changesInLast4Years: boolean;
    pONumber?: string;
    comments?: string;
    referenceId?: string;
    insuredName?: string;
    upgradeFromReportId?: number;
    policyNumber?: string;
    dateOfLoss?: string;
  };
  promoCode?: string;
  placeOrderUser: string;
}

interface EagleViewOrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  error?: string;
}

interface EagleViewReport {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  address: string;
  reportType: string;
  measurements?: {
    totalRoofArea: number;
    perimeterLength: number;
    pitch: string;
    facets: Array<{
      area: number;
      pitch: string;
      direction: string;
    }>;
  };
  downloadLinks?: {
    pdf: string;
    xml: string;
    dxf?: string;
  };
}

class EagleViewService {
  private baseUrl = 'https://api.eagleview.com';
  private sandboxUrl = 'https://sandbox-api.eagleview.com';
  private apiKey = import.meta.env.VITE_EAGLEVIEW_API_KEY;
  private useSandbox = true; // Set to false for production

  private getApiUrl(): string {
    return this.useSandbox ? this.sandboxUrl : this.baseUrl;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-API-Version': '1.0'
    };
  }

  async getImagery(address: string): Promise<any> {
    try {
      const response = await fetch(`${this.getApiUrl()}/imagery/v1/search`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          address: address,
          radius: 100,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('EagleView imagery search failed:', error);
      throw error;
    }
  }

  async getImageryById(imageId: string): Promise<any> {
    try {
      const response = await fetch(`${this.getApiUrl()}/imagery/v1/images/${imageId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('EagleView imagery fetch failed:', error);
      throw error;
    }
  }

  async downloadImage(imageId: string, format: 'jpeg' | 'tiff' = 'jpeg'): Promise<Blob> {
    try {
      const response = await fetch(`${this.getApiUrl()}/imagery/v1/images/${imageId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': format === 'tiff' ? 'image/tiff' : 'image/jpeg'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('EagleView image download failed:', error);
      throw error;
    }
  }

  async submitOrder(orderData: EagleViewOrderRequest): Promise<EagleViewOrderResponse> {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
      const response = await fetch(`${API_BASE_URL}/eagleview/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Success:', result);
      return {
        success: true,
        orderId: result.order?.id || result.id,
        message: result.message || 'Order submitted successfully',
        ...result
      };
    } catch (error) {
      console.error('EagleView order submission failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getOrderStatus(_orderId: string): Promise<EagleViewReport | null> {
    console.log('Order status endpoint not available');
    return null;
  }

  async getReports(referenceId?: string, reportId?: number): Promise<EagleViewReport[]> {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
      const params = new URLSearchParams();
      if (referenceId) params.append('referenceId', referenceId);
      if (reportId) params.append('reportId', reportId.toString());

      const url = `${API_BASE_URL}/eagleview/orders${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return Array.isArray(result) ? result : result.data || [];
    } catch (error) {
      console.error('Failed to fetch Eagle View orders:', error);
      return [];
    }
  }

  async downloadReport(reportId: string, _format: 'pdf' | 'xml' | 'dxf'): Promise<Blob | null> {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
      const response = await fetch(`${API_BASE_URL}/eagleview/report?reportId=${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Download report failed:', error);
      return null;
    }
  }

  async getAvailableProducts(): Promise<any[]> {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
      const response = await fetch(`${API_BASE_URL}/eagleview/available-products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch available products:', error);
      return [];
    }
  }

  async getAccountDetails(): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
      const response = await fetch(`${API_BASE_URL}/eagleview/account-details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Failed to fetch account details:', error);
      throw error;
    }
  }

  // ... other methods ...

  async getConnectionStatus(): Promise<{ connected: boolean; usingOwnAccount: boolean; credits: number }> {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api';
      const response = await fetch(`${API_BASE_URL}/eagleview/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return { connected: false, usingOwnAccount: false, credits: 0 };
    } catch (error) {
      console.error('Failed to get connection status:', error);
      return { connected: false, usingOwnAccount: false, credits: 0 };
    }
  }
}

export const eagleViewService = new EagleViewService();
export type { EagleViewOrderRequest, EagleViewOrderResponse, EagleViewReport };