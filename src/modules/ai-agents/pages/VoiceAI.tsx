import { Plus, Bot } from 'lucide-react';

export function VoiceAI() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 dark:text-gray-400">
          Create and manage Voice Agents for your Business
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dashboard & Logs</h3>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Agent List</h4>
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No agents available</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No Agent is Created</p>
              <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                Create AI
              </button>
            </div>
          </div>
          
          <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
            No Agents have been created yet. Create an Agent to view Stats and Logs.
          </div>
        </div>
      </div>
    </div>
  );
}