export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';
export type BillingCycle = 'monthly' | 'annual';
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

export interface Plan {
  id: string;
  name: string;
  price_monthly: string;
  price_annual: string;
  description?: string | null;
  included_modules?: string[] | null;
  limits?: any;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  plan_name?: string;
  status: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_start?: string | null;
  trial_end?: string | null;
  amount: number;
  currency: string;
  interval: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
  account?: {
    id: string;
    name: string;
    status: string;
  };
}

export interface Invoice {
  id: string;
  customer_id: string;
  number: string;
  status: string;
  total: number;
  currency: string;
  issued_at?: string | null;
  due_at?: string | null;
  created_at: string;
  account?: {
    id: string;
    name: string;
  };
}

export interface RevenueMetrics {
  totalMRR: number;
  totalARR: number;
  activeSubscriptions: number;
  churnedCount: number;
  revenueLastMonth: number;
  avgRevenuePerAccount: number;
}

export interface PlanMetrics {
  plan_name: string;
  subscription_count: number;
  total_mrr: number;
  percentage: number;
}
