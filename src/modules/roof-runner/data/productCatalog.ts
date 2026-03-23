import type { ProductId, AddOnId } from '../types/measurementOrder';

export type { ProductId, AddOnId };

export type ProductCategoryId = 'property_data' | 'measurement_reports' | 'solar';

export interface ProductPricing {
  creditCost: number | null;
  eagleViewBasePrice: number | null;
}

export interface ProductCatalogItem {
  id: ProductId;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: ProductCategoryId;
  isSelectable: boolean;
  isUpgradeOnly: boolean;
  conflictsWith: ProductId[];
  includedIn: ProductId[];
  pricing: ProductPricing;
  features: string[];
  displayOrder: number;
  requiresFeatureFlag?: string;
  comingSoonLabel?: string;
}

export interface AddOnCatalogItem {
  id: AddOnId;
  name: string;
  shortDescription: string;
  requiresProduct: ProductId;
  pricing: ProductPricing;
  isRecommended: boolean;
}

export interface ProductCategory {
  id: ProductCategoryId;
  name: string;
  icon: string;
  displayOrder: number;
}

export const productCategories: ProductCategory[] = [
  {
    id: 'measurement_reports',
    name: 'Measurement Reports',
    icon: 'FileText',
    displayOrder: 1,
  },
  {
    id: 'solar',
    name: 'Solar',
    icon: 'Sun',
    displayOrder: 2,
  },
];

