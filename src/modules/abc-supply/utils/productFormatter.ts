import { Product } from '../types';

export interface FormattedProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  supplier: string;
  color: string;
  category: string;
  primaryUom: string;
  image: string | null;
  specifications: string[];
}

export const formatProductForDisplay = (product: Product): FormattedProduct => {
  return {
    id: product.itemNumber,
    sku: product.itemNumber,
    name: product.familyName,
    description: product.itemDescription,
    supplier: product.supplierName,
    color: product.color?.name || 'N/A',
    category: product.hierarchy?.productGroup?.category?.label || 'N/A',
    primaryUom: product.uoms?.[0]?.code || 'EA',
    image: product.images?.[0]?.href || null,
    specifications: product.specifications?.map(spec => `${spec.name}: ${spec.description}`) || []
  };
};

export const formatProductsForTable = (products: Product[]) => {
  return products.map(product => ({
    itemNumber: product.itemNumber,
    familyName: product.familyName,
    supplier: product.supplierName,
    color: product.color?.name || 'N/A',
    category: product.hierarchy?.productGroup?.category?.label || 'N/A',
    status: product.status,
    uom: product.uoms?.[0]?.code || 'EA',
    description: product.itemDescription
  }));
};