import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Trash2, Send, AlertTriangle, Loader2, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { PlatformBadge } from '../common/PlatformBadge';
import { StarRating } from '../common/StarRating';
import { AIDraftPanel } from './AIDraftPanel';
import { generateDrafts, applyDraft } from '../../services/reputationAIService';
import { publishReply, deleteReply } from '../../services/reputationReplyService';
import { getDraftsForReview } from '../../services/reputationApi';
import type { ReputationReview, ReputationAIDraft } from '../../types';

interface Props {
  review: ReputationReview;
  userId: string;
  orgId: string;
  permissions: {
    canReply: boolean;
    canDeleteReply: boolean;
    canAIDraft: boolean;
  };
  onReviewUpdated: (reviewId: string, updates: Partial<ReputationReview>) => void;
}

export const ReviewDetailPanel: React.FC<Props> = ({
  review,
  userId,
  orgId,
  permissions,
  onReviewUpdated,
}) => {
  const [replyText, setReplyText] = useState('');
  const [drafts, setDrafts] = useState<ReputationAIDraft[]>([]);
  const [generatingDrafts, setGeneratingDrafts] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const publishedReply = review.replies?.find((r) => r.status === 'published') ?? null;

  const loadDrafts = useCallback(async () => {
    try {
      const result = await getDraftsForReview(orgId, review.id);
      setDrafts(result);
    } catch {
      // non-critical
    }
  }, [orgId, review.id]);

  useEffect(() => {
    loadDrafts();
    setReplyText('');
    setError(null);
    setSuccessMsg(null);
  }, [review.id, loadDrafts]);

  const showMessage = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setError(null);
      setSuccessMsg(null);
    }, 4000);
  };

  const handleGenerateDrafts = async () => {
    setGeneratingDrafts(true);
    setError(null);
    try {
      const newDrafts = await generateDrafts({ orgId, reviewId: review.id, userId });
      setDrafts(newDrafts);
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to generate drafts', true);
    } finally {
      setGeneratingDrafts(false);
    }
  };

  const handleUseDraft = async (draft: ReputationAIDraft) => {
    setReplyText(draft.draft_text);
    await applyDraft(draft.id);
    setDrafts((prev) =>
      prev.map((d) => (d.id === draft.id ? { ...d, applied: true, applied_at: new Date().toISOString() } : d))
    );
  };

  const handlePublish = async () => {
    if (!replyText.trim()) return;
    setPublishing(true);
    setError(null);
    try {
      await publishReply({
        orgId,
        reviewId: review.id,
        lateReviewId: review.late_review_id,
        accountId: review.account_id,
        message: replyText.trim(),
        userId,
      });
      onReviewUpdated(review.id, { has_reply: true });
      setReplyText('');
      showMessage('Reply published successfully.');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to publish reply', true);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this reply? This cannot be undone.')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteReply({
        orgId,
        reviewId: review.id,
        lateReviewId: review.late_review_id,
        accountId: review.account_id,
        userId,
      });
      onReviewUpdated(review.id, { has_reply: false });
      showMessage('Reply deleted.');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to delete reply', true);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
            {review.reviewer_profile_image ? (
              <img src={review.reviewer_profile_image} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {review.reviewer_name ?? 'Anonymous'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size="sm" />
              <PlatformBadge platform={review.platform} size="sm" />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {format(new Date(review.review_created_at), 'MMM d, yyyy')} &middot;{' '}
              {formatDistanceToNow(new Date(review.review_created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {review.review_text ?? '(No review text provided)'}
        </p>

        {review.review_url && (
          <a
            href={review.review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline mt-2"
          >
            <ExternalLink className="w-3 h-3" />
            View on {review.platform === 'googlebusiness' ? 'Google' : 'Facebook'}
          </a>
        )}
      </div>

      {publishedReply && (
        <div className="mx-5 mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Current Reply
            </span>
            {permissions.canDeleteReply && review.platform === 'googlebusiness' && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Delete Reply
              </button>
            )}
            {review.platform === 'facebook' && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Delete not available on Facebook
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {publishedReply.reply_text}
          </p>
        </div>
      )}

      {permissions.canReply && (
        <div className="p-5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
            {publishedReply ? 'Update Reply' : 'Write a Reply'}
          </label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            placeholder="Type your reply here…"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{replyText.length} chars</span>
            <button
              onClick={handlePublish}
              disabled={!replyText.trim() || publishing}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-800 text-white transition-colors"
            >
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {publishing ? 'Publishing…' : 'Publish Reply'}
            </button>
          </div>

          {error && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2.5">
              {successMsg}
            </div>
          )}

          {permissions.canAIDraft && (
            <AIDraftPanel
              drafts={drafts}
              generating={generatingDrafts}
              onGenerate={handleGenerateDrafts}
              onUseDraft={handleUseDraft}
            />
          )}
        </div>
      )}
    </div>
  );
};
