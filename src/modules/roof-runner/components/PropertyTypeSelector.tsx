import React, { useState } from 'react';

interface PropertyTypeSelectorProps {
  onPropertyTypeChange: (type: string, complex: boolean) => void;
  buildingId: string;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({ onPropertyTypeChange, buildingId }) => {
  const [selectedType, setSelectedType] = useState('Residential');
  const [isComplex, setIsComplex] = useState(false);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    onPropertyTypeChange(type, isComplex);
  };

  const handleComplexityChange = (complex: boolean) => {
    setIsComplex(complex);
    onPropertyTypeChange(selectedType, complex);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Type</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => handleTypeChange('Residential')}
          className={`p-4 border rounded-lg text-left ${
            selectedType === 'Residential'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <h3 className="font-medium text-gray-900 dark:text-white">Residential</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Single family homes, townhouses</p>
        </button>
        
        <button
          onClick={() => handleTypeChange('Commercial')}
          className={`p-4 border rounded-lg text-left ${
            selectedType === 'Commercial'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <h3 className="font-medium text-gray-900 dark:text-white">Commercial</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Office buildings, warehouses</p>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="complex"
          checked={isComplex}
          onChange={(e) => handleComplexityChange(e.target.checked)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="complex" className="text-sm text-gray-700 dark:text-gray-300">
          Complex property (multiple buildings, unusual shapes)
        </label>
      </div>
    </div>
  );
};

export default PropertyTypeSelector;