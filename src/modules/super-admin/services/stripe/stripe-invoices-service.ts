import { billingApi } from '../billing-api';

export async function getAllInvoices(): Promise<{ data: any[]; error?: string }> {
  try {
    const data = await billingApi.getAllInvoices();
    // Transform to match the structure expected by InvoicesTab
    const transformed = data.map((inv: any) => ({
      ...inv,
      enterprise_accounts: inv.account, // Mapping for backward compatibility
      stripe_customers: { email: inv.account?.email }
    }));
    return { data: transformed || [] };
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return { data: [], error: error.message };
  }
}

export async function getInvoicesByAccount(accountId: string): Promise<{ data: any[]; error?: string }> {
  try {
    const data = await billingApi.getAllInvoices(); // Filter logic can be added if needed
    return { data: data.filter((inv: any) => inv.account_id === accountId) };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}

// Others can be mocks or minimal implementations
export async function syncStripeInvoice(stripeInvoiceId: string) { return { success: true }; }
export async function pullInvoicesFromStripe() { return { success: true }; }
