import axios from 'axios';
import { Product, Branch, Order, CartItem, ShipTo, OrderHistoryResponse } from '../types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include dynamic auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  searchItems: async (query: string, limit: number = 20): Promise<Product[]> => {
    const response = await api.get('/abc-supply/search', {
      params: { q: query, limit }
    });

    return response.data.items || response.data.data || response.data || [];
  },

  filterItems: async (filters: string[], itemsPerPage: number = 20, pageNumber: number = 1): Promise<Product[]> => {
    const response = await api.post('/abc-supply/products/search', {
      filters: [{
        key: "itemDescription",
        condition: "contains",
        values: filters,
        joinCondition: null
      }],
      pagination: {
        itemsPerPage,
        pageNumber
      }
    });

    // Handle different response format for filter API
    if (response.data.success && response.data.data) {
      return response.data.data.items || [];
    }
    return response.data.items || response.data.data || response.data || [];
  },

  // Branches
  getBranches: async (): Promise<Branch[]> => {
    try {
      const response = await api.get('/abc-supply/branches', {
        params: {
          lat: 42.35,
          lng: -89.04,
          distance: 100
        }
      });

      // Handle the actual API response structure
      let branches = [];
      if (response.data.success && response.data.data) {
        branches = response.data.data.map(item => ({
          id: item.branch.number,
          name: item.branch.name,
          address: {
            street1: item.address.addressLine1,
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
      } else {
        console.log('No branches data found or API unsuccessful');
      }

      return branches;
    } catch (error) {
      console.error('Error fetching branches:', error);
      console.error('Error details:', error.response?.data);
      return [];
    }
  },

  // ShipTos
  getShipTos: async (): Promise<ShipTo[]> => {
    try {
      const response = await api.get('/abc-supply/shiptos');
      return response.data.shipTos || [];
    } catch (error) {
      console.error('Error fetching shipTos:', error);
      return [];
    }
  },

  // Pricing
  getPrices: async (priceRequest: PriceRequest): Promise<any> => {
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

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/abc-supply/orders');
    return response.data.orders || response.data;
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
  }): Promise<Order> => {

    console.log("Order data being sent:", orderData);

    // const orderPayload = {
    //   requestId: `REQ-${Date.now()}`,
    //   purchaseOrder: `PO-${Date.now()}`,
    //   branchNumber: orderData.branchNumber,
    //   deliveryService: "OTG",
    //   typeCode: "SO",
    //   dates: {
    //     deliveryRequestedFor: orderData.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    //   },
    //   deliveryAppointment: {
    //     instructionsTypeCode: "AT",
    //     instructions: orderData.instructions || "Standard delivery",
    //     fromTime: "09:00",
    //     toTime: "17:00",
    //     timeZoneCode: "CT"
    //   },
    //   currency: "USD",
    //   shipTo: {
    //     name: orderData.deliveryAddress.name,
    //     number: "1008710",
    //     address: {
    //       line1: orderData.deliveryAddress.line1,
    //       line2: orderData.deliveryAddress.line2 || "",
    //       line3: "",
    //       city: orderData.deliveryAddress.city,
    //       state: orderData.deliveryAddress.state,
    //       postal: orderData.deliveryAddress.postal,
    //       country: "USA"
    //     },
    //     contacts: [{
    //       name: orderData.contact.name,
    //       functionCode: "SM",
    //       email: orderData.contact.email,
    //       phones: [{
    //         number: orderData.contact.phone.replace(/\D/g, ''),
    //         type: "MOBILE",
    //         ext: ""
    //       }]
    //     }]
    //   },
    //   orderComments: [{
    //     code: "H",
    //     description: orderData.instructions || "Order created via BuilderLynk"
    //   }],
    //   lines: orderData.items.map((item, index) => ({
    //     id: (index + 1).toString(),
    //     itemNumber: item.sku,
    //     itemDescription: item.name,
    //     orderedQty: {
    //       value: item.quantity,
    //       uom: item.uom
    //     },
    //     unitPrice: {
    //       value: item.unitPrice,
    //       uom: item.uom,
    //       instructions: `Quote: REQ-${Date.now()}`
    //     },
    //     comments: {
    //       code: "D",
    //       description: `Line item: ${item.name}`
    //     }
    //   }))
    // };

    const orderPayload = {
      "requestId": "312345",
      "purchaseOrder": "999999-9",
      "branchNumber": "441",
      "deliveryService": "OTG",
      "typeCode": "SO",
      "dates": {
        "deliveryRequestedFor": "2025-03-05"
      },
      "deliveryAppointment": {
        "instructionsTypeCode": "AT",
        "instructions": "Please leave in driveway",
        "fromTime": "10:00",
        "toTime": "11:00",
        "timeZoneCode": "CT"
      },
      "currency": "USD",
      "shipTo": {
        "name": "Test Account",
        "number": "1008710",
        "address": {
          "line1": "123 Main St",
          "line2": "Dock 123",
          "line3": "Bldg. 1 Section 2",
          "city": "Chicago",
          "state": "IL",
          "postal": "60661",
          "country": "USA"
        },
        "contacts": [
          {
            "name": "John Doe",
            "functionCode": "SM",
            "email": "john.doe@email.com",
            "phones": [
              {
                "number": "8882221111",
                "type": "MOBILE",
                "ext": ""
              }
            ]
          }
        ]
      },
      "orderComments": [
        {
          "code": "H",
          "description": "Order header comment here"
        }
      ],
      "lines": [
        {
          "id": "1",
          "itemNumber": "02GAFSL3AS",
          "itemDescription": "Paint ABC Touch-UP Spray Black 12 OZ",
          "orderedQty": {
            "value": 10,
            "uom": "BD"
          },
          "unitPrice": {
            "value": 84.5,
            "uom": "BD",
            "instructions": "Quote: 312345"
          },
          "comments": {
            "code": "D",
            "description": "Line comment text here"
          }
        }
      ]
    };


    const response = await api.post('/abc-supply/orders', orderPayload);
    console.log("response,", response.data);

    return response.data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/abc-supply/orders/${orderId}`);
    return response.data;
  }
};