import React, { useState, useMemo } from 'react';
import { Image, AlertCircle } from 'lucide-react';
import { isNonProductionEnvironment } from '../../config/featureFlags';

interface ImageThumbnailProps {
  src: string;
  alt: string;
  onClick: () => void;
}

function ImageThumbnail({ src, alt, onClick }: ImageThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-transform hover:scale-[1.02]"
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <AlertCircle className="w-6 h-6 mb-1" />
          <span className="text-xs">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full object-cover transition-opacity ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </button>
  );
}

interface EstimatorImageryGalleryProps {
  images: string[];
  onImageClick: (index: number) => void;
}

export function EstimatorImageryGallery({ images, onImageClick }: EstimatorImageryGalleryProps) {
  const isNonProd = useMemo(() => isNonProductionEnvironment(), []);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
          <Image className="w-6 h-6 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Imagery not available for this property
        </p>
        {isNonProd && (
          <p className="text-sky-600 dark:text-sky-400 text-xs mt-2 max-w-xs">
            Test environment: Sample property data may not include imagery. Production will have imagery when available.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {images.length} image{images.length !== 1 ? 's' : ''} available
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, index) => (
          <ImageThumbnail
            key={`${src}-${index}`}
            src={src}
            alt={`Roof view ${index + 1}`}
            onClick={() => onImageClick(index)}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 italic">
        For roof context only. Not a substitute for final measurements.
      </p>
    </div>
  );
}
