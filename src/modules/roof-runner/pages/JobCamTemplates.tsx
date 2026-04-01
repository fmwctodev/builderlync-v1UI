import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, CreditCard as Edit2, Copy, Archive, Trash2, ChevronDown, ChevronUp, CheckSquare, FileText, Settings, RefreshCw, X, GripVertical, Save } from 'lucide-react';
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  upsertTemplateItems,
} from '../services/jobCamApi';
import type {
  JobCamTemplate, JobCamTemplateItem, TemplateType, PhotoCategory, PhotoPhase
} from '../types/jobCam';

const TAB_CONFIG: { value: TemplateType; label: string; icon: React.ElementType }[] = [
  { value: 'shotlist', label: 'Shot List Templates', icon: CheckSquare },
  { value: 'report', label: 'Report Templates', icon: FileText },
  { value: 'job_preset', label: 'Job Presets', icon: Settings },
];

const CATEGORIES: PhotoCategory[] = ['before', 'during', 'after', 'damage', 'inspection', 'completion', 'claim'];
const PHASES: PhotoPhase[] = ['pre_install', 'during_install', 'post_install', 'damage_assessment', 'claim'];

const phaseLabel: Record<PhotoPhase, string> = {
  pre_install: 'Pre-install',
  during_install: 'During install',
  post_install: 'Post-install',
  damage_assessment: 'Damage assessment',
  claim: 'Claim',
};

interface TemplateEditorProps {
  template: JobCamTemplate | null;
  type: TemplateType;
  onSave: (template: JobCamTemplate) => void;
  onCancel: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, type, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: template?.name ?? '',
    description: template?.description ?? '',
    service_type: template?.service_type ?? '',
    job_type: template?.job_type ?? '',
    is_default: template?.is_default ?? false,
  });
  const [items, setItems] = useState<Partial<JobCamTemplateItem>[]>(
    template?.items ?? []
  );
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems(prev => [...prev, {
      name: '',
      description: '',
      category: null,
      phase: null,
      is_required: true,
      sort_order: prev.length,
    }]);
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, patch: Partial<JobCamTemplateItem>) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, ...patch } : item));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let saved: JobCamTemplate;
      if (template?.id) {
        saved = await updateTemplate(template.id, {
          name: form.name,
          description: form.description || null,
          service_type: form.service_type || null,
          job_type: form.job_type || null,
          is_default: form.is_default,
        });
        await upsertTemplateItems(template.id, items);
      } else {
        saved = await createTemplate({
          template_type: type,
          name: form.name,
          description: form.description || null,
          service_type: form.service_type || null,
          job_type: form.job_type || null,
          is_default: form.is_default,
          is_active: true,
        });
        await upsertTemplateItems(saved.id, items);
      }
      onSave(saved);
    } catch (e) {
      console.error('Error saving template:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="w-[560px] bg-white dark:bg-gray-800 h-full flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {template ? 'Edit Template' : 'New Template'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Template Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Residential Roof Inspection"
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="What is this template used for?"
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Service Type</label>
              <input
                value={form.service_type}
                onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                placeholder="e.g. Roofing"
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">Job Type</label>
              <input
                value={form.job_type}
                onChange={e => setForm(f => ({ ...f, job_type: e.target.value }))}
                placeholder="e.g. Insurance"
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Set as default template</span>
          </label>

          {(type === 'shotlist' || type === 'job_preset') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Required Shots</label>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800"
                >
                  <Plus size={13} />
                  Add shot
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                      <input
                        value={item.name ?? ''}
                        onChange={e => updateItem(idx, { name: e.target.value })}
                        placeholder="Shot name *"
                        className="flex-1 text-sm border-none bg-transparent text-gray-900 dark:text-white focus:outline-none font-medium"
                      />
                      <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                    <input
                      value={item.description ?? ''}
                      onChange={e => updateItem(idx, { description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full text-xs border border-gray-100 dark:border-gray-700 rounded px-2 py-1 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={item.category ?? ''}
                        onChange={e => updateItem(idx, { category: (e.target.value as PhotoCategory) || null })}
                        className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        <option value="">Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select
                        value={item.phase ?? ''}
                        onChange={e => updateItem(idx, { phase: (e.target.value as PhotoPhase) || null })}
                        className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none"
                      >
                        <option value="">Phase</option>
                        {PHASES.map(p => <option key={p} value={p}>{phaseLabel[p]}</option>)}
                      </select>
                      <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.is_required ?? true}
                          onChange={e => updateItem(idx, { is_required: e.target.checked })}
                          className="rounded"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <button
                    onClick={addItem}
                    className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add required shot
                  </button>
                )}
              </div>
            </div>
          )}

          {type === 'report' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Default Sections</label>
                <button onClick={addItem} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800">
                  <Plus size={13} />
                  Add section
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2">
                    <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                    <input
                      value={item.name ?? ''}
                      onChange={e => updateItem(idx, { name: e.target.value })}
                      placeholder="Section name"
                      className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    />
                    <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!form.name.trim() || saving}
            className="flex-1 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const JobCamTemplates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TemplateType>('shotlist');
  const [templates, setTemplates] = useState<JobCamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorTemplate, setEditorTemplate] = useState<JobCamTemplate | null | undefined>(undefined);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates(activeTab);
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (saved: JobCamTemplate) => {
    setEditorTemplate(undefined);
    load();
  };

  const handleDuplicate = async (template: JobCamTemplate) => {
    try {
      const created = await createTemplate({
        ...template,
        name: `${template.name} (Copy)`,
        is_default: false,
        id: undefined,
      });
      if (template.items && template.items.length > 0) {
        await upsertTemplateItems(created.id, template.items);
      }
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await deleteTemplate(id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Templates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage reusable shot lists, report structures, and job presets
          </p>
        </div>
        <button
          onClick={() => setEditorTemplate(null)}
          className="flex items-center gap-2 text-sm px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Plus size={15} />
          New Template
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw size={22} className="animate-spin text-gray-400" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <CheckSquare size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-medium text-gray-600 dark:text-gray-400">No {activeTab} templates yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Create your first template to standardize documentation.</p>
          <button
            onClick={() => setEditorTemplate(null)}
            className="text-sm px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(template => {
            const isExpanded = expandedIds.has(template.id);
            return (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                      {template.is_default && (
                        <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{template.description}</p>
                    )}
                    <div className="flex gap-3 mt-1">
                      {template.service_type && (
                        <span className="text-xs text-gray-400">{template.service_type}</span>
                      )}
                      {template.job_type && (
                        <span className="text-xs text-gray-400">{template.job_type}</span>
                      )}
                      {template.items && template.items.length > 0 && (
                        <span className="text-xs text-gray-400">{template.items.length} item{template.items.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setEditorTemplate(template)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => handleArchive(template.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Archive"
                    >
                      <Archive size={14} />
                    </button>
                    {template.items && template.items.length > 0 && (
                      <button
                        onClick={() => toggleExpand(template.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && template.items && template.items.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
                    {template.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-2.5">
                        <div className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{item.name}</p>
                        {item.category && (
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{item.category}</span>
                        )}
                        {item.is_required && (
                          <span className="text-xs text-red-500">Required</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editorTemplate !== undefined && (
        <TemplateEditor
          template={editorTemplate}
          type={activeTab}
          onSave={handleSave}
          onCancel={() => setEditorTemplate(undefined)}
        />
      )}
    </div>
  );
};

export default JobCamTemplates;
