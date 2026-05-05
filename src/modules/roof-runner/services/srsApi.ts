const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176/api';

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  return {
    'Authorization': `Bearer ${token}`,
    ...extraHeaders
  };
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface OrderHistoryParams {
  startDate: string;
  endDate: string;
  itemsPerPage?: number;
  pageNumber?: number;
  search?: string;
  status?: string;
}

export const srsApi = {
  async getItems(page = 1, limit = 50) {
    const response = await fetch(`${API_BASE_URL}/srs/items?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async searchItems(query: string, branchCode: string, limit = 50) {
    const response = await fetch(`${API_BASE_URL}/srs/items/search?q=${encodeURIComponent(query)}&branchCode=${branchCode}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async searchProducts(searchData: {
    filters: Array<{ key: string; value: string }>;
    pagination: { itemsPerPage: number; pageNumber: number };
    branchCode?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/srs/items/search`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(searchData)
    });
    return response.json();
  },

  async getBranches(latitude?: number, longitude?: number, radius = 50) {
    const params = new URLSearchParams();
    
    const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
    
    if (hasCoords) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
      if (radius) params.append('radius', radius.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/srs/branches?${queryString}` : `${API_BASE_URL}/srs/branches`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/srs/orders`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async createOrder(orderData: any) {
    const response = await fetch(`${API_BASE_URL}/srs/orders`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  async getOrdersHistory(params: OrderHistoryParams) {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      itemsPerPage: (params.itemsPerPage || 20).toString(),
      pageNumber: (params.pageNumber || 1).toString(),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status })
    });

    const response = await fetch(`${API_BASE_URL}/srs/orders/history?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getOrderById(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/srs/orders/${orderId}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getPrice(priceRequestData: any) {
    const response = await fetch(`${API_BASE_URL}/srs/price`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(priceRequestData)
    });
    return response.json();
  },

  async validateConnection() {
    const response = await fetch(`${API_BASE_URL}/srs/validate`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/srs/categories`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getManufacturers() {
    const response = await fetch(`${API_BASE_URL}/srs/manufacturers`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getUOMs() {
    const response = await fetch(`${API_BASE_URL}/srs/uoms`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  async getOrderTemplates() {
    const response = await fetch(`${API_BASE_URL}/srs/order-templates`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};