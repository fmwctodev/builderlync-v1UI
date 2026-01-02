// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// User and Account Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  company: Company;
}

export interface Company {
  id: string;
  name: string;
  accountNumber: string;
  billingAddresses: Address[];
  shippingAddresses: Address[];
  contacts: Contact[];
}

export interface Address {
  id: string;
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  type: 'billing' | 'shipping';
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

// Product Types
export interface Product {
  itemNumber: string;
  familyId: string;
  familyName: string;
  supplierName: string;
  isDimensional: boolean;
  itemDescription: string;
  marketingDescription: string;
  status: string;
  familyItems: any;
  color: {
    description: string;
    code: string;
    name: string;
  };
  finish: {
    description: string | null;
    code: string | null;
    name: string | null;
  };
  weights: Array<{
    value: number | null;
    uom: string | null;
    description: string;
  }>;
  uoms: Array<{
    name: string;
    code: string;
    description: string;
  }>;
  dimensions: {
    width: {
      value: number | null;
      uom: string | null;
      description: string;
    };
    thickness: {
      value: number | null;
      uom: string | null;
      description: string;
    };
    height: {
      value: number | null;
      uom: string | null;
      description: string;
    };
    variations: any[];
  };
  specifications: Array<{
    name: string;
    code: string;
    description: string;
  }>;
  prop65Warnings: any[];
  images: Array<{
    assetId: string;
    type: string | null;
    href: string;
  }>;
  hierarchy: {
    productGroup: {
      name: string;
      code: string;
      label: string;
      description: string;
      category: {
        name: string;
        code: string;
        label: string;
        description: string;
        productType: {
          name: string;
          code: string;
          label: string;
          description: string;
          materialComposition: {
            name: string;
            code: string;
            label: string;
            description: string;
            warranty: {
              name: string;
              code: string;
              label: string;
              description: string;
              brandLine: {
                name: string;
                code: string;
                label: string;
                description: string;
              };
            };
          };
        };
      };
    };
  };
  lastModifiedDate: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  level: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface ProductInventory {
  productId: string;
  branchId: string;
  quantity: number;
  availableDate?: string;
}

export interface ProductPrice {
  productId: string;
  price: number;
  currency: string;
  uom: string;
  priceBreaks?: PriceBreak[];
  special?: boolean;
  validUntil?: string;
}

export interface PriceBreak {
  quantity: number;
  price: number;
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  address: Address;
  phone: string;
  email?: string;
  hours: BranchHours;
  coordinates: Coordinates;
  services: string[];
}

export interface BranchHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// ShipTo Types
export interface ShipTo {
  name: string;
  number: string;
  status: string;
  isSellable: boolean;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
  contacts: {
    links: any[];
  };
  paymentTerms: any;
  tax: any;
  billTo: any;
  soldTo: any;
  branches: ShipToBranch[];
}

export interface ShipToBranch {
  homeBranch: boolean;
  number: string;
  name: string;
  storefront: string;
  status: string;
  type: string;
  links: {
    self: string;
  };
}

// Order Types
export interface CartItem {
  productId: string;
  quantity: number;
  uom: string;
  shipToNumber?: string;
}

export interface OrderHistoryItem {
  orderNumber: string;
  branch: number;
  branchCityState: string;
  invoiceDate: string | null;
  orderType: string;
  orderStatus: string;
  productQty: number;
  ship_to?: string; // JSON string containing shipping address
  lines?: string; // JSON string containing order line items
  abc_response?: string; // JSON string containing ABC Supply response
}

export interface OrderHistoryResponse {
  success: boolean;
  data: {
    pagination: {
      itemsPerPage: number;
      pageNumber: number;
      totalPages: number;
      totalItems: number;
    };
    items: OrderHistoryItem[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  billingAddress: Address;
  shippingAddress: Address;
  deliveryMethod: DeliveryMethod;
  deliveryDate?: string;
  specialInstructions?: string;
  payment: PaymentInfo;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryMethod {
  type: 'pickup' | 'delivery';
  cost: number;
  estimatedDate?: string;
  timeWindow?: string;
}

export interface PaymentInfo {
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  relatedId?: string;
  relatedType?: 'order' | 'product' | 'account';
}

export type NotificationType = 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'price_change' | 'stock_alert' | 'account';

// Search and Filter Types
export interface ProductFilter {
  categoryId?: string;
  attributes?: Record<string, string[]>;
  manufacturer?: string[];
  branchId?: string;
  inStock?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'popularity';
}

export interface BranchFilter {
  state?: string;
  city?: string;
  zipCode?: string;
  radius?: number;
  coordinates?: Coordinates;
  services?: string[];
}