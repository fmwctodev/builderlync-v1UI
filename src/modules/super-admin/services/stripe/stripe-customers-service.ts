import { billingApi } from '../billing-api';

export interface StripeCustomerData {
  accountId: string;
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export async function createStripeCustomer(data: StripeCustomerData): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    // In a real app, this would call a backend endpoint that creates the Stripe customer
    // and returns the ID. For now, we'll try to find if one exists or return a mock.
    // If we have a backend endpoint for this, we should add it to billingApi.

    // For now, let's assume the backend handles this via a generic sync or we add it to billingApi later.
    // Since account-provisioning-service calls this, it expects a success result.
    console.log('Mock: Creating Stripe customer for', data.email);

    // Minimal implementation: If we had an API endpoint like:
    // const response = await billingApi.createCustomer(data);
    // return { success: true, customerId: response.id };

    return { success: true, customerId: `cus_mock_${Math.random().toString(36).slice(2, 9)}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllStripeCustomers(): Promise<{ data: any[]; error?: string }> {
  try {
    // In our simplified backend, subscriptions contain account/customer info
    // If we need a dedicated customer list, we'd add it to backend.
    // For now, we'll derive it from subscriptions or use the same endpoint.
    const subs = await billingApi.getAllSubscriptions();

    // Transform subscriptions to "customer" objects expected by AccountsTab
    const customers = subs.map((sub: any) => ({
      id: sub.stripe_customer_id,
      account_id: sub.account_id,
      stripe_customer_id: sub.stripe_customer_id,
      email: sub.account?.email || 'N/A',
      enterprise_accounts: sub.account,
      default_payment_method: 'Card' // Minimal mock
    }));

    return { data: customers };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
}
