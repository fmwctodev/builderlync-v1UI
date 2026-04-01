import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Plus, Trash2, GripVertical, FileText,
  Save, CheckCircle, RefreshCw, ImagePlus, X, ExternalLink,
  ChevronDown, ChevronUp
} from 'lucide-react';
import {
  fetchReportById,
  createReport,
  updateReport,
  upsertReportSection,
  deleteReportSection,
  addMediaToReportSection,
  updateReportMediaCaption,
  removeMediaFromSection,
  fetchJobMediaByJob,
  fetchTemplates,
} from '../services/jobCamApi';
import { getJobs, Job } from '../../../shared/store/services/jobsApi';
import type {
  JobReport, JobReportSection, JobPhoto, JobCamTemplate, ReportType
} from '../types/jobCam';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'inspection', label: 'Inspection Report' },
  { value: 'progress', label: 'Progress Report' },
  { value: 'completion', label: 'Completion Report' },
  { value: 'claim', label: 'Claim Evidence Report' },
  { value: 'custom', label: 'Custom Report' },
];

const DEFAULT_SECTIONS: Record<ReportType, string[]> = {
  inspection: ['Cover & Property Info', 'Inspection Findings', 'Damage Documentation', 'Recommendations'],
  progress: ['Project Overview', 'Current Progress', 'Work Completed', 'Next Steps'],
  completion: ['Project Summary', 'Before Photos', 'After Photos', 'Final Inspection'],
  claim: ['Claim Overview', 'Damage Evidence', 'Before & After', 'Supporting Documentation'],
  custom: ['Section 1'],
};

