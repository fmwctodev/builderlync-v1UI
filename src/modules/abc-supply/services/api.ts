import axios from 'axios';
import { Product, Branch, Order, ShipTo, OrderHistoryResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5176/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include dynamic auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle ABC Supply connection errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message?.includes('ABC Supply not connected')) {
      throw new Error('ABC Supply not connected. Please connect your ABC Supply account in Settings > Integrations.');
    }
    throw error;
  }
);

export interface ItemsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface PriceRequest {
  branchId: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
}

export const abcSupplyApi = {
  // Connection Status
  getStatus: async (): Promise<{ connected: boolean }> => {
    try {
      const response = await api.get('/abc-supply/status');
      return response.data.data || { connected: false };
    } catch (error) {
      return { connected: false };
    }
  },

  // Products
  getItems: async (page: number = 1, limit: number = 20): Promise<ItemsResponse> => {
    const response = await api.get('/abc-supply/items', {
      params: { page, limit }
    });

    return {
      items: response.data.items || response.data.data || [],
      total: response.data.total || 0,
      page: page,
      limit: limit
    };
  },

  searchItems: async (query: string, limit: number = 20, branchId?: string, page: number = 1): Promise<Product[]> => {
    const response = await api.get('/abc-supply/search', {
      params: { query, branchId, page, limit }
    });

    const payload = response.data;
    const items = payload?.data?.items || payload?.items || payload?.data || payload;
    return Array.isArray(items) ? items : [];
  },

  filterItems: async (filters: string[], itemsPerPage: number = 20, pageNumber: number = 1, branchId?: string): Promise<Product[]> => {
    // Pass branchId in query params. The backend controller (at /search) needs to extract and use it.
    // filters argument here is treated as the 'query' string for now based on previous usage
    const response = await api.get(`/abc-supply/search`, {
      params: {
        query: filters[0] || '', // Assuming filters is array of strings, usually just one search term
        branchId,
        page: pageNumber,
        limit: itemsPerPage
      }
    });

    if (response.data.success && response.data.data) {
      return response.data.data.items || [];
    }
    return response.data.items || response.data.data || response.data || [];
  },

  // Branches - Generic locator (still useful for map visualization if needed, but not for ordering)
  getBranches: async (): Promise<Branch[]> => {
    try {
      const response = await api.get('/abc-supply/branches', {
        params: {
          lat: 42.35,
          lng: -89.04,
          distance: 100
        }
      });

      let branches = [];
      if (response.data.success && response.data.data) {
        branches = response.data.data.map((item: any) => ({
          id: item.branch.number,
          name: item.branch.name,
          address: {
            street1: item.address.addressLine1, // Fixed type error mapping
            street2: item.address.addressLine2,
            city: item.address.city,
            state: item.address.state,
            zipCode: item.address.postal
          },
          phone: item.contact.phones[0] || 'N/A',
          coordinates: {
            latitude: parseFloat(item.locale.lat),
            longitude: parseFloat(item.locale.long)
          },
          hours: item.hoursOfOperation,
          services: []
        }));
      }
      return branches;
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      return [];
    }
  },

  // ShipTos - Fetch user's ship-to accounts (which contain available branches)
  getShipTos: async (): Promise<ShipTo[]> => {
    try {
      const response = await api.post('/abc-supply/accounts/search', {
        filters: [{
          key: "storefront",
          condition: "equals",
          values: ["abc"]
        }],
        pagination: { itemsPerPage: 50, pageNumber: 1 }
      });

      const data = response.data.data || response.data;
      return data.shipTos || [];
    } catch (error) {
      console.error('Error fetching shipTos:', error);
      return [];
    }
  },

  searchAccounts: async (filters: any[], pagination: { itemsPerPage: number, pageNumber: number }): Promise<any> => {
    const response = await api.post('/abc-supply/accounts/search', {
      filters,
      pagination
    });
    return response.data;
  },

  // Pricing
  getPrices: async (priceRequest: PriceRequest & { shipToNumber: string }): Promise<any> => {
    const response = await api.post('/abc-supply/prices', priceRequest);
    return response.data;
  },

  searchItemsByPrice: async (query: string, branchId: string): Promise<Product[]> => {
    const response = await api.get('/abc-supply/search-with-price', {
      params: { q: query, branchId }
    });
    return response.data.items || response.data;
  },

  // Orders
  getOrdersHistory: async (params: {
    startDate: string;
    endDate: string;
    itemsPerPage?: number;
    pageNumber?: number;
    search?: string;
    status?: string;
  }): Promise<OrderHistoryResponse> => {
    const response = await api.get('/abc-supply/ordersHistory', {
      params: {
        startDate: params.startDate,
        endDate: params.endDate,
        itemsPerPage: params.itemsPerPage || 20,
        pageNumber: params.pageNumber || 1,
        search: params.search,
        status: params.status
      }
    });
    return response.data;
  },

  getOrderDetails: async (confirmationNumber: string): Promise<any> => {
    const response = await api.get('/abc-supply/orderDetails', {
      params: { confirmationNumber }
    });
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/abc-supply/orders');
    return response.data.orders || response.data;
  },

  getJobs: async (limit: number = 100): Promise<any> => {
    const response = await api.get('/jobs', {
      params: { limit }
    });
    return response.data;
  },

  createOrder: async (orderData: {
    items: Array<{
      productId: string;
      sku: string;
      name: string;
      quantity: number;
      unitPrice: number;
      uom: string;
    }>;
    branchNumber: string;
    shipToAccountNumber: string;
    deliveryAddress: {
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal: string;
    };
    contact: {
      name: string;
      email: string;
      phone: string;
    };
    deliveryDate?: string;
    instructions?: string;
    deliveryService?: string;
  }): Promise<Order> => {

    console.log("Order data being sent:", orderData);

    const orderPayload = {
      requestId: `REQ-${Date.now()}`,
      purchaseOrder: `PO-${Date.now()}`,
      branchNumber: orderData.branchNumber,
      deliveryService: orderData.deliveryService || "OTG",
      typeCode: "SO",
      dates: {
        deliveryRequestedFor: orderData.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      deliveryAppointment: {
        instructionsTypeCode: "AT",
        instructions: orderData.instructions || "Standard delivery",
        fromTime: "09:00",
        toTime: "17:00",
        timeZoneCode: "CT"
      },
      currency: "USD",
      shipTo: {
        name: orderData.deliveryAddress.name,
        number: orderData.shipToAccountNumber,
        address: {
          line1: orderData.deliveryAddress.line1,
          line2: orderData.deliveryAddress.line2 || "",
          line3: "",
          city: orderData.deliveryAddress.city,
          state: orderData.deliveryAddress.state,
          postal: orderData.deliveryAddress.postal,
          country: "USA"
        },
        contacts: [{
          name: orderData.contact.name,
          functionCode: "SM",
          email: orderData.contact.email,
          phones: [{
            number: orderData.contact.phone.replace(/\D/g, ''),
            type: "MOBILE",
            ext: ""
          }]
        }]
      },
      orderComments: [{
        code: "H",
        description: orderData.instructions || "Order created via BuilderLynk"
      }],
      lines: orderData.items.map((item, index) => ({
        id: (index + 1).toString(),
        itemNumber: item.sku,
        itemDescription: item.name,
        orderedQty: {
          value: item.quantity,
          uom: item.uom
        },
        unitPrice: {
          value: item.unitPrice,
          uom: item.uom,
          instructions: `Quote: REQ-${Date.now()}`
        },
        comments: {
          code: "D",
          description: `Line item: ${item.name}`
        }
      }))
    };

    const response = await api.post('/abc-supply/orders', orderPayload);
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/abc-supply/orders/${orderId}`);
    return response.data;
  }
};
