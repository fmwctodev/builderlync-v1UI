import { supabase } from '../../../shared/lib/supabase';
import { deductCredits, getOrganizationCredits } from './creditsApi';
import type {
  PlanTierForBilling,
  GetChargeStatusResponse,
  ChargeInstantEstimateRequest,
  ChargeInstantEstimateResponse,
  InstantEstimateChargeRecord,
  ChargeCheckResult,
  RecordChargeResult,
} from '../types/instantEstimatorBilling';
import { isInstantEstimateFreeForTier, getInstantEstimateCreditCost } from '../types/instantEstimatorBilling';

export async function getChargeStatus(
  organizationId: string,
  propertyId: string
): Promise<GetChargeStatusResponse> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase.rpc('check_instant_estimate_charge', {
    p_organization_id: organizationId,
    p_property_id: propertyId,
  });

  if (error) {
    throw new Error(`Failed to check charge status: ${error.message}`);
  }

  const results = data as ChargeCheckResult[] | null;

  if (!results || results.length === 0) {
    return { charged: false };
  }

  const chargeResult = results[0];

  if (!chargeResult.is_valid) {
    return {
      charged: false,
      isExpired: true,
    };
  }

  const { data: fullRecord, error: fetchError } = await supabase
    .from('instant_estimate_charges')
    .select('*')
    .eq('id', chargeResult.charge_id)
    .maybeSingle();

  if (fetchError || !fullRecord) {
    return {
      charged: true,
      expiresAt: chargeResult.expires_at,
    };
  }

  return {
    charged: true,
    chargeRecord: fullRecord as InstantEstimateChargeRecord,
    expiresAt: chargeResult.expires_at,
  };
}

export async function chargeInstantEstimate(
  request: ChargeInstantEstimateRequest
): Promise<ChargeInstantEstimateResponse> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { organizationId, propertyId, addressText, planTier, userId } = request;
  const isFree = isInstantEstimateFreeForTier(planTier);
  const creditCost = getInstantEstimateCreditCost(planTier);

  const existingCharge = await getChargeStatus(organizationId, propertyId);
  if (existingCharge.charged && existingCharge.chargeRecord) {
    return {
      success: true,
      chargeId: existingCharge.chargeRecord.id,
      alreadyCharged: true,
      expiresAt: existingCharge.expiresAt,
    };
  }

  let transactionId: string | null = null;
  let newBalance: number | undefined;

  if (!isFree && creditCost > 0) {
    const balance = await getOrganizationCredits(organizationId);
    if (balance.balance < creditCost) {
      return {
        success: false,
        alreadyCharged: false,
        error: {
          message: 'Insufficient credits',
          code: 'INSUFFICIENT_CREDITS',
        },
      };
    }

    const deductResult = await deductCredits({
      organizationId,
      amount: creditCost,
      description: `Instant Estimate - ${addressText}`,
      referenceType: 'instant_estimate',
      referenceId: propertyId,
    });

    if (!deductResult.success) {
      return {
        success: false,
        alreadyCharged: false,
        error: {
          message: deductResult.error || 'Failed to deduct credits',
          code: 'DEDUCT_FAILED',
        },
      };
    }

    transactionId = deductResult.transactionId || null;
    newBalance = deductResult.newBalance;
  }

  const { data, error } = await supabase.rpc('record_instant_estimate_charge', {
    p_organization_id: organizationId,
    p_property_id: propertyId,
    p_address_text: addressText,
    p_credits_charged: creditCost,
    p_transaction_id: transactionId,
    p_plan_tier: planTier,
    p_user_id: userId || null,
  });

  if (error) {
    return {
      success: false,
      alreadyCharged: false,
      newBalance,
      error: {
        message: `Failed to record charge: ${error.message}`,
        code: 'RECORD_FAILED',
      },
    };
  }

  const results = data as RecordChargeResult[] | null;

  if (!results || results.length === 0) {
    return {
      success: false,
      alreadyCharged: false,
      newBalance,
      error: {
        message: 'No result returned from charge recording',
        code: 'NO_RESULT',
      },
    };
  }

  const result = results[0];

  if (newBalance === undefined && !isFree) {
    const updatedBalance = await getOrganizationCredits(organizationId);
    newBalance = updatedBalance.balance;
  }

  return {
    success: true,
    chargeId: result.charge_id,
    newBalance: isFree ? undefined : newBalance,
    alreadyCharged: result.already_charged,
    expiresAt: result.expires_at,
  };
}

export async function getOrganizationInstantEstimateCharges(
  organizationId: string,
  options: {
    includeExpired?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<InstantEstimateChargeRecord[]> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { includeExpired = false, limit = 50, offset = 0 } = options;

  let query = supabase
    .from('instant_estimate_charges')
    .select('*')
    .eq('organization_id', organizationId)
    .order('charged_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (!includeExpired) {
    query = query.gt('expires_at', new Date().toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch instant estimate charges: ${error.message}`);
  }

  return (data || []) as InstantEstimateChargeRecord[];
}

export async function getChargeByPropertyId(
  organizationId: string,
  propertyId: string
): Promise<InstantEstimateChargeRecord | null> {
  if (!supabase) {
    throw new Error('Database connection not available');
  }

  const { data, error } = await supabase
    .from('instant_estimate_charges')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('property_id', propertyId)
    .gt('expires_at', new Date().toISOString())
    .order('charged_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch charge record: ${error.message}`);
  }

  return data as InstantEstimateChargeRecord | null;
}

export async function canGenerateInstantEstimate(
  organizationId: string,
  propertyId: string,
  planTier: PlanTierForBilling
): Promise<{
  canGenerate: boolean;
  reason?: string;
  hasExistingCharge: boolean;
  creditBalance?: number;
}> {
  const existingCharge = await getChargeStatus(organizationId, propertyId);

  if (existingCharge.charged) {
    return {
      canGenerate: true,
      hasExistingCharge: true,
    };
  }

  if (isInstantEstimateFreeForTier(planTier)) {
    return {
      canGenerate: true,
      hasExistingCharge: false,
    };
  }

  const creditCost = getInstantEstimateCreditCost(planTier);
  const balance = await getOrganizationCredits(organizationId);

  if (balance.balance < creditCost) {
    return {
      canGenerate: false,
      reason: 'Insufficient credits',
      hasExistingCharge: false,
      creditBalance: balance.balance,
    };
  }

  return {
    canGenerate: true,
    hasExistingCharge: false,
    creditBalance: balance.balance,
  };
}
