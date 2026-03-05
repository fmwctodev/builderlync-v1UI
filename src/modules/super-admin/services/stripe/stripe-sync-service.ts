import { billingApi } from '../billing-api';

export interface SyncResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  errorMessages?: string[];
}

export async function syncAllStripeData(): Promise<{
  customers: SyncResult;
  products: SyncResult;
  subscriptions: SyncResult;
  invoices: SyncResult;
  payments: SyncResult;
}> {
  try {
    const result = await billingApi.syncStripeData();

    // Map backend results to frontend expected structure
    const mapResult = (res: any): SyncResult => ({
      success: true,
      totalProcessed: res.created + res.updated,
      created: res.created,
      updated: res.updated,
      skipped: 0,
      errors: 0
    });

    return {
      customers: mapResult(result.customers),
      products: mapResult(result.products),
      subscriptions: mapResult(result.subscriptions),
      invoices: mapResult(result.invoices),
      payments: mapResult(result.payments),
    };
  } catch (error: any) {
    console.error('Failed to sync Stripe data:', error);
    throw error;
  }
}
