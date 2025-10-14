import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

interface IfCondition {
  id: number;
  type: string;
  operator: string;
  value: string;
  workflow: string;
}

interface ThenAction {
  id: number;
  type: string;
  stage: string;
}

interface AutomationEditorProps {
  selectedAutomation: any;
  onClose: () => void;
  onSave: () => void;
}

export default function AutomationEditor({ selectedAutomation, onClose, onSave }: AutomationEditorProps) {
  const [isAutomationEnabled, setIsAutomationEnabled] = useState(false);
  const [frequency, setFrequency] = useState('oncePerJob');
  const [ifConditions, setIfConditions] = useState<IfCondition[]>([
    { id: 1, type: 'proposalStatus', operator: 'changesTo', value: 'won', workflow: 'default' }
  ]);
  const [thenActions, setThenActions] = useState<ThenAction[]>([
    { id: 1, type: 'changeJobStage', stage: '' }
  ]);

  useEffect(() => {
    if (selectedAutomation === null) {
      setIsAutomationEnabled(false);
      setFrequency('oncePerJob');
      setIfConditions([{ id: 1, type: '', operator: '', value: '', workflow: '' }]);
      setThenActions([{ id: 1, type: '', stage: '' }]);
    } else {
      setIsAutomationEnabled(true);
      setFrequency(selectedAutomation.id === '1' ? 'everyTime' : 'oncePerJob');
      setIfConditions([
        { id: 1, type: 'proposalStatus', operator: 'changesTo', value: 'won', workflow: 'default' }
      ]);
      setThenActions([
        { id: 1, type: 'changeJobStage', stage: 'Qualified' }
      ]);
    }
  }, [selectedAutomation]);

  const addIfCondition = () => {
    setIfConditions([...ifConditions, { id: ifConditions.length + 1, type: '', operator: '', value: '', workflow: '' }]);
  };

  const removeIfCondition = (idToRemove: number) => {
    setIfConditions(ifConditions.filter(condition => condition.id !== idToRemove));
  };

  const addThenAction = () => {
    setThenActions([...thenActions, { id: thenActions.length + 1, type: '', stage: '' }]);
  };

  const removeThenAction = (idToRemove: number) => {
    setThenActions(thenActions.filter(action => action.id !== idToRemove));
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {selectedAutomation === null ? 'Custom Automation' : selectedAutomation.name}
      </h2>

      {/* If... Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">If...</h3>
        {ifConditions.map((condition, index) => (
          <div key={condition.id} className={`flex items-center space-x-3 mb-4 ${index > 0 ? 'mt-4' : ''}`}>
            {index > 0 && <span className="font-semibold text-gray-700 dark:text-gray-300">AND</span>}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="relative col-span-1">
                <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm pl-3 pr-10 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select Condition</option>
                  <option value="proposalStatus">Proposal status</option>
                  <option value="jobStage">Job stage</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center space-x-2 col-span-2">
                <span className="text-gray-700 dark:text-gray-300">changes to</span>
                <div className="relative flex-grow">
                  <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm pl-3 pr-10 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select Value</option>
                    <option value="sent">Sent</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {index === 0 && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                    When
                  </span>
                )}
                {ifConditions.length > 1 && (
                  <button onClick={() => removeIfCondition(condition.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Workflow condition */}
        <div className="flex items-center space-x-3 mt-4">
          <span className="font-semibold text-gray-700 dark:text-gray-300">AND</span>
          <div className="flex-grow grid grid-cols-2 gap-3 items-center">
            <span className="text-gray-700 dark:text-gray-300">Workflow is</span>
            <div className="relative">
              <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm pl-3 pr-10 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="default">Default</option>
                <option value="custom1">Custom Workflow 1</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Then... Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Then...</h3>
        {thenActions.map((action, index) => (
          <div key={action.id} className="mb-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Then change job stage to</h4>
            <div className="flex items-center space-x-3">
              <div className="relative flex-grow">
                <select className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm pl-3 pr-10 py-2 text-base focus:border-[#dc2626] focus:ring-[#dc2626] sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Please select a stage</option>
                  <option value="New Lead">New Lead</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {thenActions.length > 1 && (
                <button onClick={() => removeThenAction(action.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Options Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Options</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Frequency</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This automation happens...</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFrequency('everyTime')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              frequency === 'everyTime' ? 'bg-[#dc2626] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Every time
          </button>
          <button
            onClick={() => setFrequency('oncePerJob')}
            className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
              frequency === 'oncePerJob' ? 'bg-[#dc2626] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Only once per job
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between mt-auto">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500"
        >
          Close
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isAutomationEnabled ? 'Enabled' : 'Not enabled'}
          </span>
          <button
            onClick={() => setIsAutomationEnabled(!isAutomationEnabled)}
            className={`${
              isAutomationEnabled ? 'bg-[#dc2626]' : 'bg-gray-300 dark:bg-gray-600'
            } relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span
              className={`${
                isAutomationEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-5 w-5 transform rounded-full bg-white shadow transition`}
            />
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-[#dc2626] border border-transparent rounded-md shadow-sm hover:bg-red-700"
          >
            Add automation
          </button>
        </div>
      </div>
    </div>
  );
}