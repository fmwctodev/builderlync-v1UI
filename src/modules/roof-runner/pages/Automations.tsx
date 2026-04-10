import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, X, Filter, Search, Folder, ExternalLink, Sparkles, MoreVertical, Plus, Settings } from "lucide-react";
import AutomationModal from '../components/AutomationModal';
import AutomationEditor from '../components/AutomationEditor';
import WorkflowTemplateLibraryModal from '../components/WorkflowTemplateLibraryModal';
import { WorkflowTemplate } from '../../../shared/store/services/workflowTemplateApi';
import ComingSoonOverlay from '../../../shared/components/ComingSoonOverlay';

export default function Automations() {
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
      setIsFilterModalOpen(false);
    }
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

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
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

        {/* Tabs */}
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

      <div className="flex-1 overflow-auto p-6 relative">
        {activeTab === 'All Workflows' && (
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
                  {workflows.map((workflow) => (
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
                              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
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

        {activeTab === 'Needs Review' && (
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

        {activeTab === 'Deleted' && (
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

        {activeTab === 'smart-list' && (
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
                  console.log('Creating folder:', folderName);
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