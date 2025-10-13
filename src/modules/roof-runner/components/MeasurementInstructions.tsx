import React from 'react';

interface MeasurementInstructionsProps {
  onInstructionChange: (instruction: string) => void;
  propertyType: string;
}

const MeasurementInstructions: React.FC<MeasurementInstructionsProps> = ({ onInstructionChange, propertyType }) => {
  const instructions = propertyType === 'Commercial' 
    ? ['Primary Structure Only', 'All Buildings', 'Custom Instructions']
    : ['Primary Structure + Detached Garage', 'Primary Structure Only', 'All Structures', 'Custom Instructions'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Measurement Instructions</h2>
      
      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="radio"
              name="instructions"
              value={instruction}
              onChange={(e) => onInstructionChange(e.target.value)}
              defaultChecked={index === 0}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-900 dark:text-white">{instruction}</span>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Any specific instructions or notes for the measurement team..."
        />
      </div>
    </div>
  );
};

export default MeasurementInstructions;