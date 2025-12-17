import type { QuickBooksInvoice, QuickBooksInvoicesResponse } from '../types/quickbooks';

const API_BASE_URL = '/api/quickbooks';

export const quickbooksApi = {
  async getInvoices(): Promise<QuickBooksInvoice[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: QuickBooksInvoicesResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch invoices');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching QuickBooks invoices:', error);
      throw error;
    }
  },

  async getInvoiceById(id: number): Promise<QuickBooksInvoice | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching QuickBooks invoice:', error);
      throw error;
    }
  }
};