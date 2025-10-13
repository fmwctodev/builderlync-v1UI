import React, { useState } from 'react';
import AddressSearch from './AddressSearch';
import PropertyTypeSelector from './PropertyTypeSelector';
import ProductSelector from './ProductSelector';
import MeasurementInstructions from './MeasurementInstructions';
import OrderSummary from './OrderSummary';
import { residentialProductCategories, commercialProductCategories } from '../data/sampleData';

const PlaceOrderPage: React.FC = () => {
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [isComplex, setIsComplex] = useState(false);
  const [buildingId, setBuildingId] = useState('29 Burnside Dr, Palm Coast, FL, 32137');
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
    setMeasurementInstructions(type === 'Commercial' ? 'Primary Structure Only' : 'Primary Structure + Detached Garage');
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
    const categories = propertyType === 'Commercial' ? commercialProductCategories : residentialProductCategories;

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
    console.log({
      address,
      propertyType,
      isComplex,
      buildingId,
      selectedProducts,
      measurementInstructions,
      totalCost: calculateTotalCost()
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Place Measurement Order</h1>
        <p className="text-gray-600 dark:text-gray-400">Enter property details and select measurement products</p>
      </div>

      <AddressSearch
        onAddressSelect={handleAddressSelect}
        buildingId={buildingId}
      />

      <PropertyTypeSelector
        onPropertyTypeChange={handlePropertyTypeChange}
        buildingId={buildingId}
      />

      <ProductSelector
        categories={propertyType === 'Commercial' ? commercialProductCategories : residentialProductCategories}
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
      />
    </div>
  );
};

export default PlaceOrderPage;