interface MediaPickerProps {
  jobId: number | null;
  sectionId: string;
  reportId: string;
  onAdd: () => void;
  onClose: () => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ jobId, sectionId, reportId, onAdd, onClose }) => {
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = jobId ? await fetchJobMediaByJob(jobId) : [];
        setPhotos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setAdding(true);
    try {
      await addMediaToReportSection(reportId, sectionId, Array.from(selected));
      onAdd();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add Photos to Section</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No photos available for this job</div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {photos.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => toggle(photo.id)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selected.has(photo.id)
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={photo.thumbnail_url ?? photo.file_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {selected.has(photo.id) && (
                    <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                      <CheckCircle className="text-primary-500 drop-shadow" size={20} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-500">{selected.size} selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selected.size === 0 || adding}
              className="text-sm px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {adding ? 'Adding...' : `Add ${selected.size > 0 ? selected.size : ''} photo${selected.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobCamReportBuilder: React.FC = () => {
  const { reportId } = useParams<{ reportId?: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedJobId = searchParams.get('jobId');

  const [report, setReport] = useState<JobReport | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [templates, setTemplates] = useState<JobCamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaPickerSection, setMediaPickerSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const [newReportForm, setNewReportForm] = useState({
    job_id: preselectedJobId ? Number(preselectedJobId) : ('' as number | ''),
    report_type: 'inspection' as ReportType,
    title: '',
    template_id: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsData, reportTemplates] = await Promise.all([
        getJobs(1, 200),
        fetchTemplates('report'),
      ]);
      setJobs(jobsData.data.data ?? []);
      setTemplates(reportTemplates);

      if (reportId && reportId !== 'new') {
        const existing = await fetchReportById(reportId);
        setReport(existing);
        if (existing?.sections) {
          setExpandedSections(new Set(existing.sections.map(s => s.id)));
        }
      }
    } catch (e) {
      console.error('Error loading report builder:', e);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newReportForm.title.trim()) return;
    setSaving(true);
    try {
      const created = await createReport({
        job_id: newReportForm.job_id !== '' ? Number(newReportForm.job_id) : undefined,
        report_type: newReportForm.report_type,
        title: newReportForm.title,
        template_id: newReportForm.template_id || undefined,
      });

      const defaultSections = DEFAULT_SECTIONS[newReportForm.report_type];
      for (let i = 0; i < defaultSections.length; i++) {
        await upsertReportSection({
          job_report_id: created.id,
          title: defaultSections[i],
          sort_order: i,
        });
      }

      navigate(`../reports/${created.id}`, { replace: true });
    } catch (e) {
      console.error('Error creating report:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReport = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updated = await updateReport(report.id, {
        title: report.title,
        cover_notes: report.cover_notes ?? undefined,
        status: report.status,
      });
      setReport(prev => prev ? { ...prev, ...updated } : prev);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updated = await updateReport(report.id, { status: 'final' });
      setReport(prev => prev ? { ...prev, ...updated } : prev);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!report) return;
    const sortOrder = report.sections?.length ?? 0;
    try {
      const section = await upsertReportSection({
        job_report_id: report.id,
        title: 'New Section',
        sort_order: sortOrder,
      });
      setReport(prev => prev ? { ...prev, sections: [...(prev.sections ?? []), { ...section, media: [] }] } : prev);
      setExpandedSections(prev => new Set([...prev, section.id]));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteReportSection(sectionId);
      setReport(prev => prev ? { ...prev, sections: (prev.sections ?? []).filter(s => s.id !== sectionId) } : prev);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSectionTitleChange = async (section: JobReportSection, title: string) => {
    setReport(prev => prev ? {
      ...prev,
      sections: (prev.sections ?? []).map(s => s.id === section.id ? { ...s, title } : s)
    } : prev);
  };

  const handleSectionTitleBlur = async (section: JobReportSection) => {
    try {
      await upsertReportSection({ ...section, job_report_id: section.job_report_id });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCaptionChange = async (mediaId: string, caption: string) => {
    setReport(prev => prev ? {
      ...prev,
      sections: (prev.sections ?? []).map(s => ({
        ...s,
        media: (s.media ?? []).map(m => m.id === mediaId ? { ...m, caption } : m)
      }))
    } : prev);
  };

  const handleCaptionBlur = async (mediaId: string, caption: string) => {
    try {
      await updateReportMediaCaption(mediaId, caption);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    try {
      await removeMediaFromSection(mediaId);
      setReport(prev => prev ? {
        ...prev,
        sections: (prev.sections ?? []).map(s => ({
          ...s,
          media: (s.media ?? []).filter(m => m.id !== mediaId)
        }))
      } : prev);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={22} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (!report && (reportId === 'new' || !reportId)) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Report</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Report Title *</label>
            <input
              type="text"
              value={newReportForm.title}
              onChange={e => setNewReportForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Inspection Report - 123 Main St"
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Report Type</label>
            <select
              value={newReportForm.report_type}
              onChange={e => setNewReportForm(f => ({ ...f, report_type: e.target.value as ReportType }))}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
            >
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Linked Job</label>
            <select
              value={newReportForm.job_id}
              onChange={e => setNewReportForm(f => ({ ...f, job_id: e.target.value ? Number(e.target.value) : '' }))}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">No job linked</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
          </div>

          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Template (optional)</label>
              <select
                value={newReportForm.template_id}
                onChange={e => setNewReportForm(f => ({ ...f, template_id: e.target.value }))}
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="">Use default sections</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!newReportForm.title.trim() || saving}
            className="w-full py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Report'}
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return <div className="p-6 text-center text-gray-500">Report not found</div>;
  }

  const linkedJob = jobs.find(j => j.id === report.job_id);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={report.title}
              onChange={e => setReport(prev => prev ? { ...prev, title: e.target.value } : prev)}
              onBlur={handleSaveReport}
              className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {REPORT_TYPES.find(t => t.value === report.report_type)?.label}
              {linkedJob ? ` · ${linkedJob.name}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              report.status === 'final'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
            }`}>
              {report.status === 'final' ? 'Final' : 'Draft'}
            </span>
            <button
              onClick={handleSaveReport}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            {report.status === 'draft' && (
              <button
                onClick={handleFinalize}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={14} />
                Finalize
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Cover Notes</h3>
            <textarea
              value={report.cover_notes ?? ''}
              onChange={e => setReport(prev => prev ? { ...prev, cover_notes: e.target.value } : prev)}
              onBlur={handleSaveReport}
              placeholder="Add notes about this report..."
              rows={3}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {(report.sections ?? []).map(section => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                  <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />
                  <input
                    type="text"
                    value={section.title}
                    onChange={e => handleSectionTitleChange(section, e.target.value)}
                    onBlur={() => handleSectionTitleBlur(section)}
                    className="flex-1 text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none"
                  />
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setMediaPickerSection(section.id)}
                      className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200 px-2 py-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                      <ImagePlus size={13} />
                      Add photos
                    </button>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4">
                    <textarea
                      value={section.summary_text ?? ''}
                      onChange={e => setReport(prev => prev ? {
                        ...prev,
                        sections: (prev.sections ?? []).map(s => s.id === section.id ? { ...s, summary_text: e.target.value } : s)
                      } : prev)}
                      onBlur={() => handleSectionTitleBlur(section)}
                      placeholder="Section summary or findings..."
                      rows={2}
                      className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 resize-none focus:outline-none mb-4"
                    />

                    {(section.media ?? []).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(section.media ?? []).map(media => (
                          <div key={media.id} className="group relative">
                            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                              {media.photo && (
                                <img
                                  src={media.photo.thumbnail_url ?? media.photo.file_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveMedia(media.id)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                            <input
                              type="text"
                              value={media.caption ?? ''}
                              onChange={e => handleCaptionChange(media.id, e.target.value)}
                              onBlur={e => handleCaptionBlur(media.id, e.target.value)}
                              placeholder="Add caption..."
                              className="mt-1.5 w-full text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => setMediaPickerSection(section.id)}
                          className="aspect-video border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                        >
                          <ImagePlus size={20} />
                          <span className="text-xs mt-1">Add more</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMediaPickerSection(section.id)}
                        className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                      >
                        <ImagePlus size={24} />
                        <span className="text-sm mt-2">Click to add photos</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={handleAddSection}
            className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-300 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>
      </div>

      {mediaPickerSection && (
        <MediaPicker
          jobId={report.job_id}
          sectionId={mediaPickerSection}
          reportId={report.id}
          onAdd={load}
          onClose={() => setMediaPickerSection(null)}
        />
      )}
    </div>
  );

  function toggleSection(id: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
};

export default JobCamReportBuilder;
