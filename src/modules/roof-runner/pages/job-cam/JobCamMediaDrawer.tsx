import React, { useEffect, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, AlertTriangle,
  Star, Shield, Briefcase, FileText, Tag, MessageSquare,
  Clock, History, Trash2, Download, ZoomIn
} from 'lucide-react';
import { updateJobPhoto, logAuditAction, fetchAuditLog } from '../../services/jobCamApi';
import type { JobPhoto, JobMediaAuditLog, PhotoCategory, PhotoPhase, ReviewStatus } from '../../types/jobCam';
import { format } from 'date-fns';

interface Props {
  photo: JobPhoto;
  onClose: () => void;
  onUpdate: (updated: JobPhoto) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const CATEGORIES: PhotoCategory[] = ['before', 'during', 'after', 'damage', 'inspection', 'completion', 'claim'];
const PHASES: PhotoPhase[] = ['pre_install', 'during_install', 'post_install', 'damage_assessment', 'claim'];

const phaseLabel: Record<PhotoPhase, string> = {
  pre_install: 'Pre-install',
  during_install: 'During install',
  post_install: 'Post-install',
  damage_assessment: 'Damage assessment',
  claim: 'Claim',
};

const categoryColors: Record<PhotoCategory, string> = {
  before: 'bg-blue-100 text-blue-700',
  during: 'bg-amber-100 text-amber-700',
  after: 'bg-green-100 text-green-700',
  damage: 'bg-red-100 text-red-700',
  inspection: 'bg-purple-100 text-purple-700',
  completion: 'bg-teal-100 text-teal-700',
  claim: 'bg-orange-100 text-orange-700',
};

const JobCamMediaDrawer: React.FC<Props> = ({ photo, onClose, onUpdate, onNext, onPrev }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'audit'>('details');
  const [auditLog, setAuditLog] = useState<JobMediaAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    description: photo.description ?? '',
    tags: photo.tags ?? [],
    category: photo.category ?? null as PhotoCategory | null,
    phase: photo.phase ?? null as PhotoPhase | null,
    office_notes: photo.office_notes ?? '',
    review_status: photo.review_status as ReviewStatus,
    is_claim_relevant: photo.is_claim_relevant,
    is_customer_shareable: photo.is_customer_shareable,
    is_marketing_approved: photo.is_marketing_approved,
  });

  useEffect(() => {
    setForm({
      description: photo.description ?? '',
      tags: photo.tags ?? [],
      category: photo.category ?? null,
      phase: photo.phase ?? null,
      office_notes: photo.office_notes ?? '',
      review_status: photo.review_status,
      is_claim_relevant: photo.is_claim_relevant,
      is_customer_shareable: photo.is_customer_shareable,
      is_marketing_approved: photo.is_marketing_approved,
    });
  }, [photo]);

  const loadAudit = async () => {
    setAuditLoading(true);
    try {
      const log = await fetchAuditLog(photo.id);
      setAuditLog(log);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') loadAudit();
  }, [activeTab, photo.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const patch = {
        description: form.description || null,
        tags: form.tags.length > 0 ? form.tags : null,
        category: form.category,
        phase: form.phase,
        office_notes: form.office_notes || null,
        review_status: form.review_status,
        is_claim_relevant: form.is_claim_relevant,
        is_customer_shareable: form.is_customer_shareable,
        is_marketing_approved: form.is_marketing_approved,
      };

      if (form.review_status !== photo.review_status) {
        await logAuditAction(photo.id, 'review_status_change', { review_status: photo.review_status }, { review_status: form.review_status });
      }
      if (form.is_claim_relevant !== photo.is_claim_relevant ||
          form.is_customer_shareable !== photo.is_customer_shareable ||
          form.is_marketing_approved !== photo.is_marketing_approved) {
        await logAuditAction(photo.id, 'flag_change',
          { is_claim_relevant: photo.is_claim_relevant, is_customer_shareable: photo.is_customer_shareable, is_marketing_approved: photo.is_marketing_approved },
          { is_claim_relevant: form.is_claim_relevant, is_customer_shareable: form.is_customer_shareable, is_marketing_approved: form.is_marketing_approved }
        );
      }

      const updated = await updateJobPhoto(photo.id, patch);
      onUpdate(updated);
      setEditing(false);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const toggleReviewStatus = (status: ReviewStatus) => {
    setForm(f => ({ ...f, review_status: f.review_status === status ? 'pending' : status }));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="w-[520px] bg-white dark:bg-gray-800 h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {onPrev && (
              <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <ChevronLeft size={16} />
              </button>
            )}
            {onNext && (
              <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <ChevronRight size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photo.file_url}
              download={photo.file_name}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <Download size={16} />
            </a>
            <a
              href={photo.file_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <ZoomIn size={16} />
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative bg-gray-900 flex-shrink-0" style={{ height: '240px' }}>
          <img
            src={photo.file_url}
            alt={photo.description ?? photo.file_name}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            {photo.is_claim_relevant && (
              <span className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                <Briefcase size={10} /> Claim
              </span>
            )}
            {photo.is_customer_shareable && (
              <span className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                <Shield size={10} /> Shareable
              </span>
            )}
            {photo.is_marketing_approved && (
              <span className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                <Star size={10} /> Marketing
              </span>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          {(['details', 'audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'details' ? 'Details & Metadata' : 'Audit Log'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(photo.capture_date), 'MMM d, yyyy h:mm a')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{photo.file_name}</p>
                </div>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  {saving ? 'Saving...' : editing ? 'Save changes' : 'Edit'}
                </button>
              </div>

              {editing ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Tags</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                          {tag}
                          <button onClick={() => removeTag(tag)}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag..."
                        className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={addTag} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Category</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map(c => (
                        <button
                          key={c}
                          onClick={() => setForm(f => ({ ...f, category: f.category === c ? null : c }))}
                          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                            form.category === c ? (categoryColors[c] ?? 'bg-gray-200 text-gray-700') : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Phase</label>
                    <select
                      value={form.phase ?? ''}
                      onChange={e => setForm(f => ({ ...f, phase: (e.target.value as PhotoPhase) || null }))}
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                    >
                      <option value="">No phase</option>
                      {PHASES.map(p => <option key={p} value={p}>{phaseLabel[p]}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Office Notes</label>
                    <textarea
                      value={form.office_notes}
                      onChange={e => setForm(f => ({ ...f, office_notes: e.target.value }))}
                      rows={2}
                      placeholder="Internal notes..."
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Review Status</label>
                    <div className="flex gap-2">
                      {([
                        { value: 'approved' as ReviewStatus, label: 'Approve', icon: Check, color: 'bg-green-100 text-green-700 border-green-200' },
                        { value: 'rejected' as ReviewStatus, label: 'Reject', icon: AlertTriangle, color: 'bg-red-100 text-red-700 border-red-200' },
                      ]).map(s => (
                        <button
                          key={s.value}
                          onClick={() => toggleReviewStatus(s.value)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                            form.review_status === s.value
                              ? s.color
                              : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <s.icon size={12} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Flags</label>
                    <div className="space-y-2">
                      {[
                        { key: 'is_claim_relevant' as const, label: 'Claim Relevant', icon: Briefcase, color: 'text-orange-600' },
                        { key: 'is_customer_shareable' as const, label: 'Customer Shareable', icon: Shield, color: 'text-blue-600' },
                        { key: 'is_marketing_approved' as const, label: 'Marketing Approved', icon: Star, color: 'text-green-600' },
                      ].map(flag => (
                        <label key={flag.key} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form[flag.key]}
                            onChange={e => setForm(f => ({ ...f, [flag.key]: e.target.checked }))}
                            className="rounded"
                          />
                          <flag.icon size={14} className={flag.color} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{flag.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {photo.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{photo.description}</p>
                    </div>
                  )}

                  {photo.tags && photo.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5 flex items-center gap-1"><Tag size={11} /> Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {photo.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {photo.category && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Category</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[photo.category]}`}>
                          {photo.category}
                        </span>
                      </div>
                    )}
                    {photo.phase && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Phase</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{phaseLabel[photo.phase]}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Review</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        photo.review_status === 'approved' ? 'bg-green-100 text-green-700' :
                        photo.review_status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {photo.review_status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Flags</p>
                    <div className="flex gap-3">
                      <span className={`flex items-center gap-1 text-xs ${photo.is_claim_relevant ? 'text-orange-600' : 'text-gray-300 dark:text-gray-600'}`}>
                        <Briefcase size={13} /> Claim
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${photo.is_customer_shareable ? 'text-blue-600' : 'text-gray-300 dark:text-gray-600'}`}>
                        <Shield size={13} /> Shareable
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${photo.is_marketing_approved ? 'text-green-600' : 'text-gray-300 dark:text-gray-600'}`}>
                        <Star size={13} /> Marketing
                      </span>
                    </div>
                  </div>

                  {photo.office_notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Office Notes</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{photo.office_notes}</p>
                    </div>
                  )}

                  {photo.gps_latitude && photo.gps_longitude && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-1">GPS Location</p>
                      <p className="text-xs text-gray-500">{photo.gps_latitude.toFixed(5)}, {photo.gps_longitude.toFixed(5)}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              {auditLoading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading audit log...</div>
              ) : auditLog.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No audit history yet</div>
              ) : (
                auditLog.map(entry => (
                  <div key={entry.id} className="flex gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <History size={12} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                        {entry.action.replace(/_/g, ' ')}
                      </p>
                      {entry.notes && <p className="text-gray-500 text-xs mt-0.5">{entry.notes}</p>}
                      <p className="text-gray-400 text-xs mt-0.5">
                        {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCamMediaDrawer;
