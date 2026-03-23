import { supabase } from '../../../shared/lib/supabase';
import { requireOrganizationId } from '../../../shared/utils/organizationHelpers';

export interface Invoice {
  id: string;
  invoice_number: string;
  name: string;
  customer_id?: string;
  opportunity_id?: string;
  amount: number;
  status: 'draft' | 'due' | 'received' | 'overdue';
  issue_date: string;
  due_date?: string;
  items: any;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const invoicesApi = {
  async getInvoicesByOpportunity(
    opportunityId: string,
    organizationId: string | null
  ): Promise<Invoice[]> {
    requireOrganizationId(organizationId, 'getInvoicesByOpportunity');

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('opportunity_id', opportunityId)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  async getAvailableInvoices(
    organizationId: string | null,
    excludeOpportunityId?: string
  ): Promise<Invoice[]> {
    requireOrganizationId(organizationId, 'getAvailableInvoices');

    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('issue_date', { ascending: false });

      if (excludeOpportunityId) {
        query = query.or(`opportunity_id.is.null,opportunity_id.neq.${excludeOpportunityId}`);
      } else {
        query = query.is('opportunity_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available invoices:', error);
      throw error;
    }
  },

  async linkInvoiceToOpportunity(
    invoiceId: string,
    opportunityId: string,
    organizationId: string | null
  ): Promise<void> {
    requireOrganizationId(organizationId, 'linkInvoiceToOpportunity');

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ opportunity_id: opportunityId })
        .eq('id', invoiceId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error linking invoice to opportunity:', error);
      throw error;
    }
  },

  async unlinkInvoiceFromOpportunity(
    invoiceId: string,
    organizationId: string | null
  ): Promise<void> {
    requireOrganizationId(organizationId, 'unlinkInvoiceFromOpportunity');

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ opportunity_id: null })
        .eq('id', invoiceId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error unlinking invoice from opportunity:', error);
      throw error;
    }
  },

  async getTotalInvoiceAmount(
    opportunityId: string,
    organizationId: string | null
  ): Promise<number> {
    requireOrganizationId(organizationId, 'getTotalInvoiceAmount');

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('amount')
        .eq('organization_id', organizationId)
        .eq('opportunity_id', opportunityId);

      if (error) throw error;

      return (data || []).reduce((sum, invoice) => sum + invoice.amount, 0);
    } catch (error) {
      console.error('Error calculating total invoice amount:', error);
      return 0;
    }
  },
};
