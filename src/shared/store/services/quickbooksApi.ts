import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface QuickBooksStatus {
  connected: boolean;
  companyInfo: {
    Name?: string;
  } | null;
}

export interface QuickBooksConnectResponse {
  success: boolean;
  data: {
    authUrl: string;
  };
  message: string;
}

export interface QuickBooksStatusResponse {
  success: boolean;
  data: QuickBooksStatus;
  message: string;
}

export interface QuickBooksResponse {
  success: boolean;
  message: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const connectQuickBooks = async (): Promise<QuickBooksConnectResponse> => {
  const response = await axios.post<QuickBooksConnectResponse>(
    `${API_BASE_URL}/quickbooks/connect`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const getQuickBooksStatus = async (): Promise<QuickBooksStatusResponse> => {
  const response = await axios.get<QuickBooksStatusResponse>(
    `${API_BASE_URL}/quickbooks/status`,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const disconnectQuickBooks = async (): Promise<QuickBooksResponse> => {
  const response = await axios.post<QuickBooksResponse>(
    `${API_BASE_URL}/quickbooks/disconnect`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const processQuickBooksCallback = async (code: string, state: string, realmId: string): Promise<QuickBooksResponse> => {
  const response = await axios.post<QuickBooksResponse>(
    `${API_BASE_URL}/quickbooks/process-callback`,
    { code, state, realmId },
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export interface QuickBooksCustomer {
  Id: string;
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}

export interface QuickBooksItem {
  Id: string;
  Name: string;
  Description?: string;
  UnitPrice?: number;
  Type: string;
  IncomeAccountRef?: { value: string; name: string };
}

export interface QuickBooksInvoiceLineItem {
  Description: string;
  Amount: number;
  DetailType: 'SalesItemLineDetail';
  SalesItemLineDetail: {
    ItemRef?: { value: string; name: string };
    UnitPrice: number;
    Qty: number;
    TaxCodeRef?: { value: string };
  };
}

export interface QuickBooksInvoiceRequest {
  CustomerRef: { value: string };
  Line: QuickBooksInvoiceLineItem[];
  DueDate?: string;
  TxnDate?: string;
  PrivateNote?: string;
  CustomerMemo?: { value: string };
  BillEmail?: { Address: string };
  PONumber?: string;
  DepositToAccountRef?: { value: string };
  GlobalTaxCalculation?: string;
}

export interface QuickBooksInvoiceResponse {
  success: boolean;
  data?: {
    Id: string;
    DocNumber: string;
    TxnDate: string;
    TotalAmt: number;
    Balance: number;
  };
  message: string;
  error?: string;
}

export interface QuickBooksCustomersResponse {
  success: boolean;
  data: QuickBooksCustomer[];
  message: string;
}

export interface QuickBooksItemsResponse {
  success: boolean;
  data: QuickBooksItem[];
  message: string;
}

export const getQuickBooksCustomers = async (): Promise<QuickBooksCustomersResponse> => {
  const response = await axios.get<QuickBooksCustomersResponse>(
    `${API_BASE_URL}/quickbooks/customers`,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const getQuickBooksItems = async (): Promise<QuickBooksItemsResponse> => {
  const response = await axios.get<QuickBooksItemsResponse>(
    `${API_BASE_URL}/quickbooks/items`,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const createQuickBooksInvoice = async (
  invoiceData: QuickBooksInvoiceRequest
): Promise<QuickBooksInvoiceResponse> => {
  const response = await axios.post<QuickBooksInvoiceResponse>(
    `${API_BASE_URL}/quickbooks/invoices`,
    invoiceData,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const syncQuickBooksInvoice = async (invoiceId: string): Promise<QuickBooksInvoiceResponse> => {
  const response = await axios.post<QuickBooksInvoiceResponse>(
    `${API_BASE_URL}/quickbooks/invoices/${invoiceId}/sync`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const createQuickBooksCustomer = async (customerData: {
  DisplayName: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}): Promise<{ success: boolean; data?: QuickBooksCustomer; message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/quickbooks/customers`,
    customerData,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export interface QuickBooksEstimateLineItem {
  Description: string;
  Amount: number;
  DetailType: 'SalesItemLineDetail';
  SalesItemLineDetail: {
    ItemRef?: { value: string; name: string };
    UnitPrice: number;
    Qty: number;
    TaxCodeRef?: { value: string };
  };
}

export interface QuickBooksEstimateRequest {
  CustomerRef: { value: string };
  Line: QuickBooksEstimateLineItem[];
  ExpirationDate?: string;
  TxnDate?: string;
  PrivateNote?: string;
  CustomerMemo?: { value: string };
  BillEmail?: { Address: string };
  PONumber?: string;
}

export interface QuickBooksEstimateResponse {
  success: boolean;
  data?: {
    Id: string;
    DocNumber: string;
    TxnDate: string;
    TotalAmt: number;
    ExpirationDate?: string;
  };
  message: string;
  error?: string;
}

export const createQuickBooksEstimate = async (
  estimateData: QuickBooksEstimateRequest
): Promise<QuickBooksEstimateResponse> => {
  const response = await axios.post<QuickBooksEstimateResponse>(
    `${API_BASE_URL}/quickbooks/estimates`,
    estimateData,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const syncQuickBooksEstimate = async (estimateId: string): Promise<QuickBooksEstimateResponse> => {
  const response = await axios.post<QuickBooksEstimateResponse>(
    `${API_BASE_URL}/quickbooks/estimates/${estimateId}/sync`,
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

export const getQuickBooksEstimates = async (): Promise<{ success: boolean; data: any[]; message: string }> => {
  const response = await axios.get(
    `${API_BASE_URL}/quickbooks/estimates`,
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};