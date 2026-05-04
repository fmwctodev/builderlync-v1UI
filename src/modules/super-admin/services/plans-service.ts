import { billingApi } from './billing-api';
import { Plan } from '../types/billing';

export async function getPlans(): Promise<Plan[]> {
  try {
    return await billingApi.getPlans();
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

export async function createPlan(planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    const data = await billingApi.createPlan(planData);
    return data.id;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function updatePlan(planId: string, updates: Partial<Plan>): Promise<void> {
  try {
    await billingApi.updatePlan(planId, updates);
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

export async function togglePlanActive(planId: string, isActive: boolean): Promise<void> {
  try {
    await billingApi.togglePlanActive(planId, isActive);
  } catch (error) {
    console.error('Error toggling plan:', error);
    throw error;
  }
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateSavings(monthly: number, annual: number): number {
  const annualEquivalent = monthly * 12;
  return Math.round(((annualEquivalent - annual) / annualEquivalent) * 100);
}
