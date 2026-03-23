import React from 'react';
import { Image, RefreshCw, AlertCircle } from 'lucide-react';
import type { ImageryStatus, ImageryError } from '../../types/propertyData';
import { EstimatorImageryGallery } from './EstimatorImageryGallery';

interface RoofImagerySectionProps {
  imageryEnabled: boolean;
  imageryStatus: ImageryStatus;
  imageryError: ImageryError | null;
  images: string[];
  onToggle: (enabled: boolean) => void;
  onRetry: () => void;
  onImageClick: (index: number) => void;
}

export function RoofImagerySection({
  imageryEnabled,
  imageryStatus,
  imageryError,
  images,
  onToggle,
  onRetry,
  onImageClick,
}: RoofImagerySectionProps) {
  const renderContent = () => {
    if (!imageryEnabled) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
            <Image className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
            Add orthogonal imagery
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-xs">
            View aerial perspectives of the property for better roof context
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Imagery availability varies by property
          </p>
        </div>
      );
    }

    if (imageryStatus === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-10 h-10 border-3 border-gray-200 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Loading imagery...
          </p>
        </div>
      );
    }

    if (imageryStatus === 'error') {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
            Unable to load imagery
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            {imageryError?.message || 'An error occurred while loading imagery'}
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }

    if (imageryStatus === 'success') {
      return (
        <EstimatorImageryGallery
          images={images}
          onImageClick={onImageClick}
        />
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Roof Imagery
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Orthogonal views for context
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={imageryEnabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {imageryEnabled ? 'On' : 'Off'}
            </span>
          </label>
        </div>
      </div>

      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}
