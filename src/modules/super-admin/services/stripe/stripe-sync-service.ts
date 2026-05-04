const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token');

export async function syncAllStripeData(): Promise<{
  customers: { created: number; updated: number; errors: number };
  products: { created: number; updated: number; errors: number };
  subscriptions: { created: number; updated: number; errors: number };
  invoices: { created: number; updated: number; errors: number };
  payments: { created: number; updated: number; errors: number };
}> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/stripe/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to sync Stripe data');
  }

  return result.data;
}
