import { useState } from "react";
import { ChevronDown, ChevronRight, X, Filter, RefreshCw, Info, List, Search, MoreHorizontal, Folder, ExternalLink } from "lucide-react";
import AutomationModal from '../components/AutomationModal';
import AutomationEditor from '../components/AutomationEditor';
import WorkflowBuilder from './WorkflowBuilder';
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
  const [currentView, setCurrentView] = useState('list');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);

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
    setSelectedTemplate(template);
    setShowTemplateModal(false);
    setCurrentView('builder');
  };

  if (currentView === 'builder') {
    return (
      <WorkflowBuilder
        onBack={() => {
          setCurrentView('list');
          setSelectedTemplate(null);
        }}
        initialTemplate={selectedTemplate}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Workflow List</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Folder className="w-4 h-4" />
            Create Folder
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <span className="text-lg">+</span>
              Create Workflow
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showCreateDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <div className="py-1">
                  <button
                    onClick={() => { 
                      setShowCreateDropdown(false); 
                      setCurrentView('builder');
                    }}
                    className="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Start from Scratch
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDropdown(false);
                      setShowTemplateModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('All Workflows')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'All Workflows'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            All Workflows
          </button>
          <button
            onClick={() => setActiveTab('Needs Review')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'Needs Review'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            Needs Review (0)
          </button>
          <button
            onClick={() => setActiveTab('Deleted')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'Deleted'
                ? 'bg-primary-600 text-white rounded-t-lg'
                : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
            }`}
          >
            Deleted
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 relative">
      <ComingSoonOverlay
        message="Coming Soon"
        subtitle="The Automations & Workflows feature is currently under development and will be available soon."
        icon="construction"
      />
      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
        </button>
        
        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Info className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <List className="w-4 h-4" />
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search" 
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 w-64"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <span className="text-sm">Customize List</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-4">
        <span className="text-gray-500 dark:text-gray-400 text-sm">Home</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="col-span-1">
            <input type="checkbox" className="rounded" />
          </div>
          <div className="col-span-3 flex items-center gap-1">
            Name
            <ChevronDown className="w-3 h-3" />
          </div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Total Enrolled</div>
          <div className="col-span-1">Active Enrolled</div>
          <div className="col-span-2">Last Updated</div>
          <div className="col-span-2">Created On</div>
          <div className="col-span-1 flex items-center gap-1">
            Stats
            <Info className="w-3 h-3" />
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
              <div className="col-span-1">
                <input type="checkbox" className="rounded" />
              </div>
              <div className="col-span-3 flex items-center gap-2">
                {workflow.isFolder ? (
                  <Folder className="w-4 h-4 text-gray-500" />
                ) : (
                  <div className="w-4 h-4" />
                )}
                <span className="text-gray-900 dark:text-white">{workflow.name}</span>
                {workflow.hasExternal && (
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <div className="col-span-1">
                {workflow.status && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.status === 'Published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {workflow.status}
                  </span>
                )}
              </div>
              <div className="col-span-1">
                {workflow.totalEnrolled !== null && (
                  <span className="text-primary-600 dark:text-primary-400">{workflow.totalEnrolled}</span>
                )}
              </div>
              <div className="col-span-1">
                {workflow.activeEnrolled !== null && (
                  <span className="text-primary-600 dark:text-primary-400">{workflow.activeEnrolled}</span>
                )}
              </div>
              <div className="col-span-2 text-gray-600 dark:text-gray-400">
                {workflow.lastUpdated}
              </div>
              <div className="col-span-2 text-gray-600 dark:text-gray-400">
                {workflow.createdOn}
              </div>
              <div className="col-span-1 flex items-center justify-between">
                {!workflow.isFolder && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
      </div>
    </div>
  );
}