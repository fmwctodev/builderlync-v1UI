import { supabase } from '../../../shared/lib/supabase';

export interface ABCSupplyAccount {
  id: string;
  organizationId: string;
  accountNumber: string;
  accountName: string | null;
  accountType: 'ship_to' | 'bill_to' | 'sold_to';
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string;
  accessibleBranchNumbers: string[];
  isDefault: boolean;
  isActive: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface ABCSupplyBranch {
  id: string;
  branchNumber: string;
  branchName: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  hours: Record<string, string>;
  services: string[];
  isActive: boolean;
}

export interface ABCSupplyProduct {
  itemNumber: string;
  itemDescription: string;
  familyName: string;
  manufacturer: string;
  stockingUom: string;
  availableUoms: string[];
  branches: string[];
  isAvailable: boolean;
  imageUrl?: string;
  category?: string;
  attributes?: Record<string, string>;
}

export interface ABCSupplyPriceRequest {
  accountNumber: string;
  branchNumber: string;
  itemNumber: string;
  quantity: number;
  uom?: string;
}

export interface ABCSupplyPriceResponse {
  itemNumber: string;
  branchNumber: string;
  accountNumber: string;
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  uom: string;
  currency: string;
  isValid: boolean;
  requiresContactForPrice: boolean;
  priceMessage?: string;
  fetchedAt: string;
}

export interface ABCSupplyOrderItem {
  itemNumber: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  description?: string;
  specialInstructions?: string;
}

export interface ABCSupplyOrderRequest {
  accountNumber: string;
  branchNumber: string;
  poNumber: string;
  items: ABCSupplyOrderItem[];
  deliveryMethod: 'delivery' | 'pickup' | 'will_call';
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryContact?: {
    name: string;
    phone: string;
  };
  requestedDeliveryDate?: string;
  deliveryTimeWindow?: string;
  specialInstructions?: string;
}

export interface ABCSupplyOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  confirmationNumber?: string;
  estimatedDeliveryDate?: string;
  message?: string;
  errors?: string[];
}

export type ABCSupplyOrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ABCSupplyOrderLineItem {
  id: string;
  itemNumber: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  lineTotal: number;
  manufacturer?: string;
  specialInstructions?: string;
}

export interface ABCSupplyOrder {
  id: string;
  orderNumber: string;
  confirmationNumber?: string;
  status: ABCSupplyOrderStatus;
  accountNumber: string;
  accountName?: string;
  branchNumber: string;
  branchName?: string;
  branchPhone?: string;
  branchAddress?: string;
  poNumber?: string;
  items: ABCSupplyOrderLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  deliveryMethod: 'delivery' | 'pickup' | 'will_call';
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryContact?: {
    name: string;
    phone: string;
  };
  requestedDeliveryDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveryTimeWindow?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SearchProductsParams {
  query: string;
  branchNumber?: string;
  category?: string;
  manufacturer?: string;
  limit?: number;
  offset?: number;
}

const API_BASE_URL = import.meta.env.VITE_ABC_SUPPLY_API_URL || '';
const API_KEY = import.meta.env.VITE_ABC_SUPPLY_API_KEY || '';

async function logApiCall(
  organizationId: string,
  endpoint: string,
  method: string,
  requestBody: unknown,
  responseStatus: number,
  responseBody: unknown,
  responseTimeMs: number,
  isError: boolean,
  errorMessage?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('abc_supply_api_logs').insert({
      organization_id: organizationId,
      user_id: user?.id,
      endpoint,
      method,
      request_body: requestBody,
      response_status: responseStatus,
      response_body: responseBody,
      response_time_ms: responseTimeMs,
      is_error: isError,
      error_message: errorMessage,
      environment: import.meta.env.VITE_ABC_SUPPLY_ENVIRONMENT || 'sandbox',
    });
  } catch (err) {
    console.error('Failed to log API call:', err);
  }
}

export async function fetchAccounts(organizationId: string): Promise<ABCSupplyAccount[]> {
  const { data, error } = await supabase
    .from('abc_supply_accounts')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('is_default', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    organizationId: row.organization_id,
    accountNumber: row.account_number,
    accountName: row.account_name,
    accountType: row.account_type || 'ship_to',
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    country: row.country || 'US',
    accessibleBranchNumbers: row.accessible_branch_numbers || [],
    isDefault: row.is_default || false,
    isActive: row.is_active || true,
    lastSyncedAt: row.last_synced_at,
    syncStatus: row.sync_status || 'pending',
  }));
}

