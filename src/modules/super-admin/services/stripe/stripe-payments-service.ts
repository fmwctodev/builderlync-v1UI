import { getStripeClient } from './stripe-client';
import { supabase, handleSupabaseError } from '../supabase-client';

export async function syncStripePayment(stripePaymentIntentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    const { data: invoice } = await supabase
      .from('stripe_invoices')
      .select('id, account_id')
      .eq('stripe_invoice_id', paymentIntent.invoice as string)
      .maybeSingle();

    const charge = paymentIntent.latest_charge
      ? typeof paymentIntent.latest_charge === 'string'
        ? await stripe.charges.retrieve(paymentIntent.latest_charge)
        : paymentIntent.latest_charge
      : null;

    const { data: existing } = await supabase
      .from('stripe_payments')
      .select('id')
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .maybeSingle();

    const paymentData = {
      account_id: invoice?.account_id || null,
      invoice_id: invoice?.id || null,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: charge?.id || null,
      amount: paymentIntent.amount,
      amount_refunded: paymentIntent.amount_received - (paymentIntent.amount_capturable || 0),
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      payment_method_type: paymentIntent.payment_method_types?.[0] || null,
      payment_method_last4: charge?.payment_method_details?.card?.last4 || null,
      payment_method_brand: charge?.payment_method_details?.card?.brand || null,
      failure_message: paymentIntent.last_payment_error?.message || null,
      receipt_url: charge?.receipt_url || null,
      paid_at: paymentIntent.status === 'succeeded' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from('stripe_payments').update(paymentData).eq('id', existing.id);
    } else {
      await supabase.from('stripe_payments').insert(paymentData);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing Stripe payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync Stripe payment',
    };
  }
}

export async function getAllPayments(filters?: {
  status?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ data: any[]; error?: string }> {
  try {
    let query = supabase
      .from('stripe_payments')
      .select(`
        *,
        enterprise_accounts (
          id,
          name,
          status
        ),
        stripe_invoices (
          invoice_number,
          amount_due
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

export async function getPaymentsByAccount(accountId: string): Promise<{ data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stripe_payments')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    return { data: [], error: handleSupabaseError(error) };
  }
}

export async function pullPaymentsFromStripe(startDate?: Date): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const stripe = getStripeClient();

    const params: any = { limit: 100 };
    if (startDate) {
      params.created = { gte: Math.floor(startDate.getTime() / 1000) };
    }

    const paymentIntents = await stripe.paymentIntents.list(params);
    let synced = 0;
    let failed = 0;

    for (const paymentIntent of paymentIntents.data) {
      const result = await syncStripePayment(paymentIntent.id);
      if (result.success) {
        synced++;
      } else {
        failed++;
      }
    }

    return { success: true, count: synced };
  } catch (error: any) {
    console.error('Error pulling payments from Stripe:', error);
    return {
      success: false,
      error: error.message || 'Failed to pull payments from Stripe',
    };
  }
}

export async function refundPayment(
  stripeChargeId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();

    const refundParams: any = { charge: stripeChargeId };
    if (amount) refundParams.amount = amount;
    if (reason) refundParams.reason = reason;

    const refund = await stripe.refunds.create(refundParams);

    const { data: payment } = await supabase
      .from('stripe_payments')
      .select('stripe_payment_intent_id')
      .eq('stripe_charge_id', stripeChargeId)
      .maybeSingle();

    if (payment) {
      await syncStripePayment(payment.stripe_payment_intent_id);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to refund payment',
    };
  }
}
