import React, { useState } from 'react';
import { Plus, Minus, MoreHorizontal, Edit, Copy, Power } from 'lucide-react';
import CreateStarterAgentsModal from './CreateStarterAgentsModal';
import CreateAgentModal from './CreateAgentModal';

const ReviewsAITab: React.FC = () => {
  const [aiMode, setAiMode] = useState('off');
  const [waitTime, setWaitTime] = useState(1);
  const [timeUnit, setTimeUnit] = useState('Days');
  const [isStarterAgentsModalOpen, setIsStarterAgentsModalOpen] = useState(false);
  const [isCreateAgentModalOpen, setIsCreateAgentModalOpen] = useState(false);

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Reviews AI</h3>

      <div className="space-y-6 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="off"
              name="aiMode"
              value="off"
              checked={aiMode === 'off'}
              onChange={(e) => setAiMode(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <label htmlFor="off" className="font-medium text-gray-900 dark:text-white">Off</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Turn off Reviews AI to stop receiving suggestions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="suggestive"
              name="aiMode"
              value="suggestive"
              checked={aiMode === 'suggestive'}
              onChange={(e) => setAiMode(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <label htmlFor="suggestive" className="font-medium text-gray-900 dark:text-white">Suggestive</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Helps you articulate review responses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="auto"
              name="aiMode"
              value="auto"
              checked={aiMode === 'auto'}
              onChange={(e) => setAiMode(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <div>
              <label htmlFor="auto" className="font-medium text-gray-900 dark:text-white">Auto Responses</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically sends reviews responses</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Wait time before responding
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setWaitTime(Math.max(1, waitTime - 1))}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={waitTime}
                onChange={(e) => setWaitTime(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-0 focus:ring-0 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => setWaitTime(waitTime + 1)}
                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Plus size={16} />
              </button>
            </div>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="Minutes">Minutes</option>
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Reviews AI Agents</h4>
          <div className="flex gap-2">
            <button
              onClick={() => setIsStarterAgentsModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Starter Agents
            </button>
            <button
              onClick={() => setIsCreateAgentModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Agent
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Agent Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Date Updated</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Review Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Review Source</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Tones</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Responses</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">LR</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Legacy Reviews AI</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">04/29/2025</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">All Reviews</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">All</td>
                <td className="px-4 py-3 text-sm text-red-600">❌ No Tone</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">0</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400"></td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <CreateStarterAgentsModal
        isOpen={isStarterAgentsModalOpen}
        onClose={() => setIsStarterAgentsModalOpen(false)}
      />
      <CreateAgentModal
        isOpen={isCreateAgentModalOpen}
        onClose={() => setIsCreateAgentModalOpen(false)}
      />
    </div>
  );
};

export default ReviewsAITab;