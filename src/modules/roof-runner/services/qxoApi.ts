const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export const qxoApi = {
  async getStatus() {
    const response = await fetch(`${API_BASE_URL}/qxo/status`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  
  async getBranches(params: { zipCode?: string, city?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.zipCode) searchParams.append('zipCode', params.zipCode);
    if (params.city) searchParams.append('city', params.city);
    
    const response = await fetch(`${API_BASE_URL}/qxo/branches?${searchParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  async searchProducts(params: { keyword?: string, branchId?: string, accountId?: string, pageSize?: number } = {}) {
    const searchParams = new URLSearchParams();
    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.branchId) searchParams.append('branchId', params.branchId);
    if (params.accountId) searchParams.append('accountId', params.accountId);
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    searchParams.append('includePrices', 'true');
    
    const response = await fetch(`${API_BASE_URL}/qxo/products?${searchParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  async updateProfile(updates: any) {
    const response = await fetch(`${API_BASE_URL}/qxo/profile`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  async createOrder(orderData: any) {
    const response = await fetch(`${API_BASE_URL}/qxo/order`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  async getOrders(params: { accountId?: string, pageNo?: number, pageSize?: number } = {}) {
    const searchParams = new URLSearchParams();
    if (params.accountId) searchParams.append('accountId', params.accountId);
    if (params.pageNo) searchParams.append('pageNo', params.pageNo.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    
    const response = await fetch(`${API_BASE_URL}/qxo/orders?${searchParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  async getOrderDetails(orderId: string) {
    const response = await fetch(`${API_BASE_URL}/qxo/order-details?orderId=${orderId}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  async getItemPrices(params: { skus: string[], branchId?: string, accountId?: string }) {
    const searchParams = new URLSearchParams();
    searchParams.append('skus', params.skus.join(','));
    if (params.branchId) searchParams.append('branchId', params.branchId);
    if (params.accountId) searchParams.append('accountId', params.accountId);
    
    const response = await fetch(`${API_BASE_URL}/qxo/price?${searchParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }
};
