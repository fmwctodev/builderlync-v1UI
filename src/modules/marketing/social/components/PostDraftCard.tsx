import React, { useState } from 'react';
import { CheckCircle, Clock, FileText, Zap } from 'lucide-react';
import type { PlatformDraft, SocialAccount, PublishMode, MediaAsset } from '../types';
import { PLATFORM_CHARACTER_LIMITS, PROVIDER_CONFIG } from '../types';
import ProviderIcon from './ProviderIcon';

interface PostDraftCardProps {
  draft: PlatformDraft;
  draftIndex: number;
  messageId: string;
  availableAccounts: SocialAccount[];
  defaultAccountIds?: string[];
  publishStatus?: { mode: PublishMode; scheduledAt?: string };
  preloadedMedia?: MediaAsset[];
  existingPostId?: string;
  onPublish: (
    draftIndex: number,
    draft: PlatformDraft,
    mode: PublishMode,
    accountIds: string[],
    media: MediaAsset[],
    mediaAssetIds: string[],
    scheduledAt?: string
  ) => Promise<void>;
}

const PostDraftCard: React.FC<PostDraftCardProps> = ({
  draft,
  draftIndex,
  availableAccounts,
  defaultAccountIds = [],
  publishStatus,
  preloadedMedia = [],
  onPublish,
}) => {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(defaultAccountIds);
  const [mode, setMode] = useState<PublishMode>('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);

  const config = PROVIDER_CONFIG[draft.platform];
  const limit = PLATFORM_CHARACTER_LIMITS[draft.platform];
  const fullBody = [draft.hook, draft.body, draft.cta].filter(Boolean).join('\n\n');
  const charCount = fullBody.length;
  const charPct = (charCount / limit) * 100;

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (loading || publishStatus) return;
    setLoading(true);
    try {
      await onPublish(
        draftIndex,
        draft,
        mode,
        selectedAccountIds,
        preloadedMedia,
        preloadedMedia.map((m) => m.id),
        mode === 'schedule' ? scheduledAt : undefined
      );
    } finally {
      setLoading(false);
    }
  };

  const modeButtons: { id: PublishMode; label: string; icon: React.ReactNode }[] = [
    { id: 'draft', label: 'Draft', icon: <FileText size={12} /> },
    { id: 'schedule', label: 'Schedule', icon: <Clock size={12} /> },
    { id: 'post_now', label: 'Post Now', icon: <Zap size={12} /> },
  ];

  const platformAccounts = availableAccounts.filter((a) => a.provider === draft.platform && a.status === 'connected');

  if (publishStatus) {
    const publishedLabel =
      publishStatus.mode === 'draft' ? 'Saved as Draft' :
      publishStatus.mode === 'schedule' ? 'Scheduled' : 'Queued to Post';

    return (
      <div className="bg-slate-700/50 rounded-xl border border-slate-600 p-4 opacity-80">
        <div className="flex items-center gap-2 mb-2">
          <ProviderIcon provider={draft.platform} size={18} />
          <span className="text-sm font-semibold text-slate-200">{config.label}</span>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full ml-auto">
            <CheckCircle size={11} />
            {publishedLabel}
          </span>
        </div>
        <p className="text-slate-400 text-sm line-clamp-2">{draft.hook}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-700 rounded-xl border border-slate-600 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ProviderIcon provider={draft.platform} size={18} />
        <span className="text-sm font-semibold text-slate-200">{config.label}</span>
        {draft.engagement_prediction > 0 && (
          <span className="ml-auto px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
            {draft.engagement_prediction.toFixed(1)}/10
          </span>
        )}
      </div>

      {draft.hook && (
        <p className="text-white font-semibold text-sm leading-snug">{draft.hook}</p>
      )}
      {draft.body && (
        <p className="text-slate-300 text-sm leading-relaxed">{draft.body}</p>
      )}
      {draft.cta && (
        <p className="text-cyan-400 text-sm italic">{draft.cta}</p>
      )}

      {draft.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {draft.hashtags.slice(0, 8).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-slate-600 text-slate-400 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {draft.visual_style_suggestion && (
        <p className="text-slate-500 text-xs italic">{draft.visual_style_suggestion}</p>
      )}

      <div className="flex items-center gap-2 text-xs">
        <span className={charPct > 100 ? 'text-red-400 font-bold' : charPct > 80 ? 'text-amber-400' : 'text-slate-500'}>
          {charCount} / {limit} chars
        </span>
      </div>

      {preloadedMedia.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {preloadedMedia.map((asset) => (
            <div key={asset.id} className="w-16 h-16 rounded-lg overflow-hidden bg-slate-600">
              <img src={asset.thumbnail_url ?? asset.public_url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-slate-600 pt-3 space-y-3">
        {platformAccounts.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Post to account</p>
            <div className="space-y-1.5">
              {platformAccounts.map((account) => (
                <label key={account.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedAccountIds.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    className="w-3.5 h-3.5 rounded accent-cyan-500"
                  />
                  {account.profile_image_url ? (
                    <img src={account.profile_image_url} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center">
                      <ProviderIcon provider={account.provider} size={12} />
                    </div>
                  )}
                  <span className="text-xs text-slate-300 group-hover:text-white truncate">{account.display_name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          {modeButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setMode(btn.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === btn.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {mode === 'schedule' && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-2 py-1.5 bg-slate-600 border border-slate-500 rounded-lg text-xs text-white"
          />
        )}

        <button
          onClick={handlePublish}
          disabled={loading || (mode === 'schedule' && !scheduledAt)}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {mode === 'draft' ? 'Save Draft' : mode === 'schedule' ? 'Schedule Post' : 'Post Now'}
        </button>
      </div>
    </div>
  );
};

export default PostDraftCard;
