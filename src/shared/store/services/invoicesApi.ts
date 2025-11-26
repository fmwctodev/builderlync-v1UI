import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface Invoice {
  id: number;
  quickbooks_id: string;
  doc_number: string;
  customer_id: number | null;
  customer_name: string;
  total_amount: number;
  balance: number;
  due_date: string;
  invoice_date: string;
  status: string;
  currency_code: string;
  email_status: string;
  private_note: string | null;
  customer_memo: string | null;
  created_by: number;
  synced_at: string;
  created_at: string;
  updated_at: string;
  contacts: {
    id: number;
    full_name: string;
    email: string;
  } | null;
  invoice_line_items: Array<{
    id: number;
    invoice_id: number;
    line_num: number;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    item_name: string;
    created_at: string;
  }>;
}

export interface InvoicesResponse {
  success: boolean;
  message: string;
  data: Invoice[];
}

export const getInvoices = async (): Promise<InvoicesResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<InvoicesResponse>(
    `${API_BASE_URL}/quickbooks/invoices`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};