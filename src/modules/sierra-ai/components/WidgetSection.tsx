import React, { useState, useEffect } from 'react';
import { Code, Copy, Eye, Settings, Palette, Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { widgetApi, WidgetConfig } from '../services/widgetApi';
import { useWidget } from '../../../shared/context/WidgetContext';

interface WidgetSectionProps {
  agentId?: string;
}

export function WidgetSection({ agentId }: WidgetSectionProps) {
  const { widgetEnabled, setWidgetEnabled, setVapiAgentId } = useWidget();
  const [config, setConfig] = useState<WidgetConfig>({
    theme: 'light',
    primary_color: '#ef4444',
    position: 'bottom-right',
    size: 'medium',
    show_avatar: true,
    show_typing_indicator: true,
    welcome_message: 'Hi! How can I help you today?',
    placeholder: 'Type your message...',
    button_text: 'Chat with us'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activePreview, setActivePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);
  const [VapiAgentId, setVapiAgentIdLocal] = useState<string>('');

  useEffect(() => {
    loadWidgetConfig();
    loadAgentData();
  }, [agentId]);

  const loadAgentData = async () => {
    if (!agentId) return;

    try {
      const { vapiApi } = await import('../services/vapiApi');
      const response = await vapiApi.getAgent(agentId);
      if (response.data?.Vapi_agent_id) {
        setVapiAgentIdLocal(response.data.Vapi_agent_id);
        setVapiAgentId(response.data.Vapi_agent_id);
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    }
  };



  const loadWidgetConfig = async () => {
    if (!agentId) return;

    try {
      setLoading(true);
      const data = await widgetApi.getWidgetConfig(agentId);
      setConfig(data);
    } catch (error) {
      console.error('Error loading widget config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromVapi = async () => {
    if (!agentId) return;

    try {
      setSyncing(true);
      const data = await widgetApi.syncFromVapi(agentId);
      setConfig(data);
      alert('Widget configuration synced from Vapi successfully!');
    } catch (error) {
      console.error('Error syncing from Vapi:', error);
      alert('Failed to sync from Vapi. Make sure your agent is connected.');
    } finally {
      setSyncing(false);
    }
  };

  const handleConfigChange = async (key: keyof WidgetConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);

    if (agentId) {
      try {
        setSaving(true);
        await widgetApi.updateWidgetConfig(agentId, newConfig);
      } catch (error) {
        console.error('Error saving widget config:', error);
        setConfig(config);
      } finally {
        setSaving(false);
      }
    }
  };

  const generateEmbedCode = () => {
    const agentIdToUse = VapiAgentId || agentId || 'your-agent-id';
    return `<Vapi-convai agent-id="${agentIdToUse}"></Vapi-convai>
<script src="https://unpkg.com/@Vapi/convai-widget-embed@beta" async type="text/javascript"></script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    alert('Code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chat Widget
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Embed your AI agent on your website
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={widgetEnabled}
                onChange={(e) => {
                  setWidgetEnabled(e.target.checked);
                  setShowWidgetPreview(e.target.checked);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                {widgetEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Embed Code</span>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{generateEmbedCode()}</code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <select
                  value={config.theme}
                  onChange={(e) => handleConfigChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select
                  value={config.position}
                  onChange={(e) => handleConfigChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <select
                  value={config.size}
                  onChange={(e) => handleConfigChange('size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Behavior
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Avatar
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display agent avatar in chat
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.show_avatar}
                    onChange={(e) => handleConfigChange('show_avatar', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Typing Indicator
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Show when agent is typing
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.show_typing_indicator}
                    onChange={(e) => handleConfigChange('show_typing_indicator', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={config.welcome_message}
                  onChange={(e) => handleConfigChange('welcome_message', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Hi! How can I help you today?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={config.placeholder}
                  onChange={(e) => handleConfigChange('placeholder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={config.button_text}
                  onChange={(e) => handleConfigChange('button_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Chat with us"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview
              </h3>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActivePreview('desktop')}
                  className={`p-2 rounded-md transition-colors ${activePreview === 'desktop'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePreview('tablet')}
                  className={`p-2 rounded-md transition-colors ${activePreview === 'tablet'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePreview('mobile')}
                  className={`p-2 rounded-md transition-colors ${activePreview === 'mobile'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Container */}
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-h-[400px] relative overflow-hidden">
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                {activePreview === 'desktop' && 'Desktop Preview (1200px+)'}
                {activePreview === 'tablet' && 'Tablet Preview (768px - 1199px)'}
                {activePreview === 'mobile' && 'Mobile Preview (< 768px)'}
              </div>

              {/* Mock Website Content */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>

              {/* Chat Widget Preview */}
              {showWidgetPreview && (
                <div
                  className={`absolute ${config.position.includes('bottom') ? 'bottom-4' : 'top-4'
                    } ${config.position.includes('right') ? 'right-4' : 'left-4'
                    }`}
                >
                  {/* Chat Button */}
                  <div
                    className="rounded-full shadow-lg cursor-pointer flex items-center justify-center text-white font-medium"
                    style={{
                      backgroundColor: config.primary_color,
                      width: config.size === 'small' ? '48px' : config.size === 'medium' ? '56px' : '64px',
                      height: config.size === 'small' ? '48px' : config.size === 'medium' ? '56px' : '64px',
                      fontSize: config.size === 'small' ? '12px' : config.size === 'medium' ? '14px' : '16px'
                    }}
                  >
                    💬
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
