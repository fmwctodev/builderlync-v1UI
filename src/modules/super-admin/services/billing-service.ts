import { supabase, handleSupabaseError } from './supabase-client';
import { PlanDefinition, BillingSnapshot } from '../types';

export const getPlans = async (): Promise<PlanDefinition[]> => {
  try {
    const { data, error } = await supabase
      .from('plan_definitions')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;

    return (data || []).map(plan => ({
      id: plan.id,
      name: plan.name,
      priceMonthly: parseFloat(plan.price_monthly),
      priceAnnual: parseFloat(plan.price_annual),
      description: plan.description,
      includedModules: plan.included_modules || [],
      limits: plan.limits,
      displayOrder: plan.display_order,
      active: plan.active,
    }));
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getBillingSnapshots = async (): Promise<BillingSnapshot[]> => {
  try {
    const { data, error } = await supabase
      .from('billing_snapshots')
      .select('*');

    if (error) throw error;

    return (data || []).map(snapshot => ({
      id: snapshot.id,
      accountId: snapshot.account_id,
      plan: snapshot.plan,
      priceMonthly: parseFloat(snapshot.price_monthly),
      billingCycle: snapshot.billing_cycle,
      lastInvoiceDate: snapshot.last_invoice_date,
      lastInvoiceAmount: snapshot.last_invoice_amount ? parseFloat(snapshot.last_invoice_amount) : undefined,
      nextBillingDate: snapshot.next_billing_date,
      isPastDue: snapshot.is_past_due,
      outstandingAmount: parseFloat(snapshot.outstanding_amount),
    }));
  } catch (error) {
    console.error('Error fetching billing snapshots:', error);
    throw new Error(handleSupabaseError(error));
  }
};

export const getRevenueMetrics = async () => {
  try {
    const { data, error } = await supabase
      .from('enterprise_accounts')
      .select('mrr, arr, status')
      .in('status', ['active', 'past_due']);

    if (error) throw error;

    const totalMRR = (data || []).reduce((sum, account) => sum + parseFloat(account.mrr), 0);
    const totalARR = (data || []).reduce((sum, account) => sum + parseFloat(account.arr), 0);
    const activeCount = (data || []).filter(a => a.status === 'active').length;

    return {
      totalMRR,
      totalARR,
      activeAccounts: activeCount,
      averageMRR: data && data.length > 0 ? totalMRR / data.length : 0,
    };
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    throw new Error(handleSupabaseError(error));
  }
};
