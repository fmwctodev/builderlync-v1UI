import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
};

export interface Invoice {
  id: string;
  invoice_number: string;
  name: string;
  customer_id?: number;
  customer_name?: string;
  user_id?: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date?: string;
  po_number?: string;
  payment_terms?: string;
  line_items?: any[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  coupon_id?: number;
  coupon_discount?: number;
  notes?: string;
  message_to_customer?: string;
  is_estimate?: boolean;
  job_id?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  warning?: string;
  data?: any;
}

export interface Estimate {
  id: string;
  estimate_number: string;
  name: string;
  customer_id?: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  is_template: boolean;
  is_recurring: boolean;
  issue_date: string;
  expiry_date?: string;
  acceptance_status: 'pending' | 'accepted' | 'rejected';
  accepted_at?: string;
  items: any[];
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'proposal' | 'estimate' | 'contract';
  customer_id?: string;
  status: 'draft' | 'waiting' | 'completed' | 'payments' | 'archived';
  value: number;
  content: any;
  date_modified: string;
  created_by?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  customer_id?: string;
  customer_name: string;
  provider: string;
  source: string;
  amount: number;
  transaction_date: string;
  payment_status: 'approved' | 'pending' | 'failed' | 'declined';
  funding_status: 'funded' | 'in_transit' | 'not_funded' | 'error' | 'ach_return';
  metadata: any;
  created_at: string;
}

export interface Coupon {
  id: string;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  status: 'active' | 'scheduled' | 'expired';
  start_date: string;
  end_date?: string;
  redemption_count: number;
  max_redemptions?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentIntegration {
  id: string;
  provider: 'quickbooks' | 'stripe';
  is_connected: boolean;
  credentials: any;
  settings: any;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export const fetchInvoices = async (filters?: {
  status?: string;
  is_estimate?: boolean;
  job_id?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Invoice[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.is_estimate !== undefined) params.append('is_estimate', String(filters.is_estimate));
  if (filters?.job_id) params.append('job_id', String(filters.job_id));
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.search) params.append('search', filters.search);

  const response = await makeRequest(`/invoices?${params}`);
  return response.data;
};

export const createInvoice = async (invoice: Partial<Invoice>): Promise<any> => {
  const response = await makeRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice),
  });
  return response;
};

export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<any> => {
  const response = await makeRequest(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await makeRequest(`/invoices/${id}`, {
    method: 'DELETE',
  });
};

export const fetchEstimates = async (filters?: {
  status?: string;
  isTemplate?: boolean;
  isRecurring?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Estimate[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.isTemplate !== undefined) params.append('isTemplate', String(filters.isTemplate));
  if (filters?.isRecurring !== undefined) params.append('isRecurring', String(filters.isRecurring));
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.search) params.append('search', filters.search);

  const response = await makeRequest(`/estimates?${params}`);
  return response.data;
};

export const createEstimate = async (estimate: Partial<Estimate>): Promise<Estimate> => {
  const response = await makeRequest('/estimates', {
    method: 'POST',
    body: JSON.stringify(estimate),
  });
  return response.data;
};

export const updateEstimate = async (id: string, updates: Partial<Estimate>): Promise<Estimate> => {
  const response = await makeRequest(`/estimates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteEstimate = async (id: string): Promise<void> => {
  await makeRequest(`/estimates/${id}`, {
    method: 'DELETE',
  });
};

export const fetchDocuments = async (filters?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Document[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.search) params.append('search', filters.search);

  const response = await makeRequest(`/contracts?${params}`);
  return response.data;
};

export const createDocument = async (document: Partial<Document>): Promise<Document> => {
  const response = await makeRequest('/contracts', {
    method: 'POST',
    body: JSON.stringify(document),
  });
  return response.data;
};

export const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document> => {
  const response = await makeRequest(`/contracts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await makeRequest(`/contracts/${id}`, {
    method: 'DELETE',
  });
};

export const fetchTransactions = async (filters?: {
  paymentStatus?: string;
  fundingStatus?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Transaction[]> => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.provider) params.append('provider', filters.provider);
  if (filters?.search) params.append('search', filters.search);

  // Note: paymentStatus and fundingStatus filters are not fully implemented in backend yet as per previous code analysis
  // but we can pass them if backend supported them later.

  const response = await makeRequest(`/transactions?${params}`);
  return response.data;
};

export const createTransaction = async (transaction: Partial<Transaction>): Promise<Transaction> => {
  const response = await makeRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
  return response.data;
};

export const fetchCoupons = async (filters?: {
  status?: string;
  search?: string;
}): Promise<Coupon[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const response = await makeRequest(`/coupons?${params}`);
  return response.data;
};

export const createCoupon = async (coupon: Partial<Coupon>): Promise<Coupon> => {
  const response = await makeRequest('/coupons', {
    method: 'POST',
    body: JSON.stringify(coupon),
  });
  return response.data;
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<Coupon> => {
  const response = await makeRequest(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  await makeRequest(`/coupons/${id}`, {
    method: 'DELETE',
  });
};

export const fetchPaymentIntegrations = async (): Promise<PaymentIntegration[]> => {
  const response = await makeRequest('/payments/integrations');
  return response.data;
};

export const updatePaymentIntegration = async (
  provider: string,
  updates: Partial<PaymentIntegration>
): Promise<PaymentIntegration> => {
  const response = await makeRequest(`/payments/integrations/${provider}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const getInvoiceStats = async () => {
  const response = await makeRequest('/invoices/stats');
  return response.data;
};

export const getDocumentStats = async () => {
  const response = await makeRequest('/contracts/stats');
  return response.data;
};
