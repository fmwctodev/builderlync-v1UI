export type AccountMode = 'credits' | 'eagleview';

export interface EagleViewAuthState {
  token: string;
  accountId?: string;
  accountName?: string;
  authenticatedAt: string;
  expiresAt?: string;
}

export interface CreditBalance {
  organizationId: string;
  balance: number;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  organizationId: string;
  amount: number;
  transactionType: 'credit' | 'debit';
  description: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface PropertyDataState {
  selectedPropertyId: string | null;
  selectedAddressText: string | null;
  propertyData: import('./propertyData').PropertyData | null;
  propertyDataStatus: import('./propertyData').PropertyDataStatus;
  propertyDataError: import('./propertyData').PropertyDataError | null;
}

export interface MeasurementOrderContextState {
  accountMode: AccountMode | null;
  eagleViewAuth: EagleViewAuthState | null;
  creditBalance: CreditBalance | null;
  isLoadingCredits: boolean;
  isAuthenticating: boolean;
  error: string | null;
  selectedProducts: ProductId[];
  selectedAddOns: AddOnId[];
  productSelectionWarnings: string[];
  creditBreakdown: CreditBreakdownResult;
  creditEligibility: CreditEligibility;
  isUpgradeFlow: boolean;
  upgradeFromOrderId: string | null;
  upgradeFromProductId: UpgradeEligibleProductId | null;
  upgradeContext: UpgradeContext | null;
  selectedPropertyId: string | null;
  selectedAddressText: string | null;
  propertyData: import('./propertyData').PropertyData | null;
  propertyDataStatus: import('./propertyData').PropertyDataStatus;
  propertyDataError: import('./propertyData').PropertyDataError | null;
  promoCode: string | null;
  promoStatus: import('./promoCode').PromoCodeStatus;
  promoResult: import('./promoCode').PromoCodeResult | null;
  promoError: string | null;
  adjustedCreditTotal: number;
}

export interface MeasurementOrderContextActions {
  setAccountMode: (mode: AccountMode) => void;
  clearAccountMode: () => void;
  setEagleViewAuth: (auth: EagleViewAuthState) => void;
  clearEagleViewAuth: () => void;
  refreshCreditBalance: () => Promise<void>;
  clearError: () => void;
  selectProduct: (productId: ProductId) => { autoDeselected: ProductId[] };
  deselectProduct: (productId: ProductId) => { autoDeselectedAddOns: AddOnId[] };
  toggleAddOn: (addOnId: AddOnId) => void;
  clearProductSelection: () => void;
  getOrderPayload: () => OrderPayload | UpgradeOrderPayload | null;
  enterUpgradeMode: (order: MeasurementOrder, source: UpgradeSource) => void;
  exitUpgradeMode: () => void;
  setSelectedAddress: (propertyId: string, addressText: string) => void;
  clearSelectedAddress: () => void;
  refreshPropertyData: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  clearPromoCode: () => void;
}

export type MeasurementOrderContextValue = MeasurementOrderContextState & MeasurementOrderContextActions;

export interface EagleViewAuthResponse {
  success: boolean;
  token?: string;
  accountId?: string;
  accountName?: string;
  expiresAt?: string;
  error?: string;
  errorCode?: string;
}

export interface EagleViewAuthRequest {
  username: string;
  password: string;
}

export interface DeductCreditsRequest {
  organizationId: string;
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

export interface DeductCreditsResponse {
  success: boolean;
  newBalance?: number;
  transactionId?: string;
  error?: string;
}

export interface AddCreditsRequest {
  organizationId: string;
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

export interface AddCreditsResponse {
  success: boolean;
  newBalance?: number;
  transactionId?: string;
  error?: string;
}

export type ProductId =
  | 'property_roof_area_estimate'
  | 'measure_bidperfect'
  | 'measure_full_house'
  | 'measure_premium'
  | 'measure_gutter'
  | 'solar_inform_essentials_plus'
  | 'solar_inform_advanced'
  | 'solar_truedesign_sales'
  | 'solar_truedesign_planning';

export type AddOnId = 'addon_orthogonal_imagery';

export interface ProductSelectionState {
  selectedProducts: ProductId[];
  selectedAddOns: AddOnId[];
  productSelectionWarnings: string[];
}

export interface ProductSelectionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface OrderPayload {
  accountMode: AccountMode;
  selectedProducts: ProductId[];
  selectedAddOns: AddOnId[];
  addressId?: string;
  propertyId?: string;
  propertyType?: string;
}

export interface CreditBreakdownItem {
  id: string;
  name: string;
  type: 'product' | 'addon';
  credits: number | null;
}

export interface CreditBreakdownResult {
  items: CreditBreakdownItem[];
  totalCredits: number;
  missingMappings: string[];
}

export interface CreditEligibility {
  sufficient: boolean;
  shortage: number;
  hasLoadError: boolean;
  hasMissingMappings: boolean;
}

export type UpgradeSource = 'order_history' | 'order_detail' | 'proposal' | 'instant_estimator';

export type UpgradeEligibleProductId = 'measure_bidperfect';
export type UpgradeTargetProductId = 'measure_premium';

export type UpgradeEligibleStatus = 'completed' | 'delivered';

export interface UpgradeContext {
  addressId: string;
  propertyId: string;
  addressText: string;
  customerId?: string;
  jobId?: string;
  source: UpgradeSource;
}

export interface UpgradeState {
  isUpgradeFlow: boolean;
  upgradeFromOrderId: string | null;
  upgradeFromProductId: UpgradeEligibleProductId | null;
  lockedUpgradeProductId: UpgradeTargetProductId;
  upgradeContext: UpgradeContext | null;
}

export interface UpgradeOrderMetadata {
  type: 'UPGRADE';
  upgradeFromOrderId: string;
  upgradeFromProductId: UpgradeEligibleProductId;
  lockedUpgradeProductId: UpgradeTargetProductId;
}

export interface UpgradeOrderPayload extends OrderPayload {
  metadata: UpgradeOrderMetadata;
}

export type OrderedVia = 'credits' | 'eagleview';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'delivered' | 'cancelled' | 'failed';

export interface OrderOutputs {
  pdfUrl: string | null;
  jsonUrl: string | null;
  jsonBody: Record<string, unknown> | null;
  xmlUrl: string | null;
  xmlBody: string | null;
  totalArea?: number;
  roof_area?: number;
  perimeter?: number;
  primaryPitch?: string;
  primary_pitch?: string;
  facets?: number;
  facet_count?: number;
}

export interface OrderMetadata {
  isUpgradeOrder: boolean;
  upgradeFromOrderId: string | null;
}

export interface MeasurementOrder {
  id: string;
  orderNumber: string;
  productId: ProductId;
  productName: string;
  address: string;
  addressId?: string;
  propertyId?: string;
  datePlaced: string;
  dateCompleted?: string | null;
  delivery: string;
  cost: number;
  status: OrderStatus;
  orderedVia: OrderedVia;
  outputs: OrderOutputs;
  metadata: OrderMetadata;
  customerId?: string;
  jobId?: string;
  propertyType?: string;
}

export interface MeasurementOrderDbRow {
  id: string;
  organization_id: string;
  job_id: string | null;
  property_address: string;
  order_type: string | null;
  property_type: string | null;
  is_complex: boolean;
  complexity_notes: string | null;
  products_ordered: unknown[] | null;
  total_cost: number;
  payment_status: string;
  order_status: string;
  eagleview_order_id: string | null;
  eagleview_report_url: string | null;
  report_data: Record<string, unknown> | null;
  hover_order_id: string | null;
  hover_report_url: string | null;
  ordered_via: string | null;
  pdf_url: string | null;
  json_url: string | null;
  json_body: Record<string, unknown> | null;
  xml_url: string | null;
  xml_body: string | null;
  is_upgrade_order: boolean;
  upgrade_from_order_id: string | null;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface OrderFilters {
  status?: OrderStatus | 'all';
  product?: ProductId | 'all';
  search?: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  productId: ProductId;
  productName: string;
  address: string;
  datePlaced: string;
  status: OrderStatus;
  orderedVia: OrderedVia;
  hasPdfOutput: boolean;
  isUpgradeEligible: boolean;
}

export const UPGRADE_ELIGIBLE_PRODUCTS: UpgradeEligibleProductId[] = ['measure_bidperfect'];
export const UPGRADE_ELIGIBLE_STATUSES: OrderStatus[] = ['completed', 'delivered'];
export const UPGRADE_TARGET_PRODUCT: UpgradeTargetProductId = 'measure_premium';

export const PRODUCT_DISPLAY_NAMES: Record<ProductId, string> = {
  property_roof_area_estimate: 'Property Data',
  measure_bidperfect: 'BidPerfect',
  measure_full_house: 'Full House',
  measure_premium: 'Premium',
  solar_solar_report: 'Solar Report',
};

export const ORDER_STATUS_DISPLAY: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
};
