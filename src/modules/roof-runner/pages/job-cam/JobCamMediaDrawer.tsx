import React, { useEffect, useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Check, AlertTriangle,
  Star, Shield, Briefcase, FileText, Tag,
  History, Download, ZoomIn, RefreshCw
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
  before: 'bg-primary-100 text-primary-700',
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
    <div className="fixed inset-0 z-[60] flex animate-in fade-in duration-300">
      <div className="flex-1 bg-black/60 backdrop-blur-sm shadow-inner cursor-pointer" onClick={onClose} />

      <div className="w-[520px] bg-white dark:bg-gray-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            {onPrev && (
              <button 
                onClick={onPrev} 
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-500 hover:text-primary-600 transition-all hover:shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {onNext && (
              <button 
                onClick={onNext} 
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-500 hover:text-primary-600 transition-all hover:shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photo.file_url}
              download={photo.file_name}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-primary-600 transition-all"
            >
              <Download size={18} />
            </a>
            <a
              href={photo.file_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-primary-600 transition-all"
            >
              <ZoomIn size={18} />
            </a>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 hover:text-red-500 transition-all ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative bg-gray-900 flex-shrink-0 shadow-inner group" style={{ height: '300px' }}>
          <img
            src={photo.file_url}
            alt={photo.description ?? photo.file_name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {photo.is_claim_relevant && (
              <span className="flex items-center gap-2 text-[10px] bg-orange-500 text-white px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm">
                <Briefcase size={12} /> Claim
              </span>
            )}
            {photo.is_customer_shareable && (
              <span className="flex items-center gap-2 text-[10px] bg-primary-500 text-white px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm">
                <Shield size={12} /> Shareable
              </span>
            )}
            {photo.is_marketing_approved && (
              <span className="flex items-center gap-2 text-[10px] bg-green-500 text-white px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm">
                <Star size={12} /> Marketing
              </span>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
          {(['details', 'audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'details' ? 'Details & Metadata' : 'Audit History'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                    <FileText size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1.5">Captured On</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {format(new Date(photo.capture_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm ${
                    editing 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600 hover:border-primary-500'
                  }`}
                >
                  {saving ? 'Syncing...' : editing ? 'Save Changes' : 'Update Info'}
                </button>
              </div>

              {editing ? (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Photo Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner"
                      placeholder="Add a detailed description for this photo..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Search Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {form.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-2 text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-xl font-bold border border-primary-100 dark:border-primary-800">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Type and press Enter..."
                        className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner"
                      />
                      <button onClick={addTag} className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 uppercase tracking-widest border border-gray-200 dark:border-gray-600">
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                      <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map(c => (
                          <button
                            key={c}
                            onClick={() => setForm(f => ({ ...f, category: f.category === c ? null : c }))}
                            className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${
                              form.category === c 
                                ? (categoryColors[c] ?? 'bg-primary-600 text-white border-primary-600 shadow-md') 
                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600 hover:border-primary-400'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Work Phase</label>
                      <select
                        value={form.phase ?? ''}
                        onChange={e => setForm(f => ({ ...f, phase: (e.target.value as PhotoPhase) || null }))}
                        className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none font-bold shadow-inner"
                      >
                        <option value="">No phase selected</option>
                        {PHASES.map(p => <option key={p} value={p}>{phaseLabel[p]}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Review & Status</label>
                    <div className="flex gap-3">
                      {[
                        { value: 'approved' as ReviewStatus, label: 'Approved', icon: Check, color: 'bg-green-50 text-green-700 border-green-200 ring-green-100' },
                        { value: 'rejected' as ReviewStatus, label: 'Rejected', icon: AlertTriangle, color: 'bg-red-50 text-red-700 border-red-200 ring-red-100' },
                      ].map(s => (
                        <button
                          key={s.value}
                          onClick={() => toggleReviewStatus(s.value)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold uppercase tracking-widest border-2 transition-all ${
                            form.review_status === s.value
                              ? `${s.color} ring-4`
                              : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <s.icon size={16} />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Data Flags</label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 grid grid-cols-1 gap-4 shadow-inner">
                      {[
                        { key: 'is_claim_relevant' as const, label: 'Claim Documentation', icon: Briefcase, color: 'text-orange-600' },
                        { key: 'is_customer_shareable' as const, label: 'Ready for Customer Portal', icon: Shield, color: 'text-primary-600' },
                        { key: 'is_marketing_approved' as const, label: 'Marketing Approved Asset', icon: Star, color: 'text-green-600' },
                      ].map(flag => (
                        <label key={flag.key} className="flex items-center gap-4 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={form[flag.key]}
                              onChange={e => setForm(f => ({ ...f, [flag.key]: e.target.checked }))}
                              className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                            />
                          </div>
                          <flag.icon size={18} className={`${flag.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 transition-colors">{flag.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-3 text-sm font-bold bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 uppercase tracking-widest"
                    >
                      {saving ? 'Processing...' : 'Apply Changes'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 text-sm font-bold text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {photo.description && (
                    <div className="bg-gray-50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MessageSquare size={12} className="text-primary-500" /> Description
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed italic">"{photo.description}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-md transition-all">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Tag size={12} className="text-primary-500" /> Category
                      </p>
                      {photo.category ? (
                        <span className={`text-xs px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest inline-block shadow-sm ${categoryColors[photo.category]}`}>
                          {photo.category}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No category assigned</span>
                      )}
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-md transition-all">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock size={12} className="text-primary-500" /> Phase
                      </p>
                      {photo.phase ? (
                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{phaseLabel[photo.phase]}</p>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No phase assigned</span>
                      )}
                    </div>
                  </div>

                  {photo.tags && photo.tags.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Tag size={12} className="text-primary-500" /> Search Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {photo.tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-xl font-bold border border-gray-200 dark:border-gray-600 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Shield size={12} className="text-primary-500" /> System Metrics
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Review Status</span>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm ${
                          photo.review_status === 'approved' ? 'bg-green-100 text-green-700' :
                          photo.review_status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {photo.review_status}
                        </span>
                      </div>
                      <div className="h-px bg-gray-50 dark:bg-gray-700" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Storage ID</span>
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[200px]">{photo.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              {auditLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw size={24} className="animate-spin text-primary-500" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hydrating History...</p>
                </div>
              ) : auditLog.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <History size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest font-mono">Clean Slate</p>
                    <p className="text-xs text-gray-400 mt-1">No modifications tracked yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                    {auditLog.map((entry, index) => (
                    <div key={entry.id} className="flex gap-4 relative group">
                        {index !== auditLog.length - 1 && (
                            <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-100 dark:bg-gray-700" />
                        )}
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0 z-10 group-hover:scale-110 transition-transform shadow-sm">
                        <History size={16} className="text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all">
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                                {entry.action.replace(/_/g, ' ')}
                            </p>
                            {entry.notes && <p className="text-xs text-gray-500 dark:text-gray-400 italic font-medium mt-1.5 border-l-2 border-primary-500 pl-3">"{entry.notes}"</p>}
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50 leading-none">
                                <span className="text-[10px] font-bold text-primary-500 uppercase">{entry.user_email?.split('@')[0] || 'System'}</span>
                                <span className="text-gray-300 dark:text-gray-600 font-bold">&bull;</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(entry.created_at), 'MMM d, h:mm a')}</span>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCamMediaDrawer;