export const productCatalog: ProductCatalogItem[] = [
  {
    id: 'measure_bidperfect',
    name: 'BidPerfect',
    shortDescription: 'Quick and accurate measurements for bidding',
    fullDescription: 'Get total roof area, pitch table, facet count, aerial images, and suggested waste factor for accurate bidding.',
    category: 'measurement_reports',
    isSelectable: true,
    isUpgradeOnly: false,
    conflictsWith: ['measure_full_house'],
    includedIn: ['measure_full_house'],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 18,
    },
    features: [
      'Total roof area',
      'Pitch table',
      'Number of facets',
      '5 Aerial images of structure',
      'Suggested waste factor',
    ],
    displayOrder: 1,
  },
  {
    id: 'measure_full_house',
    name: 'Full House',
    shortDescription: 'Complete measurements for the entire house',
    fullDescription: 'Complete measurements including roof (with penetrations), walls, windows, doors, and gutters.',
    category: 'measurement_reports',
    isSelectable: true,
    isUpgradeOnly: false,
    conflictsWith: ['measure_bidperfect'],
    includedIn: [],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 105,
    },
    features: [
      '3D Roof measurements (including penetrations)',
      'Walls, Windows, and Doors measurements',
      'Gutter measurements',
      'Field verification areas marked in yellow',
    ],
    displayOrder: 2,
  },
  {
    id: 'measure_gutter',
    name: 'Gutter',
    shortDescription: 'Roof diagram with gutters highlighted',
    fullDescription: 'Detailed gutter measurements with roof diagram, aerial images, eave measurements, and downspout count.',
    category: 'measurement_reports',
    isSelectable: true,
    isUpgradeOnly: false,
    conflictsWith: [],
    includedIn: ['measure_full_house'],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 13.75,
    },
    features: [
      'Roof diagram with gutters highlighted',
      '5 aerial images of the structure',
      'Total eave measurements',
      'Estimated number of downspouts',
    ],
    displayOrder: 3,
  },
  {
    id: 'measure_premium',
    name: 'Premium',
    shortDescription: 'Premium roof measurement report',
    fullDescription: 'Premium roof measurement report with 3D diagram, aerial images, critical measurements, and waste calculation.',
    category: 'measurement_reports',
    isSelectable: false,
    isUpgradeOnly: true,
    conflictsWith: [],
    includedIn: [],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 32.75,
    },
    features: [
      '3D diagram of the roof',
      '5 aerial images of the structure',
      'All critical measurements',
      'Waste calculation table',
    ],
    displayOrder: 4,
  },
  {
    id: 'solar_inform_essentials_plus',
    name: 'Inform Essentials+',
    shortDescription: 'Basic solar installation data',
    fullDescription: 'Essential roof data for solar installations including roof geometry, pitch, azimuth, area, 2D obstructions, and line classifications.',
    category: 'solar',
    isSelectable: true,
    isUpgradeOnly: false,
    conflictsWith: [],
    includedIn: ['solar_inform_advanced', 'solar_truedesign_sales', 'solar_truedesign_planning'],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 63.25,
    },
    features: [
      'Roof geometry',
      'Pitch',
      'Azimuth',
      'Area',
      '2D Roof obstructions',
      'Line classifications',
    ],
    displayOrder: 1,
    requiresFeatureFlag: 'solar_products_enabled',
    comingSoonLabel: 'V1',
  },
  {
    id: 'solar_inform_advanced',
    name: 'Inform Advanced',
    shortDescription: 'Advanced solar data with SAV and TSRF',
    fullDescription: 'Advanced solar measurements including solar values (SAV, TSRF), 3D roof obstructions, plus all Inform Essentials+ features.',
    category: 'solar',
    isSelectable: true,
    isUpgradeOnly: false,
    conflictsWith: ['solar_inform_essentials_plus'],
    includedIn: ['solar_truedesign_sales', 'solar_truedesign_planning'],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 79,
    },
    features: [
      'Solar values (SAV, TSRF)',
      '3D Roof obstructions',
      'In addition to:',
      'Roof geometry',
      'Pitch',
      'Azimuth',
      'Area',
      'Line classifications',
    ],
    displayOrder: 2,
    requiresFeatureFlag: 'solar_products_enabled',
    comingSoonLabel: 'V1',
  },
  {
    id: 'solar_truedesign_sales',
    name: 'TrueDesign for Sales',
    shortDescription: 'Design residential PV layout for sales',
    fullDescription: 'Design your residential PV layout to determine energy production, powered by Inform Advance dataset with 3D models, SAV, and TSRF.',
    category: 'solar',
    isSelectable: true,
    isUpgradeOnly: false,
    conflictsWith: ['solar_truedesign_planning'],
    includedIn: ['solar_truedesign_planning'],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 30,
    },
    features: [
      'Design your residential PV layout to determine energy production',
      'Powered by our Inform Advance dataset (3D models, SAV, TSRF)',
    ],
    displayOrder: 3,
    requiresFeatureFlag: 'solar_products_enabled',
    comingSoonLabel: 'V1',
  },
  {
    id: 'solar_truedesign_planning',
    name: 'TrueDesign for Planning',
    shortDescription: 'Export PV design for install planning',
    fullDescription: 'Export your residential PV Design (DWG, JSON) to support install planning operations, includes all TrueDesign for Sales features plus Inform Advance deliverables.',
    category: 'solar',
    isSelectable: true,
    isUpgradeOnly: false,
    conflictsWith: ['solar_truedesign_sales'],
    includedIn: [],
    pricing: {
      creditCost: null,
      eagleViewBasePrice: 105.5,
    },
    features: [
      'Export your residential PV Design (DWG, JSON) to support your install planning operations',
      'In addition to:',
      'Design your residential PV layout to determine energy production',
      'Includes Inform Advance deliverables (3D models, SAV, TSRF)',
    ],
    displayOrder: 4,
    requiresFeatureFlag: 'solar_products_enabled',
    comingSoonLabel: 'V1',
  },
];

export const addOnCatalog: AddOnCatalogItem[] = [];

export function getProductById(id: ProductId): ProductCatalogItem | undefined {
  return productCatalog.find((p) => p.id === id);
}

export function getAddOnById(id: AddOnId): AddOnCatalogItem | undefined {
  return addOnCatalog.find((a) => a.id === id);
}

export function getProductsByCategory(categoryId: ProductCategoryId): ProductCatalogItem[] {
  return productCatalog
    .filter((p) => p.category === categoryId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getCategoryById(id: ProductCategoryId): ProductCategory | undefined {
  return productCategories.find((c) => c.id === id);
}

export function getSortedCategories(): ProductCategory[] {
  return [...productCategories].sort((a, b) => a.displayOrder - b.displayOrder);
}
