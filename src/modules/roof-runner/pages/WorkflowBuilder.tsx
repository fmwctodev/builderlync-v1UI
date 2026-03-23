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
  Grid
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
  const [steps, setSteps] = useState<any[]>([]);
  const [showRecentTriggers, setShowRecentTriggers] = useState(true);
  const [showContactCategory, setShowContactCategory] = useState(true);
  const [showRecentActions, setShowRecentActions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
  };

  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setSelectedItem('');
    setSearchQuery('');
  };

  const handleSelectItem = (id: string) => {
    const item = sidebarType === 'trigger'
      ? triggerOptions.find(t => t.id === id)
      : actionOptions.find(a => a.id === id);

    if (item) {
      setSteps([...steps, { type: sidebarType, ...item }]);

      if (sidebarType === 'trigger') {
        setSidebarType('action');
        setActiveTab('Actions');
        setSearchQuery('');
      } else {
        handleCloseSidebar();
      }
    }
  };

  const handleAddActionAtPosition = (position: number) => {
    handleOpenSidebar('action');
  };

  const filteredTriggers = triggerOptions.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActions = actionOptions.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workflows
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">New Workflow : 1763708398366</h1>
              <Edit className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <button className="text-primary-600 hover:text-primary-700 font-medium">Saved</button>
            <button className="text-primary-600 hover:text-primary-700 font-medium">Test Workflow</button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Draft</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">Publish</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mt-4">
          <button className="pb-3 px-1 border-b-2 border-primary-600 text-primary-600 font-medium text-sm">
            Builder
          </button>
          <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
            Settings
          </button>
          <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
            Enrollment History
          </button>
          <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">
            Execution Logs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <CheckSquare className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Clock className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <FileText className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Zap className="w-5 h-5" />
          </button>
          <div className="flex-1"></div>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Plus className="w-5 h-5" />
          </button>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">100%</div>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <div className="w-4 h-4 border border-gray-400 rounded"></div>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-auto relative">
          <div className="min-h-full flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-6">
              {steps.length === 0 ? (
                <button
                  onClick={() => handleOpenSidebar('trigger')}
                  className="border-2 border-dashed border-red-400 dark:border-primary-600 rounded-lg px-12 py-8 text-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors bg-white dark:bg-gray-800"
                >
                  <Plus className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <span className="text-primary-600 font-medium">Add New Trigger</span>
                </button>
              ) : (
                <>
                  {steps.map((step, index) => (
                    <div key={index}>
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              <step.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                                {step.type}
                              </div>
                              <div className="font-medium text-gray-900 dark:text-white">{step.name}</div>
                            </div>
                          </div>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {index < steps.length - 1 || step.type === 'trigger' ? (
                        <>
                          <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleAddActionAtPosition(index + 1)}
                              className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                          <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
                        </>
                      ) : null}
                    </div>
                  ))}

                  {steps.length > 0 && steps[steps.length - 1].type === 'trigger' && (
                    <>
                      <button
                        onClick={() => handleOpenSidebar('action')}
                        className="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">Please select action</span>
                      </button>
                      <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
                    </>
                  )}

                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                    END
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {showSidebar && (
          <div className="w-[440px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sidebarType === 'trigger' ? 'Add Trigger' : 'Actions'}
                </h2>
                <button
                  onClick={handleCloseSidebar}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {sidebarType === 'trigger'
                  ? 'Adds a workflow trigger, and on execution, the Contact gets added to the workflow.'
                  : 'Pick an action for this step'}
              </p>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={sidebarType === 'trigger' ? 'Search For Triggers' : 'Search For Actions'}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab(sidebarType === 'trigger' ? 'Triggers' : 'Actions')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-1.5 ${
                    activeTab === (sidebarType === 'trigger' ? 'Triggers' : 'Actions')
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {sidebarType === 'trigger' ? 'Triggers' : 'Actions'}
                </button>
                <button
                  onClick={() => setActiveTab('Apps')}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-1.5 ${
                    activeTab === 'Apps'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  Apps
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab !== 'Apps' && (
                <div className="p-6">
                  {sidebarType === 'trigger' ? (
                    <>
                      {/* Recent Triggers */}
                      {filteredTriggers.some(t => t.category === 'recent') && (
                        <div className="mb-6">
                          <button
                            onClick={() => setShowRecentTriggers(!showRecentTriggers)}
                            className="flex items-center justify-between w-full mb-3"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Triggers</h3>
                            {showRecentTriggers ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {showRecentTriggers && (
                            <div className="space-y-1">
                              {filteredTriggers.filter(t => t.category === 'recent').map((trigger) => (
                                <button
                                  key={trigger.id}
                                  onClick={() => handleSelectItem(trigger.id)}
                                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                      <trigger.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <span className="text-sm text-gray-900 dark:text-white font-medium">{trigger.name}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
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
                            className="flex items-center justify-between w-full mb-3"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white">Contact</h3>
                            {showContactCategory ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {showContactCategory && (
                            <div className="space-y-1">
                              {filteredTriggers.filter(t => t.category === 'contact').map((trigger) => (
                                <button
                                  key={trigger.id}
                                  onClick={() => handleSelectItem(trigger.id)}
                                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                      <trigger.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <span className="text-sm text-gray-900 dark:text-white">{trigger.name}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
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
                        <div className="mb-6">
                          <button
                            onClick={() => setShowRecentActions(!showRecentActions)}
                            className="flex items-center justify-between w-full mb-3"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Actions</h3>
                            {showRecentActions ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {showRecentActions && (
                            <div className="space-y-1">
                              {filteredActions.filter(a => a.category === 'recent').map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleSelectItem(action.id)}
                                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                      <action.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <span className="text-sm text-gray-900 dark:text-white font-medium">{action.name}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
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
                            className="flex items-center justify-between w-full mb-3"
                          >
                            <h3 className="font-semibold text-gray-900 dark:text-white">Contact</h3>
                            {showContactCategory ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          {showContactCategory && (
                            <div className="space-y-1">
                              {filteredActions.filter(a => a.category === 'contact').map((action) => (
                                <button
                                  key={action.id}
                                  onClick={() => handleSelectItem(action.id)}
                                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                      <action.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <span className="text-sm text-gray-900 dark:text-white">{action.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {action.starred && (
                                      <Star className="w-4 h-4 text-primary-600 dark:text-primary-400 fill-current" />
                                    )}
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
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
                <div className="p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No apps available
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
