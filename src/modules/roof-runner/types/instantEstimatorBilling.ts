export type PlanTierForBilling = 'standard' | 'pro' | 'enterprise';

export type EstimateChargeStatus =
  | 'idle'
  | 'checking'
  | 'charging'
  | 'charged'
  | 'error';

export interface EstimateChargeError {
  message: string;
  code?: string;
}

export interface InstantEstimateChargeRecord {
  id: string;
  organization_id: string;
  property_id: string;
  address_text: string;
  credits_charged: number;
  transaction_id: string | null;
  plan_tier_at_charge: PlanTierForBilling;
  charged_at: string;
  expires_at: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChargeCheckResult {
  charge_id: string;
  credits_charged: number;
  plan_tier_at_charge: string;
  charged_at: string;
  expires_at: string;
  is_valid: boolean;
}

export interface GetChargeStatusResponse {
  charged: boolean;
  chargeRecord?: InstantEstimateChargeRecord;
  expiresAt?: string;
  isExpired?: boolean;
}

export interface ChargeInstantEstimateRequest {
  organizationId: string;
  propertyId: string;
  addressText: string;
  planTier: PlanTierForBilling;
  userId?: string;
}

export interface ChargeInstantEstimateResponse {
  success: boolean;
  chargeId?: string;
  newBalance?: number;
  alreadyCharged: boolean;
  expiresAt?: string;
  error?: EstimateChargeError;
}

export interface RecordChargeResult {
  charge_id: string;
  expires_at: string;
  already_charged: boolean;
}

export function normalizePlanTier(tier: string | null | undefined): PlanTierForBilling {
  if (!tier) return 'standard';
  const normalized = tier.toLowerCase();
  if (normalized === 'pro') return 'pro';
  if (normalized === 'enterprise') return 'enterprise';
  return 'standard';
}

export function isInstantEstimateFreeForTier(tier: PlanTierForBilling): boolean {
  return tier === 'pro' || tier === 'enterprise';
}

export function getInstantEstimateCreditCost(tier: PlanTierForBilling): number {
  return isInstantEstimateFreeForTier(tier) ? 0 : 1;
}

export function isChargeExpired(expiresAt: string | Date): boolean {
  const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expirationDate <= new Date();
}

export function getChargeExpirationDays(expiresAt: string | Date): number {
  const expirationDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const diffMs = expirationDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isChargeExpiringSoon(expiresAt: string | Date, thresholdDays: number = 7): boolean {
  const daysRemaining = getChargeExpirationDays(expiresAt);
  return daysRemaining > 0 && daysRemaining <= thresholdDays;
}
