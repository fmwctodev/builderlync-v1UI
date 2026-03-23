import { useState } from "react";
import { X } from "lucide-react";

interface Automation {
  id: number;
  name: string;
  enabled: boolean;
  description?: string;
}

export function Automations() {
  const [automations, setAutomations] = useState<Automation[]>([
    { id: 1, name: "Adjuster Meeting Details Follow Up", enabled: false },
    { id: 2, name: "Depreciation/Final Payment Collection", enabled: true },
    { id: 3, name: "Reconciliation Kirk Automation", enabled: true },
  ]);

  const [editing, setEditing] = useState<Automation | null>(null);

  const toggleAutomation = (id: number) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Automations</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
            Create custom
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary-100 text-red-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300">
            Browse automations
          </button>
        </div>
      </div>

      <p className="text-gray-500 dark:text-gray-400 mb-4">
        Automatically trigger actions to happen based on certain conditions being met
      </p>

      <div className="space-y-4">
        {automations.map((automation) => (
          <div
            key={automation.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleAutomation(automation.id)}
                className={`${
                  automation.enabled ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
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
                <span className="text-sm text-gray-400 ml-1">(disabled)</span>
              )}
            </div>

            <button
              onClick={() => setEditing(automation)}
              className="text-primary-600 hover:underline"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {editing && <EditModal automation={editing} onClose={() => setEditing(null)} />}
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
          <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">If...</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Job stage</option>
            </select>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>remains in</option>
            </select>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Default: Appointment run</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">for greater than</span>
            <input
              type="number"
              className="w-16 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              defaultValue={3}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
          </div>
        </div>

        {/* Action Block */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Then...</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Send email</option>
            </select>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Customer</option>
            </select>
          </div>
          <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-gray-50 dark:bg-gray-700 text-sm">
            <p className="font-semibold text-gray-900 dark:text-white">Follow-Up: Adjuster Meeting ??</p>
            <p className="text-gray-600 dark:text-gray-400">
              Dear {"{{Customer name}}"}, I hope you're doing well...
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Frequency</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-primary-600 text-white text-sm">
                Every time
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700">
                Only once per job
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">When</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-primary-600 text-white text-sm">
                Immediately
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700">
                Delay
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button className="text-red-500 hover:underline">Delete</button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Save automation
          </button>
        </div>
      </div>
    </div>
  );
}