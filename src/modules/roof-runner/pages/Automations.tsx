import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import AutomationModal from '../components/AutomationModal';
import AutomationEditor from '../components/AutomationEditor';

interface Automation {
  id: number;
  name: string;
  enabled: boolean;
  condition: string;
  action: string;
  frequency: string;
}

export default function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([
    { 
      id: 1, 
      name: "Adjuster Meeting Details Follow Up", 
      enabled: false,
      condition: "Job stage changes to Payments/Invoicing and workflow is Default",
      action: "Create tasks Depreciation Released/Final Payment Collection",
      frequency: "Every time"
    },
    { 
      id: 2, 
      name: "Depreciation/Final Payment Collection", 
      enabled: true,
      condition: "Job stage changes to Payments/Invoicing",
      action: "Send email to customer",
      frequency: "Once per job"
    },
    { 
      id: 3, 
      name: "Reconciliation Kirk Automation", 
      enabled: true,
      condition: "Job completed for 7 days",
      action: "Generate reconciliation report",
      frequency: "Every time"
    },
  ]);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Automation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowseEditor, setShowBrowseEditor] = useState(false);

  const toggleAutomation = (id: number) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Automations</h1>
        <div className="space-x-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-[#dc2626] text-white hover:bg-red-700"
          >
            Create custom
          </button>
          <button 
            onClick={() => setShowBrowseEditor(true)}
            className="px-4 py-2 rounded-lg bg-red-100 text-[#dc2626] hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
          >
            Browse automations
          </button>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Automatically trigger actions to happen based on certain conditions being met
      </p>

      <div className="space-y-3">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleExpanded(automation.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {expandedId === automation.id ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={() => toggleAutomation(automation.id)}
                  className={`${
                    automation.enabled ? "bg-[#dc2626]" : "bg-gray-300 dark:bg-gray-600"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      automation.enabled ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </button>
                
                <span
                  className={`${
                    !automation.enabled ? "text-gray-400" : "text-gray-800 dark:text-gray-200"
                  } font-medium`}
                >
                  {automation.name}
                </span>
                
                {!automation.enabled && (
                  <span className="text-sm text-gray-400">(disabled)</span>
                )}
              </div>

              <button 
                onClick={() => setEditing(automation)}
                className="text-[#dc2626] hover:underline text-sm"
              >
                Edit
              </button>
            </div>

            {/* Expanded Content */}
            {expandedId === automation.id && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="pt-4 space-y-4">
                  {/* If Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">If...</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Job stage changes to</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                        Payments/Invoicing
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">and workflow is</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                        Default
                      </span>
                    </div>
                  </div>

                  {/* Then Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Then...</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                        Create tasks
                      </span>
                      <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
                        Depreciation Released/Final Payment Collection
                      </span>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Frequency</h4>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                      Every time
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && <EditModal automation={editing} onClose={() => setEditing(null)} />}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <AutomationModal onClose={() => setShowCreateModal(false)} />
            </div>
          </div>
        </div>
      )}
      {showBrowseEditor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-4xl h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowBrowseEditor(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <AutomationEditor 
                selectedAutomation={null} 
                onClose={() => setShowBrowseEditor(false)} 
                onSave={() => setShowBrowseEditor(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditModal({
  automation,
  onClose,
}: {
  automation: Automation;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{automation.name}</h2>

        {/* Condition Block */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-3">If...</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Job stage changes to</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              Payments/Invoicing
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">and workflow is</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              Default
            </span>
          </div>
        </div>

        {/* Action Block */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-3">Then...</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
              Create tasks
            </span>
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs font-medium">
              Depreciation Released/Final Payment Collection
            </span>
          </div>
        </div>

        {/* Frequency */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-3">Frequency</h3>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
            Every time
          </span>
        </div>

        <div className="flex justify-between mt-6">
          <button className="text-red-500 hover:underline">Delete</button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#dc2626] text-white rounded-md hover:bg-red-700"
          >
            Save automation
          </button>
        </div>
      </div>
    </div>
  );
}

