export interface QuickBooksInvoiceLineItem {
  id: number;
  invoice_id: number;
  line_num: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  item_name: string;
  created_at: string;
}

export interface QuickBooksContact {
  id: number;
  full_name: string;
  email: string;
}

export interface QuickBooksInvoice {
  id: number;
  quickbooks_id: string;
  doc_number: string;
  customer_id: number | null;
  customer_name: string;
  total_amount: number;
  balance: number;
  due_date: string;
  invoice_date: string;
  status: 'open' | 'paid' | 'overdue' | 'draft';
  currency_code: string;
  email_status: 'NotSent' | 'EmailSent' | 'NeedToSend';
  private_note: string | null;
  customer_memo: string | null;
  created_by: number;
  synced_at: string;
  created_at: string;
  updated_at: string;
  contacts: QuickBooksContact | null;
  invoice_line_items: QuickBooksInvoiceLineItem[];
}

export interface QuickBooksInvoicesResponse {
  success: boolean;
  message: string;
  data: QuickBooksInvoice[];
}