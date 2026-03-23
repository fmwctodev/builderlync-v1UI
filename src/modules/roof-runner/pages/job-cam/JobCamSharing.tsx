import React, { useEffect, useState, useCallback } from 'react';
import {
  Link, Plus, Copy, Check, Trash2, Eye, RefreshCw,
  Clock, ExternalLink, Shield, Users, AlertTriangle
} from 'lucide-react';
import {
  fetchShareLinks,
  createShareLink,
  revokeShareLink,
} from '../../services/jobCamApi';
import { getJobs, Job } from '../../../../shared/store/services/jobsApi';
import type { JobMediaShareLink, ShareMode, CreateShareLinkInput } from '../../types/jobCam';
import { format, formatDistanceToNow, isPast } from 'date-fns';

const shareModeConfig: Record<ShareMode, { label: string; color: string; description: string }> = {
  customer: {
    label: 'Customer',
    color: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    description: 'Share approved photos with the homeowner',
  },
  claim: {
    label: 'Insurance Claim',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    description: 'Share claim-relevant documentation with adjuster',
  },
  internal: {
    label: 'Internal',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    description: 'Share with team members or subcontractors',
  },
};

interface CreateLinkModalProps {
  jobs: Job[];
  onClose: () => void;
  onCreated: (link: JobMediaShareLink) => void;
}

const CreateLinkModal: React.FC<CreateLinkModalProps> = ({ jobs, onClose, onCreated }) => {
  const [form, setForm] = useState<CreateShareLinkInput>({
    share_mode: 'customer',
    recipient_label: '',
    expires_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [jobId, setJobId] = useState<number | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const input: CreateShareLinkInput = {
        ...form,
        job_id: jobId !== '' ? Number(jobId) : undefined,
        expires_at: form.expires_at || undefined,
        recipient_label: form.recipient_label || undefined,
      };
      const link = await createShareLink(input);
      onCreated(link);
    } catch (err) {
      console.error('Failed to create share link:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Create Share Link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Share Mode <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {(Object.entries(shareModeConfig) as [ShareMode, typeof shareModeConfig[ShareMode]][]).map(([mode, cfg]) => (
                <label
                  key={mode}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    form.share_mode === mode
                      ? 'border-gray-900 dark:border-white'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="share_mode"
                    value={mode}
                    checked={form.share_mode === mode}
                    onChange={() => setForm(f => ({ ...f, share_mode: mode }))}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cfg.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cfg.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Linked Job (optional)
            </label>
            <select
              value={jobId}
              onChange={e => setJobId(e.target.value !== '' ? Number(e.target.value) : '')}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">No specific job</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recipient Label (optional)
            </label>
            <input
              type="text"
              value={form.recipient_label}
              onChange={e => setForm(f => ({ ...f, recipient_label: e.target.value }))}
              placeholder="e.g. John Smith (Homeowner)"
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiry Date (optional)
            </label>
            <input
              type="datetime-local"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Link'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title="Copy link"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
};

const JobCamSharing: React.FC = () => {
  const [links, setLinks] = useState<JobMediaShareLink[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filterMode, setFilterMode] = useState<ShareMode | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [linksData, jobsData] = await Promise.all([
        fetchShareLinks(),
        getJobs(1, 100),
      ]);
      setLinks(linksData);
      setJobs(jobsData.jobs ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this share link? Recipients will no longer be able to access it.')) return;
    try {
      await revokeShareLink(id);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, is_revoked: true } : l));
    } catch (e) {
      console.error(e);
    }
  };

  const getJobName = (jobId: number | null) => {
    if (!jobId) return null;
    return jobs.find(j => j.id === jobId)?.name ?? `Job #${jobId}`;
  };

  const getShareUrl = (token: string) => `${window.location.origin}/share/${token}`;

  const filteredLinks = filterMode === 'all' ? links : links.filter(l => l.share_mode === filterMode);

  const activeLinks = links.filter(l => !l.is_revoked && (!l.expires_at || !isPast(new Date(l.expires_at))));
  const revokedLinks = links.filter(l => l.is_revoked);
  const expiredLinks = links.filter(l => !l.is_revoked && l.expires_at && isPast(new Date(l.expires_at)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={26} className="text-gray-700 dark:text-gray-300" />
            Sharing & Access
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage secure links for sharing job media with customers, adjusters, and team members
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus size={16} />
          New Share Link
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Links', value: activeLinks.length, icon: Link, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Total Views', value: links.reduce((sum, l) => sum + l.access_count, 0), icon: Eye, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          { label: 'Revoked', value: revokedLinks.length + expiredLinks.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
            <div className={`${stat.bg} rounded-xl p-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={17} className="text-gray-500" />
            Share Links
          </h2>
          <div className="flex gap-2">
            {(['all', 'customer', 'claim', 'internal'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors capitalize ${
                  filterMode === mode
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {mode === 'all' ? 'All' : shareModeConfig[mode].label}
              </button>
            ))}
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="py-16 text-center">
            <Link size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No share links yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-gray-700 dark:text-gray-300 underline"
            >
              Create your first link
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filteredLinks.map(link => {
              const isExpired = link.expires_at && isPast(new Date(link.expires_at));
              const isActive = !link.is_revoked && !isExpired;
              const shareUrl = getShareUrl(link.token);
              const jobName = getJobName(link.job_id);

              return (
                <div key={link.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${shareModeConfig[link.share_mode].color}`}>
                          {shareModeConfig[link.share_mode].label}
                        </span>
                        {!isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {link.is_revoked ? 'Revoked' : 'Expired'}
                          </span>
                        )}
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Active
                          </span>
                        )}
                      </div>

                      {link.recipient_label && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{link.recipient_label}</p>
                      )}
                      {jobName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{jobName}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded truncate max-w-xs">
                          {shareUrl}
                        </code>
                        {isActive && <CopyButton text={shareUrl} />}
                        {isActive && (
                          <a
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye size={11} />
                          {link.access_count} views
                        </span>
                        {link.last_accessed_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            Last viewed {formatDistanceToNow(new Date(link.last_accessed_at), { addSuffix: true })}
                          </span>
                        )}
                        {link.expires_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {isExpired
                              ? `Expired ${format(new Date(link.expires_at), 'MMM d, yyyy')}`
                              : `Expires ${format(new Date(link.expires_at), 'MMM d, yyyy')}`}
                          </span>
                        )}
                        <span>Created {format(new Date(link.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleRevoke(link.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={12} />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-200 mb-2 flex items-center gap-2">
          <Shield size={15} />
          Access Security
        </h3>
        <ul className="space-y-1 text-sm text-primary-800 dark:text-primary-300">
          <li>Links use unique tokens and cannot be guessed</li>
          <li>Revoked links immediately stop working</li>
          <li>Expired links are automatically deactivated</li>
          <li>Each view is logged with timestamp</li>
        </ul>
      </div>

      {showCreate && (
        <CreateLinkModal
          jobs={jobs}
          onClose={() => setShowCreate(false)}
          onCreated={link => {
            setLinks(prev => [link, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
};

export default JobCamSharing;
