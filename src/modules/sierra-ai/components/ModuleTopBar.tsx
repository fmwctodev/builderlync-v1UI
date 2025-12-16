import React from 'react';
import { Bot, Phone, MessageSquare, Globe, Save, Rocket } from 'lucide-react';
import { StatusChip } from './StatusChip';

interface ModuleTopBarProps {
  agentStatus: 'active' | 'paused';
  onToggleStatus: () => void;
  voiceStatus: 'connected' | 'not_connected';
  smsStatus: 'connected' | 'not_connected';
  webchatStatus: 'enabled' | 'disabled';
  hasPendingChanges: boolean;
  onSave: () => void;
  onPublish: () => void;
}

export function ModuleTopBar({
  agentStatus,
  onToggleStatus,
  voiceStatus,
  smsStatus,
  webchatStatus,
  hasPendingChanges,
  onSave,
  onPublish,
}: ModuleTopBarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Bot className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sierra AI</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Voice • SMS • Webchat Agent</p>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Agent Status Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Status:</span>
            <button
              onClick={onToggleStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${
                agentStatus === 'active' ? 'bg-green-600' : 'bg-gray-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  agentStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <StatusChip
              label={agentStatus === 'active' ? 'Active' : 'Paused'}
              status={agentStatus === 'active' ? 'success' : 'neutral'}
              size="md"
            />
          </div>

          {/* Channel Health */}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Voice:</span>
              <StatusChip
                label={voiceStatus === 'connected' ? 'Connected' : 'Not Connected'}
                status={voiceStatus === 'connected' ? 'success' : 'error'}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">SMS:</span>
              <StatusChip
                label={smsStatus === 'connected' ? 'Connected' : 'Not Connected'}
                status={smsStatus === 'connected' ? 'success' : 'error'}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Webchat:</span>
              <StatusChip
                label={webchatStatus === 'enabled' ? 'Enabled' : 'Disabled'}
                status={webchatStatus === 'enabled' ? 'info' : 'neutral'}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-300 dark:border-gray-600">
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={onPublish}
              disabled={!hasPendingChanges}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                hasPendingChanges
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Publish to Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
