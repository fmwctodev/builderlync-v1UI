import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const StarRating: React.FC<Props> = ({ rating, max = 5, size = 'sm', showNumber = false }) => {
  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      {showNumber && (
        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
};
