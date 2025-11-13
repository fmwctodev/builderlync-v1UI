import { useState } from "react";
import { ArrowLeft, Edit, User, Clock, History, Play, Save, Plus, MoreHorizontal, X, ArrowLeft as BackArrow, HelpCircle } from "lucide-react";

interface WorkflowBuilderProps {
  onBack?: () => void;
}

export default function WorkflowBuilder({ onBack }: WorkflowBuilderProps) {
  const [showTriggerSidebar, setShowTriggerSidebar] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState('');
  const [triggerName, setTriggerName] = useState('');
  const [activeTab, setActiveTab] = useState('Triggers');
  const [triggers, setTriggers] = useState([]);


  const triggerOptions = [
    { id: 'birthday', name: 'Birthday Reminder', icon: '🎂' },
    { id: 'contact-changed', name: 'Contact Changed', icon: '👤' },
    { id: 'contact-created', name: 'Contact Created', icon: '👤' },
    { id: 'contact-dnd', name: 'Contact DND', icon: '🚫' },
    { id: 'contact-tag', name: 'Contact Tag', icon: '🏷️' },
    { id: 'custom-date', name: 'Custom Date Reminder', icon: '📅' },
    { id: 'note-added', name: 'Note Added', icon: '📝' },
    { id: 'note-changed', name: 'Note Changed', icon: '📝' },
    { id: 'task-added', name: 'Task Added', icon: '✅' }
  ];

  const handleAddTrigger = () => {
    if (selectedTrigger && triggerName) {
      const trigger = triggerOptions.find(t => t.id === selectedTrigger);
      setTriggers([...triggers, { ...trigger, name: triggerName }]);
      setShowTriggerSidebar(false);
      setSelectedTrigger('');
      setTriggerName('');
    }
  };



  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
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
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">New Workflow : 1763016996587</h1>
              <Edit className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <button className="text-primary-600 hover:text-primary-700">Test Workflow</button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Draft</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
              <span className="text-sm text-gray-500">Publish</span>
            </div>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-6 mt-4 border-b border-gray-200 dark:border-gray-700">
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
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600"></div>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Clock className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </button>
          <button className="mt-auto p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Plus className="w-5 h-5" />
          </button>
          <div className="text-xs text-gray-500">100%</div>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600"></div>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600"></div>
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 h-full overflow-auto">
          <div className="min-w-[200vw] min-h-[200vh] flex items-center justify-center p-8">
            {triggers.length === 0 ? (
              <button
                onClick={() => setShowTriggerSidebar(true)}
                className="border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-white dark:bg-gray-800 shadow-sm"
              >
                <Plus className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <span className="text-primary-600 font-medium">Add New Trigger</span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {triggers.map((trigger, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[200px] shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{trigger.icon}</span>
                        <div>
                          <div className="text-xs text-gray-500 uppercase">Trigger</div>
                          <div className="font-medium text-gray-900 dark:text-white">{trigger.name}</div>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                
                <button
                  onClick={() => setShowTriggerSidebar(true)}
                  className="border-2 border-dashed border-primary-300 dark:border-primary-600 rounded-lg p-4 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors bg-white dark:bg-gray-800 shadow-sm"
                >
                  <Plus className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <span className="text-primary-600 text-sm">Add New Trigger</span>
                </button>
                
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-w-[200px] text-center shadow-sm">
                  <Plus className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                </div>
                
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                
                <div className="bg-gray-200 dark:bg-gray-600 rounded-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                  END
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Add Trigger */}
        {showTriggerSidebar && (
          <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowTriggerSidebar(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <BackArrow className="w-4 h-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Trigger</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-primary-600 hover:text-primary-700 text-sm">Learn More</button>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  <button 
                    onClick={() => setShowTriggerSidebar(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Adds a workflow trigger, and on execution, the Contact gets added to the workflow.
              </p>
              
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-3 flex items-center">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <input
                  type="text"
                  placeholder="Search For Triggers"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setActiveTab('Triggers')}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'Triggers' 
                      ? 'border-primary-600 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  🔥 Triggers
                </button>
                <button 
                  onClick={() => setActiveTab('Apps')}
                  className={`pb-2 px-1 border-b-2 font-medium text-sm ml-6 ${
                    activeTab === 'Apps' 
                      ? 'border-primary-600 text-primary-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  📱 Apps
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!selectedTrigger ? (
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Contact</h3>
                    <div className="space-y-2">
                      {triggerOptions.map((trigger) => (
                        <button
                          key={trigger.id}
                          onClick={() => {
                            setSelectedTrigger(trigger.id);
                            setTriggerName(trigger.name);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
                        >
                          <span className="text-lg">{trigger.icon}</span>
                          <span className="text-sm text-gray-900 dark:text-white">{trigger.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CHOOSE A WORKFLOW TRIGGER <HelpCircle className="w-3 h-3 inline ml-1" />
                    </h4>
                    <select 
                      value={selectedTrigger}
                      onChange={(e) => setSelectedTrigger(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {triggerOptions.map((trigger) => (
                        <option key={trigger.id} value={trigger.id}>{trigger.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WORKFLOW TRIGGER NAME
                    </h4>
                    <input
                      type="text"
                      value={triggerName}
                      onChange={(e) => setTriggerName(e.target.value)}
                      placeholder="Birthday Reminder"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <button className="text-primary-600 hover:text-primary-700 text-sm mb-6">
                    ⊕ Add filters
                  </button>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowTriggerSidebar(false);
                        setSelectedTrigger('');
                        setTriggerName('');
                      }}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddTrigger}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!selectedTrigger || !triggerName}
                    >
                      Save Trigger
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}