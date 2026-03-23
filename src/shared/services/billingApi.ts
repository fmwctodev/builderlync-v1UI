import { supabase } from '../lib/supabase';

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  plan_id: string;
  plan_name: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  amount: number;
  currency: string;
  interval: string;
  interval_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  organization_id: string;
  stripe_payment_method_id?: string;
  type: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  billing_email?: string;
  is_default: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BillingHistory {
  id: string;
  organization_id: string;
  subscription_id?: string;
  stripe_invoice_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  invoice_pdf?: string;
  paid_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreatePaymentMethodInput {
  type: string;
  stripe_payment_method_id?: string;
  card_brand?: string;
  card_last4?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  billing_email?: string;
  is_default?: boolean;
}

export const billingApi = {
  async getSubscription(organizationId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  },

  async getAllSubscriptions(organizationId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

    return data || [];
  },

  async createSubscription(
    organizationId: string,
    subscription: Omit<Subscription, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
  ): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: organizationId,
        ...subscription,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return data;
  },

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return data;
  },

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    return this.updateSubscription(subscriptionId, {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    });
  },

  async getPaymentMethods(organizationId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      throw new Error(`Failed to fetch payment methods: ${error.message}`);
    }

    return data || [];
  },

  async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod | null> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching payment method:', error);
      throw new Error(`Failed to fetch payment method: ${error.message}`);
    }

    return data;
  },

  async getDefaultPaymentMethod(
    organizationId: string
  ): Promise<PaymentMethod | null> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_default', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching default payment method:', error);
      throw new Error(`Failed to fetch default payment method: ${error.message}`);
    }

    return data;
  },

  async addPaymentMethod(
    organizationId: string,
    input: CreatePaymentMethodInput
  ): Promise<PaymentMethod> {
    if (input.is_default) {
      await this.clearDefaultPaymentMethod(organizationId);
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        organization_id: organizationId,
        ...input,
        is_default: input.is_default ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding payment method:', error);
      throw new Error(`Failed to add payment method: ${error.message}`);
    }

    return data;
  },

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const paymentMethod = await this.getPaymentMethod(paymentMethodId);
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    await this.clearDefaultPaymentMethod(paymentMethod.organization_id);

    const { data, error } = await supabase
      .from('payment_methods')
      .update({
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentMethodId)
      .select()
      .single();

    if (error) {
      console.error('Error setting default payment method:', error);
      throw new Error(`Failed to set default payment method: ${error.message}`);
    }

    return data;
  },

  async clearDefaultPaymentMethod(organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('organization_id', organizationId)
      .eq('is_default', true);

    if (error) {
      console.error('Error clearing default payment method:', error);
    }
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (error) {
      console.error('Error deleting payment method:', error);
      throw new Error(`Failed to delete payment method: ${error.message}`);
    }
  },

  async getBillingHistory(organizationId: string): Promise<BillingHistory[]> {
    const { data, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching billing history:', error);
      throw new Error(`Failed to fetch billing history: ${error.message}`);
    }

    return data || [];
  },

  async getBillingHistoryItem(historyId: string): Promise<BillingHistory | null> {
    const { data, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('id', historyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching billing history item:', error);
      throw new Error(`Failed to fetch billing history item: ${error.message}`);
    }

    return data;
  },

  async addBillingHistoryItem(
    organizationId: string,
    item: Omit<BillingHistory, 'id' | 'organization_id' | 'created_at'>
  ): Promise<BillingHistory> {
    const { data, error } = await supabase
      .from('billing_history')
      .insert({
        organization_id: organizationId,
        ...item,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding billing history item:', error);
      throw new Error(`Failed to add billing history item: ${error.message}`);
    }

    return data;
  },
};
