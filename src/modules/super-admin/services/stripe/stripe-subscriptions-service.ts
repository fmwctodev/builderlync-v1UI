import { getStripeClient } from './stripe-client';
import { supabase, handleSupabaseError } from '../supabase-client';
import type Stripe from 'stripe';

export interface CreateSubscriptionData {
  accountId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  trialPeriodDays?: number;
}

export async function createStripeSubscription(
  data: CreateSubscriptionData
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const stripe = getStripeClient();

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: data.stripeCustomerId,
      items: [{ price: data.stripePriceId }],
      metadata: {
        account_id: data.accountId,
        plan_name: data.planName,
      },
    };

    if (data.trialPeriodDays) {
      subscriptionParams.trial_period_days = data.trialPeriodDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('id')
      .eq('stripe_customer_id', data.stripeCustomerId)
      .single();

    if (!customer) {
      throw new Error('Customer not found in database');
    }

    await supabase.from('stripe_subscriptions').insert({
      account_id: data.accountId,
      customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: data.stripeCustomerId,
      status: subscription.status,
      plan_name: data.planName,
      billing_cycle: data.billingCycle,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription.metadata,
    });

    return { success: true, subscriptionId: subscription.id };
  } catch (error: any) {
    console.error('Error creating Stripe subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to create Stripe subscription',
    };
  }
}

export async function getSubscriptionByAccountId(accountId: string): Promise<{ data: any; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) throw error;

    return { data };
  } catch (error: any) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function syncStripeSubscription(stripeSubscriptionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    const { error } = await supabase
      .from('stripe_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
        metadata: subscription.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error syncing Stripe subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync Stripe subscription',
    };
  }
}

export async function cancelStripeSubscription(
  stripeSubscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();

    if (cancelAtPeriodEnd) {
      await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    }

    await syncStripeSubscription(stripeSubscriptionId);

    return { success: true };
  } catch (error: any) {
    console.error('Error canceling Stripe subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel Stripe subscription',
    };
  }
}

export async function updateSubscriptionPlan(
  stripeSubscriptionId: string,
  newPriceId: string,
  planName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    const subscriptionItemId = subscription.items.data[0].id;

    await stripe.subscriptions.update(stripeSubscriptionId, {
      items: [
        {
          id: subscriptionItemId,
          price: newPriceId,
        },
      ],
      metadata: {
        ...subscription.metadata,
        plan_name: planName,
      },
      proration_behavior: 'create_prorations',
    });

    await supabase
      .from('stripe_subscriptions')
      .update({
        plan_name: planName,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    await syncStripeSubscription(stripeSubscriptionId);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating subscription plan:', error);
    return {
      success: false,
      error: error.message || 'Failed to update subscription plan',
    };
  }
}

export async function reactivateSubscription(stripeSubscriptionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = getStripeClient();

    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await syncStripeSubscription(stripeSubscriptionId);

    return { success: true };
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to reactivate subscription',
    };
  }
}

export async function getAllSubscriptions(): Promise<{ data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('stripe_subscriptions')
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

    if (error) throw error;

    return { data: data || [] };
  } catch (error: any) {
    return { data: [], error: handleSupabaseError(error) };
  }
}
