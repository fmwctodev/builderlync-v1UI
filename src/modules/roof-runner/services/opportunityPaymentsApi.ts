import { apiClient } from '../../../shared/utils/api';

export interface OpportunityPayment {
  id: string;
  opportunity_id: string;
  user_id: string;
  organization_id?: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  transaction_reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOpportunityPaymentRequest {
  opportunity_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  transaction_reference?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
}

export interface UpdateOpportunityPaymentRequest {
  amount?: number;
  payment_date?: string;
  payment_method?: string;
  transaction_reference?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
}

export const opportunityPaymentsApi = {
  async getPayments(opportunityId: string): Promise<OpportunityPayment[]> {
    return apiClient.get(`/opportunities/${opportunityId}/payments`);
  },

  async createPayment(paymentData: CreateOpportunityPaymentRequest): Promise<OpportunityPayment> {
    return apiClient.post('/opportunities/payments', paymentData);
  },

  async updatePayment(paymentId: string, updates: UpdateOpportunityPaymentRequest): Promise<OpportunityPayment> {
    return apiClient.put(`/opportunities/payments/${paymentId}`, updates);
  },

  async deletePayment(paymentId: string): Promise<void> {
    return apiClient.delete(`/opportunities/payments/${paymentId}`);
  },

  async getTotalPaid(opportunityId: string): Promise<number> {
    const payments = await this.getPayments(opportunityId);
    return payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  },
};
