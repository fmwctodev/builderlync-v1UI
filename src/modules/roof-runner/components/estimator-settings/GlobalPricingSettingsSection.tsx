import React from 'react';
import { Info } from 'lucide-react';
import type { PricingType } from '../../types/instantEstimatorSettings';

interface GlobalPricingSettingsSectionProps {
  restrictMaterials: boolean;
  pricingType: PricingType;
  showPriceRange: boolean;
  lowerRangePercent: number;
  upperRangePercent: number;
  showFinancing: boolean;
  financingLink: string;
  onRestrictMaterialsChange: (value: boolean) => void;
  onPricingTypeChange: (value: PricingType) => void;
  onShowPriceRangeChange: (value: boolean) => void;
  onLowerRangeChange: (value: number) => void;
  onUpperRangeChange: (value: number) => void;
  onShowFinancingChange: (value: boolean) => void;
  onFinancingLinkChange: (value: string) => void;
}

export const GlobalPricingSettingsSection: React.FC<GlobalPricingSettingsSectionProps> = ({
  restrictMaterials,
  pricingType,
  showPriceRange,
  lowerRangePercent,
  upperRangePercent,
  showFinancing,
  financingLink,
  onRestrictMaterialsChange,
  onPricingTypeChange,
  onShowPriceRangeChange,
  onLowerRangeChange,
  onUpperRangeChange,
  onShowFinancingChange,
  onFinancingLinkChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-8">
        <div className="w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Pricing settings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure how pricing is displayed to your customers across all instant estimators.
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={restrictMaterials}
              onChange={(e) => onRestrictMaterialsChange(e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Restrict customer to the materials I've configured pricing for
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <Info className="w-4 h-4" />
            </button>
          </label>

          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Choose how you would like to specify your pricing
            </p>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => onPricingTypeChange('per_sqft')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  pricingType === 'per_sqft'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Per square foot
              </button>
              <button
                onClick={() => onPricingTypeChange('per_square')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  pricingType === 'per_square'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Per square
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showPriceRange}
                onChange={(e) => onShowPriceRangeChange(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show prices as range
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <Info className="w-4 h-4" />
              </button>
            </label>

            {showPriceRange && (
              <div className="grid grid-cols-2 gap-4 ml-8">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Lower range (-%)
                  </label>
                  <input
                    type="number"
                    value={lowerRangePercent}
                    onChange={(e) => onLowerRangeChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Upper range (+%)
                  </label>
                  <input
                    type="number"
                    value={upperRangePercent}
                    onChange={(e) => onUpperRangeChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showFinancing}
                onChange={(e) => onShowFinancingChange(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Show financing options
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <Info className="w-4 h-4" />
              </button>
            </label>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Add financing link
              </label>
              <input
                type="text"
                value={financingLink}
                onChange={(e) => onFinancingLinkChange(e.target.value)}
                placeholder="Add link"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Provide a link to your financing page that will appear alongside each estimate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
