import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AddressSearch from './AddressSearch';
import PropertyTypeSelector from './PropertyTypeSelector';
import ProductSelector from './ProductSelector';
import MeasurementInstructions from './MeasurementInstructions';
import OrderSummary from './OrderSummary';
import { residentialProductCategories, commercialProductCategories, multiFamilyProductCategories } from '../../data/measurementData';

interface PlaceOrderPageProps {
  onOrderComplete: (orderData: any) => void;
  onBack: () => void;
}

const PlaceOrderPage: React.FC<PlaceOrderPageProps> = ({ onOrderComplete, onBack }) => {
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [isComplex, setIsComplex] = useState(false);
  const [buildingId, setBuildingId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [measurementInstructions, setMeasurementInstructions] = useState('Primary Structure + Detached Garage');

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setBuildingId(selectedAddress);
  };

  const handlePropertyTypeChange = (type: string, complex: boolean) => {
    setPropertyType(type);
    setIsComplex(complex);
    setSelectedProducts({});
    setMeasurementInstructions(type === 'Commercial' || type === 'Industrial' ? 'Primary Structure Only' : 'Primary Structure + Detached Garage');
  };

  const handleProductSelect = (productId: string, isSelected: boolean) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: isSelected
    }));
  };

  const handleInstructionChange = (instruction: string) => {
    setMeasurementInstructions(instruction);
  };

  const calculateTotalCost = (): number => {
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

  const selectedCategories = propertyType === 'Commercial' || propertyType === 'Industrial'
    ? commercialProductCategories
    : propertyType === 'Multi-Family'
    ? multiFamilyProductCategories
    : residentialProductCategories;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Place Measurement Order</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter property details and select measurement products</p>
        </div>
      </div>

      <AddressSearch
        onAddressSelect={handleAddressSelect}
        buildingId={buildingId}
        setBuildingId={setBuildingId}
      />

      <PropertyTypeSelector
        onPropertyTypeChange={handlePropertyTypeChange}
        buildingId={buildingId}
      />

      <ProductSelector
        categories={selectedCategories}
        onProductSelect={handleProductSelect}
        propertyType={propertyType}
      />

      <MeasurementInstructions
        onInstructionChange={handleInstructionChange}
        propertyType={propertyType}
      />

      <OrderSummary
        totalCost={calculateTotalCost()}
        onNext={handleNext}
        disabled={!address || Object.keys(selectedProducts).length === 0}
      />
    </div>
  );
};

export default PlaceOrderPage;