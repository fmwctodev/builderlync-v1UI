import { supabase } from '../../lib/supabase';
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

export const createInvoice = async (invoice: Partial<Invoice>): Promise<Invoice> => {
  const response = await makeRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice),
  });
  return response.data;
};

export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
  const response = await makeRequest(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
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
  let query = supabase
    .from('estimates')
    .select('*')
    .order('issue_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.isTemplate !== undefined) {
    query = query.eq('is_template', filters.isTemplate);
  }

  if (filters?.isRecurring !== undefined) {
    query = query.eq('is_recurring', filters.isRecurring);
  }

  if (filters?.startDate) {
    query = query.gte('issue_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('issue_date', filters.endDate);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,estimate_number.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createEstimate = async (estimate: Partial<Estimate>): Promise<Estimate> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('estimates')
    .insert([{ ...estimate, created_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEstimate = async (id: string, updates: Partial<Estimate>): Promise<Estimate> => {
  const { data, error } = await supabase
    .from('estimates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEstimate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchDocuments = async (filters?: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Document[]> => {
  let query = supabase
    .from('documents_contracts')
    .select('*')
    .order('date_modified', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.startDate) {
    query = query.gte('date_modified', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('date_modified', filters.endDate);
  }

  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createDocument = async (document: Partial<Document>): Promise<Document> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('documents_contracts')
    .insert([{ ...document, created_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents_contracts')
    .update({ ...updates, date_modified: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('documents_contracts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchTransactions = async (filters?: {
  paymentStatus?: string;
  fundingStatus?: string;
  provider?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false });

  if (filters?.paymentStatus) {
    query = query.eq('payment_status', filters.paymentStatus);
  }

  if (filters?.fundingStatus) {
    query = query.eq('funding_status', filters.fundingStatus);
  }

  if (filters?.provider) {
    query = query.eq('provider', filters.provider);
  }

  if (filters?.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }

  if (filters?.search) {
    query = query.or(`customer_name.ilike.%${filters.search}%,transaction_id.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createTransaction = async (transaction: Partial<Transaction>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchCoupons = async (filters?: {
  status?: string;
  search?: string;
}): Promise<Coupon[]> => {
  let query = supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createCoupon = async (coupon: Partial<Coupon>): Promise<Coupon> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('coupons')
    .insert([{ ...coupon, created_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<Coupon> => {
  const { data, error } = await supabase
    .from('coupons')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCoupon = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchPaymentIntegrations = async (): Promise<PaymentIntegration[]> => {
  const { data, error } = await supabase
    .from('payment_integrations')
    .select('*')
    .order('provider');

  if (error) throw error;
  return data || [];
};

export const updatePaymentIntegration = async (
  provider: string,
  updates: Partial<PaymentIntegration>
): Promise<PaymentIntegration> => {
  const { data, error } = await supabase
    .from('payment_integrations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('provider', provider)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getInvoiceStats = async () => {
  const { data, error } = await supabase
    .from('invoices')
    .select('status, amount');

  if (error) throw error;

  const stats = {
    draft: { count: 0, total: 0 },
    due: { count: 0, total: 0 },
    received: { count: 0, total: 0 },
    overdue: { count: 0, total: 0 },
  };

  data?.forEach((invoice) => {
    if (stats[invoice.status as keyof typeof stats]) {
      stats[invoice.status as keyof typeof stats].count += 1;
      stats[invoice.status as keyof typeof stats].total += Number(invoice.amount);
    }
  });

  return stats;
};

export const getDocumentStats = async () => {
  const { data, error } = await supabase
    .from('documents_contracts')
    .select('status');

  if (error) throw error;

  const stats = {
    draft: 0,
    waiting: 0,
    completed: 0,
    payments: 0,
    archived: 0,
  };

  data?.forEach((doc) => {
    if (stats[doc.status as keyof typeof stats] !== undefined) {
      stats[doc.status as keyof typeof stats] += 1;
    }
  });

  return stats;
};
