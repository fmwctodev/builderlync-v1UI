import React, { useEffect, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, AlertTriangle,
  Star, Shield, Briefcase, Tag,
  Clock, Trash2, Download, ZoomIn, History, RefreshCw
} from 'lucide-react';
import { updateJobPhoto, logAuditAction, fetchAuditLog, deleteJobPhoto } from '../services/jobCamApi';
import type { JobPhoto, JobMediaAuditLog, PhotoCategory, PhotoPhase, ReviewStatus } from '../types/jobCam';
import { format } from 'date-fns';

interface JobCamMediaDrawerProps {
  photo: JobPhoto;
  onClose: () => void;
  onUpdate: (updated: JobPhoto) => void;
  onDelete?: (id: string) => void;
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

const categoryColors: Partial<Record<PhotoCategory, string>> = {
  before: 'bg-primary-100 text-primary-700',
  during: 'bg-amber-100 text-amber-700',
  after: 'bg-green-100 text-green-700',
  damage: 'bg-red-100 text-red-700',
  inspection: 'bg-purple-100 text-purple-700',
  completion: 'bg-teal-100 text-teal-700',
  claim: 'bg-orange-100 text-orange-700',
};

const JobCamMediaDrawer: React.FC<JobCamMediaDrawerProps> = ({ photo, onClose, onUpdate, onDelete, onNext, onPrev }) => {
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
      review_status: photo.review_status ?? 'pending',
      is_claim_relevant: photo.is_claim_relevant ?? false,
      is_customer_shareable: photo.is_customer_shareable ?? false,
      is_marketing_approved: photo.is_marketing_approved ?? false,
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
      setForm((f: any) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((f: any) => ({ ...f, tags: f.tags.filter((t: string) => t !== tag) }));
  };

  const toggleReviewStatus = async (status: ReviewStatus) => {
    const nextStatus = form.review_status === status ? 'pending' : status;
    setForm(f => ({ ...f, review_status: nextStatus }));
    
    // Immediate save for review status
    setSaving(true);
    try {
      if (nextStatus !== photo.review_status) {
        await logAuditAction(photo.id, 'review_status_change', { review_status: photo.review_status }, { review_status: nextStatus });
        const updated = await updateJobPhoto(photo.id, { review_status: nextStatus });
        onUpdate(updated);
      }
    } catch (e) {
      console.error('Review update failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this media?')) return;
    setSaving(true);
    try {
      await deleteJobPhoto(photo.id);
      onDelete?.(photo.id);
      onClose();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed:', e);
      // Fallback
      window.open(photo.file_url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="flex-1 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="w-[500px] bg-white dark:bg-gray-800 h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-1.5">
            <button onClick={onPrev} disabled={!onPrev} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button onClick={onNext} disabled={!onNext} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 disabled:opacity-30 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              title="Download Original"
            >
              <Download size={18} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative bg-gray-900 aspect-video flex-shrink-0 group overflow-hidden">
          <img
            src={photo.file_url}
            alt={photo.description ?? photo.file_name}
            className="w-full h-full object-contain shadow-inner"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {photo.is_claim_relevant && (
              <span className="flex items-center gap-1.5 text-[10px] bg-orange-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-md border border-white/20">
                <Briefcase size={12} /> Claim
              </span>
            )}
            {photo.is_customer_shareable && (
              <span className="flex items-center gap-1.5 text-[10px] bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-md border border-white/20">
                <Shield size={12} /> External
              </span>
            )}
            {photo.is_marketing_approved && (
              <span className="flex items-center gap-1.5 text-[10px] bg-green-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-md border border-white/20">
                <Star size={12} /> Marketing
              </span>
            )}
          </div>
          <a
              href={photo.file_url}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-3 right-3 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            >
              <ZoomIn size={18} />
            </a>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          {(['details', 'audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'border-b-2 border-primary-600 text-primary-600 bg-white dark:bg-gray-800'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'details' ? 'Media Data' : 'Review Trail'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Captured</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {format(new Date(photo.capture_date), 'MMMM d, yyyy @ h:mm a')}
                  </p>
                </div>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-sm ${
                    editing 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {saving ? 'Syncing...' : editing ? 'Done' : 'Update'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={11}/> Caption / Note</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      placeholder="Add a capture note..."
                      className="w-full text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all border-dashed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Tag size={11}/> Tags</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-bold border border-primary-100 dark:border-primary-800">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-primary-900 transition-colors"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Tag this photo..."
                        className="flex-1 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                      <button onClick={addTag} className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-md">
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                      <select
                        value={form.category ?? ''}
                        onChange={e => setForm(f => ({ ...f, category: (e.target.value as PhotoCategory) || null }))}
                        className="w-full text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="">No Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Phase</label>
                      <select
                        value={form.phase ?? ''}
                        onChange={e => setForm(f => ({ ...f, phase: (e.target.value as PhotoPhase) || null }))}
                        className="w-full text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="">N/A</option>
                        {PHASES.map(p => <option key={p} value={p}>{phaseLabel[p]}</option>)}
                      </select>
                    </div>
                  </div>

                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Inspection Review</label>
                    <div className="flex gap-3">
                      {([
                        { value: 'approved' as ReviewStatus, label: 'Approve', icon: Check, color: 'bg-green-100 text-green-700 border-green-300' },
                        { value: 'rejected' as ReviewStatus, label: 'Reject', icon: AlertTriangle, color: 'bg-red-100 text-red-700 border-red-300' },
                      ]).map(s => (
                        <button
                          key={s.value}
                          onClick={() => toggleReviewStatus(s.value)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-wider border-2 transition-all text-xs ${
                            form.review_status === s.value
                              ? s.color
                              : 'border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-gray-600'
                          }`}
                        >
                          <s.icon size={14} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Intelligence Flags</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { key: 'is_claim_relevant' as const, label: 'Add to Claim History', icon: Briefcase, color: 'text-orange-600' },
                        { key: 'is_customer_shareable' as const, label: 'Include in Customer Files', icon: Shield, color: 'text-primary-600' },
                        { key: 'is_marketing_approved' as const, label: 'Approve for Web/Social', icon: Star, color: 'text-green-600' },
                      ].map(flag => (
                        <label key={flag.key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                          <div className="flex items-center gap-3">
                            <flag.icon size={16} className={flag.color} />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{flag.label}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={form[flag.key]}
                            onChange={e => setForm(f => ({ ...f, [flag.key]: e.target.checked }))}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-inner">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed italic">
                      {photo.description || "No description provided."}
                    </p>
                  </div>

                  {photo.tags && photo.tags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metadata Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {photo.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Categorization</p>
                      {photo.category ? (
                         <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md shadow-sm border border-black/5 ${categoryColors[photo.category]}`}>
                            {photo.category}
                        </span>
                      ) : <span className="text-xs text-gray-300 italic">None</span>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Review Status</p>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md shadow-sm border border-black/5 ${
                        photo.review_status === 'approved' ? 'bg-green-50 text-green-700' :
                        photo.review_status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {photo.review_status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Media Intelligence Flags</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'is_claim_relevant' as const, label: 'Claim', icon: Briefcase, active: photo.is_claim_relevant, color: 'text-orange-500', bg: 'bg-orange-50' },
                        { key: 'is_customer_shareable' as const, label: 'Public', icon: Shield, active: photo.is_customer_shareable, color: 'text-primary-500', bg: 'bg-primary-50' },
                        { key: 'is_marketing_approved' as const, label: 'Marketing', icon: Star, active: photo.is_marketing_approved, color: 'text-green-500', bg: 'bg-green-50' },
                      ].map(flag => (
                        <div key={flag.key} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${flag.active ? `${flag.bg} border-transparent shadow-sm scale-105` : 'border-gray-100 dark:border-gray-800 opacity-30 grayscale'}`}>
                          <flag.icon size={20} className={flag.active ? flag.color : 'text-gray-400'} />
                          <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${flag.active ? flag.color : 'text-gray-400'}`}>{flag.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {photo.office_notes && (
                    <div className="p-4 rounded-xl bg-primary-900/10 border border-primary-200 dark:border-primary-900/30">
                      <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">Internal Office Note</p>
                      <p className="text-sm font-semibold text-primary-900 dark:text-primary-100 leading-relaxed italic">{photo.office_notes}</p>
                    </div>
                  )}
                  
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-inner space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">File Details</span>
                        <span className="text-[10px] font-bold text-gray-400">#PHOTO-{photo.id.split('-')[0].toUpperCase()}</span>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex justify-between">Dimensions <span>{photo.width || '?' } x {photo.height || '?'}</span></p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex justify-between">Filesize <span>{photo.file_size ? (photo.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown'}</span></p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex justify-between">Mime Type <span className="uppercase">{photo.mime_type?.split('/')[1] || 'Unknown'}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-5 animate-in slide-in-from-bottom duration-500">
              {auditLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <RefreshCw size={24} className="animate-spin text-primary-600" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching review history...</p>
                </div>
              ) : auditLog.length === 0 ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                        <History size={24} className="text-gray-200" />
                   </div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No review activity recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                    {auditLog.map((entry, idx) => (
                    <div key={entry.id} className="relative flex gap-4 pr-2">
                        {idx !== auditLog.length - 1 && (
                            <div className="absolute left-3 top-6 bottom-[-20px] w-0.5 bg-gray-100 dark:bg-gray-800" />
                        )}
                        <div className="w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 z-10 border border-primary-100 dark:border-primary-800">
                           <Check size={10} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="space-y-1 pb-4">
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                {entry.action.replace(/_/g, ' ')}
                            </p>
                            {entry.notes && <p className="text-xs font-medium text-gray-500 italic leading-relaxed py-1 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-2 border-primary-400">{entry.notes}</p>}
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 pt-0.5">
                                <Clock size={10}/> {format(new Date(entry.created_at), 'MMM d, yyyy @ h:mm a')}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
             <button
               onClick={handleDelete}
               disabled={saving}
               className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all font-bold uppercase tracking-widest text-xs disabled:opacity-50"
             >
                <Trash2 size={16} />
                {saving ? 'Deleting...' : 'Delete Media'}
             </button>
        </div>
      </div>
    </div>
  );
};

export default JobCamMediaDrawer;
