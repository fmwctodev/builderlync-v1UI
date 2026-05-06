import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, X, Filter, Search, Folder, ExternalLink, Sparkles, MoreVertical, Plus, Settings, Zap } from "lucide-react";
import AutomationModal from '../components/AutomationModal';
import AutomationEditor from '../components/AutomationEditor';
import WorkflowTemplateLibraryModal from '../components/WorkflowTemplateLibraryModal';
import AutomationOverview from '../components/AutomationOverview';
import { WorkflowTemplate } from '../../../shared/store/services/workflowTemplateApi';
import ComingSoonOverlay from '../../../shared/components/ComingSoonOverlay';

export default function Automations() {
  const [mainTab, setMainTab] = useState('Workflows');
  const [activeTab, setActiveTab] = useState('All Workflows');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [smartListName, setSmartListName] = useState('New Smart List');
  const navigate = useNavigate();
  const [filters, setFilters] = useState([
    { field: '', condition: 'Is', value: '', error: false }
  ]);

  // Global Workflow Settings — persisted to localStorage as a graceful
  // fallback while there's no dedicated `updateAutomationSettings` API.
  // When the API lands the load/save handlers can swap to it without
  // changing the UI bindings.
  const SETTINGS_KEY = 'builderlync.automations.globalSettings';
  type AutomationGlobalSettings = {
    allowMultipleEnrollment: boolean;
    stopOnResponse: boolean;
  };
  const loadGlobalSettings = (): AutomationGlobalSettings => {
    if (typeof window === 'undefined') {
      return { allowMultipleEnrollment: false, stopOnResponse: true };
    }
    try {
      const raw = window.localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          allowMultipleEnrollment: !!parsed.allowMultipleEnrollment,
          stopOnResponse: parsed.stopOnResponse ?? true,
        };
      }
    } catch {
      // ignore JSON parse errors and fall through to defaults
    }
    return { allowMultipleEnrollment: false, stopOnResponse: true };
  };
  const [globalSettings, setGlobalSettings] = useState<AutomationGlobalSettings>(() => loadGlobalSettings());
  const [savedGlobalSettings, setSavedGlobalSettings] = useState<AutomationGlobalSettings>(() => loadGlobalSettings());
  const [savingSettings, setSavingSettings] = useState(false);
  const settingsDirty =
    globalSettings.allowMultipleEnrollment !== savedGlobalSettings.allowMultipleEnrollment ||
    globalSettings.stopOnResponse !== savedGlobalSettings.stopOnResponse;

  // Custom folders — persisted to localStorage so user-created folders
  // survive page reloads. Renders alongside the hardcoded workflow folders.
  // When a real backend folder endpoint exists, swap loadCustomFolders /
  // persistCustomFolders without changing any UI bindings.
  const FOLDERS_KEY = 'builderlync.automations.customFolders';
  type CustomFolder = {
    id: string;
    name: string;
    createdAt: string;
  };
  const loadCustomFolders = (): CustomFolder[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(FOLDERS_KEY);
      return raw ? (JSON.parse(raw) as CustomFolder[]) : [];
    } catch {
      return [];
    }
  };
  const [customFolders, setCustomFolders] = useState<CustomFolder[]>(() => loadCustomFolders());
  const persistCustomFolders = (next: CustomFolder[]) => {
    setCustomFolders(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FOLDERS_KEY, JSON.stringify(next));
    }
  };

  // Applied filters (after validateAndApply) — separate from the modal's
  // working `filters` so we can show "X filters applied" badges in the UI
  // and clear them with a single click. Persisted so filters survive
  // page reload, matching how saved-view UX works in similar SaaS tools.
  const APPLIED_FILTERS_KEY = 'builderlync.automations.appliedFilters';
  type AppliedFilter = { field: string; condition: string; value: string };
  const loadAppliedFilters = (): AppliedFilter[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(APPLIED_FILTERS_KEY);
      return raw ? (JSON.parse(raw) as AppliedFilter[]) : [];
    } catch {
      return [];
    }
  };
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>(() => loadAppliedFilters());
  const persistAppliedFilters = (next: AppliedFilter[]) => {
    setAppliedFilters(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(APPLIED_FILTERS_KEY, JSON.stringify(next));
    }
  };

  const handleSaveGlobalSettings = async () => {
    setSavingSettings(true);
    try {
      // Simulate save latency for UI feedback; localStorage write is sync.
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(globalSettings));
      }
      setSavedGlobalSettings(globalSettings);
    } catch (error) {
      console.error('Failed to save automation settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  const addFilter = () => {
    setFilters([...filters, { field: '', condition: 'Is', value: '', error: false }]);
  };

  const updateFilter = (index: number, key: string, value: string) => {
    const updated = [...filters];
    (updated[index] as any)[key] = value;
    updated[index].error = false;
    setFilters(updated);
  };

  const deleteFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const validateAndApply = () => {
    let valid = true;
    const updated = filters.map(f => {
      if (!f.value || f.value === 'Please Select') {
        valid = false;
        return { ...f, error: true };
      }
      return f;
    });
    setFilters(updated);
    if (valid) {
      // Persist applied filters so they survive reload and can be
      // displayed as badges with a Clear-all affordance.
      const cleaned: AppliedFilter[] = updated
        .filter((f) => f.field && f.value && f.value !== 'Please Select')
        .map((f) => ({ field: f.field, condition: f.condition, value: f.value }));
      persistAppliedFilters(cleaned);
      setIsFilterModalOpen(false);
    }
  };

  const clearAppliedFilters = () => {
    persistAppliedFilters([]);
    setFilters([{ field: '', condition: 'Is', value: '', error: false }]);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const workflows = [
    {
      id: 1,
      name: '00. A2P',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Sep 25 2024, 9:41 AM',
      createdOn: 'Sep 25 2024, 9:41 AM',
      isFolder: true
    },
    {
      id: 2,
      name: '000a. Sierra-AI Caller',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Aug 07 2025, 1:32 AM',
      createdOn: 'Jul 20 2025, 9:15 PM',
      isFolder: true
    },
    {
      id: 3,
      name: '000b. Sierra-AI-JobWorkflows',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Aug 07 2025, 1:33 AM',
      createdOn: 'Jul 30 2025, 9:26 PM',
      isFolder: true
    },
    {
      id: 4,
      name: '01. Residential Sales Pipeline',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Dec 26 2024, 3:52 PM',
      createdOn: 'Dec 20 2024, 3:26 PM',
      isFolder: true
    },
    {
      id: 5,
      name: '02. Commercial Sales Pipeline',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Sep 29 2025, 11:59 PM',
      createdOn: 'Sep 29 2025, 11:59 PM',
      isFolder: true
    },
    {
      id: 6,
      name: '02. Subcontractor Pipeline',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Sep 30 2025, 12:14 AM',
      createdOn: 'Jan 14 2025, 8:14 AM',
      isFolder: true
    },
    {
      id: 7,
      name: '03. New Employee Application',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Sep 30 2025, 12:15 AM',
      createdOn: 'Jan 29 2025, 2:26 PM',
      isFolder: true
    },
    {
      id: 8,
      name: '08. Request review',
      status: null,
      totalEnrolled: null,
      activeEnrolled: null,
      lastUpdated: 'Sep 30 2025, 12:57 AM',
      createdOn: 'Nov 22 2024, 10:45 AM',
      isFolder: true
    }
  ];

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setShowTemplateModal(false);
    navigate(`builder?templateId=${template.id}`);
  };

  // Merge custom folders into the displayed list. User-created folders
  // appear first so newly-created entries are immediately discoverable.
  // Apply text-based filters (name contains) when the user has Applied
  // filters via the Advanced Filters modal.
  const customFolderRows = customFolders.map((cf) => ({
    id: `custom-${cf.id}`,
    name: cf.name,
    status: null as null,
    totalEnrolled: null as null,
    activeEnrolled: null as null,
    lastUpdated: new Date(cf.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
    createdOn: new Date(cf.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
    isFolder: true as const,
    isCustomFolder: true as const,
  }));

  const allWorkflows: any[] = [...customFolderRows, ...workflows];

  // Apply text filters: each filter has field + condition + value. We
  // support `name` contains/equals, `status` equals, and `lastUpdated`
  // contains here — best-effort given the static data shape.
  const displayedWorkflows = appliedFilters.length === 0
    ? allWorkflows
    : allWorkflows.filter((w) => {
        return appliedFilters.every((f) => {
          const fieldKey = f.field.toLowerCase().replace(/\s+/g, '');
          const lookup: Record<string, string> = {
            name: String(w.name ?? ''),
            status: String(w.status ?? ''),
            lastupdated: String(w.lastUpdated ?? ''),
            createdon: String(w.createdOn ?? ''),
          };
          const candidate = (lookup[fieldKey] ?? '').toLowerCase();
          const target = f.value.toLowerCase();
          if (f.condition === 'Is' || f.condition === 'Equals') {
            return candidate === target;
          }
          // Default to "contains"
          return candidate.includes(target);
        });
      });

  const handleDeleteCustomFolder = (id: string) => {
    if (!window.confirm('Delete this folder? Workflows assigned to it will move to the root level.')) return;
    persistCustomFolders(customFolders.filter((cf) => cf.id !== id));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      {/* Top Header - Premium Midnight Theme */}
      <div className="bg-[#050914] px-6 py-3.5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <Zap className="w-5 h-5 text-primary-500 fill-primary-500/20" />
             <h1 className="text-lg font-black text-white uppercase tracking-tighter">Automation</h1>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl gap-1 border border-white/5">
            {[
              { id: 'Workflows', label: 'Workflows' },
              { id: 'Overview', label: 'Overview', beta: true },
              { id: 'Global Settings', label: 'Global Workflow Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`relative px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2.5 ${
                  mainTab === tab.id
                    ? 'bg-white text-black shadow-xl'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
                {tab.beta && (
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter transition-all ${
                    mainTab === tab.id ? 'bg-amber-400 text-black' : 'bg-primary-600 text-white'
                  }`}>
                    Beta
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           {/* Automation Updates Indicator */}
           <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/5 transition-all group">
             <div className="relative">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-blue-400 animate-ping opacity-20 rounded-full" />
             </div>
             <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest group-hover:text-white transition-colors">Automation Updates</span>
           </button>
        </div>
      </div>

      {mainTab === 'Workflows' && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow List</h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowFolderModal(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Create Folder
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                onClick={() => console.log('Build using AI clicked')}
              >
                <Sparkles className="w-4 h-4" />
                Build using AI
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Workflow
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showCreateDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => { 
                          setShowCreateDropdown(false); 
                          navigate('builder');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Start from Scratch
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateDropdown(false);
                          setShowTemplateModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        Select from Template
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {[
              { id: 'All Workflows', label: 'All Workflows' },
              { id: 'Needs Review', label: `Needs Review (0)` },
              { id: 'Deleted', label: 'Deleted' },
              { id: 'smart-list', label: 'smart_list.model...' },
              { id: 'new-smart-list', label: '+ New Smart List', secondary: true }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'new-smart-list') {
                    setActiveTab('smart-list');
                    setIsDrawerOpen(true);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`pb-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                } ${tab.secondary ? 'text-gray-400 font-normal hover:text-primary-600' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6 relative">
        {mainTab === 'Workflows' && activeTab === 'All Workflows' && (
          <>
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <Filter className="w-4 h-4" />
                Advanced Filters
              </button>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Applied filter badges (UXA-032) */}
            {appliedFilters.length > 0 && (
              <div className="mb-4 flex items-center flex-wrap gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Applied filters:
                </span>
                {appliedFilters.map((f, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-md text-xs"
                  >
                    <span className="font-medium">{f.field}</span>
                    <span className="opacity-70">{f.condition}</span>
                    <span>{f.value}</span>
                  </span>
                ))}
                <button
                  onClick={clearAppliedFilters}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                >
                  Clear all
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  ({displayedWorkflows.length} of {allWorkflows.length})
                </span>
              </div>
            )}

            {/* Breadcrumb */}
            <div className="mb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Home</span>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created On</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {displayedWorkflows.length === 0 && appliedFilters.length > 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No workflows match your applied filters.{' '}
                        <button onClick={clearAppliedFilters} className="text-primary-600 hover:underline">
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                  {displayedWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {workflow.isFolder ? (
                            <Folder className="w-5 h-5 text-gray-400" />
                          ) : (
                            <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800" />
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">{workflow.name}</span>
                          {workflow.hasExternal && (
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {workflow.lastUpdated}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {workflow.createdOn}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === workflow.id ? null : workflow.id);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuId === workflow.id && (
                          <div className="absolute right-6 mt-1 w-36 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 overflow-hidden">
                            <div className="py-1">
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Rename</button>
                              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Move</button>
                              <button
                                onClick={() => {
                                  if ((workflow as any).isCustomFolder) {
                                    // Strip the "custom-" prefix we added when building customFolderRows
                                    const realId = String(workflow.id).replace(/^custom-/, '');
                                    handleDeleteCustomFolder(realId);
                                    setActiveMenuId(null);
                                  } else {
                                    alert('Deleting built-in workflows is not supported yet.');
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div></div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Previous
                </button>
                <button className="px-3 py-2 bg-primary-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  2
                </button>
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Next
                </button>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-4">10 / page</span>
              </div>
            </div>
          </>
        )}

        {mainTab === 'Workflows' && activeTab === 'Needs Review' && (
          <>
            <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Workflows with errors in the past 30 days which are not resolved are listed below.
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Occurred</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-[220px]">
                    <td colSpan={3} className="text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <div className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700 rounded-lg relative mb-3 flex items-center justify-center">
                          <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 rounded-full px-1.5 py-0.5 absolute -top-2 -right-2">✕</span>
                        </div>
                        <div className="text-sm font-medium">No Data</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {mainTab === 'Workflows' && activeTab === 'Deleted' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Workflows deleted in the past 30 days are listed below
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workflow Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deleted By</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created on</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deleted on</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-[220px]">
                    <td colSpan={5} className="text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <div className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700 rounded-lg relative mb-3 flex items-center justify-center">
                          <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 rounded-full px-1.5 py-0.5 absolute -top-2 -right-2">✕</span>
                        </div>
                        <div className="text-sm font-medium">No Data</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {mainTab === 'Workflows' && activeTab === 'smart-list' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Advanced Filters
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded" /></th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Enrolled</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Enrolled</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created On</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Stats</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {[
                    { id: 101, name: 'CUSTOM VALUE UPDATER', status: 'Draft', total: 0, active: 0, updated: 'Dec 29 2024, 6:22 PM', created: 'Nov 19 2024, 7:34 PM' },
                    { id: 102, name: 'Appt No Show', status: 'Published', total: 6, active: 0, updated: 'Oct 08 2025, 11:20 AM', created: 'Jun 07 2024, 1:21 AM' }
                  ].map((workflow) => (
                    <tr key={workflow.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                      <td className="px-6 py-4"><input type="checkbox" className="rounded" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white uppercase text-sm tracking-tight">{workflow.name}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          workflow.status === 'Published' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {workflow.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{workflow.total}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{workflow.active}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{workflow.updated}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{workflow.created}</td>
                      <td className="px-6 py-4 text-center text-gray-400 font-bold">›</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md text-gray-400">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {mainTab === 'Overview' && <AutomationOverview />}

        {mainTab === 'Global Settings' && (
          <div className="max-w-[800px] mx-auto py-12 space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center justify-between border-b pb-6">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Global Workflow Settings</h2>
                   <p className="text-gray-500 mt-1 font-medium">Manage system-wide defaults for all automations</p>
                </div>
                <button
                  onClick={handleSaveGlobalSettings}
                  disabled={savingSettings || !settingsDirty}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingSettings ? 'Saving…' : settingsDirty ? 'Save Changes' : 'Saved'}
                </button>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                   <h3 className="font-bold text-gray-900 flex items-center gap-2">
                     <Settings className="w-4 h-4 text-primary-500" /> General Defaults
                   </h3>
                   <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer">
                         <div>
                            <p className="text-sm font-bold text-gray-700">Allow Multiple Enrollment</p>
                            <p className="text-xs text-gray-500">Enable contacts to enter multiple times</p>
                         </div>
                         <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={globalSettings.allowMultipleEnrollment}
                            onChange={(e) =>
                              setGlobalSettings((prev) => ({
                                ...prev,
                                allowMultipleEnrollment: e.target.checked,
                              }))
                            }
                         />
                         <div className="w-10 h-5 bg-gray-200 peer-checked:bg-primary-600 rounded-full relative transition-colors">
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"
                                 style={{ transform: globalSettings.allowMultipleEnrollment ? 'translateX(20px)' : 'translateX(0)' }} />
                         </div>
                      </label>
                      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer">
                         <div>
                            <p className="text-sm font-bold text-gray-700">Stop on Response</p>
                            <p className="text-xs text-gray-500">Halt workflow if client replies</p>
                         </div>
                         <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={globalSettings.stopOnResponse}
                            onChange={(e) =>
                              setGlobalSettings((prev) => ({
                                ...prev,
                                stopOnResponse: e.target.checked,
                              }))
                            }
                         />
                         <div className={`w-10 h-5 rounded-full relative transition-colors ${globalSettings.stopOnResponse ? 'bg-primary-600' : 'bg-gray-200'}`}>
                            <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                                 style={{ transform: globalSettings.stopOnResponse ? 'translateX(20px)' : 'translateX(2px)' }} />
                         </div>
                      </label>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Folder</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder Name
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFolderModal(false);
                  setFolderName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const trimmed = folderName.trim();
                  if (!trimmed) return;
                  // localStorage-backed persistence; survives page reload.
                  // Swap to backend endpoint when one is wired (UXA-033).
                  const next: CustomFolder = {
                    id: `folder_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
                    name: trimmed,
                    createdAt: new Date().toISOString(),
                  };
                  persistCustomFolders([next, ...customFolders]);
                  setShowFolderModal(false);
                  setFolderName('');
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!folderName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Library Modal */}
      <WorkflowTemplateLibraryModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Customize List Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-2xl transition-transform duration-300 transform translate-x-0 flex flex-col">
            <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Customize List</span>
              <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input 
                  type="text" 
                  value={smartListName}
                  onChange={(e) => setSmartListName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              <button 
                onClick={() => setIsFilterModalOpen(true)}
                className="w-full flex justify-between items-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                  <span className="font-semibold text-sm uppercase">Advanced Filters</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-700/30">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
              >
                Discard
              </button>
              <button 
                className="px-6 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition-colors"
                onClick={() => setIsDrawerOpen(false)}
              >
                Save List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">Advanced Filters</span>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {filters.map((filter, index) => (
                <div key={index} className="space-y-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 relative group">
                  {filters.length > 1 && (
                    <button 
                      onClick={() => deleteFilter(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={filter.field}
                      onChange={(e) => updateFilter(index, 'field', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    >
                      <option value="">Action Type</option>
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                    </select>

                    <select 
                      value={filter.condition}
                      onChange={(e) => updateFilter(index, 'condition', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    >
                      <option value="Is">Is</option>
                      <option value="Is Not">Is Not</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <select 
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl text-sm outline-none transition-all font-medium ${
                        filter.error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700 focus:border-primary-500'
                      }`}
                    >
                      <option value="">Please Select</option>
                      <option value="Sent">Sent</option>
                      <option value="Opened">Opened</option>
                      <option value="Clicked">Clicked</option>
                    </select>
                    {filter.error && (
                      <p className="text-xs font-bold text-red-500 px-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full" />
                        Value cannot be empty
                      </p>
                    )}
                  </div>

                  {index < filters.length - 1 && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">AND</span>
                    </div>
                  )}
                </div>
              ))}

              <button 
                onClick={addFilter}
                className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Filter
              </button>
            </div>

            <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-700/20">
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 shadow-md transition-all active:scale-95"
                onClick={validateAndApply}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}