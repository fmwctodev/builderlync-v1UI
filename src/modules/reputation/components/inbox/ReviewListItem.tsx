import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, MessageSquareOff, User } from 'lucide-react';
import { PlatformBadge } from '../common/PlatformBadge';
import { StarRating } from '../common/StarRating';
import { SLABadge } from '../common/SLABadge';
import { PriorityBadge } from '../common/PriorityBadge';
import type { ReputationReview } from '../../types';

interface Props {
  review: ReputationReview;
  isSelected: boolean;
  onClick: () => void;
}

export const ReviewListItem: React.FC<Props> = ({ review, isSelected, onClick }) => {
  const snippet = review.review_text
    ? review.review_text.length > 120
      ? review.review_text.slice(0, 120) + '…'
      : review.review_text
    : '(No text)';

  const timeAgo = formatDistanceToNow(new Date(review.review_created_at), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/60 transition-colors ${
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-l-primary-500'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
          {review.reviewer_profile_image ? (
            <img
              src={review.reviewer_profile_image}
              alt={review.reviewer_name ?? 'Reviewer'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {review.reviewer_name ?? 'Anonymous'}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{timeAgo}</span>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <StarRating rating={review.rating} size="sm" />
            <PlatformBadge platform={review.platform} size="sm" />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
            {snippet}
          </p>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {review.has_reply ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="w-3 h-3" />
                Replied
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <MessageSquareOff className="w-3 h-3" />
                Needs reply
              </span>
            )}
            {review.priority && review.priority !== 'normal' && (
              <PriorityBadge priority={review.priority} />
            )}
            {review.sla_breached != null && (
              <SLABadge sla_breached={review.sla_breached} />
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
