export type AffiliateStatus = 'active' | 'paused' | 'inactive';
export type AffiliatePayoutMethod = 'paypal' | 'ach' | 'wire' | 'check' | 'other';

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  referralCode: string;
  commissionRate: number;            // 0..1, e.g. 0.20 = 20%
  commissionWindowMonths: number;    // 0 = lifetime
  payoutMethod: AffiliatePayoutMethod;
  payoutEmail?: string;
  payoutDetails?: Record<string, any>;
  status: AffiliateStatus;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type AffiliateReferralStatus = 'cookie' | 'signed_up' | 'paying' | 'churned';

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  affiliateName?: string;
  affiliateCode?: string;
  referredEmail?: string;
  referredUserId?: string;
  referredAccountId?: string;
  referredAccountName?: string;
  status: AffiliateReferralStatus;
  cookieAt?: string;
  signedUpAt?: string;
  firstPaymentAt?: string;
  churnedAt?: string;
  sourceUrl?: string;
  utm?: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Joined live data from enterprise_accounts (optional)
  accountMrr?: number;
  accountStatus?: string;
}

export type AffiliatePayoutStatus = 'accrued' | 'approved' | 'paid' | 'void';

export interface AffiliatePayoutBreakdownItem {
  referral_id: string;
  account_id?: string;
  account_name?: string;
  mrr: number;
  rate: number;
  amount: number;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  affiliateName?: string;
  periodStart: string;       // YYYY-MM-DD
  periodEnd: string;         // YYYY-MM-DD
  amountDue: number;
  currency: string;
  dueDate: string;           // YYYY-MM-DD
  status: AffiliatePayoutStatus;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  paidBy?: string;
  paymentReference?: string;
  breakdown: AffiliatePayoutBreakdownItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateStats {
  affiliateId: string;
  totalReferrals: number;
  signedUp: number;
  paying: number;
  churned: number;
  lifetimeEarned: number;
  pendingPayout: number;
  paidOut: number;
  monthlyAccrual: number;   // current monthly accrual estimate
}

export interface AffiliateFilters {
  search?: string;
  status?: AffiliateStatus | 'all';
  tags?: string[];
}

export interface CreateAffiliateInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  referralCode?: string;             // auto-generated if absent
  commissionRate?: number;
  commissionWindowMonths?: number;
  payoutMethod?: AffiliatePayoutMethod;
  payoutEmail?: string;
  payoutDetails?: Record<string, any>;
  status?: AffiliateStatus;
  notes?: string;
  tags?: string[];
}

export type UpdateAffiliateInput = Partial<CreateAffiliateInput>;
