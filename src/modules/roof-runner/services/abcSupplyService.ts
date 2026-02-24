interface ABCSupplyConfig {
  clientId: string;
  clientSecret: string;
  tokenApi: string;
  refreshToken: string;
  scope: string;
  baseUrl: string;
}

interface ABCSupplyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface ABCSupplyProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  manufacturer: string;
  category: string;
  price?: number;
  availability?: boolean;
  images?: string[];
}

interface ABCSupplyBranch {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email?: string;
  hours?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ABCSupplyOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: ABCSupplyOrderItem[];
  createdAt: string;
  branchId?: string;
}

interface ABCSupplyOrderHistoryItem {
  orderNumber: string;
  branch: number;
  branchCityState: string;
  invoiceDate: string | null;
  orderType: string;
  orderStatus: string;
  productQty: number;
}

interface ABCSupplyOrderHistoryResponse {
  success: boolean;
  data: {
    pagination: {
      itemsPerPage: number;
      pageNumber: number;
      totalPages: number;
      totalItems: number;
    };
    items: ABCSupplyOrderHistoryItem[];
  };
}

interface ABCSupplyOrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface PriceRequest {
  branchId: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
}

class ABCSupplyService {
  private config: ABCSupplyConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
      tokenApi: import.meta.env.VITE_TOKEN_API,
      refreshToken: import.meta.env.VITE_REFRESH_TOKEN,
      scope: import.meta.env.VITE_SCOPE,
      baseUrl: 'https://partners-sb.abcsupply.com/api'
    };
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      console.log('Using cached token');
      return this.accessToken;
    }

    try {
      console.log('Requesting new access token...');
      console.log('Token API:', this.config.tokenApi);
      console.log('Client ID:', this.config.clientId);
      console.log('Refresh Token:', this.config.refreshToken ? 'Present' : 'Missing');

      const response = await fetch(this.config.tokenApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.clientId}:${this.config.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          scope: this.config.scope
        })
      });

      console.log('Token response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token request error response:', errorText);
        throw new Error(`Token request failed: ${response.status} - ${errorText}`);
      }

      const tokenData: ABCSupplyToken = await response.json();
      console.log('Token received successfully');
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAccessToken();

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async searchProducts(query: string, limit: number = 20): Promise<ABCSupplyProduct[]> {
    try {
      const url = `${import.meta.env.VITE_SEARCHITEMS_API}?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await this.makeAuthenticatedRequest(url);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Product search failed:', error);
      return [];
    }
  }

  async getAllProducts(limit: number = 50): Promise<ABCSupplyProduct[]> {
    try {
      const url = `${import.meta.env.VITE_ALLITEMS_API}?limit=${limit}`;
      console.log('Calling getAllProducts with URL:', url);
      const response = await this.makeAuthenticatedRequest(url);

      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Get products failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      return data.items || [];
    } catch (error) {
      console.error('Get all products failed:', error);
      return [];
    }
  }

  async getBranches(): Promise<ABCSupplyBranch[]> {
    try {
      const response = await this.makeAuthenticatedRequest(import.meta.env.VITE_BRANCHES_API);

      if (!response.ok) {
        throw new Error(`Get branches failed: ${response.status}`);
      }

      const data = await response.json();
      return data.branches || [];
    } catch (error) {
      console.error('Get branches failed:', error);
      return [];
    }
  }

  async getStatus(): Promise<{ connected: boolean }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/abc-supply/status`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        return { connected: data.data?.connected || false };
      }
      return { connected: false };
    } catch (error) {
      return { connected: false };
    }
  }

  async getPrices(priceRequest: PriceRequest): Promise<any> {
    try {
      const response = await this.makeAuthenticatedRequest(import.meta.env.VITE_GETPRICE_API, {
        method: 'POST',
        body: JSON.stringify(priceRequest)
      });

      if (!response.ok) {
        throw new Error(`Get prices failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get prices failed:', error);
      return null;
    }
  }

  async searchItemsByPrice(query: string, branchId: string): Promise<ABCSupplyProduct[]> {
    try {
      const url = `${import.meta.env.VITE_SEARCH_ITEM_BY_PRICE_API}?q=${encodeURIComponent(query)}&branchId=${branchId}`;
      const response = await this.makeAuthenticatedRequest(url);

      if (!response.ok) {
        throw new Error(`Search by price failed: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Search by price failed:', error);
      return [];
    }
  }

  async getOrdersHistory(params: {
    startDate: string;
    endDate: string;
    itemsPerPage?: number;
    pageNumber?: number;
  }): Promise<ABCSupplyOrderHistoryResponse> {
    try {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
        itemsPerPage: (params.itemsPerPage || 20).toString(),
        pageNumber: (params.pageNumber || 1).toString()
      });

      const response = await this.makeAuthenticatedRequest(
        `${import.meta.env.VITE_API_BASE_URL}/abc-supply/ordersHistory?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`Get orders history failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get orders history failed:', error);
      return {
        success: false,
        data: {
          pagination: { itemsPerPage: 20, pageNumber: 1, totalPages: 0, totalItems: 0 },
          items: []
        }
      };
    }
  }

  async getOrders(): Promise<ABCSupplyOrder[]> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.config.baseUrl}/order/v1/orders`);

      if (!response.ok) {
        throw new Error(`Get orders failed: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Get orders failed:', error);
      return [];
    }
  }

  async createOrder(orderData: any): Promise<ABCSupplyOrder | null> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.config.baseUrl}/order/v1/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`Create order failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create order failed:', error);
      return null;
    }
  }
}

export const abcSupplyService = new ABCSupplyService();
export type {
  ABCSupplyProduct,
  ABCSupplyBranch,
  ABCSupplyOrder,
  ABCSupplyOrderItem,
  ABCSupplyOrderHistoryItem,
  ABCSupplyOrderHistoryResponse,
  PriceRequest
};