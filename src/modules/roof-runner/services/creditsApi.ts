import { supabase } from '../../../shared/lib/supabase';
import type {
  CreditBalance,
  CreditTransaction,
  DeductCreditsRequest,
  DeductCreditsResponse,
  AddCreditsRequest,
  AddCreditsResponse,
} from '../types/measurementOrder';

export async function getOrganizationCredits(organizationId: string): Promise<CreditBalance> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('organization_credits')
    .select('organization_id, balance, updated_at')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch credit balance: ${error.message}`);
  }

  if (!data) {
    return {
      organizationId,
      balance: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    organizationId: data.organization_id,
    balance: parseFloat(data.balance) || 0,
    updatedAt: data.updated_at,
  };
}

export async function getCreditTransactionHistory(
  organizationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch transaction history: ${error.message}`);
  }

  return (data || []).map((tx) => ({
    id: tx.id,
    organizationId: tx.organization_id,
    amount: parseFloat(tx.amount) || 0,
    transactionType: tx.transaction_type as 'credit' | 'debit',
    description: tx.description,
    referenceType: tx.reference_type,
    referenceId: tx.reference_id,
    createdAt: tx.created_at,
    createdBy: tx.created_by,
  }));
}

export async function deductCredits(request: DeductCreditsRequest): Promise<DeductCreditsResponse> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase.rpc('deduct_credits', {
    org_id: request.organizationId,
    deduct_amount: request.amount,
    deduct_description: request.description,
    ref_type: request.referenceType || null,
    ref_id: request.referenceId || null,
  });

  if (error) {
    return {
      success: false,
      error: `Failed to deduct credits: ${error.message}`,
    };
  }

  const result = data as { success: boolean; new_balance?: number; transaction_id?: string; error?: string };

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Unknown error occurred',
    };
  }

  return {
    success: true,
    newBalance: result.new_balance,
    transactionId: result.transaction_id,
  };
}

export async function addCredits(request: AddCreditsRequest): Promise<AddCreditsResponse> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase.rpc('add_credits', {
    org_id: request.organizationId,
    add_amount: request.amount,
    add_description: request.description,
    ref_type: request.referenceType || null,
    ref_id: request.referenceId || null,
  });

  if (error) {
    return {
      success: false,
      error: `Failed to add credits: ${error.message}`,
    };
  }

  const result = data as { success: boolean; new_balance?: number; transaction_id?: string; error?: string };

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Unknown error occurred',
    };
  }

  return {
    success: true,
    newBalance: result.new_balance,
    transactionId: result.transaction_id,
  };
}

export async function hasEnoughCredits(organizationId: string, requiredAmount: number): Promise<boolean> {
  const balance = await getOrganizationCredits(organizationId);
  return balance.balance >= requiredAmount;
}
