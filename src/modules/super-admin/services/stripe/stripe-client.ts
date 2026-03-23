import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const apiKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error('Stripe API key not configured. Please set VITE_STRIPE_SECRET_KEY in your environment.');
    }

    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  }

  return stripeInstance;
}

export function getStripeWebhookSecret(): string {
  const secret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('Stripe webhook secret not configured. Please set VITE_STRIPE_WEBHOOK_SECRET in your environment.');
  }

  return secret;
}

export function isStripeConfigured(): boolean {
  return !!(import.meta.env.VITE_STRIPE_SECRET_KEY && import.meta.env.VITE_STRIPE_WEBHOOK_SECRET);
}

export async function testStripeConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isStripeConfigured()) {
      return {
        success: false,
        error: 'Stripe is not configured. Please set API keys in environment variables.',
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
