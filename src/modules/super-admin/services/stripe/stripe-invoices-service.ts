import { getStripeClient } from './stripe-client';
import { supabase, handleSupabaseError } from '../supabase-client';

export async function syncStripeInvoice(stripeInvoiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    const invoice = await stripe.invoices.retrieve(stripeInvoiceId);

    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('id, account_id')
      .eq('stripe_customer_id', invoice.customer as string)
      .maybeSingle();

    if (!customer) {
      throw new Error('Customer not found');
    }

    const { data: subscription } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .eq('stripe_subscription_id', invoice.subscription as string)
      .maybeSingle();

    const { data: existing } = await supabase
      .from('stripe_invoices')
      .select('id')
      .eq('stripe_invoice_id', stripeInvoiceId)
      .maybeSingle();

    const invoiceData = {
      account_id: customer.account_id,
      customer_id: customer.id,
      subscription_id: subscription?.id || null,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer as string,
      invoice_number: invoice.number || null,
      status: invoice.status || 'draft',
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      amount_remaining: invoice.amount_remaining,
      currency: invoice.currency,
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
      invoice_pdf: invoice.invoice_pdf || null,
      hosted_invoice_url: invoice.hosted_invoice_url || null,
      description: invoice.description || null,
      metadata: invoice.metadata,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('stripe_invoices').update(invoiceData).eq('id', existing.id);
    } else {
      await supabase.from('stripe_invoices').insert(invoiceData);
    }

    if (invoice.status === 'paid' && customer.account_id) {
      await supabase
        .from('enterprise_accounts')
        .update({ status: 'active' })
        .eq('id', customer.account_id)
        .eq('status', 'past_due');
    } else if (invoice.status === 'open' && invoice.amount_remaining > 0 && customer.account_id) {
      const overdueDate = invoice.due_date ? new Date(invoice.due_date * 1000) : null;
      if (overdueDate && overdueDate < new Date()) {
        await supabase
          .from('enterprise_accounts')
          .update({ status: 'past_due' })
          .eq('id', customer.account_id);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing Stripe invoice:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync Stripe invoice',
    };
  }
}

export async function getAllInvoices(filters?: {
  status?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ data: any[]; error?: string }> {
  try {
    let query = supabase
      .from('stripe_invoices')
      .select(`
        *,
        enterprise_accounts (
          id,
          name,
          status
        ),
        stripe_customers (
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    return { data: [], error: handleSupabaseError(error) };
  }
}

export async function getInvoicesByAccount(accountId: string): Promise<{ data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stripe_invoices')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    return { data: [], error: handleSupabaseError(error) };
  }
}

export async function pullInvoicesFromStripe(startDate?: Date): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const stripe = getStripeClient();

    const params: any = { limit: 100 };
    if (startDate) {
      params.created = { gte: Math.floor(startDate.getTime() / 1000) };
    }

    const invoices = await stripe.invoices.list(params);
    let synced = 0;
    let failed = 0;

    for (const invoice of invoices.data) {
      const result = await syncStripeInvoice(invoice.id);
      if (result.success) {
        synced++;
      } else {
        failed++;
      }
    }

    return { success: true, count: synced };
  } catch (error: any) {
    console.error('Error pulling invoices from Stripe:', error);
    return {
      success: false,
      error: error.message || 'Failed to pull invoices from Stripe',
    };
  }
}

export async function sendInvoiceReminder(stripeInvoiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    await stripe.invoices.sendInvoice(stripeInvoiceId);

    return { success: true };
  } catch (error: any) {
    console.error('Error sending invoice reminder:', error);
    return {
      success: false,
      error: error.message || 'Failed to send invoice reminder',
    };
  }
}

export async function voidInvoice(stripeInvoiceId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    await stripe.invoices.voidInvoice(stripeInvoiceId);
    await syncStripeInvoice(stripeInvoiceId);

    return { success: true };
  } catch (error: any) {
    console.error('Error voiding invoice:', error);
    return {
      success: false,
      error: error.message || 'Failed to void invoice',
    };
  }
}
