import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface CatalogItem {
  id: string;
  itemType: 'Material' | 'Labor' | 'Other';
  name: string;
  description?: string;
  measurements?: string;
  coverage: number;
  supplier?: string;
  supplierType?: 'abc' | 'srs' | null;
  productId?: string;
  productData?: any;
  branchId?: string;
  branchData?: any;
  abcSelectedShipTo?: any;
  preTaxCost: number;
  waste: number;
  unit: string;
  salesTax: number;
  materialPurchaseTax: number;
  createdAt: string;
  updatedAt: string;
  usage?: {
    totalTemplates: number;
    totalReferences: number;
    templates: Array<{
      id: string;
      name: string;
      referenceCount: number;
      updatedAt: string;
    }>;
  };
}

export interface CatalogFilters {
  search?: string;
  itemTypes?: string;
  sortBy?: 'name-asc' | 'name-desc' | 'date-new' | 'date-old';
  page?: number;
  limit?: number;
}

export interface CatalogResponse {
  success: boolean;
  message?: string;
  data?: {
    items: CatalogItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface SingleItemResponse {
  success: boolean;
  message?: string;
  data?: CatalogItem;
}

export interface BulkDeleteResponse {
  success: boolean;
  message?: string;
  data?: {
    deletedCount: number;
  };
}

export interface CatalogImportResponse {
  success: boolean;
  message?: string;
  data?: {
    created: number;
    updated: number;
    failed: number;
    errors: Array<{ row: number; message: string }>;
  };
}

export interface CatalogSettings {
  salesTax: number;
  materialPurchaseTax: number;
  wasteFactor: number;
}

export interface CatalogSettingsResponse {
  success: boolean;
  message?: string;
  data?: CatalogSettings;
}

// Get catalog items with filters
export const getCatalogItems = async (filters: CatalogFilters = {}): Promise<CatalogResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.itemTypes) params.append('itemTypes', filters.itemTypes);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await axios.get<CatalogResponse>(
      `${API_BASE_URL}/catalog/items?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch catalog items'
    };
  }
};

// Create new catalog item
export const createCatalogItem = async (data: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SingleItemResponse> => {
  try {
    const response = await axios.post<SingleItemResponse>(
      `${API_BASE_URL}/catalog/items`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create catalog item'
    };
  }
};

// Update catalog item
export const updateCatalogItem = async (id: string, data: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SingleItemResponse> => {
  try {
    const response = await axios.put<SingleItemResponse>(
      `${API_BASE_URL}/catalog/items/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update catalog item'
    };
  }
};

// Delete single catalog item
export const deleteCatalogItem = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/catalog/items/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete catalog item'
    };
  }
};

// Bulk delete catalog items
export const bulkDeleteCatalogItems = async (itemIds: string[]): Promise<BulkDeleteResponse> => {
  try {
    const response = await axios.post<BulkDeleteResponse>(
      `${API_BASE_URL}/catalog/items/bulk-delete`,
      { itemIds },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete catalog items'
    };
  }
};

// Duplicate catalog item
export const duplicateCatalogItem = async (id: string): Promise<SingleItemResponse> => {
  try {
    const response = await axios.post<SingleItemResponse>(
      `${API_BASE_URL}/catalog/items/${id}/duplicate`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to duplicate catalog item'
    };
  }
};

// Update item type only
export const updateCatalogItemType = async (id: string, itemType: 'Material' | 'Labor' | 'Other'): Promise<{ success: boolean; message?: string; data?: { id: string; itemType: string } }> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/catalog/items/${id}/type`,
      { itemType },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update item type'
    };
  }
};

export const getCatalogItemById = async (id: string): Promise<SingleItemResponse> => {
  try {
    const response = await axios.get<SingleItemResponse>(
      `${API_BASE_URL}/catalog/items/${id}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch catalog item'
    };
  }
};

export const exportCatalogCsv = async (): Promise<{ success: boolean; blob?: Blob; message?: string }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/catalog/items/export-csv`, {
      headers: getAuthHeaders(),
      responseType: 'blob'
    });

    return {
      success: true,
      blob: response.data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to export catalog CSV'
    };
  }
};

export const importCatalogCsv = async (csv: string): Promise<CatalogImportResponse> => {
  try {
    const response = await axios.post<CatalogImportResponse>(
      `${API_BASE_URL}/catalog/items/import-csv`,
      { csv },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to import catalog CSV'
    };
  }
};

export const getCatalogSettings = async (): Promise<CatalogSettingsResponse> => {
  try {
    const response = await axios.get<CatalogSettingsResponse>(
      `${API_BASE_URL}/catalog/settings`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch catalog settings'
    };
  }
};

export const saveCatalogSettings = async (settings: CatalogSettings): Promise<CatalogSettingsResponse> => {
  try {
    const response = await axios.put<CatalogSettingsResponse>(
      `${API_BASE_URL}/catalog/settings`,
      settings,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to save catalog settings'
    };
  }
};
