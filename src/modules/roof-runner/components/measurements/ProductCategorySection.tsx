import { Database, FileText, Sun } from 'lucide-react';
import type { ProductId, AddOnId, AccountMode } from '../../types/measurementOrder';
import type { ProductCategory, ProductCatalogItem } from '../../data/productCatalog';
import { getProductsByCategory } from '../../data/productCatalog';
import { ProductCard } from './ProductCard';
import { OrthogonalImageryToggle } from './OrthogonalImageryToggle';

interface ProductCategorySectionProps {
  category: ProductCategory;
  selectedProducts: ProductId[];
  selectedAddOns: AddOnId[];
  accountMode: AccountMode;
  onSelectProduct: (productId: ProductId) => void;
  onDeselectProduct: (productId: ProductId) => void;
  onToggleAddOn: (addOnId: AddOnId) => void;
  featureFlagsEnabled?: Record<string, boolean>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Database: <Database className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Sun: <Sun className="w-5 h-5" />,
};

export function ProductCategorySection({
  category,
  selectedProducts,
  selectedAddOns,
  accountMode,
  onSelectProduct,
  onDeselectProduct,
  onToggleAddOn,
  featureFlagsEnabled = {},
}: ProductCategorySectionProps) {
  const products = getProductsByCategory(category.id);
  const icon = categoryIcons[category.icon] || <FileText className="w-5 h-5" />;

  if (products.length === 0) {
    return null;
  }

  const isPropertyDataCategory = category.id === 'property_data';
  const roofAreaEstimateSelected = selectedProducts.includes('property_roof_area_estimate');

  // Check if all products in this category are coming soon
  const allProductsComingSoon = products.every(
    (p) => p.requiresFeatureFlag && !featureFlagsEnabled[p.requiresFeatureFlag]
  );

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500 dark:text-gray-400">
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {category.name}
        </h2>
        {allProductsComingSoon && (
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Coming Soon - V1
          </span>
        )}
      </div>

      <div className="space-y-3">
        {products.map((product: ProductCatalogItem) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              isSelected={selectedProducts.includes(product.id)}
              currentSelection={selectedProducts}
              accountMode={accountMode}
              onSelect={() => onSelectProduct(product.id)}
              onDeselect={() => onDeselectProduct(product.id)}
              featureFlagsEnabled={featureFlagsEnabled}
            />

            {isPropertyDataCategory && product.id === 'property_roof_area_estimate' && (
              <OrthogonalImageryToggle
                isEnabled={roofAreaEstimateSelected}
                isSelected={selectedAddOns.includes('addon_orthogonal_imagery')}
                accountMode={accountMode}
                onToggle={() => onToggleAddOn('addon_orthogonal_imagery')}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
