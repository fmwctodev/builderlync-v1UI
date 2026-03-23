import { supabase } from '../../../shared/lib/supabase';
import {
  PromoCodeResult,
  PromoValidationRequest,
  CouponDbRow,
  PROMO_ELIGIBLE_ACCOUNT_MODES,
} from '../types/promoCode';

export async function validatePromoCode(
  request: PromoValidationRequest
): Promise<PromoCodeResult> {
  const { code, totalCredits, accountMode } = request;

  const trimmedCode = code.trim().toUpperCase();

  if (!trimmedCode) {
    return {
      code: trimmedCode,
      couponId: '',
      name: '',
      isValid: false,
      discountType: 'credits',
      discountValue: 0,
      calculatedDiscount: 0,
      errorMessage: 'Please enter a promo code',
    };
  }

  if (accountMode && !PROMO_ELIGIBLE_ACCOUNT_MODES.includes(accountMode)) {
    return {
      code: trimmedCode,
      couponId: '',
      name: '',
      isValid: false,
      discountType: 'credits',
      discountValue: 0,
      calculatedDiscount: 0,
      errorMessage: 'Promo codes are only valid for credit-based orders',
    };
  }

  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', trimmedCode)
      .maybeSingle();

    if (error) {
      console.error('Error fetching coupon:', error);
      return {
        code: trimmedCode,
        couponId: '',
        name: '',
        isValid: false,
        discountType: 'credits',
        discountValue: 0,
        calculatedDiscount: 0,
        errorMessage: 'Unable to validate promo code. Please try again.',
      };
    }

    if (!coupon) {
      return {
        code: trimmedCode,
        couponId: '',
        name: '',
        isValid: false,
        discountType: 'credits',
        discountValue: 0,
        calculatedDiscount: 0,
        errorMessage: 'Invalid promo code',
      };
    }

    const typedCoupon = coupon as CouponDbRow;
    const validationResult = validateCouponRules(typedCoupon);

    if (!validationResult.isValid) {
      return {
        code: trimmedCode,
        couponId: typedCoupon.id,
        name: typedCoupon.name,
        isValid: false,
        discountType: mapDiscountType(typedCoupon.discount_type),
        discountValue: typedCoupon.discount_value,
        calculatedDiscount: 0,
        errorMessage: validationResult.errorMessage,
      };
    }

    const calculatedDiscount = calculateDiscount(
      typedCoupon.discount_type,
      typedCoupon.discount_value,
      totalCredits
    );

    return {
      code: trimmedCode,
      couponId: typedCoupon.id,
      name: typedCoupon.name,
      isValid: true,
      discountType: mapDiscountType(typedCoupon.discount_type),
      discountValue: typedCoupon.discount_value,
      calculatedDiscount,
      errorMessage: null,
    };
  } catch (err) {
    console.error('Promo code validation error:', err);
    return {
      code: trimmedCode,
      couponId: '',
      name: '',
      isValid: false,
      discountType: 'credits',
      discountValue: 0,
      calculatedDiscount: 0,
      errorMessage: 'An error occurred while validating the promo code',
    };
  }
}

function validateCouponRules(coupon: CouponDbRow): { isValid: boolean; errorMessage: string } {
  const now = new Date();
  const startDate = new Date(coupon.start_date);
  const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

  if (coupon.status !== 'active') {
    if (coupon.status === 'scheduled') {
      return { isValid: false, errorMessage: 'This promo code is not yet active' };
    }
    return { isValid: false, errorMessage: 'This promo code is no longer active' };
  }

  if (startDate > now) {
    return { isValid: false, errorMessage: 'This promo code is not yet active' };
  }

  if (endDate && endDate < now) {
    return { isValid: false, errorMessage: 'This promo code has expired' };
  }

  if (coupon.max_redemptions && coupon.redemption_count >= coupon.max_redemptions) {
    return { isValid: false, errorMessage: 'This promo code has reached its usage limit' };
  }

  return { isValid: true, errorMessage: '' };
}

function mapDiscountType(dbType: 'percentage' | 'fixed_amount'): 'percentage' | 'fixed_amount' | 'credits' {
  if (dbType === 'fixed_amount') {
    return 'credits';
  }
  return dbType;
}

function calculateDiscount(
  discountType: 'percentage' | 'fixed_amount',
  discountValue: number,
  totalCredits: number
): number {
  if (discountType === 'percentage') {
    return Math.floor((totalCredits * discountValue) / 100);
  }
  return Math.min(Math.floor(discountValue), totalCredits);
}

export function applyPromoToCredits(
  totalCredits: number,
  promoResult: PromoCodeResult | null
): number {
  if (!promoResult || !promoResult.isValid) {
    return totalCredits;
  }
  return Math.max(0, totalCredits - promoResult.calculatedDiscount);
}

export function formatPromoDiscount(promoResult: PromoCodeResult): string {
  if (promoResult.discountType === 'percentage') {
    return `${promoResult.discountValue}% off`;
  }
  return `${promoResult.calculatedDiscount} credits off`;
}

export async function recordPromoUsage(couponId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_coupon_redemption', {
      coupon_id: couponId,
    });

    if (error) {
      const { error: updateError } = await supabase
        .from('coupons')
        .update({
          redemption_count: supabase.rpc('increment', { x: 1 }),
        })
        .eq('id', couponId);

      if (updateError) {
        console.error('Error incrementing coupon usage:', updateError);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error('Error recording promo usage:', err);
    return false;
  }
}
