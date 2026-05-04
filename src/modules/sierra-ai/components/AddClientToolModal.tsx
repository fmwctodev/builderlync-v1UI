import React, { useState } from 'react';
import { X, Wrench, Plus, Trash2, Code } from 'lucide-react';
import {
  ClientToolParameter,
  CreateClientToolInput,
} from '../services/clientToolsApi';

interface AddClientToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: CreateClientToolInput) => Promise<void>;
}

export function AddClientToolModal({
  isOpen,
  onClose,
  onSave,
}: AddClientToolModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [waitForResponse, setWaitForResponse] = useState(false);
  const [disableInterruptions, setDisableInterruptions] = useState(false);
  const [preToolSpeech, setPreToolSpeech] = useState<'auto' | 'always' | 'never'>('auto');
  const [executionMode, setExecutionMode] = useState<'immediately' | 'after_speech' | 'during_speech'>('after_speech');
  const [parameters, setParameters] = useState<ClientToolParameter[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);

  if (!isOpen) return null;

  const handleAddParameter = () => {
    setParameters([
      ...parameters,
      { name: '', type: 'string', description: '', required: false },
    ]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleParameterChange = (
    index: number,
    field: keyof ClientToolParameter,
    value: string | boolean
  ) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a tool name');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        wait_for_response: waitForResponse,
        disable_interruptions: disableInterruptions,
        pre_tool_speech: preToolSpeech,
        execution_mode: executionMode,
        parameters: parameters.filter(p => p.name.trim()),
        webhook_url: webhookUrl.trim() || null,
      });
      handleClose();
    } catch (error) {
      console.error('Error saving tool:', error);
      alert('Failed to save tool. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setWaitForResponse(false);
    setDisableInterruptions(false);
    setPreToolSpeech('auto');
    setExecutionMode('after_speech');
    setParameters([]);
    setWebhookUrl('');
    setShowJsonEditor(false);
    onClose();
  };

  const getJsonRepresentation = () => {
    return JSON.stringify(
      {
        name,
        description,
        wait_for_response: waitForResponse,
        disable_interruptions: disableInterruptions,
        pre_tool_speech: preToolSpeech,
        execution_mode: executionMode,
        parameters,
        webhook_url: webhookUrl || null,
      },
      null,
      2
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add client tool
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Configuration
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">📹</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Describe to the LLM how and when to use the tool.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter tool name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Describe what this tool does"
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <input
                  type="checkbox"
                  id="waitForResponse"
                  checked={waitForResponse}
                  onChange={(e) => setWaitForResponse(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div>
                  <label
                    htmlFor="waitForResponse"
                    className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  >
                    Wait for response
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select this box to make the agent wait for the tool to finish executing
                    before resuming the conversation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <input
                  type="checkbox"
                  id="disableInterruptions"
                  checked={disableInterruptions}
                  onChange={(e) => setDisableInterruptions(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div>
                  <label
                    htmlFor="disableInterruptions"
                    className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  >
                    Disable interruptions
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select this box to disable interruptions while the tool is running.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Pre-tool speech
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Force agent speech before tool execution or let it decide automatically based on
                  recent execution times.
                </p>
                <select
                  value={preToolSpeech}
                  onChange={(e) => setPreToolSpeech(e.target.value as 'auto' | 'always' | 'never')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="auto">Auto</option>
                  <option value="always">Always</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Execution mode
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Determines when and how the tool executes relative to agent speech.
                </p>
                <select
                  value={executionMode}
                  onChange={(e) => setExecutionMode(e.target.value as 'immediately' | 'after_speech' | 'during_speech')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="immediately">Immediately</option>
                  <option value="after_speech">After speech</option>
                  <option value="during_speech">During speech</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Parameters
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Define the parameters that will be sent with the event.
                </p>
              </div>
              <button
                onClick={handleAddParameter}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Add param
              </button>
            </div>

            {parameters.length > 0 && (
              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) =>
                            handleParameterChange(index, 'name', e.target.value)
                          }
                          placeholder="Parameter name"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <select
                          value={param.type}
                          onChange={(e) =>
                            handleParameterChange(index, 'type', e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="array">Array</option>
                          <option value="object">Object</option>
                          <option value="date">Date</option>
                        </select>
                        <input
                          type="text"
                          value={param.description}
                          onChange={(e) =>
                            handleParameterChange(index, 'description', e.target.value)
                          }
                          placeholder="Description"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) =>
                              handleParameterChange(index, 'required', e.target.checked)
                            }
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Required
                          </span>
                        </label>
                      </div>
                      <button
                        onClick={() => handleRemoveParameter(index)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Dynamic Variables
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Variables in tool parameters will be replaced with actual values when the webhook is
              called.
            </p>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                Available: {'{'}
                {'{'}contact.name{'}}'}
                {', '}
                {'{'}
                {'{'}contact.phone{'}}'}
                {', '}
                {'{'}
                {'{'}contact.email{'}}'}
                {', '}
                {'{'}
                {'{'}agent.name{'}}'}
                {', '}
                {'{'}
                {'{'}conversation.id{'}}'}
                {', '}
                {'{'}
                {'{'}timestamp{'}}'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://example.com/webhook"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={() => {
              const json = getJsonRepresentation();
              navigator.clipboard.writeText(json);
              alert('JSON copied to clipboard');
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Code className="w-4 h-4" />
            Edit as JSON
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Add tool'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