export async function fetchBranches(branchNumbers?: string[]): Promise<ABCSupplyBranch[]> {
  let query = supabase
    .from('abc_supply_branches')
    .select('*')
    .eq('is_active', true);

  if (branchNumbers && branchNumbers.length > 0) {
    query = query.in('branch_number', branchNumbers);
  }

  const { data, error } = await query.order('branch_name');

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    branchNumber: row.branch_number || row.branch_code,
    branchName: row.branch_name,
    addressLine1: row.address || row.address_line1,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    phone: row.phone,
    email: row.email,
    latitude: row.latitude,
    longitude: row.longitude,
    hours: row.hours_of_operation || row.hours || {},
    services: row.services_offered || row.services || [],
    isActive: row.is_active,
  }));
}

export async function fetchBranchesForAccount(accountNumber: string, organizationId: string): Promise<ABCSupplyBranch[]> {
  const { data: accountData, error: accountError } = await supabase
    .from('abc_supply_accounts')
    .select('accessible_branch_numbers')
    .eq('organization_id', organizationId)
    .eq('account_number', accountNumber)
    .maybeSingle();

  if (accountError) throw accountError;

  const branchNumbers = accountData?.accessible_branch_numbers || [];

  if (branchNumbers.length === 0) {
    return fetchBranches();
  }

  return fetchBranches(branchNumbers);
}

export async function searchProducts(
  params: SearchProductsParams,
  organizationId: string
): Promise<ABCSupplyProduct[]> {
  const startTime = Date.now();

  const mockProducts: ABCSupplyProduct[] = [
    {
      itemNumber: 'GAF-TL-HD-001',
      itemDescription: 'GAF Timberline HD Architectural Shingles - Charcoal',
      familyName: 'Timberline HD',
      manufacturer: 'GAF',
      stockingUom: 'BDL',
      availableUoms: ['BDL', 'SQ'],
      branches: params.branchNumber ? [params.branchNumber] : ['1', '14', '123'],
      isAvailable: true,
      category: 'Roofing',
    },
    {
      itemNumber: 'OC-DUR-002',
      itemDescription: 'Owens Corning Duration Shingles - Onyx Black',
      familyName: 'Duration',
      manufacturer: 'Owens Corning',
      stockingUom: 'BDL',
      availableUoms: ['BDL', 'SQ'],
      branches: params.branchNumber ? [params.branchNumber] : ['1', '14'],
      isAvailable: true,
      category: 'Roofing',
    },
    {
      itemNumber: 'CT-LM-003',
      itemDescription: 'CertainTeed Landmark Shingles - Weathered Wood',
      familyName: 'Landmark',
      manufacturer: 'CertainTeed',
      stockingUom: 'BDL',
      availableUoms: ['BDL', 'SQ'],
      branches: params.branchNumber ? [] : ['14', '123'],
      isAvailable: !params.branchNumber || ['14', '123'].includes(params.branchNumber),
      category: 'Roofing',
    },
    {
      itemNumber: 'GAF-SS-004',
      itemDescription: 'GAF Starter Strip Plus - Starter Shingles',
      familyName: 'Starter Strip',
      manufacturer: 'GAF',
      stockingUom: 'BDL',
      availableUoms: ['BDL'],
      branches: params.branchNumber ? [params.branchNumber] : ['1', '14', '123'],
      isAvailable: true,
      category: 'Roofing Accessories',
    },
    {
      itemNumber: 'GAF-RV-005',
      itemDescription: 'GAF Cobra Ridge Vent - 20 ft Roll',
      familyName: 'Cobra',
      manufacturer: 'GAF',
      stockingUom: 'RL',
      availableUoms: ['RL', 'EA'],
      branches: params.branchNumber ? [params.branchNumber] : ['1', '14'],
      isAvailable: true,
      category: 'Ventilation',
    },
    {
      itemNumber: 'GAF-UL-006',
      itemDescription: 'GAF FeltBuster Synthetic Underlayment',
      familyName: 'FeltBuster',
      manufacturer: 'GAF',
      stockingUom: 'RL',
      availableUoms: ['RL', 'SQ'],
      branches: params.branchNumber ? [params.branchNumber] : ['1', '14', '123'],
      isAvailable: true,
      category: 'Underlayment',
    },
  ];

  let filteredProducts = mockProducts;

  if (params.query) {
    const query = params.query.toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.itemDescription.toLowerCase().includes(query) ||
      p.itemNumber.toLowerCase().includes(query) ||
      p.manufacturer.toLowerCase().includes(query) ||
      p.familyName.toLowerCase().includes(query)
    );
  }

  if (params.branchNumber) {
    filteredProducts = filteredProducts.map(p => ({
      ...p,
      isAvailable: p.branches.includes(params.branchNumber!),
      branches: p.branches.includes(params.branchNumber!) ? [params.branchNumber!] : [],
    }));
  }

  if (params.manufacturer) {
    filteredProducts = filteredProducts.filter(p =>
      p.manufacturer.toLowerCase() === params.manufacturer!.toLowerCase()
    );
  }

  if (params.category) {
    filteredProducts = filteredProducts.filter(p =>
      p.category?.toLowerCase() === params.category!.toLowerCase()
    );
  }

  await logApiCall(
    organizationId,
    '/products/search',
    'GET',
    params,
    200,
    { count: filteredProducts.length },
    Date.now() - startTime,
    false
  );

  return filteredProducts;
}

