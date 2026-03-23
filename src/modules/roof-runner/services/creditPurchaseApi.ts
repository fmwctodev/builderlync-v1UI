import { supabase } from '../../../shared/lib/supabase';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  stripe_price_id: string | null;
  description: string | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface CreditPurchase {
  id: string;
  organization_id: string;
  credit_package_id: string | null;
  credits_purchased: number;
  amount_paid_cents: number;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  completed_at: string | null;
  created_by: string | null;
}

export interface CreateCheckoutSessionRequest {
  organizationId: string;
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export async function getCreditPackages(): Promise<CreditPackage[]> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch credit packages: ${error.message}`);
  }

  return data || [];
}

export async function getCreditPackage(packageId: string): Promise<CreditPackage | null> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch credit package: ${error.message}`);
  }

  return data;
}

export async function createCreditPurchase(
  organizationId: string,
  packageId: string,
  creditsPurchased: number,
  amountPaidCents: number,
  stripeCheckoutSessionId: string
): Promise<CreditPurchase> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('credit_purchases')
    .insert({
      organization_id: organizationId,
      credit_package_id: packageId,
      credits_purchased: creditsPurchased,
      amount_paid_cents: amountPaidCents,
      stripe_checkout_session_id: stripeCheckoutSessionId,
      status: 'pending',
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create credit purchase: ${error.message}`);
  }

  return data;
}

export async function getPurchaseHistory(
  organizationId: string,
  limit: number = 20
): Promise<CreditPurchase[]> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('credit_purchases')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch purchase history: ${error.message}`);
  }

  return data || [];
}

export async function createStripeCheckoutSession(
  request: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration not available');
  }

  const session = await supabase?.auth.getSession();
  const accessToken = session?.data.session?.access_token;

  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/stripe-credits-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      organizationId: request.organizationId,
      packageId: request.packageId,
      successUrl: request.successUrl,
      cancelUrl: request.cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  const data = await response.json();
  return {
    checkoutUrl: data.url,
    sessionId: data.sessionId,
  };
}
