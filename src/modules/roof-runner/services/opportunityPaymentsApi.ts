import { supabase } from '../../../shared/lib/supabase';

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
    try {
      const { data, error } = await supabase
        .from('opportunity_payments')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching opportunity payments:', error);
      throw error;
    }
  },

  async createPayment(paymentData: CreateOpportunityPaymentRequest): Promise<OpportunityPayment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('opportunity_payments')
        .insert({
          ...paymentData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating opportunity payment:', error);
      throw error;
    }
  },

  async updatePayment(paymentId: string, updates: UpdateOpportunityPaymentRequest): Promise<OpportunityPayment> {
    try {
      const { data, error } = await supabase
        .from('opportunity_payments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating opportunity payment:', error);
      throw error;
    }
  },

  async deletePayment(paymentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('opportunity_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting opportunity payment:', error);
      throw error;
    }
  },

  async getTotalPaid(opportunityId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('opportunity_payments')
        .select('amount')
        .eq('opportunity_id', opportunityId)
        .eq('status', 'completed');

      if (error) throw error;

      return (data || []).reduce((sum, payment) => sum + payment.amount, 0);
    } catch (error) {
      console.error('Error calculating total paid:', error);
      return 0;
    }
  },
};
