import React, { useState } from 'react';
import { X, Link2, Copy, Check } from 'lucide-react';
import { createShareLink } from '../../services/jobCamApi';
import type { ShareMode, CreateShareLinkInput, JobMediaShareLink } from '../../types/jobCam';

interface Props {
  open: boolean;
  onClose: () => void;
  jobId?: number;
  photoIds?: string[];
  reportId?: string;
  onCreated?: (link: JobMediaShareLink) => void;
}

const SHARE_MODES: { value: ShareMode; label: string; description: string }[] = [
  { value: 'gallery', label: 'Photo Gallery', description: 'Full gallery of job photos' },
  { value: 'timeline', label: 'Timeline View', description: 'Chronological timeline of photos' },
  { value: 'single_photo', label: 'Single Photo', description: 'Share specific photos only' },
  { value: 'customer', label: 'Customer Portal', description: 'Customer-safe view of progress' },
  { value: 'claim', label: 'Insurance Claim', description: 'Damage documentation package' },
  { value: 'report', label: 'Report', description: 'Share a finalized report' },
  { value: 'internal', label: 'Internal', description: 'Team-only access link' },
];

const ShareModal: React.FC<Props> = ({ open, onClose, jobId, photoIds, reportId, onCreated }) => {
  const [mode, setMode] = useState<ShareMode>('gallery');
  const [label, setLabel] = useState('');
  const [expiresIn, setExpiresIn] = useState<string>('7d');
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState<JobMediaShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const getExpiresAt = () => {
    const now = Date.now();
    switch (expiresIn) {
      case '1d': return new Date(now + 86400000).toISOString();
      case '7d': return new Date(now + 604800000).toISOString();
      case '30d': return new Date(now + 2592000000).toISOString();
      case 'never': return undefined;
      default: return new Date(now + 604800000).toISOString();
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const input: CreateShareLinkInput = {
        job_id: jobId,
        share_mode: mode,
        recipient_label: label || undefined,
        expires_at: getExpiresAt(),
        photo_ids: photoIds,
        report_id: reportId,
      };
      const link = await createShareLink(input);
      setCreatedLink(link);
      onCreated?.(link);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || e.message || 'Failed to create share link');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!createdLink) return;
    const url = `${window.location.origin}/shared/${createdLink.token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCreatedLink(null);
    setCopied(false);
    setLabel('');
    setMode('gallery');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Link2 size={18} />
            {createdLink ? 'Link Created' : 'Share'}
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {createdLink ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate font-mono">
                  {window.location.origin}/shared/{createdLink.token}
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Share Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {SHARE_MODES.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        mode === m.value
                          ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{m.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Recipient Label</label>
                <input
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="e.g. John Smith, State Farm..."
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Expires</label>
                <div className="flex gap-1.5">
                  {[
                    { value: '1d', label: '1 day' },
                    { value: '7d', label: '7 days' },
                    { value: '30d', label: '30 days' },
                    { value: 'never', label: 'Never' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setExpiresIn(opt.value)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        expiresIn === opt.value
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Link2 size={14} />
                {creating ? 'Creating...' : 'Create Share Link'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
