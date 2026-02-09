import { getStripeClient } from './stripe-client';
import { supabase, handleSupabaseError } from '../supabase-client';
import type Stripe from 'stripe';

export interface StripeCustomerData {
  accountId: string;
  email: string;
  name: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export async function createStripeCustomer(data: StripeCustomerData): Promise<{ success: boolean; customerId?: string; error?: string }> {
  try {
    const stripe = getStripeClient();

    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: {
        account_id: data.accountId,
        ...data.metadata,
      },
    });

    await supabase.from('stripe_customers').insert({
      account_id: data.accountId,
      stripe_customer_id: customer.id,
      email: data.email,
      name: data.name,
      default_payment_method: customer.default_source as string | null,
      currency: customer.currency || 'usd',
      balance: customer.balance || 0,
      delinquent: customer.delinquent || false,
      metadata: customer.metadata,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
    });

    return { success: true, customerId: customer.id };
  } catch (error: any) {
    console.error('Error creating Stripe customer:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Stripe customer',
    };
  }
}

export async function getStripeCustomerByAccountId(accountId: string): Promise<{ data: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stripe_customers')
      .select('*')
      .eq('account_id', accountId)
      .maybeSingle();

    if (error) throw error;

    return { data };
  } catch (error: any) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function syncStripeCustomer(stripeCustomerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(stripeCustomerId);

    if (customer.deleted) {
      await supabase
        .from('stripe_customers')
        .delete()
        .eq('stripe_customer_id', stripeCustomerId);

      return { success: true };
    }

    const { error } = await supabase
      .from('stripe_customers')
      .update({
        email: customer.email || '',
        name: customer.name || '',
        default_payment_method: customer.default_source as string | null,
        currency: customer.currency || 'usd',
        balance: customer.balance || 0,
        delinquent: customer.delinquent || false,
        metadata: customer.metadata,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing Stripe customer:', error);

    await supabase
      .from('stripe_customers')
      .update({
        sync_status: 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', stripeCustomerId);

    return {
      success: false,
      error: error.message || 'Failed to sync Stripe customer',
    };
  }
}

export async function updateStripeCustomer(
  stripeCustomerId: string,
  updates: Partial<Stripe.CustomerUpdateParams>
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.update(stripeCustomerId, updates);

    await syncStripeCustomer(customer.id);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating Stripe customer:', error);
    return {
      success: false,
      error: error.message || 'Failed to update Stripe customer',
    };
  }
}

export async function deleteStripeCustomer(stripeCustomerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    await stripe.customers.del(stripeCustomerId);

    await supabase
      .from('stripe_customers')
      .delete()
      .eq('stripe_customer_id', stripeCustomerId);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting Stripe customer:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete Stripe customer',
    };
  }
}

export async function getAllStripeCustomers(): Promise<{ data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stripe_customers')
      .select(`
        *,
        enterprise_accounts (
          id,
          name,
          status,
          plan
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    return { data: [], error: handleSupabaseError(error) };
  }
}
