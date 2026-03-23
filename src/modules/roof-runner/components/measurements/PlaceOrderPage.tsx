import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, MapPin } from 'lucide-react';
import AddressSearch from './AddressSearch';
import PropertyTypeSelector from './PropertyTypeSelector';
import ProductSelector from './ProductSelector';
import MeasurementInstructions from './MeasurementInstructions';
import UpgradeModeBanner from './UpgradeModeBanner';
import LockedProductDisplay from './LockedProductDisplay';
import { residentialProductCategories, commercialProductCategories, multiFamilyProductCategories } from '../../data/measurementData';
import { useMeasurementOrderContext } from '../../context/MeasurementOrderContext';
import { UPGRADE_TARGET_PRODUCT } from '../../types/measurementOrder';

interface PlaceOrderPageProps {
  onOrderComplete: (orderData: any) => void;
  onBack: () => void;
}

const PlaceOrderPage: React.FC<PlaceOrderPageProps> = ({ onOrderComplete, onBack }) => {
  const {
    isUpgradeFlow,
    upgradeFromOrderId,
    upgradeContext,
    exitUpgradeMode,
    getOrderPayload,
    accountMode,
    creditBreakdown,
    creditEligibility,
  } = useMeasurementOrderContext();

  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [isComplex, setIsComplex] = useState(false);
  const [buildingId, setBuildingId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [measurementInstructions, setMeasurementInstructions] = useState('Primary Structure + Detached Garage');

  useEffect(() => {
    if (isUpgradeFlow && upgradeContext) {
      setAddress(upgradeContext.addressText);
      setBuildingId(upgradeContext.propertyId);
    }
  }, [isUpgradeFlow, upgradeContext]);

  const handleAddressSelect = (selectedAddress: string) => {
    if (isUpgradeFlow) return;
    setAddress(selectedAddress);
    setBuildingId(selectedAddress);
  };

  const handlePropertyTypeChange = (type: string, complex: boolean) => {
    if (isUpgradeFlow) return;
    setPropertyType(type);
    setIsComplex(complex);
    setSelectedProducts({});
    setMeasurementInstructions(type === 'Commercial' || type === 'Industrial' ? 'Primary Structure Only' : 'Primary Structure + Detached Garage');
  };

  const handleProductSelect = (productId: string, isSelected: boolean) => {
    if (isUpgradeFlow) return;
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: isSelected
    }));
  };

  const handleInstructionChange = (instruction: string) => {
    setMeasurementInstructions(instruction);
  };

  const calculateTotalCost = (): number => {
    if (isUpgradeFlow) {
      return creditBreakdown.totalCredits;
    }

    let total = 0;
    const categories = propertyType === 'Commercial' || propertyType === 'Industrial'
      ? commercialProductCategories
      : propertyType === 'Multi-Family'
      ? multiFamilyProductCategories
      : residentialProductCategories;

    Object.entries(selectedProducts).forEach(([productId, isSelected]) => {
      if (isSelected) {
        for (const category of categories) {
          const product = category.products.find(p => p.id === productId);
          if (product) {
            total += product.price;
            break;
          }
        }
      }
    });

    return total;
  };

  const handleNext = () => {
    if (isUpgradeFlow) {
      const upgradePayload = getOrderPayload();
      if (upgradePayload) {
        onOrderComplete({
          ...upgradePayload,
          address,
          propertyType,
          isComplex,
          buildingId,
          measurementInstructions,
          totalCost: calculateTotalCost()
        });
      }
      return;
    }

    const orderData = {
      address,
      propertyType,
      isComplex,
      buildingId,
      selectedProducts,
      measurementInstructions,
      totalCost: calculateTotalCost()
    };
    onOrderComplete(orderData);
  };

  const handleCancelUpgrade = () => {
    exitUpgradeMode();
    onBack();
  };

  const selectedCategories = propertyType === 'Commercial' || propertyType === 'Industrial'
    ? commercialProductCategories
    : propertyType === 'Multi-Family'
    ? multiFamilyProductCategories
    : residentialProductCategories;

  const canProceed = isUpgradeFlow
    ? (accountMode === 'eagleview' || (accountMode === 'credits' && creditEligibility.sufficient && !creditEligibility.hasMissingMappings))
    : (address && Object.keys(selectedProducts).length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={isUpgradeFlow ? handleCancelUpgrade : onBack}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
          {isUpgradeFlow ? 'Cancel Upgrade' : 'Back'}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isUpgradeFlow ? 'Upgrade Order' : 'Place Measurement Order'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isUpgradeFlow
              ? 'Review and confirm your upgrade to Premium'
              : 'Enter property details and select measurement products'}
          </p>
        </div>
      </div>

      {isUpgradeFlow && upgradeFromOrderId && (
        <UpgradeModeBanner
          fromProduct="BidPerfect"
          toProduct="Premium"
          orderNumber={upgradeFromOrderId}
          onCancel={handleCancelUpgrade}
        />
      )}

      {isUpgradeFlow && upgradeContext ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Property Address (Locked)
            </span>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 dark:text-white font-medium">
                {upgradeContext.addressText}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Property ID: {upgradeContext.propertyId}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <AddressSearch
          onAddressSelect={handleAddressSelect}
          buildingId={buildingId}
          setBuildingId={setBuildingId}
        />
      )}

      {!isUpgradeFlow && (
        <PropertyTypeSelector
          onPropertyTypeChange={handlePropertyTypeChange}
          buildingId={buildingId}
        />
      )}

      {isUpgradeFlow ? (
        <LockedProductDisplay
          productId={UPGRADE_TARGET_PRODUCT}
          label="Selected Product (Upgrade)"
        />
      ) : (
        <ProductSelector
          categories={selectedCategories}
          onProductSelect={handleProductSelect}
          propertyType={propertyType}
        />
      )}

      <MeasurementInstructions
        onInstructionChange={handleInstructionChange}
        propertyType={propertyType}
      />

      {isUpgradeFlow && accountMode === 'credits' && creditEligibility.hasMissingMappings && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Premium upgrade credit mapping not configured. Please contact support.
          </p>
        </div>
      )}

      {isUpgradeFlow && accountMode === 'credits' && !creditEligibility.sufficient && !creditEligibility.hasMissingMappings && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            Insufficient credits for this upgrade. You need {creditBreakdown.totalCredits} credits.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isUpgradeFlow ? 'Continue with Upgrade' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
