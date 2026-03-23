import React, { useState } from 'react';

interface MeasurementInstructionsProps {
  onInstructionChange: (instruction: string) => void;
  propertyType: string;
}

const MeasurementInstructions: React.FC<MeasurementInstructionsProps> = ({
  onInstructionChange,
  propertyType
}) => {
  const [selectedInstruction, setSelectedInstruction] = useState(
    propertyType === 'Commercial' || propertyType === 'Industrial' ? 'Primary Structure Only' : 'Primary Structure + Detached Garage'
  );

  const handleInstructionChange = (instruction: string) => {
    setSelectedInstruction(instruction);
    onInstructionChange(instruction);
  };

  const getInstructionOptions = () => {
    if (propertyType === 'Commercial' || propertyType === 'Industrial') {
      return [
        'Primary Structure Only',
        'All Structures on Property'
      ];
    } else {
      return [
        'Primary Structure + Detached Garage',
        'Primary Structure Only',
        'All Structures on Property'
      ];
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Measurement Instructions</h3>
      
      <div className="space-y-3">
        {getInstructionOptions().map((instruction) => (
          <label key={instruction} className="flex items-center cursor-pointer">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
              name="measurementInstruction"
              checked={selectedInstruction === instruction}
              onChange={() => handleInstructionChange(instruction)}
            />
            <span className="ml-3 text-gray-700 dark:text-gray-300">{instruction}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Instructions:</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {selectedInstruction === 'Primary Structure Only' && (
            <p>Measurements will include only the main building structure.</p>
          )}
          {selectedInstruction === 'Primary Structure + Detached Garage' && (
            <p>Measurements will include the main building and any detached garage structures.</p>
          )}
          {selectedInstruction === 'All Structures on Property' && (
            <p>Measurements will include all structures visible on the property including sheds, outbuildings, etc.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeasurementInstructions;