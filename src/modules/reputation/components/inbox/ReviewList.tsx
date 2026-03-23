import React from 'react';
import { Loader2, Inbox } from 'lucide-react';
import { ReviewListItem } from './ReviewListItem';
import type { ReputationReview } from '../../types';

interface Props {
  reviews: ReputationReview[];
  selectedId: string | null;
  loading: boolean;
  hasMore: boolean;
  onSelect: (review: ReputationReview) => void;
  onLoadMore: () => void;
}

export const ReviewList: React.FC<Props> = ({
  reviews,
  selectedId,
  loading,
  hasMore,
  onSelect,
  onLoadMore,
}) => {
  if (loading && reviews.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
        <Inbox className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No reviews found</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Try adjusting your filters or sync to fetch the latest reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {reviews.map((review) => (
        <ReviewListItem
          key={review.id}
          review={review}
          isSelected={review.id === selectedId}
          onClick={() => onSelect(review)}
        />
      ))}

      {hasMore && (
        <div className="py-4 px-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Load more
          </button>
        </div>
      )}
    </div>
  );
};
