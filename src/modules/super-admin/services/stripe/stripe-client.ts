import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

const getStripeApiKey = (): string => {
  const key = import.meta.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe API key not configured');
  }
  return key;
};

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const apiKey = getStripeApiKey();
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2026-01-28.clover' as any,
    });
  }
  return stripeInstance;
}

export function getStripeWebhookSecret(): string {
  const secret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Stripe webhook secret not configured');
  }
  return secret;
}

export function isStripeConfigured(): boolean {
  try {
    const apiKey = import.meta.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    return !!apiKey && apiKey.startsWith('sk_');
  } catch {
    return false;
  }
}

export async function testStripeConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isStripeConfigured()) {
      return {
        success: false,
        error: 'Stripe API key not configured. Set VITE_STRIPE_SECRET_KEY environment variable.',
      };
    }
    const stripe = getStripeClient();
    await stripe.customers.list({ limit: 1 });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to Stripe',
    };
  }
}
