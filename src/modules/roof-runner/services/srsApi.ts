const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

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
    const response = await fetch(`${API_BASE_URL}/srs/items?page=${page}&limit=${limit}`);
    return response.json();
  },

  async searchItems(query: string, limit = 50) {
    const response = await fetch(`${API_BASE_URL}/srs/items/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.json();
  },

  async searchProducts(searchData: {
    filters: Array<{ key: string; value: string }>;
    pagination: { itemsPerPage: number; pageNumber: number };
  }) {
    const response = await fetch(`${API_BASE_URL}/srs/items/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData)
    });
    return response.json();
  },

  async getBranches(lat?: number, lng?: number, distance?: number, page?: number, limit?: number, search?: string) {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lng !== undefined) params.append('lng', lng.toString());
    if (distance !== undefined) params.append('distance', distance.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const url = queryString ? `${API_BASE_URL}/srs/branches?${queryString}` : `${API_BASE_URL}/srs/branches`;
    
    const response = await fetch(url);
    return response.json();
  },

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/srs/orders`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  async createOrder(orderData: any) {
    const response = await fetch(`${API_BASE_URL}/srs/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
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
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  async getOrderById(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/srs/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  async getPrice(priceRequestData: any) {
    const response = await fetch(`${API_BASE_URL}/srs/price`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(priceRequestData)
    });
    return response.json();
  },

  async validateConnection() {
    const response = await fetch(`${API_BASE_URL}/srs/validate`);
    return response.json();
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/srs/categories`);
    return response.json();
  },

  async getManufacturers() {
    const response = await fetch(`${API_BASE_URL}/srs/manufacturers`);
    return response.json();
  },

  async getUOMs() {
    const response = await fetch(`${API_BASE_URL}/srs/uoms`);
    return response.json();
  }
};