import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  User,
  Clock,
  Save,
  Plus,
  MoreHorizontal,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  Cake,
  UserCheck,
  UserPlus,
  Ban,
  Tag,
  Calendar,
  FileText,
  CheckSquare,
  Bell,
  MessageSquare,
  UserX,
  UserCog,
  FileEdit,
  Star,
  Zap,
  Grid,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  ToggleRight,
  Activity,
  LogOut,
  Settings as SettingsIcon,
  Play,
  RotateCcw
} from "lucide-react";
import { WorkflowTemplate } from '../../../shared/store/services/workflowTemplateApi';

interface WorkflowBuilderProps {
  onBack?: () => void;
  initialTemplate?: WorkflowTemplate | null;
}

export default function WorkflowBuilder({ onBack, initialTemplate }: WorkflowBuilderProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarType, setSidebarType] = useState<'trigger' | 'action'>('trigger');
  const [selectedItem, setSelectedItem] = useState('');
  const [activeTab, setActiveTab] = useState('Triggers');
  const [activeNavbarTab, setActiveNavbarTab] = useState('Builder');
  const [steps, setSteps] = useState<any[]>([]);
  const [showRecentTriggers, setShowRecentTriggers] = useState(true);
  const [showContactCategory, setShowContactCategory] = useState(true);
  const [showRecentActions, setShowRecentActions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const triggerOptions = [
    { id: 'contact-tag', name: 'Contact Tag', icon: Tag, category: 'recent' },
    { id: 'birthday', name: 'Birthday Reminder', icon: Cake, category: 'contact' },
    { id: 'contact-changed', name: 'Contact Changed', icon: UserCheck, category: 'contact' },
    { id: 'contact-created', name: 'Contact Created', icon: UserPlus, category: 'contact' },
    { id: 'contact-dnd', name: 'Contact DND', icon: Ban, category: 'contact' },
    { id: 'contact-tag-2', name: 'Contact Tag', icon: Tag, category: 'contact' },
    { id: 'custom-date', name: 'Custom Date Reminder', icon: Calendar, category: 'contact' },
    { id: 'note-added', name: 'Note Added', icon: FileText, category: 'contact' },
    { id: 'note-changed', name: 'Note Changed', icon: FileEdit, category: 'contact' },
    { id: 'task-added', name: 'Task Added', icon: CheckSquare, category: 'contact' },
    { id: 'task-reminder', name: 'Task Reminder', icon: Bell, category: 'contact' }
  ];

  const actionOptions = [
    { id: 'send-sms', name: 'Send SMS', icon: MessageSquare, category: 'recent' },
    { id: 'add-task', name: 'Add Task', icon: CheckSquare, category: 'recent' },
    { id: 'create-contact', name: 'Create Contact', icon: UserPlus, category: 'contact' },
    { id: 'find-contact', name: 'Find Contact', icon: Search, category: 'contact' },
    { id: 'update-contact', name: 'Update Contact Field', icon: UserCheck, category: 'contact' },
    { id: 'add-tag', name: 'Add Contact Tag', icon: Tag, category: 'contact' },
    { id: 'remove-tag', name: 'Remove Contact Tag', icon: Tag, category: 'contact' },
    { id: 'assign-user', name: 'Assign To User', icon: UserCog, category: 'contact' },
    { id: 'remove-user', name: 'Remove Assigned User', icon: UserX, category: 'contact' },
    { id: 'enable-dnd', name: 'Enable/Disable DND', icon: Ban, category: 'contact' },
    { id: 'add-notes', name: 'Add To Notes', icon: FileText, category: 'contact' },
    { id: 'copy-contact', name: 'Copy Contact', icon: Star, category: 'contact', starred: true }
  ];

  useEffect(() => {
    if (initialTemplate) {
      const templateSteps: any[] = [];

      if (initialTemplate.trigger_config && initialTemplate.trigger_config.type) {
        const triggerOption = triggerOptions.find(t => t.id === initialTemplate.trigger_config.type);
        if (triggerOption) {
          templateSteps.push({
            type: 'trigger',
            ...triggerOption,
            name: initialTemplate.trigger_config.name || triggerOption.name
          });
        }
      }

      if (initialTemplate.actions_config && Array.isArray(initialTemplate.actions_config)) {
        initialTemplate.actions_config.forEach((actionConfig: any) => {
          const actionOption = actionOptions.find(a => a.id === actionConfig.id);
          if (actionOption) {
            templateSteps.push({
              type: 'action',
              ...actionOption,
              name: actionConfig.name || actionOption.name
            });
          }
        });
      }

      setSteps(templateSteps);
    }
  }, [initialTemplate]);

  const handleOpenSidebar = (type: 'trigger' | 'action') => {
    setSidebarType(type);
    setShowSidebar(true);
    setActiveTab(type === 'trigger' ? 'Triggers' : 'Actions');
    setEditingStepIndex(null);
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setSelectedItem('');
    setSearchQuery('');
    setEditingStepIndex(null);
  };

  const handleSelectItem = (id: string) => {
    const item = sidebarType === 'trigger'
      ? triggerOptions.find(t => t.id === id)
      : actionOptions.find(a => a.id === id);

    if (item) {
      const newStep = { type: sidebarType, ...item };
      setSteps([...steps, newStep]);
      setEditingStepIndex(steps.length); // The newly added item's index
    }
  };

  const handleEditStepCanvasClick = (stepToEdit: any) => {
    const idx = steps.indexOf(stepToEdit);
    if (idx !== -1) {
      setEditingStepIndex(idx);
      setSidebarType(stepToEdit.type);
      setShowSidebar(true);
    }
  };

  const handleAddActionAtPosition = (position: number | string) => {
    handleOpenSidebar('action');
  };

  const filteredTriggers = triggerOptions.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActions = actionOptions.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggers = steps.filter((s: any) => s.type === 'trigger');
  const actions = steps.filter((s: any) => s.type === 'action');

  return (
    <div className="fixed inset-0 bg-paper dark:bg-canvas overflow-hidden flex flex-col z-[50]">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 pt-4 z-20 shadow-sm relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={onBack}
              className="group flex justify-center items-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">New Workflow : 1763708398366</h1>
              <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Draft saved</span>
            </div>
            <button className="px-5 py-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-xl font-semibold text-sm transition-all shadow-sm">
              Test Workflow
            </button>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 pl-2 uppercase tracking-widest">Draft</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm dark:border-gray-600 peer-checked:bg-emerald-500 peer-checked:shadow-lg peer-checked:shadow-emerald-500/20"></div>
              </label>
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 pr-2 uppercase tracking-widest">Publish</span>
            </div>
            <button className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5">
              Save
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 mt-6">
          {['Builder', 'Settings', 'Enrollment History', 'Execution Logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNavbarTab(tab)}
              className={`pb-4 px-1 text-sm font-semibold transition-colors relative ${activeNavbarTab === tab ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              {tab}
              {activeNavbarTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full shadow-[0_-2px_8px_rgba(0,0,0,0.1)] shadow-primary-500/50" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {activeNavbarTab === 'Builder' && (
          <>
            {/* Left Sidebar Actions */}
            <div className="w-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center py-6 gap-5 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
              <button className="p-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all hover:scale-110 shadow-sm border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
                <CheckSquare className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all hover:scale-110 shadow-sm border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
                <Clock className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all hover:scale-110 shadow-sm border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all hover:scale-110 shadow-sm border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
                <FileText className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all hover:scale-110 shadow-sm border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
                <Zap className="w-5 h-5" />
              </button>
              <div className="flex-1"></div>
              <button className="p-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-inner">100%</div>
              <button className="p-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-110">
                <div className="w-5 h-5 border-[2px] border-current rounded-md"></div>
              </button>
              <button className="p-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-110">
                <Grid className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:24px_24px] overflow-auto relative scroll-smooth">
              <div className="min-h-full flex items-start justify-center p-16">
                <div className="flex flex-col items-center w-full">
                  {steps.length === 0 ? (
                    <button
                      onClick={() => handleOpenSidebar('trigger')}
                      className="group relative border-2 border-dashed border-gray-300 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500 rounded-2xl px-16 py-10 text-center transition-all duration-300 bg-white/50 hover:bg-white dark:bg-gray-800/50 dark:hover:bg-gray-800 backdrop-blur-sm cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 mt-10"
                    >
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Add New Trigger</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Start your workflow by selecting an event to listen for.</p>
                    </button>
                  ) : (
                    <>
                      {/* Triggers Section */}
                      {triggers.length > 0 && (
                        <div className="flex flex-col items-center relative w-full mb-8">
                          {/* Horizontal Layout for Triggers */}
                          <div className="flex flex-row flex-nowrap overflow-visible items-start justify-center gap-8 relative z-10 w-full max-w-full pb-8">
                            {/* A horizontal manifold line connects all stems at the bottom. We use pseudo elements or absolute divs to build this. */}

                            {triggers.map((step: any, index: number) => (
                              <div key={`trigger-${index}`} className="relative group flex flex-col items-center">
                                <div
                                  onClick={() => handleEditStepCanvasClick(step)}
                                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-5 w-[320px] shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer z-10"
                                >
                                  <div className="flex items-center justify-between pl-1">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                                        <step.icon className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-bold tracking-widest uppercase text-amber-500/80">
                                          Workflow Trigger
                                        </div>
                                        <div className="font-bold text-gray-900 dark:text-white text-base mt-0.5 truncate max-w-[160px]">{step.name}</div>
                                      </div>
                                    </div>
                                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-gray-400">
                                      <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Stem connecting downwards */}
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 absolute -bottom-8 shadow-sm z-0"></div>

                                {/* Logic for the horizontal manifold line */}
                                {triggers.length > 1 && (
                                  <div className={`absolute -bottom-8 h-0.5 bg-gray-300 dark:bg-gray-600 z-0
                                ${index === 0 ? 'w-[50%] right-0' : ''}
                                ${index === triggers.length - 1 ? 'w-[50%] left-0' : ''}
                                ${index !== 0 && index !== triggers.length - 1 ? 'w-full' : ''}
                              `}></div>
                                )}
                                {triggers.length === 1 && (
                                  <div className={`absolute -bottom-8 h-0.5 bg-gray-300 dark:bg-gray-600 z-0 w-[50%] right-0`}></div>
                                )}
                              </div>
                            ))}

                            {/* Add New Trigger Card (Horizontal sibling) */}
                            <div className="relative flex flex-col items-center">
                              <button
                                onClick={() => handleOpenSidebar('trigger')}
                                className="flex items-center justify-center gap-3 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-500 rounded-2xl w-[260px] h-[92px] text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500 transition-all cursor-pointer shadow-sm hover:shadow-lg backdrop-blur-sm z-10 group"
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 transition-colors">
                                  <Plus className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-sm tracking-wide">Add New Trigger</span>
                              </button>

                              {/* Stem connecting downwards */}
                              <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 absolute -bottom-8 shadow-sm z-0"></div>
                              <div className="absolute -bottom-8 h-0.5 bg-gray-300 dark:bg-gray-600 z-0 w-[50%] left-0"></div>
                            </div>
                          </div>

                          {/* Main central trunk dropping down from the manifold line */}
                          <div className="relative flex flex-col justify-center items-center h-16 w-full -mt-8">
                            <div className="w-0.5 h-full bg-gradient-to-b from-gray-300 to-gray-300 dark:from-gray-600 dark:to-gray-600 absolute shadow-sm z-0"></div>

                            {/* Plus button right below Triggers if actions exist */}
                            {actions.length > 0 && (
                              <button
                                onClick={() => handleAddActionAtPosition(0)}
                                className="z-10 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 text-gray-400 hover:text-primary-600 transition-all hover:-translate-y-0.5 mt-8"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Adding first action if none exist */}
                      {triggers.length > 0 && actions.length === 0 && (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => handleOpenSidebar('action')}
                            className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 min-w-[340px] text-center hover:bg-white dark:hover:bg-gray-800 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 group relative z-10"
                          >
                            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary-600 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 flex items-center justify-center mb-3 transition-all transform group-hover:scale-110">
                              <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Click here to add your first Action</span>
                          </button>
                        </div>
                      )}

                      {/* Actions Section */}
                      {actions.length > 0 && (
                        <div className="flex flex-col items-center w-full z-10">
                          {actions.map((step: any, index: number) => (
                            <div key={`action-${index}`} className="relative group w-full flex flex-col items-center">
                              <div
                                onClick={() => handleEditStepCanvasClick(step)}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-5 min-w-[340px] shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer z-10"
                              >
                                <div className="flex items-center justify-between pl-1">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                                      <step.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold tracking-widest uppercase text-primary-600/80">
                                        Action
                                      </div>
                                      <div className="font-bold text-gray-900 dark:text-white text-base mt-0.5 truncate max-w-[170px]">{step.name}</div>
                                    </div>
                                  </div>
                                  <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all text-gray-400">
                                    <MoreHorizontal className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              <div className="relative flex flex-col justify-center items-center h-20 w-full">
                                <div className="w-0.5 h-full bg-gradient-to-b from-gray-300 via-gray-300 to-gray-300 dark:from-gray-600 dark:via-gray-600 dark:to-gray-600 absolute shadow-sm z-0"></div>
                                <button
                                  onClick={() => handleAddActionAtPosition('action')}
                                  className="z-10 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-xl hover:border-primary-400 dark:hover:border-primary-500 text-gray-400 hover:text-primary-600 transition-all hover:-translate-y-0.5"
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Final Ending */}
                          <div className="relative flex flex-col items-center">
                            <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600 dark:to-transparent absolute top-[-20px] z-0"></div>
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-inner rounded-full px-8 py-3 text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase relative z-10 border border-gray-200/50 dark:border-gray-700/50 mt-4">
                              End of Workflow
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            {showSidebar && (
              <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border-l border-gray-200/50 dark:border-gray-700/50 flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] animate-slide-in-right absolute right-0 top-0 bottom-0 ${editingStepIndex !== null ? 'w-[520px]' : 'w-[460px]'}`}>

                {editingStepIndex !== null ? (
                  // --- EDIT MODE VIEW ---
                  (() => {
                    const step = steps[editingStepIndex];
                    if (!step) return null;
                    return (
                      <div className="flex flex-col h-full overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 shrink-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setEditingStepIndex(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 group transition-colors">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                              </button>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{step.name}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="flex items-center gap-1.5 px-3 py-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20 dark:text-primary-400 rounded-full text-xs font-semibold transition-colors">
                                <span>Learn more</span>
                                <Zap className="w-3 h-3" />
                              </button>
                              <button onClick={handleCloseSidebar} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 ml-[44px]">
                            {step.type === 'trigger'
                              ? 'Runs when the specified tag is applied or cleared.'
                              : 'Create a new Task with a defined Due Date to be Assigned to a Specific User'}
                          </p>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          {step.type === 'trigger' ? (
                            <>
                              {/* Trigger Edit Layout */}
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Choose a Workflow Trigger</label>
                                <div className="relative">
                                  <select className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm appearance-none cursor-pointer">
                                    <option>{step.name}</option>
                                  </select>
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Workflow Trigger Name</label>
                                <input type="text" defaultValue={step.name} className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Filters</label>
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <span className="font-medium text-sm">Select</span>
                                    <ChevronDown className="w-4 h-4" />
                                  </div>
                                  <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex gap-2 items-center">
                                    <div className="relative flex-1">
                                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                      <input type="text" placeholder="Search" className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 shadow-inner" />
                                    </div>
                                  </div>
                                  <div className="max-h-56 overflow-y-auto">
                                    <div className="bg-gray-900 dark:bg-gray-950 text-white text-xs font-semibold px-4 py-2 opacity-90">Standard Fields</div>
                                    <div className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 cursor-pointer transition-colors">Tag Added</div>
                                    <div className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800">Tag Removed</div>
                                    <div className="bg-gray-900 dark:bg-gray-950 text-white text-xs font-semibold px-4 py-2 opacity-90">Custom Field</div>
                                    <div className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 cursor-pointer transition-colors">ABA/Routing Number - 9 digit</div>
                                    <div className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 cursor-pointer transition-colors">About You</div>
                                    <div className="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 cursor-pointer transition-colors">Account Number</div>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Action Edit Layout */}
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Action Name</label>
                                <input type="text" defaultValue={step.name} className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Title <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                  <input type="text" placeholder="Please Input" className="w-full p-3 pr-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all" />
                                  <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors">
                                    <Tag className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Description <span className="text-red-500">*</span></label>
                                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900 transition-all focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
                                  <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-wrap">
                                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors"><Tag className="w-4 h-4" /></button>
                                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                                    <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors"><ArrowLeft className="w-4 h-4 rotate-180" /></button>
                                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                    <button className="p-1.5 text-gray-500 hover:text-gray-700 font-serif font-bold hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors">B</button>
                                    <button className="p-1.5 text-gray-500 hover:text-gray-700 font-serif italic hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors">I</button>
                                    <button className="p-1.5 text-gray-500 hover:text-gray-700 font-serif underline hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors">U</button>
                                    <button className="p-1.5 text-gray-500 hover:text-gray-700 line-through hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors">S</button>
                                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                    <div className="relative">
                                      <select className="text-sm bg-transparent outline-none font-medium text-gray-600 dark:text-gray-300 appearance-none pr-6 cursor-pointer pl-1">
                                        <option>Verdana</option>
                                        <option>Inter</option>
                                      </select>
                                      <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                  </div>
                                  <textarea rows={6} className="w-full p-4 bg-transparent outline-none resize-none text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm" placeholder="Type a message"></textarea>
                                  <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 text-right text-[11px] font-medium text-gray-400 dark:text-gray-500 tracking-wide bg-gray-50/50 dark:bg-gray-800/20">
                                    0 characters | 0 words
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2 pt-2">
                                <label className="text-[11px] font-bold text-gray-500 tracking-widest uppercase">Assign to</label>
                                <div className="relative">
                                  <select className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm appearance-none cursor-pointer">
                                    <option>Select User...</option>
                                  </select>
                                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200/60 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/80 flex justify-end gap-3 shrink-0">
                          <button onClick={handleCloseSidebar} className="px-5 py-2.5 font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200">
                            Cancel
                          </button>
                          <button onClick={handleCloseSidebar} className="px-6 py-2.5 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900">
                            {step.type === 'trigger' ? 'Save Trigger' : 'Save action'}
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // --- LIST MODE VIEW ---
                  <div className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 shrink-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${sidebarType === 'trigger' ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'}`}>
                            {sidebarType === 'trigger' ? <Zap className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {sidebarType === 'trigger' ? 'Add Trigger' : 'Add Action'}
                          </h2>
                        </div>
                        <button
                          onClick={handleCloseSidebar}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors bg-paper dark:bg-canvas border border-gray-200 dark:border-gray-700"
                        >
                          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {sidebarType === 'trigger'
                          ? 'Adds a workflow trigger. When the event occurs, the Contact will be enrolled into this workflow.'
                          : 'Pick an action for this stage of the workflow.'}
                      </p>

                      {/* Search */}
                      <div className="relative mb-6">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={sidebarType === 'trigger' ? 'Search triggers...' : 'Search actions...'}
                          className="w-full pl-12 pr-4 py-3.5 border-none rounded-xl bg-paper dark:bg-canvas text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-inner font-medium"
                        />
                      </div>

                      {/* Tabs */}
                      <div className="flex gap-8 border-b border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => setActiveTab(sidebarType === 'trigger' ? 'Triggers' : 'Actions')}
                          className={`pb-4 relative font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === (sidebarType === 'trigger' ? 'Triggers' : 'Actions')
                              ? 'text-primary-600'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                          <Zap className="w-4 h-4" />
                          {sidebarType === 'trigger' ? 'Triggers' : 'Actions'}
                          {activeTab === (sidebarType === 'trigger' ? 'Triggers' : 'Actions') && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full shadow-[0_-2px_8px_rgba(0,0,0,0.1)] shadow-primary-500/50" />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab('Apps')}
                          className={`pb-4 relative font-bold text-sm flex items-center gap-2 transition-colors ${activeTab === 'Apps'
                              ? 'text-primary-600'
                              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                          <Grid className="w-4 h-4" />
                          Apps
                          {activeTab === 'Apps' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full shadow-[0_-2px_8px_rgba(0,0,0,0.1)] shadow-primary-500/50" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      {activeTab !== 'Apps' && (
                        <div className="space-y-8">
                          {sidebarType === 'trigger' ? (
                            <>
                              {/* Recent Triggers */}
                              {filteredTriggers.some(t => t.category === 'recent') && (
                                <div>
                                  <button
                                    onClick={() => setShowRecentTriggers(!showRecentTriggers)}
                                    className="flex items-center justify-between w-full mb-4 px-2 group"
                                  >
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 group-hover:text-gray-600 transition-colors">Recent Triggers</h3>
                                    {showRecentTriggers ? (
                                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    )}
                                  </button>
                                  {showRecentTriggers && (
                                    <div className="grid grid-cols-1 gap-2">
                                      {filteredTriggers.filter(t => t.category === 'recent').map((trigger) => (
                                        <button
                                          key={trigger.id}
                                          onClick={() => handleSelectItem(trigger.id)}
                                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/5 transition-all group"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                              <trigger.icon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{trigger.name}</span>
                                          </div>
                                          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-4 h-4 text-gray-400" />
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Contact Category */}
                              {filteredTriggers.some(t => t.category === 'contact') && (
                                <div>
                                  <button
                                    onClick={() => setShowContactCategory(!showContactCategory)}
                                    className="flex items-center justify-between w-full mb-4 px-2 group"
                                  >
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 group-hover:text-gray-600 transition-colors">Contact</h3>
                                    {showContactCategory ? (
                                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    )}
                                  </button>
                                  {showContactCategory && (
                                    <div className="grid grid-cols-1 gap-2">
                                      {filteredTriggers.filter(t => t.category === 'contact').map((trigger) => (
                                        <button
                                          key={trigger.id}
                                          onClick={() => handleSelectItem(trigger.id)}
                                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/5 transition-all group"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                              <trigger.icon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{trigger.name}</span>
                                          </div>
                                          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-4 h-4 text-gray-400" />
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Recent Actions */}
                              {filteredActions.some(a => a.category === 'recent') && (
                                <div>
                                  <button
                                    onClick={() => setShowRecentActions(!showRecentActions)}
                                    className="flex items-center justify-between w-full mb-4 px-2 group"
                                  >
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 group-hover:text-gray-600 transition-colors">Recent Actions</h3>
                                    {showRecentActions ? (
                                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    )}
                                  </button>
                                  {showRecentActions && (
                                    <div className="grid grid-cols-1 gap-2">
                                      {filteredActions.filter(a => a.category === 'recent').map((action) => (
                                        <button
                                          key={action.id}
                                          onClick={() => handleSelectItem(action.id)}
                                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-md hover:shadow-primary-500/5 transition-all group"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                              <action.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{action.name}</span>
                                          </div>
                                          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-4 h-4 text-gray-400" />
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Contact Category */}
                              {filteredActions.some(a => a.category === 'contact') && (
                                <div>
                                  <button
                                    onClick={() => setShowContactCategory(!showContactCategory)}
                                    className="flex items-center justify-between w-full mb-4 px-2 group"
                                  >
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 group-hover:text-gray-600 transition-colors">Contact</h3>
                                    {showContactCategory ? (
                                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    )}
                                  </button>
                                  {showContactCategory && (
                                    <div className="grid grid-cols-1 gap-2">
                                      {filteredActions.filter(a => a.category === 'contact').map((action) => (
                                        <button
                                          key={action.id}
                                          onClick={() => handleSelectItem(action.id)}
                                          className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-md hover:shadow-primary-500/5 transition-all group"
                                        >
                                          <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                              <action.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{action.name}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {action.starred && (
                                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            )}
                                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Plus className="w-4 h-4 text-gray-400" />
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {activeTab === 'Apps' && (
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Grid className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            No custom apps integrated yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Settings Tab */}
        {activeNavbarTab === 'Settings' && (
          <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto py-12 px-6">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2">Workflow Settings</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Configure how this workflow runs, including its default options and behavior.</p>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow mb-8 overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" />
                    Contact
                  </h3>
                </div>
                <div className="p-8 space-y-8">
                  <div className="flex gap-5">
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-checked:shadow-lg peer-checked:shadow-primary-500/20"></div>
                    </label>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Allow re-entry</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                        Allows a Contact to re-enter once it has left this workflow. If the Contact attempts to re-enter while it is still enrolled in this workflow, it will get skipped. Also if this workflow has appointment or invoice based triggers it will allow Contact to re-enter even if the 'Allow re-entry' setting is disabled. <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold ml-1">Learn more</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 border-t border-gray-100 dark:border-gray-700/50 pt-8">
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-checked:shadow-lg peer-checked:shadow-primary-500/20"></div>
                    </label>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Allow multiple Opportunities</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                        Allows a Contact with multiple Opportunities to enter the workflow as separate executions. For each Opportunity, the Contact will have a distinct execution in the workflow. Even if 'Allow Re-entry' is disabled, multiple Opportunities will still enter the workflow. <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold ml-1">Learn more</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-5 border-t border-gray-100 dark:border-gray-700/50 pt-8">
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-checked:shadow-lg peer-checked:shadow-primary-500/20"></div>
                    </label>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Stop on response</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-3xl">
                        Ends workflow for a Contact if the Contact responds to a message that is sent from this workflow. <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold ml-1">Learn more</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    Communication
                  </h3>
                </div>
                <div className="p-8 space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Timezone</label>
                    <div className="relative inline-block w-80">
                      <select className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm font-medium transition-all shadow-sm cursor-pointer">
                        <option>Account Timezone</option>
                        <option>Contact Timezone</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-[14px] w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">Wait steps and Time window executions will proceed based on this timezone. <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold ml-1">Learn more</a></p>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700/50 pt-8">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">Time Window</label>
                    <div className="flex gap-5">
                      <div className="flex-shrink-0 mt-0.5">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-checked:shadow-lg peer-checked:shadow-primary-500/20"></div>
                        </label>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">Specific Time</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          Restrict actions from being sent outside the window you define. <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold ml-1">Learn more</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enrollment History */}
        {activeNavbarTab === 'Enrollment History' && (
          <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto w-full p-8 animate-fadeIn">
            <div className="max-w-[1400px] mx-auto">
              <div className="mb-8 pl-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2">Enrollment History</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">View a history of all the Contacts that have entered this Workflow</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <div className="px-4 py-2.5 text-sm font-medium text-gray-400">Start Date</div>
                      <div className="px-2 text-gray-300 dark:text-gray-600"><ArrowLeft className="w-4 h-4 rotate-180" /></div>
                      <div className="px-4 py-2.5 text-sm font-medium text-gray-400">End Date</div>
                      <div className="px-3 py-2.5 border-l border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"><Calendar className="w-4 h-4" /></div>
                    </div>

                    <div className="relative">
                      <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer min-w-[160px] hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <option>All Events</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer min-w-[180px] hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <option>Select Contact</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <button className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold border-b border-gray-100 dark:border-gray-700/50">
                        <th className="py-4 px-6 font-semibold">Contact</th>
                        <th className="py-4 px-6 font-semibold">Enrollment Reason</th>
                        <th className="py-4 px-6 font-semibold">Date Enrolled <br /><span className="text-[10px] font-medium opacity-70">(CDT -05:00)</span></th>
                        <th className="py-4 px-6 font-semibold hidden md:table-cell">Current Action</th>
                        <th className="py-4 px-6 font-semibold hidden lg:table-cell">Current Status</th>
                        <th className="py-4 px-6 font-semibold hidden xl:table-cell">Next Execution On <br /><span className="text-[10px] font-medium opacity-70">(CDT -05:00)</span></th>
                        <th className="py-4 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                      {[
                        { initial: 'HK', color: 'bg-primary-400', contact: 'hello, a direct questi...', reason: 'Website Form S...', date: 'Apr 19th', time: '12:46:38 pm' },
                        { initial: 'T', color: 'bg-red-500', contact: 'test', reason: 'Website Form S...', date: 'Apr 16th', time: '3:01:50 pm' },
                        { initial: 'T', color: 'bg-red-500', contact: 'test', reason: 'Website Form S...', date: 'Apr 15th', time: '4:22:01 pm' },
                        { initial: 'KS', color: 'bg-primary-600', contact: 'k\'leigh searcy', reason: 'Website Form S...', date: 'Apr 14th', time: '1:47:57 pm' }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${row.color} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-gray-800`}>{row.initial}</div>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">{row.contact}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium">
                            {row.reason}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-700 dark:text-gray-300">{row.date}</div>
                            <div className="text-xs text-gray-400">{row.time}</div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                              <CheckSquare className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add Task</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden lg:table-cell">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/20">
                              <span>Finished</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 hidden xl:table-cell text-gray-400 font-medium text-sm">
                            Not Available
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                                <Clock className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                                <UserCog className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Execution Logs */}
        {activeNavbarTab === 'Execution Logs' && (
          <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 overflow-y-auto w-full p-8 animate-fadeIn">
            <div className="max-w-[1400px] mx-auto">
              <div className="mb-8 pl-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2">Execution Logs</h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">View a history and details of all executions performed by this Workflow</p>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <div className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">2026-03-22</div>
                      <div className="px-2 text-gray-300 dark:text-gray-600"><ArrowLeft className="w-4 h-4 rotate-180" /></div>
                      <div className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">2026-04-20</div>
                      <div className="px-3 py-2.5 border-l border-gray-200 dark:border-gray-700 text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"><Calendar className="w-4 h-4" /></div>
                    </div>

                    <div className="relative">
                      <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer min-w-[160px] hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <option>All actions</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer min-w-[140px] hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <option>All Status</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <select className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer min-w-[180px] hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                        <option>Select Contact</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <button className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-gray-800/80 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold border-b border-gray-100 dark:border-gray-700/50">
                        <th className="py-4 px-6 font-semibold w-2/5">Contact</th>
                        <th className="py-4 px-6 font-semibold">Action</th>
                        <th className="py-4 px-6 font-semibold text-center">Status</th>
                        <th className="py-4 px-6 font-semibold">Executed On <br /><span className="text-[10px] font-medium opacity-70">(CDT -05:00)</span></th>
                        <th className="py-4 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                      {[
                        { action: 'Removed by - End Of Workflow', icon: <LogOut className="w-3.5 h-3.5 text-gray-400" />, status: 'Finished', color: 'emerald' },
                        { action: 'Add Task', icon: <CheckSquare className="w-3.5 h-3.5 text-gray-400" />, status: 'Executed', color: 'emerald' },
                        { action: 'Assign to user', icon: <UserPlus className="w-3.5 h-3.5 text-gray-400" />, status: 'Executed', color: 'emerald' },
                        { action: 'Add to Workflow', icon: <Zap className="w-3.5 h-3.5 text-gray-400" />, status: 'Executed', color: 'emerald' },
                        { action: 'Go To', icon: <ArrowLeft className="w-3.5 h-3.5 text-gray-400" />, status: 'Executed', color: 'emerald' },
                        { action: '001. New Lead/Update Source', icon: <Activity className="w-3.5 h-3.5 text-gray-400" />, status: 'Executed', color: 'emerald' }
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                          <td className="py-4 px-6 max-w-[400px]">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-700 flex-shrink-0 text-indigo-300 flex items-center justify-center font-bold text-xs shadow-sm shadow-indigo-900/20 mt-1">HJ</div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed truncate whitespace-normal font-medium">Hello, A direct question — how much is a single roofing job worth to you in the Austin market? Because the domain TXRoofingContractors.com is currently available at a wholesale sale price of just $295</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                              {row.icon}
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{row.action}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full bg-${row.color}-50 dark:bg-${row.color}-500/10 text-${row.color}-600 dark:text-${row.color}-400 text-xs font-bold ring-1 ring-${row.color}-500/20 min-w-[80px]`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-700 dark:text-gray-300">Apr 19th,</div>
                            <div className="text-xs text-gray-500">12:46:4{6 - i} pm</div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button className="text-primary-600 dark:text-primary-400 font-bold text-sm hover:underline hover:text-primary-700 mr-2 transition-colors">
                                View Details
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all shadow-sm">
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all shadow-sm">
                                <UserCog className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all shadow-sm">
                                <LogOut className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
