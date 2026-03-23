export type PromoCodeStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'error';

export type PromoDiscountType = 'percentage' | 'fixed_amount' | 'credits';

export interface PromoCodeResult {
  code: string;
  couponId: string;
  name: string;
  isValid: boolean;
  discountType: PromoDiscountType;
  discountValue: number;
  calculatedDiscount: number;
  errorMessage: string | null;
}

export interface PromoCodeState {
  promoCode: string | null;
  promoStatus: PromoCodeStatus;
  promoResult: PromoCodeResult | null;
  promoError: string | null;
}

export interface PromoValidationRequest {
  code: string;
  totalCredits: number;
  accountMode: 'credits' | 'eagleview' | null;
}

export interface CouponDbRow {
  id: string;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  status: 'active' | 'scheduled' | 'expired';
  start_date: string;
  end_date: string | null;
  redemption_count: number;
  max_redemptions: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const PROMO_ELIGIBLE_ACCOUNT_MODES: ('credits' | 'eagleview')[] = ['credits'];

export const DEFAULT_PROMO_STATE: PromoCodeState = {
  promoCode: null,
  promoStatus: 'idle',
  promoResult: null,
  promoError: null,
};