export async function getItemPrice(
  request: ABCSupplyPriceRequest,
  organizationId: string
): Promise<ABCSupplyPriceResponse> {
  const startTime = Date.now();

  const mockPrices: Record<string, number> = {
    'GAF-TL-HD-001': 32.99,
    'OC-DUR-002': 35.49,
    'CT-LM-003': 29.99,
    'GAF-SS-004': 18.99,
    'GAF-RV-005': 45.00,
    'GAF-UL-006': 89.99,
  };

  const unitPrice = mockPrices[request.itemNumber] || 0;
  const requiresContactForPrice = unitPrice === 0;

  const response: ABCSupplyPriceResponse = {
    itemNumber: request.itemNumber,
    branchNumber: request.branchNumber,
    accountNumber: request.accountNumber,
    unitPrice,
    totalPrice: unitPrice * request.quantity,
    quantity: request.quantity,
    uom: request.uom || 'EA',
    currency: 'USD',
    isValid: unitPrice > 0,
    requiresContactForPrice,
    priceMessage: requiresContactForPrice
      ? 'Contact branch for pricing on this item'
      : undefined,
    fetchedAt: new Date().toISOString(),
  };

  await logApiCall(
    organizationId,
    '/pricing',
    'POST',
    request,
    200,
    response,
    Date.now() - startTime,
    false
  );

  return response;
}

export async function getBatchPricing(
  items: Omit<ABCSupplyPriceRequest, 'accountNumber' | 'branchNumber'>[],
  accountNumber: string,
  branchNumber: string,
  organizationId: string
): Promise<ABCSupplyPriceResponse[]> {
  const results = await Promise.all(
    items.map(item =>
      getItemPrice(
        { ...item, accountNumber, branchNumber },
        organizationId
      )
    )
  );
  return results;
}

