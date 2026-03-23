import { supabase, handleSupabaseError } from './supabase-client';

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

export interface ChurnData {
  month: string;
  churnedCount: number;
  totalActive: number;
  rate: number;
}

export async function calculateMRR(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select('plan_name, billing_cycle')
      .in('status', ['active', 'trialing']);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const { data: plans } = await supabase
      .from('plan_definitions')
      .select('name, price_monthly, price_annual');

    if (!plans) return 0;

    const planPriceMap = new Map(
      plans.map(p => [p.name, { monthly: parseFloat(p.price_monthly), annual: parseFloat(p.price_annual) }])
    );

    let totalMRR = 0;
    data.forEach(sub => {
      const prices = planPriceMap.get(sub.plan_name);
      if (prices) {
        if (sub.billing_cycle === 'monthly') {
          totalMRR += prices.monthly;
        } else if (sub.billing_cycle === 'annual') {
          totalMRR += prices.annual / 12;
        }
      }
    });

    return Math.round(totalMRR * 100) / 100;
  } catch (error) {
    console.error('Error calculating MRR:', error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function calculateARR(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select('plan_name, billing_cycle')
      .in('status', ['active', 'trialing']);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const { data: plans } = await supabase
      .from('plan_definitions')
      .select('name, price_monthly, price_annual');

    if (!plans) return 0;

    const planPriceMap = new Map(
      plans.map(p => [p.name, { monthly: parseFloat(p.price_monthly), annual: parseFloat(p.price_annual) }])
    );

    let totalARR = 0;
    data.forEach(sub => {
      const prices = planPriceMap.get(sub.plan_name);
      if (prices) {
        if (sub.billing_cycle === 'monthly') {
          totalARR += prices.monthly * 12;
        } else if (sub.billing_cycle === 'annual') {
          totalARR += prices.annual;
        }
      }
    });

    return Math.round(totalARR * 100) / 100;
  } catch (error) {
    console.error('Error calculating ARR:', error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function calculateChurnRate(): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activeAtStart, error: error1 } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .eq('status', 'active')
      .lte('created_at', thirtyDaysAgo.toISOString());

    const { data: churned, error: error2 } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .in('status', ['canceled', 'ended_at'])
      .gte('canceled_at', thirtyDaysAgo.toISOString());

    if (error1 || error2) throw error1 || error2;

    const activeCount = activeAtStart?.length || 0;
    const churnedCount = churned?.length || 0;

    if (activeCount === 0) return 0;

    return Math.round((churnedCount / activeCount) * 1000) / 10;
  } catch (error) {
    console.error('Error calculating churn rate:', error);
    return 0;
  }
}

export async function calculateARPA(): Promise<number> {
  try {
    const mrr = await calculateMRR();

    const { data, error } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .in('status', ['active', 'trialing']);

    if (error) throw error;

    const activeCount = data?.length || 0;
    if (activeCount === 0) return 0;

    return Math.round((mrr / activeCount) * 100) / 100;
  } catch (error) {
    console.error('Error calculating ARPA:', error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function calculateMRRGrowth(): Promise<number> {
  try {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: lastMonthSubs, error: error1 } = await supabase
      .from('stripe_subscriptions')
      .select('plan_name, billing_cycle')
      .in('status', ['active', 'trialing'])
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());

    const { data: thisMonthSubs, error: error2 } = await supabase
      .from('stripe_subscriptions')
      .select('plan_name, billing_cycle')
      .in('status', ['active', 'trialing'])
      .gte('created_at', thisMonthStart.toISOString());

    if (error1 || error2) throw error1 || error2;

    const { data: plans } = await supabase
      .from('plan_definitions')
      .select('name, price_monthly, price_annual');

    if (!plans) return 0;

    const planPriceMap = new Map(
      plans.map(p => [p.name, { monthly: parseFloat(p.price_monthly), annual: parseFloat(p.price_annual) }])
    );

    const calculateMRRFromSubs = (subs: any[]) => {
      let mrr = 0;
      subs?.forEach(sub => {
        const prices = planPriceMap.get(sub.plan_name);
        if (prices) {
          if (sub.billing_cycle === 'monthly') {
            mrr += prices.monthly;
          } else if (sub.billing_cycle === 'annual') {
            mrr += prices.annual / 12;
          }
        }
      });
      return mrr;
    };

    const lastMonthMRR = calculateMRRFromSubs(lastMonthSubs || []);
    const thisMonthMRR = calculateMRRFromSubs(thisMonthSubs || []);

    if (lastMonthMRR === 0) return 0;

    const growth = ((thisMonthMRR - lastMonthMRR) / lastMonthMRR) * 100;
    return Math.round(growth * 10) / 10;
  } catch (error) {
    console.error('Error calculating MRR growth:', error);
    return 0;
  }
}

export async function getPlanBreakdown(): Promise<PlanBreakdown[]> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('stripe_subscriptions')
      .select('plan_name, billing_cycle')
      .in('status', ['active', 'trialing']);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) return [];

    const { data: plans } = await supabase
      .from('plan_definitions')
      .select('name, price_monthly, price_annual');

    if (!plans) return [];

    const planPriceMap = new Map(
      plans.map(p => [p.name, { monthly: parseFloat(p.price_monthly), annual: parseFloat(p.price_annual) }])
    );

    const planStats = new Map<string, { count: number; mrr: number }>();

    subscriptions.forEach(sub => {
      const prices = planPriceMap.get(sub.plan_name);
      if (prices) {
        const current = planStats.get(sub.plan_name) || { count: 0, mrr: 0 };
        let mrr = 0;

        if (sub.billing_cycle === 'monthly') {
          mrr = prices.monthly;
        } else if (sub.billing_cycle === 'annual') {
          mrr = prices.annual / 12;
        }

        planStats.set(sub.plan_name, {
          count: current.count + 1,
          mrr: current.mrr + mrr
        });
      }
    });

    const totalMRR = Array.from(planStats.values()).reduce((sum, stat) => sum + stat.mrr, 0);

    const breakdown: PlanBreakdown[] = Array.from(planStats.entries()).map(([planName, stats]) => ({
      planName,
      subscriptionCount: stats.count,
      mrr: Math.round(stats.mrr * 100) / 100,
      percentage: totalMRR > 0 ? Math.round((stats.mrr / totalMRR) * 100) : 0
    }));

    return breakdown.sort((a, b) => b.mrr - a.mrr);
  } catch (error) {
    console.error('Error getting plan breakdown:', error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  try {
    const [mrr, arr, mrrGrowth, churnRate, arpa] = await Promise.all([
      calculateMRR(),
      calculateARR(),
      calculateMRRGrowth(),
      calculateChurnRate(),
      calculateARPA()
    ]);

    const { data: activeSubs, error } = await supabase
      .from('stripe_subscriptions')
      .select('id')
      .in('status', ['active', 'trialing']);

    if (error) throw error;

    const activeSubscriptions = activeSubs?.length || 0;
    const lifetimeValue = churnRate > 0 ? Math.round((arpa / (churnRate / 100)) * 100) / 100 : 0;

    return {
      totalMRR: mrr,
      totalARR: arr,
      mrrGrowth,
      activeSubscriptions,
      churnRate,
      arpa,
      lifetimeValue
    };
  } catch (error) {
    console.error('Error getting revenue metrics:', error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function getChurnHistory(months: number = 6): Promise<ChurnData[]> {
  try {
    const history: ChurnData[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const { data: active, error: error1 } = await supabase
        .from('stripe_subscriptions')
        .select('id')
        .eq('status', 'active')
        .lte('created_at', monthStart.toISOString());

      const { data: churned, error: error2 } = await supabase
        .from('stripe_subscriptions')
        .select('id')
        .in('status', ['canceled'])
        .gte('canceled_at', monthStart.toISOString())
        .lte('canceled_at', monthEnd.toISOString());

      if (error1 || error2) throw error1 || error2;

      const activeCount = active?.length || 0;
      const churnedCount = churned?.length || 0;
      const rate = activeCount > 0 ? Math.round((churnedCount / activeCount) * 1000) / 10 : 0;

      history.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        churnedCount,
        totalActive: activeCount,
        rate
      });
    }

    return history;
  } catch (error) {
    console.error('Error getting churn history:', error);
    return [];
  }
}
