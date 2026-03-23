import { useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useMeasurementOrderContext } from '../../context/MeasurementOrderContext';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { getSortedCategories } from '../../data/productCatalog';
import { ProductCategorySection } from './ProductCategorySection';
import { SelectionSummaryBar } from './SelectionSummaryBar';
import { FullHouseInfoBanner } from './FullHouseInfoBanner';
import { ProductSelectionToasts } from './ProductSelectionToasts';
import { PropertyDataPreviewCard } from './PropertyDataPreviewCard';
import { OrthogonalImageryGallery } from './OrthogonalImageryGallery';
import { ImageViewerModal } from './ImageViewerModal';
import { useProductSelectionToast } from '../../hooks/useProductSelectionToast';
import { useProductFeatureFlags } from '../../hooks/useProductFeatureFlags';
import type { ProductId, AddOnId } from '../../types/measurementOrder';

interface ProductSelectionStepProps {
  onBack: () => void;
  onContinue: () => void;
}

export function ProductSelectionStep({ onBack, onContinue }: ProductSelectionStepProps) {
  const {
    accountMode,
    selectedProducts,
    selectedAddOns,
    selectProduct,
    deselectProduct,
    toggleAddOn,
    clearProductSelection,
    propertyData,
    propertyDataStatus,
    propertyDataError,
    refreshPropertyData,
  } = useMeasurementOrderContext();

  const { subscriptionTier } = useCurrentOrganization();

  const { toasts, showAutoDeselectToast, showAddOnAutoDeselectToast, showClearAllToast, dismissToast } = useProductSelectionToast();

  const { solarProductsEnabled } = useProductFeatureFlags();

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  // Create feature flags object for components
  const featureFlagsEnabled = {
    solar_products_enabled: solarProductsEnabled,
  };

  const handleImageClick = (index: number) => {
    setImageViewerIndex(index);
    setImageViewerOpen(true);
  };

  const categories = getSortedCategories();
  const isFullHouseSelected = selectedProducts.includes('measure_full_house');

  const handleSelectProduct = (productId: ProductId) => {
    const { autoDeselected } = selectProduct(productId);
    if (autoDeselected.length > 0) {
      autoDeselected.forEach((deselectedId) => {
        showAutoDeselectToast(deselectedId, productId);
      });
    }
  };

  const handleDeselectProduct = (productId: ProductId) => {
    const { autoDeselectedAddOns } = deselectProduct(productId);
    if (autoDeselectedAddOns.length > 0) {
      autoDeselectedAddOns.forEach((addOnId) => {
        showAddOnAutoDeselectToast(addOnId, productId);
      });
    }
  };

  const handleToggleAddOn = (addOnId: AddOnId) => {
    toggleAddOn(addOnId);
  };

  const handleClearAll = () => {
    clearProductSelection();
    showClearAllToast();
  };

  if (!accountMode) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please select an account mode first.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Go back to account selection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to account selection
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Products
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose the measurement reports and data products for your order
            </p>
          </div>
        </div>
      </div>

      <SelectionSummaryBar
        selectedProducts={selectedProducts}
        selectedAddOns={selectedAddOns}
        accountMode={accountMode}
        onRemoveProduct={handleDeselectProduct}
        onRemoveAddOn={(addOnId) => toggleAddOn(addOnId)}
        onClearAll={handleClearAll}
        onContinue={onContinue}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <PropertyDataPreviewCard
              data={propertyData}
              status={propertyDataStatus}
              error={propertyDataError}
              subscriptionTier={subscriptionTier}
              onRetry={refreshPropertyData}
            />
          </div>
          <div className="lg:col-span-2">
            <OrthogonalImageryGallery
              images={propertyData?.images || []}
              status={propertyDataStatus}
              onImageClick={handleImageClick}
            />
          </div>
        </div>

        {categories.map((category) => (
          <ProductCategorySection
            key={category.id}
            category={category}
            selectedProducts={selectedProducts}
            selectedAddOns={selectedAddOns}
            accountMode={accountMode}
            onSelectProduct={handleSelectProduct}
            onDeselectProduct={handleDeselectProduct}
            onToggleAddOn={handleToggleAddOn}
            featureFlagsEnabled={featureFlagsEnabled}
          />
        ))}

        <FullHouseInfoBanner isVisible={isFullHouseSelected} />
      </div>

      <ProductSelectionToasts toasts={toasts} onDismiss={dismissToast} />

      <ImageViewerModal
        images={propertyData?.images || []}
        initialIndex={imageViewerIndex}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
      />
    </div>
  );
}
