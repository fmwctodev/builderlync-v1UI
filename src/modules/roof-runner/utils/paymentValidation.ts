import type { PaymentInfoInput, PaymentValidationResult } from '../types/readiness';

export function validatePaymentInfo(paymentInfo: PaymentInfoInput | null | undefined): PaymentValidationResult {
  const errors: Record<string, string> = {};
  const missingFields: string[] = [];

  if (!paymentInfo) {
    return {
      isValid: false,
      errors: { general: 'Payment information is required' },
      missingFields: ['firstName', 'lastName', 'cardNumber', 'expiryMonth', 'expiryYear', 'cvv'],
    };
  }

  if (!paymentInfo.firstName?.trim()) {
    errors.firstName = 'First name is required';
    missingFields.push('firstName');
  }

  if (!paymentInfo.lastName?.trim()) {
    errors.lastName = 'Last name is required';
    missingFields.push('lastName');
  }

  const cardNumber = paymentInfo.cardNumber?.replace(/\s/g, '') || '';
  if (!cardNumber) {
    errors.cardNumber = 'Card number is required';
    missingFields.push('cardNumber');
  } else if (!/^\d{13,19}$/.test(cardNumber)) {
    errors.cardNumber = 'Invalid card number';
  }

  if (!paymentInfo.expiryMonth) {
    errors.expiryMonth = 'Expiry month is required';
    missingFields.push('expiryMonth');
  }

  if (!paymentInfo.expiryYear) {
    errors.expiryYear = 'Expiry year is required';
    missingFields.push('expiryYear');
  }

  if (paymentInfo.expiryMonth && paymentInfo.expiryYear) {
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    const expYear = parseInt(paymentInfo.expiryYear, 10);
    const expMonth = parseInt(paymentInfo.expiryMonth, 10);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      errors.expiryDate = 'Card has expired';
    }
  }

  const cvv = paymentInfo.cvv?.trim() || '';
  if (!cvv) {
    errors.cvv = 'CVV is required';
    missingFields.push('cvv');
  } else if (!/^\d{3,4}$/.test(cvv)) {
    errors.cvv = 'CVV must be 3 or 4 digits';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingFields,
  };
}

export function isPaymentInfoComplete(paymentInfo: PaymentInfoInput | null | undefined): boolean {
  if (!paymentInfo) return false;

  return Boolean(
    paymentInfo.firstName?.trim() &&
    paymentInfo.lastName?.trim() &&
    paymentInfo.cardNumber?.replace(/\s/g, '').length >= 13 &&
    paymentInfo.expiryMonth &&
    paymentInfo.expiryYear &&
    paymentInfo.cvv?.trim().length >= 3
  );
}

export function getPaymentCompletionPercentage(paymentInfo: PaymentInfoInput | null | undefined): number {
  if (!paymentInfo) return 0;

  const fields = [
    !!paymentInfo.firstName?.trim(),
    !!paymentInfo.lastName?.trim(),
    (paymentInfo.cardNumber?.replace(/\s/g, '').length ?? 0) >= 13,
    !!paymentInfo.expiryMonth,
    !!paymentInfo.expiryYear,
    (paymentInfo.cvv?.trim().length ?? 0) >= 3,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

export function formatCardNumberDisplay(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(' ');
}
