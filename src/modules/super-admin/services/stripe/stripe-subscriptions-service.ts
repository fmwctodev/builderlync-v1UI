import { billingApi } from '../billing-api';

export interface CreateSubscriptionData {
  accountId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  trialPeriodDays?: number;
}

export async function createStripeSubscription(data: CreateSubscriptionData): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    console.log('Mock: Creating Stripe subscription for', data.stripeCustomerId);

    // In a real app, this would call:
    // const response = await billingApi.createSubscription(data);
    // return { success: true, subscriptionId: response.id };

    return { success: true, subscriptionId: `sub_mock_${Math.random().toString(36).slice(2, 9)}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllSubscriptions(): Promise<{ data: any[]; error?: string }> {
  try {
    const data = await billingApi.getAllSubscriptions();
    return { data: data || [] };
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return { data: [], error: error.message };
  }
}

export async function getSubscriptionByAccount(accountId: string) {
  const { data } = await getAllSubscriptions();
  return { data: data.find((s: any) => s.account_id === accountId) };
}
