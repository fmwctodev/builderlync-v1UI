import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface PropertyTypeSelectorProps {
  onPropertyTypeChange: (type: string, isComplex: boolean) => void;
  buildingId: string;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  onPropertyTypeChange,
  buildingId
}) => {
  const [propertyType, setPropertyType] = useState('Residential');
  const [isComplex, setIsComplex] = useState(false);

  const handleTypeChange = (type: string) => {
    setPropertyType(type);
    onPropertyTypeChange(type, isComplex);
  };

  const handleComplexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIsComplex = e.target.checked;
    setIsComplex(newIsComplex);
    
    if (newIsComplex) {
      setPropertyType('Commercial');
      onPropertyTypeChange('Commercial', true);
    } else {
      onPropertyTypeChange(propertyType, false);
    }
  };

  if (!buildingId) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Type</h3>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              name="propertyType"
              checked={propertyType === 'Residential'}
              onChange={() => handleTypeChange('Residential')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Residential</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              name="propertyType"
              checked={propertyType === 'Commercial'}
              onChange={() => handleTypeChange('Commercial')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Commercial</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              name="propertyType"
              checked={propertyType === 'Multi-Family'}
              onChange={() => handleTypeChange('Multi-Family')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Multi-Family</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              name="propertyType"
              checked={propertyType === 'Industrial'}
              onChange={() => handleTypeChange('Industrial')}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Industrial</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              checked={isComplex}
              onChange={handleComplexChange}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">This is a complex</span>
          </label>
          
          <div className="relative group">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-3 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-10">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              You can now place an order for multiple buildings. Use pins to label each building to create sitemap for your order. Each pin placed will require a separate report and charge, necessitating a saved credit card on file. Do not place multiple pins on a single connected structure, as it will cause delays in processing your order.
            </div>
          </div>
        </div>

        {isComplex && (
          <div className="flex gap-4 bg-primary-50 dark:bg-primary-900/20 items-center justify-start p-4 rounded-lg">
            <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <p className="text-primary-800 dark:text-primary-200 text-sm">
              Add additional buildings on this complex to your order by dropping additional pins on the map.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyTypeSelector;