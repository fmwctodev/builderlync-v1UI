import React, { useState, useEffect } from 'react';
import { Wrench, Plus } from 'lucide-react';
import { SystemTool } from '../services/agentsApi';
import {
  ClientTool,
  CreateClientToolInput,
  fetchClientTools,
  createClientTool,
  deleteClientTool,
  toggleClientTool,
} from '../services/clientToolsApi';
import { AddClientToolModal } from './AddClientToolModal';
import { ClientToolCard } from './ClientToolCard';

interface ToolsSectionProps {
  agentId?: string;
  organizationId?: string;
  tools: SystemTool[];
  onChange: (tools: SystemTool[]) => void;
}

export function ToolsSection({ agentId, organizationId, tools, onChange }: ToolsSectionProps) {
  const activeToolsCount = tools.filter((tool) => tool.enabled).length;
  const [clientTools, setClientTools] = useState<ClientTool[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoadingClientTools, setIsLoadingClientTools] = useState(false);

  const activeClientToolsCount = clientTools.filter((tool) => tool.enabled).length;

  useEffect(() => {
    if (agentId) {
      loadClientTools();
    }
  }, [agentId]);

  const loadClientTools = async () => {
    if (!agentId) return;

    setIsLoadingClientTools(true);
    try {
      const tools = await fetchClientTools(agentId);
      setClientTools(tools);
    } catch (error) {
      console.error('Error loading client tools:', error);
    } finally {
      setIsLoadingClientTools(false);
    }
  };

  const handleToggleTool = (toolId: string) => {
    const updatedTools = tools.map((tool) =>
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
    );
    onChange(updatedTools);
  };

  const handleAddClientTool = async (input: CreateClientToolInput) => {
    if (!agentId || !organizationId) {
      throw new Error('Agent ID and Organization ID are required');
    }

    await createClientTool(agentId, organizationId, input);
    await loadClientTools();
  };

  const handleToggleClientTool = async (toolId: string, enabled: boolean) => {
    try {
      await toggleClientTool(toolId, enabled);
      await loadClientTools();
    } catch (error) {
      console.error('Error toggling client tool:', error);
    }
  };

  const handleDeleteClientTool = async (toolId: string) => {
    try {
      await deleteClientTool(toolId);
      await loadClientTools();
    } catch (error) {
      console.error('Error deleting client tool:', error);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Client Tools</h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={!agentId || !organizationId}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Allow custom integrations and webhook-based actions.
          </p>

          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {activeClientToolsCount} active {activeClientToolsCount === 1 ? 'tool' : 'tools'}
            </div>
          </div>

          {isLoadingClientTools ? (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              Loading client tools...
            </div>
          ) : clientTools.length > 0 ? (
            <div className="space-y-2">
              {clientTools.map((tool) => (
                <ClientToolCard
                  key={tool.id}
                  tool={tool}
                  onToggle={handleToggleClientTool}
                  onDelete={handleDeleteClientTool}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
              No client tools added yet. Click "Add Tool" to create one.
            </div>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System tools</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Allow the agent perform built-in actions.
            </p>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {activeToolsCount} active {activeToolsCount === 1 ? 'tool' : 'tools'}
            </div>
          </div>

          <div className="space-y-3">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tool.name}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleTool(tool.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tool.enabled ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      tool.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddClientToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddClientTool}
      />
    </>
  );
}
