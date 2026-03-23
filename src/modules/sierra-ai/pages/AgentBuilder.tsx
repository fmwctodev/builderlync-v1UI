import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  Phone,
  MessageSquare,
  Globe,
  Settings,
  Zap,
  Shield,
  Play,
  Pause,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import { fetchAgentById, updateAgent, updateAgentStatus, AIAgent, VoiceConfig, LanguageConfig, SystemTool, DEFAULT_SYSTEM_TOOLS, SecurityOverrides, WebhookConfig, DEFAULT_SECURITY_OVERRIDES, DEFAULT_WEBHOOK_CONFIG } from '../services/agentsApi';
import { SystemPromptSection } from '../components/SystemPromptSection';
import { VoicesSection } from '../components/VoicesSection';
import { LanguageSection } from '../components/LanguageSection';
import { FirstMessageSection } from '../components/FirstMessageSection';
import { ToolsSection } from '../components/ToolsSection';
import { SecuritySection } from '../components/SecuritySection';
import { PhoneNumbersSection } from '../components/PhoneNumbersSection';

type BuilderTab = 'overview' | 'voice-sms' | 'webchat' | 'tools' | 'security';

export function AgentBuilder() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { currentOrganizationSlug, currentOrganization } = useCurrentOrganization();
  const [activeTab, setActiveTab] = useState<BuilderTab>('overview');
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [systemPrompt, setSystemPrompt] = useState('');
  const [voices, setVoices] = useState<VoiceConfig[]>([]);
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [firstMessage, setFirstMessage] = useState('');
  const [firstMessageInterruptible, setFirstMessageInterruptible] = useState(false);
  const [systemTools, setSystemTools] = useState<SystemTool[]>(DEFAULT_SYSTEM_TOOLS);

  const [authenticationEnabled, setAuthenticationEnabled] = useState(false);
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<SecurityOverrides>(DEFAULT_SECURITY_OVERRIDES);
  const [conversationInitiationWebhook, setConversationInitiationWebhook] = useState<WebhookConfig>(DEFAULT_WEBHOOK_CONFIG);
  const [postCallWebhook, setPostCallWebhook] = useState<WebhookConfig>(DEFAULT_WEBHOOK_CONFIG);
  const [dailyCallLimit, setDailyCallLimit] = useState(100000);
  const [concurrentCallLimit, setConcurrentCallLimit] = useState(-1);
  const [burstingEnabled, setBurstingEnabled] = useState(true);

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  useEffect(() => {
    if (agent) {
      setSystemPrompt(agent.system_prompt || '');
      setVoices(agent.voices || []);
      setLanguages(agent.languages || [{ code: 'en', name: 'English', isDefault: true }]);
      setFirstMessage(agent.first_message || '');
      setFirstMessageInterruptible(agent.first_message_interruptible || false);
      setSystemTools(agent.system_tools || DEFAULT_SYSTEM_TOOLS);

      setAuthenticationEnabled(agent.authentication_enabled ?? false);
      setAllowlist(agent.allowlist || []);
      setOverrides(agent.overrides || DEFAULT_SECURITY_OVERRIDES);
      setConversationInitiationWebhook(agent.conversation_initiation_webhook || DEFAULT_WEBHOOK_CONFIG);
      setPostCallWebhook(agent.post_call_webhook || DEFAULT_WEBHOOK_CONFIG);
      setDailyCallLimit(agent.daily_call_limit ?? 100000);
      setConcurrentCallLimit(agent.concurrent_call_limit ?? -1);
      setBurstingEnabled(agent.bursting_enabled ?? true);
    }
  }, [agent]);

  const loadAgent = async () => {
    if (!agentId) return;

    try {
      setLoading(true);
      const data = await fetchAgentById(agentId);
      setAgent(data);
    } catch (error) {
      console.error('Error loading agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!agent) return;

    try {
      setSaving(true);
      const updated = await updateAgent({
        id: agent.id,
        system_prompt: systemPrompt,
        voices,
        languages,
        first_message: firstMessage,
        first_message_interruptible: firstMessageInterruptible,
        system_tools: systemTools,
        authentication_enabled: authenticationEnabled,
        allowlist,
        overrides,
        conversation_initiation_webhook: conversationInitiationWebhook,
        post_call_webhook: postCallWebhook,
        daily_call_limit: dailyCallLimit,
        concurrent_call_limit: concurrentCallLimit,
        bursting_enabled: burstingEnabled,
      });
      setAgent(updated);
      alert('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Agent Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The agent you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate(`/org/${currentOrganizationSlug}/ai-agents`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  const handleStatusToggle = async () => {
    if (!agent) return;

    const newStatus = agent.status === 'active' ? 'paused' : 'active';

    try {
      const updated = await updateAgentStatus(agent.id, newStatus);
      setAgent(updated);
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Failed to update agent status');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Bot },
    { id: 'voice-sms', label: 'Voice & SMS', icon: Phone },
    { id: 'webchat', label: 'Webchat', icon: Globe, enabled: agent.channels.webchat?.enabled },
    { id: 'tools', label: 'Tools', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/org/${currentOrganizationSlug}/ai-agents`)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {agent.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Toggle */}
              <button
                onClick={handleStatusToggle}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  agent.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}
              >
                {agent.status === 'active' ? (
                  <>
                    <Play className="w-4 h-4" />
                    Active
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Paused
                  </>
                )}
              </button>

              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = 'enabled' in tab && !tab.enabled;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id as BuilderTab)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-red-600 text-red-600 dark:border-red-500 dark:text-red-500'
                      : isDisabled
                      ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agent Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {agent.stats.callsHandled || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Calls Handled
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {agent.stats.messagesHandled || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Messages Processed
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {agent.stats.appointmentsBooked || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Appointments Booked
                  </div>
                </div>
              </div>
            </div>

            {/* Main Configuration Grid - System Prompt on left, Voices & Languages on right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - System Prompt (takes up 2 columns) */}
              <div className="lg:col-span-2">
                <SystemPromptSection
                  value={systemPrompt}
                  onChange={setSystemPrompt}
                  onSettingsClick={() => console.log('System prompt settings')}
                />
              </div>

              {/* Right Column - Voices & Languages (takes up 1 column) */}
              <div className="space-y-6">
                <VoicesSection voices={voices} onChange={setVoices} />
                <LanguageSection languages={languages} onChange={setLanguages} />
              </div>
            </div>

            {/* First Message Section (full width) */}
            <FirstMessageSection
              value={firstMessage}
              interruptible={firstMessageInterruptible}
              onChange={setFirstMessage}
              onInterruptibleChange={setFirstMessageInterruptible}
            />

            {/* Agent Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agent Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agent.name}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={agent.description}
                    readOnly
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Main Goal
                  </label>
                  <textarea
                    value={agent.main_goal || ''}
                    readOnly
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Enabled Channels */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Enabled Channels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg ${
                    agent.channels.voice?.enabled
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Phone
                      className={`w-6 h-6 ${
                        agent.channels.voice?.enabled
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Voice</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {agent.channels.voice?.enabled ? 'Configured' : 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg ${
                    agent.channels.sms?.enabled
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare
                      className={`w-6 h-6 ${
                        agent.channels.sms?.enabled
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">SMS</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {agent.channels.sms?.enabled ? 'Configured' : 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg ${
                    agent.channels.webchat?.enabled
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Globe
                      className={`w-6 h-6 ${
                        agent.channels.webchat?.enabled
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Webchat</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {agent.channels.webchat?.enabled ? 'Configured' : 'Not configured'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice-sms' && currentOrganization && (
          <div className="max-w-7xl">
            <PhoneNumbersSection organizationId={currentOrganization.id} />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="max-w-3xl">
            <ToolsSection
              agentId={agentId}
              organizationId={currentOrganization?.id}
              tools={systemTools}
              onChange={setSystemTools}
            />
          </div>
        )}

        {activeTab === 'security' && (
          <SecuritySection
            authenticationEnabled={authenticationEnabled}
            onAuthenticationEnabledChange={setAuthenticationEnabled}
            allowlist={allowlist}
            onAllowlistChange={setAllowlist}
            overrides={overrides}
            onOverridesChange={setOverrides}
            conversationInitiationWebhook={conversationInitiationWebhook}
            onConversationInitiationWebhookChange={setConversationInitiationWebhook}
            postCallWebhook={postCallWebhook}
            onPostCallWebhookChange={setPostCallWebhook}
            dailyCallLimit={dailyCallLimit}
            onDailyCallLimitChange={setDailyCallLimit}
            concurrentCallLimit={concurrentCallLimit}
            onConcurrentCallLimitChange={setConcurrentCallLimit}
            burstingEnabled={burstingEnabled}
            onBurstingEnabledChange={setBurstingEnabled}
          />
        )}

        {activeTab !== 'overview' && activeTab !== 'voice-sms' && activeTab !== 'tools' && activeTab !== 'security' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {tabs.find((t) => t.id === activeTab)?.label} Configuration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your agent's {tabs.find((t) => t.id === activeTab)?.label.toLowerCase()}{' '}
                settings here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
