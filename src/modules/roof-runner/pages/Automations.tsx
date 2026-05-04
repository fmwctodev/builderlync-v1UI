import { useState } from "react";
import { 
  ChevronDown, ChevronRight, X, Filter, RefreshCw, Info, List, Search, 
  MoreHorizontal, Folder, ExternalLink, Grid, Plus, Edit, Zap,
  TrendingUp, CheckCircle, Users, AlertCircle, Calendar, ArrowRight, Activity
} from "lucide-react";
import AutomationModal from '../components/AutomationModal';
import AutomationEditor from '../components/AutomationEditor';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowTemplateLibraryModal from '../components/WorkflowTemplateLibraryModal';
import { WorkflowTemplate } from '../../../shared/store/services/workflowTemplateApi';

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
    <div className="h-full flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 pt-6 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Workflows</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and build your automated journeys</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowFolderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              <Folder className="w-4 h-4 text-gray-400" />
              New Folder
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                className="flex items-center gap-2 px-5 py-2 bg-primary-600 shadow-lg shadow-primary-600/20 text-white rounded-xl hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
                <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
              </button>
              
              {showCreateDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 z-30 animate-fadeIn overflow-hidden">
                  <div className="py-2">
                    <button
                      onClick={() => { 
                        setShowCreateDropdown(false); 
                        setCurrentView('builder');
                      }}
                      className="w-full text-left px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                         <Plus className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Start from Scratch</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        setShowTemplateModal(true);
                      }}
                      className="w-full text-left px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                         <Grid className="w-4 h-4" />
                      </div>
                      <span className="font-medium">Browse Templates</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-transparent">
          {['All Workflows', 'Analytics', 'Needs Review', 'Deleted'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 relative text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'Needs Review' ? 'Needs Review (0)' : tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full shadow-[0_-2px_8px_rgba(0,0,0,0.1)] shadow-primary-500/50" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 relative">
        {activeTab === 'Analytics' ? (
          <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn pb-8">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-500/10 rounded-xl">
                    <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Workflows</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">301</h3>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Published Workflows</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">48</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-pink-50 dark:bg-pink-500/10 rounded-xl">
                    <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Enrollments</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">17.7K</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Error Review Summary</h4>
                </div>
                <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No workflow errors found</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All workflows are running smoothly</p>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Workflow Enrollments</h3>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">Last 7 Weeks</span>
                </div>
              </div>
              
              {/* Custom Line Chart Presentation */}
              <div className="relative h-64 w-full">
                {/* Y-Axis labels */}
                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400 font-medium z-10 bg-white/80 dark:bg-gray-800/80 pr-2 pb-1">
                  <div className="text-right">250</div>
                  <div className="text-right">200</div>
                  <div className="text-right">150</div>
                  <div className="text-right">100</div>
                  <div className="text-right">50</div>
                  <div className="text-right">0</div>
                </div>
                
                {/* Grid Lines */}
                <div className="absolute left-12 right-0 top-2 bottom-8 flex flex-col justify-between">
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50"></div>
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50"></div>
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50"></div>
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50"></div>
                  <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50"></div>
                  <div className="w-full h-px bg-gray-200 dark:bg-gray-600"></div>
                </div>

                {/* SVG Graph Line and Area */}
                <div className="absolute left-12 right-0 top-2 bottom-8">
                  <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="gradientArea" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(220, 38, 38, 0.2)" />
                        <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <path 
                      d="M 0,80 C 100,50 150,45 250,60 C 350,75 400,90 500,85 C 600,80 650,20 700,40 C 750,60 780,180 800,195 L 800,200 L 0,200 Z" 
                      fill="url(#gradientArea)" 
                      className="transition-all duration-1000 ease-in-out hover:opacity-80"
                    />
                    <path 
                      d="M 0,80 C 100,50 150,45 250,60 C 350,75 400,90 500,85 C 600,80 650,20 700,40 C 750,60 780,180 800,195" 
                      fill="none" 
                      stroke="#dc2626" 
                      strokeWidth="3" 
                      className="drop-shadow-md brightness-110"
                    />
                    
                    {/* Points on Graph */}
                    <circle cx="0" cy="80" r="4" fill="white" stroke="#dc2626" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <circle cx="150" cy="46" r="4" fill="white" stroke="#dc2626" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <circle cx="300" cy="67" r="4" fill="white" stroke="#dc2626" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <circle cx="450" cy="86" r="4" fill="white" stroke="#dc2626" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <circle cx="600" cy="81" r="4" fill="white" stroke="#dc2626" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <circle cx="710" cy="45" r="4" fill="white" stroke="#dc2626" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                    <circle cx="800" cy="195" r="4" fill="white" stroke="#dc2626" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" />
                  </svg>
                </div>
                
                {/* X-Axis labels */}
                <div className="absolute left-10 right-0 bottom-0 h-6 flex justify-between text-xs text-gray-400 font-medium px-4 items-end">
                  <span>Mar 8 - Mar 14</span>
                  <span>Mar 15 - Mar 21</span>
                  <span>Mar 22 - Mar 28</span>
                  <span className="text-center flex-col flex leading-tight">Mar 29 - Apr 4<span className="text-[10px] text-gray-300">Weeks</span></span>
                  <span>Apr 5 - Apr 11</span>
                  <span>Apr 12 - Apr 18</span>
                  <span>Apr 19 - Apr 25</span>
                </div>
              </div>
            </div>

            {/* Trigger Analysis Filter Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Trigger Analysis</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Filter trigger performance by various criteria to get detailed insights</p>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <select className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none min-w-[140px] cursor-pointer">
                      <option>Filter Type</option>
                    </select>
                    <span className="text-sm text-gray-500 font-medium">is</span>
                    <select className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none min-w-[140px] cursor-pointer">
                      <option>Filter Value</option>
                    </select>
                  </div>
                  <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">2026-03-21</div>
                    <div className="px-2 text-gray-300 dark:text-gray-600"><ArrowRight className="w-4 h-4" /></div>
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">2026-04-20</div>
                    <div className="px-3 py-2 border-l border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800"><Calendar className="w-4 h-4" /></div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Attempted */}
                  <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 shadow-sm hover:border-primary-100 dark:hover:border-primary-900/50 transition-colors">
                    <div className="flex justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Attempted Enrollments</h4>
                      <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-400"><Users className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">17.3K</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Contacts evaluated per workflow</p>
                  </div>
                  
                  {/* Matched */}
                  <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 shadow-sm hover:border-green-100 dark:hover:border-green-900/50 transition-colors">
                    <div className="flex justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Matched Enrollments</h4>
                      <div className="p-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg text-green-500"><CheckCircle className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">991</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contacts matching workflow triggers</p>
                  </div>
                  
                  {/* Unmatched */}
                  <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 shadow-sm hover:border-pink-100 dark:hover:border-pink-900/50 transition-colors">
                    <div className="flex justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unmatched Enrollments</h4>
                      <div className="p-1.5 bg-pink-50 dark:bg-pink-500/10 rounded-lg text-pink-500"><X className="w-4 h-4" /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">16.3K</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contacts failing to match triggers</p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-primary-50/50 dark:bg-primary-900/10 p-3 rounded-lg">
                  <Info className="w-4 h-4 text-primary-500" />
                  Trigger Analysis data is available upto last 30 days
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search workflows..." 
                className="pl-10 pr-4 py-2.5 w-72 bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-primary-500 text-sm focus:outline-none transition-all dark:text-gray-200"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm font-medium transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm ring-1 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm ring-1 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm ring-1 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table/List Area */}
        <div className="flex flex-col gap-3">
          {/* List Header */}
          <div className="grid grid-cols-12 gap-4 px-6 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
             <div className="col-span-4 pl-2">Name</div>
             <div className="col-span-2">Status</div>
             <div className="col-span-2 text-center">Enrolled (Tot / Act)</div>
             <div className="col-span-3">Modified</div>
             <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* List Body */}
          <div className="flex flex-col gap-2">
            {workflows.map((workflow) => (
              <div 
                key={workflow.id} 
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer group"
                onClick={() => !workflow.isFolder && setCurrentView('builder')}
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${workflow.isFolder ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                    {workflow.isFolder ? (
                      <Folder className="w-5 h-5" fill="currentColor" fillOpacity={0.2} />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {workflow.name}
                    </h3>
                    {workflow.hasExternal && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <ExternalLink className="w-3 h-3" /> External Link
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  {workflow.status ? (
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      workflow.status === 'Published' 
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/20'
                        : 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600'
                    }`}>
                      {workflow.status}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">Draft</span>
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-right text-sm font-medium text-gray-600 dark:text-gray-300">{workflow.totalEnrolled || 0}</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="w-8 text-left text-sm font-medium text-primary-600 dark:text-primary-400">{workflow.activeEnrolled || 0}</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300">{workflow.lastUpdated}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Created: {workflow.createdOn}</div>
                </div>
                <div className="col-span-1 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-2 bg-white dark:bg-gray-700 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-all hover:border-primary-200 dark:hover:border-primary-800"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}

        {/* Create Folder Modal */}
        {showFolderModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-[400px] border border-gray-100 dark:border-gray-700 animate-slide-in-right transform">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Folder</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Organize your workflows nicely.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-4 py-3 bg-paper dark:bg-canvas border-none rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner"
                  placeholder="e.g. Lead Nurturing"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowFolderModal(false);
                    setFolderName('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowFolderModal(false);
                    setFolderName('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  disabled={!folderName.trim()}
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        <WorkflowTemplateLibraryModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </div>
  );
}