import { supabase } from './supabase-client';
import { Plan } from '../types/billing';

export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plan_definitions')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    throw new Error(`Failed to fetch plans: ${error.message}`);
  }

  return (data || []) as Plan[];
}

export async function getPlanById(planId: string): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plan_definitions')
    .select('*')
    .eq('id', planId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching plan:', error);
    throw new Error(`Failed to fetch plan: ${error.message}`);
  }

  return data as Plan;
}

export async function createPlan(planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  const { data, error } = await supabase
    .from('plan_definitions')
    .insert(planData)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating plan:', error);
    throw new Error(`Failed to create plan: ${error.message}`);
  }

  return data.id;
}

export async function updatePlan(planId: string, updates: Partial<Plan>): Promise<void> {
  const { error } = await supabase
    .from('plan_definitions')
    .update(updates)
    .eq('id', planId);

  if (error) {
    console.error('Error updating plan:', error);
    throw new Error(`Failed to update plan: ${error.message}`);
  }
}

export async function togglePlanActive(planId: string, isActive: boolean): Promise<void> {
  await updatePlan(planId, { active: isActive });
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('plan_definitions')
    .delete()
    .eq('id', planId);

  if (error) {
    console.error('Error deleting plan:', error);
    throw new Error(`Failed to delete plan: ${error.message}`);
  }
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateSavings(monthly: number, annual: number): number {
  const annualEquivalent = monthly * 12;
  return Math.round(((annualEquivalent - annual) / annualEquivalent) * 100);
}
