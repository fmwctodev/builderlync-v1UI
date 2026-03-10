import { billingApi } from './billing-api';

export interface RevenueMetrics {
  totalMRR: number;
  totalARR: number;
  mrrGrowth: number;
  activeSubscriptions: number;
  churnRate: number;
  arpa: number;
  lifetimeValue: number;
}

export interface PlanBreakdown {
  planName: string;
  subscriptionCount: number;
  mrr: number;
  percentage: number;
}

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  try {
    const data = await billingApi.getMetrics();
    return {
      totalMRR: data.mrr,
      totalARR: data.arr,
      mrrGrowth: 0, // Backend could provide this if needed
      activeSubscriptions: data.totalCustomers,
      churnRate: data.churnRate,
      arpa: data.arpa,
      lifetimeValue: data.churnRate > 0 ? (data.arpa / (data.churnRate / 100)) : 0
    };
  } catch (error) {
    console.error('Error getting revenue metrics:', error);
    throw error;
  }
}

export async function getPlanBreakdown(): Promise<PlanBreakdown[]> {
  try {
    const data = await billingApi.getMetrics();
    return data.planRevenueBreakdown.map((item: any) => ({
      planName: item.name,
      subscriptionCount: 0, // Backend could provide this
      mrr: item.revenue,
      percentage: data.mrr > 0 ? Math.round((item.revenue / data.mrr) * 100) : 0
    }));
  } catch (error) {
    console.error('Error getting plan breakdown:', error);
    throw error;
  }
}

// Keep other functions as mocks or implement the backend equivalent
export async function getChurnHistory(months: number = 6): Promise<any[]> {
  return [];
}
