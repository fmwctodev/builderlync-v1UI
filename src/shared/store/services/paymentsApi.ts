import { supabase } from '../../lib/supabase';

export interface Invoice {
  id: string;
  invoice_number: string;
  name: string;
  customer_id?: string;
  amount: number;
  status: 'draft' | 'due' | 'received' | 'overdue';
  issue_date: string;
  due_date?: string;
  items: any[];
  notes?: string;
  coupon_id?: string;
  coupon_code?: string;
  coupon_discount_amount?: number;
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
  coupon_id?: string;
  coupon_code?: string;
  coupon_discount_amount?: number;
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
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Invoice[]> => {
  let query = supabase
    .from('invoices')
    .select('*')
    .order('issue_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.startDate) {
    query = query.gte('issue_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('issue_date', filters.endDate);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,invoice_number.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createInvoice = async (invoice: Partial<Invoice>): Promise<Invoice> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('invoices')
    .insert([{ ...invoice, created_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
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

export interface InvoiceTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category: string;
  default_price: number;
  default_quantity: number;
  unit_type: string;
  tax_rate: number;
  is_taxable: boolean;
  quickbooks_item_id?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  line_number: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  discount_percentage: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  template_id?: string;
  quickbooks_item_id?: string;
}

export interface InvoiceAttachment {
  id: string;
  invoice_id: string;
  file_id: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  quickbooks_attachment_id?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface RecurringInvoiceSchedule {
  id?: string;
  organization_id: string;
  invoice_template_id: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  day_of_week?: number;
  day_of_month?: number;
  start_date: string;
  end_date?: string;
  next_invoice_date: string;
  total_occurrences?: number;
  occurrences_completed: number;
  is_active: boolean;
  is_paused: boolean;
  last_generated_at?: string;
  quickbooks_recurring_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchInvoiceTemplates = async (filters?: {
  category?: string;
  isActive?: boolean;
  search?: string;
}): Promise<InvoiceTemplate[]> => {
  let query = supabase
    .from('invoice_templates')
    .select('*')
    .order('name');

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

export const createInvoiceTemplate = async (template: Partial<InvoiceTemplate>): Promise<InvoiceTemplate> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('invoice_templates')
    .insert([{ ...template, created_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateInvoiceTemplate = async (id: string, updates: Partial<InvoiceTemplate>): Promise<InvoiceTemplate> => {
  const { data, error } = await supabase
    .from('invoice_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteInvoiceTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoice_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('line_number');

  if (error) throw error;
  return data || [];
};

export const createInvoiceItems = async (items: Partial<InvoiceItem>[]): Promise<InvoiceItem[]> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data || [];
};

export const updateInvoiceItem = async (id: string, updates: Partial<InvoiceItem>): Promise<InvoiceItem> => {
  const { data, error } = await supabase
    .from('invoice_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteInvoiceItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoice_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchInvoiceAttachments = async (invoiceId: string): Promise<InvoiceAttachment[]> => {
  const { data, error } = await supabase
    .from('invoice_attachments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createInvoiceAttachment = async (attachment: Partial<InvoiceAttachment>): Promise<InvoiceAttachment> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('invoice_attachments')
    .insert([{ ...attachment, uploaded_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteInvoiceAttachment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('invoice_attachments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createRecurringSchedule = async (schedule: Partial<RecurringInvoiceSchedule>): Promise<RecurringInvoiceSchedule> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('recurring_invoice_schedules')
    .insert([{ ...schedule, created_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRecurringSchedule = async (id: string, updates: Partial<RecurringInvoiceSchedule>): Promise<RecurringInvoiceSchedule> => {
  const { data, error } = await supabase
    .from('recurring_invoice_schedules')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchRecurringSchedules = async (): Promise<RecurringInvoiceSchedule[]> => {
  const { data, error } = await supabase
    .from('recurring_invoice_schedules')
    .select('*')
    .eq('is_active', true)
    .order('next_invoice_date');

  if (error) throw error;
  return data || [];
};

export interface EstimateItem {
  id?: string;
  estimate_id?: string;
  line_number: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  discount_percentage: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  template_id?: string;
  quickbooks_item_id?: string;
}

export interface EstimateAttachment {
  id: string;
  estimate_id: string;
  file_id: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  quickbooks_attachment_id?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export const fetchEstimateItems = async (estimateId: string): Promise<EstimateItem[]> => {
  const { data, error } = await supabase
    .from('estimate_items')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('line_number');

  if (error) throw error;
  return data || [];
};

export const createEstimateItems = async (items: Partial<EstimateItem>[]): Promise<EstimateItem[]> => {
  const { data, error } = await supabase
    .from('estimate_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data || [];
};

export const updateEstimateItem = async (id: string, updates: Partial<EstimateItem>): Promise<EstimateItem> => {
  const { data, error } = await supabase
    .from('estimate_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEstimateItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('estimate_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchEstimateAttachments = async (estimateId: string): Promise<EstimateAttachment[]> => {
  const { data, error } = await supabase
    .from('estimate_attachments')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createEstimateAttachment = async (attachment: Partial<EstimateAttachment>): Promise<EstimateAttachment> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('estimate_attachments')
    .insert([{ ...attachment, uploaded_by: user?.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEstimateAttachment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('estimate_attachments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const convertEstimateToInvoice = async (estimateId: string): Promise<string> => {
  const { data, error } = await supabase.rpc('convert_estimate_to_invoice', {
    estimate_uuid: estimateId
  });

  if (error) throw error;
  return data;
};

export const updateEstimateAcceptanceStatus = async (
  id: string,
  status: 'pending' | 'accepted' | 'rejected'
): Promise<{ estimate: Estimate; invoice?: Invoice }> => {
  const updates = {
    acceptance_status: status,
    ...(status === 'accepted' ? { accepted_at: new Date().toISOString(), status: 'accepted' } : {})
  };

  const { data: estimate, error: estimateError } = await supabase
    .from('estimates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (estimateError) throw estimateError;

  if (status === 'accepted') {
    try {
      const invoiceId = await convertEstimateToInvoice(id);
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      return { estimate, invoice };
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      return { estimate };
    }
  }

  return { estimate };
};
