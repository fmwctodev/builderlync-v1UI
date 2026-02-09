// Mock Stripe client for super admin module
let stripeInstance: any = null;

export function getStripeClient(): any {
  if (!stripeInstance) {
    // Mock stripe instance
    stripeInstance = {
      customers: {
        list: () => Promise.resolve({ data: [] }),
        retrieve: () => Promise.resolve({}),
        create: () => Promise.resolve({}),
        update: () => Promise.resolve({})
      },
      subscriptions: {
        list: () => Promise.resolve({ data: [] }),
        retrieve: () => Promise.resolve({}),
        create: () => Promise.resolve({}),
        update: () => Promise.resolve({})
      },
      invoices: {
        list: () => Promise.resolve({ data: [] }),
        retrieve: () => Promise.resolve({})
      },
      products: {
        list: () => Promise.resolve({ data: [] }),
        retrieve: () => Promise.resolve({}),
        create: () => Promise.resolve({}),
        update: () => Promise.resolve({})
      },
      prices: {
        list: () => Promise.resolve({ data: [] }),
        retrieve: () => Promise.resolve({}),
        create: () => Promise.resolve({}),
        update: () => Promise.resolve({})
      }
    };
  }
  return stripeInstance;
}

export function getStripeWebhookSecret(): string {
  return 'mock-webhook-secret';
}

export function isStripeConfigured(): boolean {
  return false; // Mock as not configured
}

export async function testStripeConnection(): Promise<{ success: boolean; error?: string }> {
  return {
    success: false,
    error: 'Stripe integration not configured in this environment'
  };
}
