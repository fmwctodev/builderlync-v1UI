import React, { useState } from 'react';
import { Shield, Plus, X, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { SecurityOverrides, WebhookConfig } from '../services/agentsApi';

interface SecuritySectionProps {
  authenticationEnabled: boolean;
  onAuthenticationEnabledChange: (enabled: boolean) => void;
  allowlist: string[];
  onAllowlistChange: (allowlist: string[]) => void;
  overrides: SecurityOverrides;
  onOverridesChange: (overrides: SecurityOverrides) => void;
  conversationInitiationWebhook: WebhookConfig;
  onConversationInitiationWebhookChange: (webhook: WebhookConfig) => void;
  postCallWebhook: WebhookConfig;
  onPostCallWebhookChange: (webhook: WebhookConfig) => void;
  dailyCallLimit: number;
  onDailyCallLimitChange: (limit: number) => void;
  concurrentCallLimit: number;
  onConcurrentCallLimitChange: (limit: number) => void;
  burstingEnabled: boolean;
  onBurstingEnabledChange: (enabled: boolean) => void;
}

export function SecuritySection({
  authenticationEnabled,
  onAuthenticationEnabledChange,
  allowlist,
  onAllowlistChange,
  overrides,
  onOverridesChange,
  conversationInitiationWebhook,
  onConversationInitiationWebhookChange,
  postCallWebhook,
  onPostCallWebhookChange,
  dailyCallLimit,
  onDailyCallLimitChange,
  concurrentCallLimit,
  onConcurrentCallLimitChange,
  burstingEnabled,
  onBurstingEnabledChange,
}: SecuritySectionProps) {
  const [newHost, setNewHost] = useState('');

  const handleAddHost = () => {
    if (newHost.trim() && !allowlist.includes(newHost.trim())) {
      onAllowlistChange([...allowlist, newHost.trim()]);
      setNewHost('');
    }
  };

  const handleRemoveHost = (host: string) => {
    onAllowlistChange(allowlist.filter((h) => h !== host));
  };

  const handleOverrideToggle = (key: keyof SecurityOverrides) => {
    onOverridesChange({
      ...overrides,
      [key]: !overrides[key],
    });
  };

  const overrideOptions: { key: keyof SecurityOverrides; label: string }[] = [
    { key: 'agent_language', label: 'Agent language' },
    { key: 'first_message', label: 'First message' },
    { key: 'system_prompt', label: 'System prompt' },
    { key: 'llm', label: 'LLM' },
    { key: 'voice', label: 'Voice' },
    { key: 'voice_speed', label: 'Voice speed' },
    { key: 'voice_stability', label: 'Voice stability' },
    { key: 'voice_similarity', label: 'Voice similarity' },
    { key: 'text_only', label: 'Text only' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security</h1>
      </div>

      {/* Authentication Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Authentication
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Require users to authenticate before connecting to the agent.
            </p>
            <button className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Shield className="w-4 h-4" />
              Learn how to secure your Vapi Agent
            </button>
          </div>
          <button
            onClick={() => onAuthenticationEnabledChange(!authenticationEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              authenticationEnabled ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                authenticationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Allowlist Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Allowlist</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Specify the hosts that will be allowed to connect to this agent.
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Allowlist</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newHost}
                onChange={(e) => setNewHost(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddHost()}
                placeholder="example.com"
                className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
              />
              <button
                onClick={handleAddHost}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add host
              </button>
            </div>
          </div>

          {allowlist.length === 0 ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-600 dark:text-red-400">
                  <p>
                    No allowlist specified. Any host will be able to connect to this agent. We
                    strongly recommend setting up an allowlist when using overrides.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {allowlist.map((host) => (
                <div
                  key={host}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{host}</span>
                  <button
                    onClick={() => handleRemoveHost(host)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overrides Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Overrides</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Choose which parts of the config can be overridden by the client at the start of the
            conversation.
          </p>

          <div className="space-y-3">
            {overrideOptions.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </span>
                <button
                  onClick={() => handleOverrideToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    overrides[option.key]
                      ? 'bg-gray-900 dark:bg-white'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                      overrides[option.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation Initiation Client Data Webhook Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Conversation Initiation Client Data Webhook
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Configure how the <span className="font-medium">conversation initiation client data</span>{' '}
            is fetched when receiving Twilio or SIP trunk calls.
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Fetch initiation client data from a webhook
            </span>
            <button
              onClick={() =>
                onConversationInitiationWebhookChange({
                  ...conversationInitiationWebhook,
                  enabled: !conversationInitiationWebhook.enabled,
                })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                conversationInitiationWebhook.enabled
                  ? 'bg-gray-900 dark:bg-white'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                  conversationInitiationWebhook.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {conversationInitiationWebhook.enabled && (
            <input
              type="url"
              value={conversationInitiationWebhook.url || ''}
              onChange={(e) =>
                onConversationInitiationWebhookChange({
                  ...conversationInitiationWebhook,
                  url: e.target.value,
                })
              }
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
            />
          )}
        </div>
      </div>

      {/* Post-call Webhook Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Post-call Webhook
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Override the post-call webhook for this agent. You can configure the default webhooks
            used by all agents in <span className="font-medium">your workspace settings</span>.
          </p>
          <button className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
            <LinkIcon className="w-4 h-4" />
            Learn how to automate post-call workflows with Vapi & n8n
          </button>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Post-call webhook
            </span>
            <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Create Webhook
            </button>
          </div>

          {postCallWebhook.url ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-900 dark:text-white">{postCallWebhook.url}</span>
              <button
                onClick={() =>
                  onPostCallWebhookChange({ url: null, enabled: false })
                }
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No post-call webhook configured.
            </div>
          )}
        </div>
      </div>

      {/* Limits Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Limits</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Configure conversation limits and timeout durations
          </p>

          <div className="space-y-6">
            {/* Daily call limit */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Daily call limit
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                The maximum number of calls allowed per day.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={dailyCallLimit}
                  onChange={(e) => onDailyCallLimitChange(parseInt(e.target.value) || 0)}
                  className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Calls per day</span>
              </div>
            </div>

            {/* Concurrent call limit */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Concurrent call limit
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                The maximum number of concurrent calls allowed.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={concurrentCallLimit}
                  onChange={(e) => onConcurrentCallLimitChange(parseInt(e.target.value) || -1)}
                  className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {concurrentCallLimit === -1 ? 'Using subscription limit' : 'Concurrent calls'}
                </span>
              </div>
            </div>

            {/* Enable bursting */}
            <div className="flex items-start justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable bursting
                  </span>
                  <button
                    onClick={() => onBurstingEnabledChange(!burstingEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      burstingEnabled
                        ? 'bg-gray-900 dark:bg-white'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${
                        burstingEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  If enabled, the agent can exceed the workspace subscription concurrency limit by up
                  to 3 times, with excess calls charged at double the normal rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