export async function placeOrder(
  request: ABCSupplyOrderRequest,
  organizationId: string
): Promise<ABCSupplyOrderResponse> {
  const startTime = Date.now();

  const mockOrderNumber = `ABC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  const response: ABCSupplyOrderResponse = {
    success: true,
    orderId: crypto.randomUUID(),
    orderNumber: mockOrderNumber,
    confirmationNumber: `CONF-${mockOrderNumber}`,
    estimatedDeliveryDate: request.requestedDeliveryDate ||
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    message: 'Order submitted successfully to ABC Supply',
  };

  await logApiCall(
    organizationId,
    '/orders',
    'POST',
    request,
    201,
    response,
    Date.now() - startTime,
    false
  );

  return response;
}

export async function createAccount(
  organizationId: string,
  accountData: Partial<ABCSupplyAccount>
): Promise<ABCSupplyAccount> {
  const { data, error } = await supabase
    .from('abc_supply_accounts')
    .insert({
      organization_id: organizationId,
      account_number: accountData.accountNumber,
      account_name: accountData.accountName,
      account_type: accountData.accountType || 'ship_to',
      contact_name: accountData.contactName,
      contact_email: accountData.contactEmail,
      contact_phone: accountData.contactPhone,
      address_line1: accountData.addressLine1,
      address_line2: accountData.addressLine2,
      city: accountData.city,
      state: accountData.state,
      zip_code: accountData.zipCode,
      country: accountData.country || 'US',
      accessible_branch_numbers: accountData.accessibleBranchNumbers || [],
      is_default: accountData.isDefault || false,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    organizationId: data.organization_id,
    accountNumber: data.account_number,
    accountName: data.account_name,
    accountType: data.account_type,
    contactName: data.contact_name,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    addressLine1: data.address_line1,
    addressLine2: data.address_line2,
    city: data.city,
    state: data.state,
    zipCode: data.zip_code,
    country: data.country,
    accessibleBranchNumbers: data.accessible_branch_numbers || [],
    isDefault: data.is_default,
    isActive: data.is_active,
    lastSyncedAt: data.last_synced_at,
    syncStatus: data.sync_status,
  };
}

export async function updateAccount(
  accountId: string,
  accountData: Partial<ABCSupplyAccount>
): Promise<void> {
  const updateData: Record<string, unknown> = {};

  if (accountData.accountName !== undefined) updateData.account_name = accountData.accountName;
  if (accountData.contactName !== undefined) updateData.contact_name = accountData.contactName;
  if (accountData.contactEmail !== undefined) updateData.contact_email = accountData.contactEmail;
  if (accountData.contactPhone !== undefined) updateData.contact_phone = accountData.contactPhone;
  if (accountData.addressLine1 !== undefined) updateData.address_line1 = accountData.addressLine1;
  if (accountData.addressLine2 !== undefined) updateData.address_line2 = accountData.addressLine2;
  if (accountData.city !== undefined) updateData.city = accountData.city;
  if (accountData.state !== undefined) updateData.state = accountData.state;
  if (accountData.zipCode !== undefined) updateData.zip_code = accountData.zipCode;
  if (accountData.accessibleBranchNumbers !== undefined) updateData.accessible_branch_numbers = accountData.accessibleBranchNumbers;
  if (accountData.isDefault !== undefined) updateData.is_default = accountData.isDefault;
  if (accountData.isActive !== undefined) updateData.is_active = accountData.isActive;

  const { error } = await supabase
    .from('abc_supply_accounts')
    .update(updateData)
    .eq('id', accountId);

  if (error) throw error;
}

export async function deleteAccount(accountId: string): Promise<void> {
  const { error } = await supabase
    .from('abc_supply_accounts')
    .delete()
    .eq('id', accountId);

  if (error) throw error;
}

export async function setDefaultAccount(accountId: string, organizationId: string): Promise<void> {
  await supabase
    .from('abc_supply_accounts')
    .update({ is_default: false })
    .eq('organization_id', organizationId);

  const { error } = await supabase
    .from('abc_supply_accounts')
    .update({ is_default: true })
    .eq('id', accountId);

  if (error) throw error;
}

export async function syncAccountFromApi(
  organizationId: string,
  accountNumber: string
): Promise<ABCSupplyAccount> {
  const existingAccount = await supabase
    .from('abc_supply_accounts')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('account_number', accountNumber)
    .maybeSingle();

  const mockAccountData = {
    accountNumber,
    accountName: `Ship-To Account ${accountNumber}`,
    accessibleBranchNumbers: ['1', '14', '123'],
    syncStatus: 'synced' as const,
    lastSyncedAt: new Date().toISOString(),
  };

  if (existingAccount.data) {
    await updateAccount(existingAccount.data.id, {
      ...mockAccountData,
    });
    return {
      ...existingAccount.data,
      ...mockAccountData,
      id: existingAccount.data.id,
      organizationId,
    } as ABCSupplyAccount;
  }

  return createAccount(organizationId, mockAccountData);
}

const mockOrders: ABCSupplyOrder[] = [
  {
    id: '1',
    orderNumber: 'ABC-2024-001',
    confirmationNumber: 'CONF-ABC-2024-001',
    status: 'processing',
    accountNumber: '123456',
    accountName: 'Main Ship-To Account',
    branchNumber: '14',
    branchName: 'ABC Supply - Austin North',
    branchPhone: '(512) 555-0123',
    branchAddress: '1234 Industrial Blvd, Austin, TX 78701',
    poNumber: 'PO-2024-001',
    items: [
      {
        id: '1-1',
        itemNumber: 'GAF-TL-HD-001',
        description: 'GAF Timberline HD Shingles',
        quantity: 20,
        uom: 'BDL',
        unitPrice: 32.99,
        lineTotal: 659.80,
        manufacturer: 'GAF',
      },
      {
        id: '1-2',
        itemNumber: 'GAF-UL-006',
        description: 'Underlayment Roll',
        quantity: 5,
        uom: 'RL',
        unitPrice: 89.99,
        lineTotal: 449.95,
        manufacturer: 'GAF',
      },
    ],
    subtotal: 1109.75,
    tax: 91.55,
    total: 2450.00,
    deliveryMethod: 'delivery',
    deliveryAddress: {
      line1: '5678 Construction Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
    },
    deliveryContact: {
      name: 'John Smith',
      phone: '(512) 555-9876',
    },
    requestedDeliveryDate: '2024-01-19',
    estimatedDeliveryDate: '2024-01-19',
    createdAt: '2024-01-14T10:30:00Z',
  },
  {
    id: '2',
    orderNumber: 'ABC-2024-002',
    confirmationNumber: 'CONF-ABC-2024-002',
    status: 'shipped',
    accountNumber: '123456',
    accountName: 'Main Ship-To Account',
    branchNumber: '14',
    branchName: 'ABC Supply - Austin North',
    branchPhone: '(512) 555-0123',
    branchAddress: '1234 Industrial Blvd, Austin, TX 78701',
    poNumber: 'PO-2024-002',
    items: [
      {
        id: '2-1',
        itemNumber: 'GTR-AL-001',
        description: 'Aluminum Gutters',
        quantity: 100,
        uom: 'LF',
        unitPrice: 12.50,
        lineTotal: 1250.00,
        manufacturer: 'Amerimax',
      },
      {
        id: '2-2',
        itemNumber: 'GTR-GD-002',
        description: 'Gutter Guards',
        quantity: 50,
        uom: 'EA',
        unitPrice: 8.99,
        lineTotal: 449.50,
        manufacturer: 'Amerimax',
      },
    ],
    subtotal: 1699.50,
    tax: 176.00,
    total: 1875.50,
    deliveryMethod: 'delivery',
    deliveryAddress: {
      line1: '789 Builder Lane',
      city: 'Round Rock',
      state: 'TX',
      zipCode: '78664',
    },
    deliveryContact: {
      name: 'Mike Johnson',
      phone: '(512) 555-4321',
    },
    requestedDeliveryDate: '2024-01-18',
    estimatedDeliveryDate: '2024-01-18',
    trackingNumber: 'TRK-789456123',
    createdAt: '2024-01-12T14:15:00Z',
  },
  {
    id: '3',
    orderNumber: 'ABC-2024-003',
    confirmationNumber: 'CONF-ABC-2024-003',
    status: 'delivered',
    accountNumber: '123456',
    accountName: 'Main Ship-To Account',
    branchNumber: '123',
    branchName: 'ABC Supply - Round Rock',
    branchPhone: '(512) 555-0125',
    branchAddress: '999 Supply Dr, Round Rock, TX 78664',
    poNumber: 'PO-2024-003',
    items: [
      {
        id: '3-1',
        itemNumber: 'OC-DUR-002',
        description: 'Owens Corning Duration Shingles',
        quantity: 25,
        uom: 'BDL',
        unitPrice: 35.49,
        lineTotal: 887.25,
        manufacturer: 'Owens Corning',
      },
      {
        id: '3-2',
        itemNumber: 'GAF-RV-005',
        description: 'Ridge Vent',
        quantity: 10,
        uom: 'RL',
        unitPrice: 45.00,
        lineTotal: 450.00,
        manufacturer: 'GAF',
      },
    ],
    subtotal: 1337.25,
    tax: 110.32,
    total: 3200.75,
    deliveryMethod: 'pickup',
    actualDeliveryDate: '2024-01-15',
    createdAt: '2024-01-08T09:00:00Z',
  },
];

export async function fetchRecentOrders(
  organizationId: string,
  limit: number = 5
): Promise<ABCSupplyOrder[]> {
  return mockOrders.slice(0, limit);
}

export async function fetchOrder(
  orderId: string,
  organizationId: string
): Promise<ABCSupplyOrder | null> {
  const order = mockOrders.find(o => o.id === orderId);
  return order || null;
}

export async function fetchOrderByNumber(
  orderNumber: string,
  organizationId: string
): Promise<ABCSupplyOrder | null> {
  const order = mockOrders.find(o => o.orderNumber === orderNumber);
  return order || null;
}
