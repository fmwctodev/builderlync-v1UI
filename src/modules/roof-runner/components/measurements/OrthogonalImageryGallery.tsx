import React, { useState } from 'react';
import { Image, AlertTriangle, Loader2 } from 'lucide-react';
import type { PropertyDataStatus } from '../../types/propertyData';

interface OrthogonalImageryGalleryProps {
  images: string[];
  status: PropertyDataStatus;
  onImageClick?: (index: number) => void;
}

function ImageSkeleton() {
  return (
    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
  );
}

function ImageThumbnail({
  src,
  index,
  onClick,
}: {
  src: string;
  index: number;
  onClick: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      )}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle className="w-5 h-5 mb-1" />
          <span className="text-xs">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={`Property view ${index + 1}`}
          className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-105 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {index + 1}
      </div>
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Image className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No imagery available for this property
      </p>
    </div>
  );
}

function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Image className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Select an address to view property imagery
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <ImageSkeleton />
      <ImageSkeleton />
      <ImageSkeleton />
    </div>
  );
}

export function OrthogonalImageryGallery({
  images,
  status,
  onImageClick,
}: OrthogonalImageryGalleryProps) {
  if (status === 'idle') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Property Imagery
        </h3>
        <IdleState />
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Property Imagery
          </h3>
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
        <LoadingState />
      </div>
    );
  }

  if (status === 'error' || images.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Property Imagery
        </h3>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Property Imagery
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((src, index) => (
          <ImageThumbnail
            key={`${src}-${index}`}
            src={src}
            index={index}
            onClick={() => onImageClick?.(index)}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 italic">
        For roof context only. Not a substitute for final measurements.
      </p>
    </div>
  );
}
