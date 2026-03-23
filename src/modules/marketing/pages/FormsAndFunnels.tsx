import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, TrendingUp, Users, Eye, Copy, ExternalLink, BarChart2, Loader2, FileText, Search, Clock, List, MoreVertical, CreditCard as Edit, Trash2, FolderPlus, Code, Check, X, CreditCard as Edit2, Folder } from 'lucide-react';
import type { MarketingFunnel } from '../types/marketing';
import type { MarketingForm, FormFolder } from '../types/forms';
import { funnelsApi } from '../services/funnelsApi';
import { formsApi } from '../services/formsApi';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { useMarketingToast } from '../hooks/useMarketingToast';
import { MarketingToastContainer } from '../components/MarketingToastContainer';
import { CreateFormModal } from '../components/CreateFormModal';
import { EmbedCodeModal } from '../components/EmbedCodeModal';
import { FormsAnalyzeTab } from './FormsAnalyzeTab';
import { FormsSubmissionsTab } from './FormsSubmissionsTab';

const FUNNEL_TEMPLATES = [
  {
    id: 't1',
    name: 'Storm Response Funnel',
    description: 'Emergency tarp + inspection offer. Best for post-storm surge.',
    expectedCPL: '$22',
    closeRate: '38%',
    category: 'storm',
    funnel_type: 'storm_response',
    headline: 'Storm Damage? We Respond in 24 Hours',
    offer: 'Free storm damage inspection',
  },
  {
    id: 't2',
    name: 'Free Inspection Funnel',
    description: 'Classic free roof inspection offer. Works year-round.',
    expectedCPL: '$45',
    closeRate: '28%',
    category: 'inspection',
    funnel_type: 'free_inspection',
    headline: 'Get a Free Roof Inspection Today',
    offer: 'Free inspection with no obligation',
  },
  {
    id: 't3',
    name: 'Insurance Claim Funnel',
    description: 'Designed for homeowners with hail or wind damage claims.',
    expectedCPL: '$38',
    closeRate: '42%',
    category: 'insurance',
    funnel_type: 'insurance_claim',
    headline: 'We Handle Your Insurance Claim Start to Finish',
    offer: 'Free damage assessment + claim assistance',
  },
  {
    id: 't4',
    name: 'Financing Offer Funnel',
    description: '0% financing for 18 months. Targets price-sensitive leads.',
    expectedCPL: '$52',
    closeRate: '22%',
    category: 'financing',
    funnel_type: 'financing',
    headline: '0% Financing for 18 Months on Any Roof',
    offer: '0% APR financing available',
  },
  {
    id: 't5',
    name: 'Senior Homeowner Funnel',
    description: 'Senior discount + easy scheduling for 55+ homeowners.',
    expectedCPL: '$41',
    closeRate: '31%',
    category: 'demographic',
    funnel_type: 'senior_discount',
    headline: 'Senior Homeowner Special — Save 10%',
    offer: '10% senior discount on all services',
  },
  {
    id: 't6',
    name: 'Commercial Roofing Funnel',
    description: 'B2B targeted. Property managers and commercial owners.',
    expectedCPL: '$88',
    closeRate: '18%',
    category: 'commercial',
    funnel_type: 'commercial',
    headline: 'Commercial Roofing — On Time, On Budget',
    offer: 'Free commercial roof assessment',
  },
];

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const FunnelCard: React.FC<{ funnel: MarketingFunnel }> = ({ funnel }) => {
  const conversionRate =
    funnel.submissions > 0
      ? ((funnel.appointments_booked / funnel.submissions) * 100).toFixed(1)
      : '0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{funnel.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[funnel.status]}`}>
              {funnel.status}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {funnel.funnel_type.replace(/_/g, ' ')} · {funnel.offer}
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <ExternalLink size={14} />
        </button>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-1.5 font-medium">Mini Funnel</p>
        <div className="flex items-center gap-1 text-xs">
          <div className="flex-1 text-center">
            <p className="font-bold text-gray-900 dark:text-white">{funnel.submissions}</p>
            <p className="text-gray-500">Submissions</p>
          </div>
          <ArrowRight size={10} className="text-gray-400 shrink-0" />
          <div className="flex-1 text-center">
            <p className="font-bold text-gray-900 dark:text-white">{funnel.appointments_booked}</p>
            <p className="text-gray-500">Appointments</p>
          </div>
          <ArrowRight size={10} className="text-gray-400 shrink-0" />
          <div className="flex-1 text-center">
            <p className="font-bold text-green-600 dark:text-green-400">{funnel.close_rate}%</p>
            <p className="text-gray-500">Close Rate</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          <TrendingUp size={10} className="inline mr-0.5" />
          {conversionRate}% form→appt
        </span>
        <div className="flex gap-1.5 ml-auto">
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Eye size={12} /> Preview
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Copy size={12} /> Embed
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <BarChart2 size={12} /> Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

type MainTab = 'funnels' | 'templates' | 'forms';
type FormsSubTab = 'build' | 'analyze' | 'submissions';

const CreateFolderModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Folder</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormsLibraryContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentOrganizationId: organizationId, currentOrganizationSlug: orgSlug } =
    useCurrentOrganization();

  const [forms, setForms] = useState<MarketingForm[]>([]);
  const [folders, setFolders] = useState<FormFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [formsSubTab, setFormsSubTab] = useState<FormsSubTab>('build');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'clock'>('list');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateFormModal, setShowCreateFormModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [renamingFormId, setRenamingFormId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [selectedFormForEmbed, setSelectedFormForEmbed] = useState<MarketingForm | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [organizationId]);

  useEffect(() => {
    const shouldRefresh = searchParams.get('refreshForms');
    if (shouldRefresh === 'true') {
      loadData();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('refreshForms');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
        if (renamingFormId) {
          setRenamingFormId(null);
          setRenameValue('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [renamingFormId]);

  useEffect(() => {
    if (renamingFormId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFormId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsData, foldersData] = await Promise.all([
        formsApi.getForms(organizationId),
        formsApi.getFolders(organizationId),
      ]);
      setForms(formsData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Error loading forms data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => setShowCreateFormModal(true);

  const handleCreateFormType = (type: 'scratch' | 'template') => {
    setShowCreateFormModal(false);
    if (type === 'scratch') {
      navigate(`/org/${orgSlug}/marketing/forms/builder/new`);
    }
  };

  const handleEditForm = (formId: string) =>
    navigate(`/org/${orgSlug}/marketing/forms/builder/${formId}`);

  const handleDuplicateForm = async (formId: string) => {
    try {
      await formsApi.duplicateForm(formId, organizationId);
      loadData();
    } catch (error) {
      console.error('Error duplicating form:', error);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    try {
      await formsApi.deleteForm(formId, organizationId);
      loadData();
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await formsApi.createFolder({ name }, organizationId);
      setShowCreateFolderModal(false);
      loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleStartRename = (form: MarketingForm) => {
    setRenamingFormId(form.id);
    setRenameValue(form.name);
    setOpenDropdownId(null);
  };

  const handleCancelRename = () => {
    setRenamingFormId(null);
    setRenameValue('');
  };

  const handleSaveRename = async (formId: string) => {
    if (!renameValue.trim() || renameSaving) return;
    try {
      setRenameSaving(true);
      await formsApi.updateForm(formId, { name: renameValue.trim() }, organizationId);
      setRenamingFormId(null);
      setRenameValue('');
      loadData();
    } catch (error) {
      console.error('Error renaming form:', error);
    } finally {
      setRenameSaving(false);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, formId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveRename(formId);
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const handleShowEmbedCode = (form: MarketingForm) => {
    setSelectedFormForEmbed(form);
    setShowEmbedModal(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === formId ? null : formId);
  };

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = currentFolder ? form.folder_id === currentFolder : !form.folder_id;
    return matchesSearch && matchesFolder;
  });

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-6">
          {(['build', 'analyze', 'submissions'] as FormsSubTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setFormsSubTab(t)}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                formsSubTab === t
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {t === 'build' ? 'Build' : t === 'analyze' ? 'Analyze' : 'Submissions'}
            </button>
          ))}
        </nav>
      </div>

      {formsSubTab === 'analyze' && <FormsAnalyzeTab />}
      {formsSubTab === 'submissions' && <FormsSubmissionsTab />}

      {formsSubTab === 'build' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Forms</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create, manage, and organise forms effortlessly to capture lead info and engage
                users—all without coding
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <FolderPlus size={16} />
                <span>Create folder</span>
              </button>
              <button
                onClick={handleCreateForm}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add Form</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search for forms"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent min-w-[280px]"
              />
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('clock')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'clock'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Clock size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">Home</div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : filteredFolders.length === 0 && filteredForms.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FileText className="w-14 h-14 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                No forms yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Get started by creating your first lead capture form
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleCreateForm}
                  className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  <Plus size={16} />
                  <span>+ New Form</span>
                </button>
                <button
                  onClick={() => navigate(`/org/${orgSlug}/marketing/forms/builder/new`)}
                  className="inline-flex items-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold"
                >
                  Go to Forms Builder
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Updated By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredFolders.map((folder) => (
                    <tr
                      key={folder.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Folder className="text-gray-400" size={18} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {folder.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(folder.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredForms.map((form) => (
                    <tr
                      key={form.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="text-gray-400" size={18} />
                          {renamingFormId === form.id ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                ref={renameInputRef}
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => handleRenameKeyDown(e, form.id)}
                                className="flex-1 px-2 py-1 text-sm border border-red-500 rounded focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                disabled={renameSaving}
                              />
                              <button
                                onClick={() => handleSaveRename(form.id)}
                                disabled={!renameValue.trim() || renameSaving}
                                className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Save"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={handleCancelRename}
                                disabled={renameSaving}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {form.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(form.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {form.created_by || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className="relative inline-block"
                          ref={openDropdownId === form.id ? dropdownRef : null}
                        >
                          <button
                            onClick={(e) => toggleDropdown(form.id, e)}
                            className={`p-2 rounded transition-colors ${
                              openDropdownId === form.id
                                ? 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openDropdownId === form.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                              <button
                                onClick={() => {
                                  handleEditForm(form.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleDuplicateForm(form.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Copy size={16} />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => handleStartRename(form)}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit2 size={16} />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={() => handleShowEmbedCode(form)}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Code size={16} />
                                <span>Get Embed Code</span>
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                              <button
                                onClick={() => {
                                  handleDeleteForm(form.id);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {showCreateFormModal && (
        <CreateFormModal
          onClose={() => setShowCreateFormModal(false)}
          onCreate={handleCreateFormType}
        />
      )}

      {showEmbedModal && selectedFormForEmbed && (
        <EmbedCodeModal
          form={selectedFormForEmbed}
          onClose={() => {
            setShowEmbedModal(false);
            setSelectedFormForEmbed(null);
          }}
        />
      )}
    </div>
  );
};

export const FormsAndFunnels: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [funnels, setFunnels] = useState<MarketingFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('funnels');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await funnelsApi.getFunnels(orgId);
      setFunnels(data);
    } catch {
      addToast('error', 'Failed to load funnels');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleNewFunnel = async () => {
    try {
      const funnel = await funnelsApi.createFunnel(
        {
          name: 'New Funnel',
          funnel_type: 'free_inspection',
          headline: '',
          offer: '',
        },
        orgId
      );
      setFunnels((prev) => [funnel, ...prev]);
      addToast('success', 'New funnel created');
      setActiveTab('funnels');
    } catch {
      addToast('error', 'Failed to create funnel');
    }
  };

  const handleUseTemplate = async (template: (typeof FUNNEL_TEMPLATES)[number]) => {
    setCreatingTemplateId(template.id);
    try {
      const funnel = await funnelsApi.createFunnel(
        {
          name: template.name,
          funnel_type: template.funnel_type,
          headline: template.headline,
          offer: template.offer,
        },
        orgId
      );
      setFunnels((prev) => [funnel, ...prev]);
      addToast('success', `"${template.name}" added to your funnels`);
      setActiveTab('funnels');
    } catch {
      addToast('error', 'Failed to create funnel from template');
    } finally {
      setCreatingTemplateId(null);
    }
  };

  const totalSubmissions = funnels.reduce((s, f) => s + f.submissions, 0);
  const totalAppointments = funnels.reduce((s, f) => s + f.appointments_booked, 0);
  const avgCloseRate =
    funnels.length > 0
      ? (funnels.reduce((s, f) => s + f.close_rate, 0) / funnels.length).toFixed(1)
      : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Active Funnels',
            value: funnels.filter((f) => f.status === 'active').length.toString(),
          },
          { label: 'Total Submissions', value: totalSubmissions.toLocaleString() },
          { label: 'Appointments Booked', value: totalAppointments.toLocaleString() },
          { label: 'Avg Close Rate', value: `${avgCloseRate}%` },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['funnels', 'templates', 'forms'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {t === 'funnels' ? 'My Funnels' : t === 'templates' ? 'Templates' : 'Forms'}
            </button>
          ))}
        </div>

        {activeTab !== 'forms' && (
          <button
            onClick={handleNewFunnel}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            New Funnel
          </button>
        )}
      </div>

      {activeTab === 'funnels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funnels.length === 0 && (
            <div className="col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                No funnels yet
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Create a funnel or use a template to get started.
              </p>
              <button
                onClick={() => setActiveTab('templates')}
                className="text-sm bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Browse Templates
              </button>
            </div>
          )}
          {funnels.map((f) => (
            <FunnelCard key={f.id} funnel={f} />
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FUNNEL_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium capitalize">
                  {t.category}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">{t.description}</p>
              <div className="flex items-center gap-4 text-xs mb-3">
                <div>
                  <p className="text-gray-500">Expected CPL</p>
                  <p className="font-bold text-gray-900 dark:text-white">{t.expectedCPL}</p>
                </div>
                <div>
                  <p className="text-gray-500">Close Rate</p>
                  <p className="font-bold text-green-600 dark:text-green-400">{t.closeRate}</p>
                </div>
              </div>
              <button
                onClick={() => handleUseTemplate(t)}
                disabled={creatingTemplateId === t.id}
                className="w-full flex items-center justify-center gap-1.5 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
              >
                {creatingTemplateId === t.id && (
                  <Loader2 size={12} className="animate-spin" />
                )}
                Use This Template
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'forms' && <FormsLibraryContent />}

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
