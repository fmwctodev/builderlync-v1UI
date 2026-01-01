import React, { useState, useEffect } from 'react';
import { Code, Copy, Eye, RefreshCw, Upload } from 'lucide-react';
import { useWidget } from '../../../shared/context/WidgetContext';

interface WidgetSectionProps {
  agentId?: string;
}

export function WidgetSection({ agentId }: WidgetSectionProps) {
  const { widgetEnabled, setWidgetEnabled, setElevenlabsAgentId, setWidgetConfig } = useWidget();
  const [config, setConfig] = useState({
    avatarType: 'orb' as 'orb' | 'link' | 'image',
    avatarUrl: '',
    avatarImage: null as File | null,
    color: '#7C3AED',
    position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [elevenlabsAgentId, setElevenlabsAgentIdLocal] = useState<string>('');

  useEffect(() => {
    loadAgentData();
  }, [agentId]);

  useEffect(() => {
    if (elevenlabsAgentId) {
      loadWidgetFromElevenLabs();
    }
  }, [elevenlabsAgentId]);

  const loadAgentData = async () => {
    if (!agentId) return;
    
    try {
      const { elevenlabsApi } = await import('../services/elevenlabsApi');
      const response = await elevenlabsApi.getAgent(agentId);
      if (response.data?.elevenlabs_agent_id) {
        setElevenlabsAgentIdLocal(response.data.elevenlabs_agent_id);
        setElevenlabsAgentId(response.data.elevenlabs_agent_id);
      }
    } catch (error) {
      console.error('Error loading agent data:', error);
    }
  };

  const loadWidgetFromElevenLabs = async () => {
    if (!elevenlabsAgentId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-agents/${agentId}/widget`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.widget_config) {
          setConfig({
            avatarType: data.widget_config.avatar_type || 'orb',
            avatarUrl: data.widget_config.avatar_url || '',
            avatarImage: null,
            color: data.widget_config.color || '#7C3AED',
            position: data.widget_config.position || 'bottom-right'
          });
        }
      }
    } catch (error) {
      console.error('Error loading widget from ElevenLabs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!elevenlabsAgentId) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai-agents/${agentId}/widget/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        const newConfig = { ...config, avatarType: 'image' as const, avatarUrl: data.avatar_url, avatarImage: file };
        setConfig(newConfig);
        setWidgetConfig({
          avatarUrl: data.avatar_url,
          color: newConfig.color,
          position: newConfig.position
        });
      } else {
        alert('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleConfigChange = async (key: keyof typeof config, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    
    const widgetConfigForContext = {
      avatarUrl: newConfig.avatarType === 'orb' ? '' : newConfig.avatarUrl,
      color: newConfig.color,
      position: newConfig.position
    };
    setWidgetConfig(widgetConfigForContext);
    
    if (agentId && widgetEnabled) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/ai-agents/${agentId}/widget`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            widget_config: {
              avatar_type: newConfig.avatarType,
              avatar_url: newConfig.avatarUrl,
              color: newConfig.color,
              position: newConfig.position
            }
          })
        });
      } catch (error) {
        console.error('Error updating widget config:', error);
      }
    }
  };

  const generateEmbedCode = () => {
    const agentIdToUse = elevenlabsAgentId || 'your-agent-id';
    let code = `<elevenlabs-convai agent-id="${agentIdToUse}"`;
    
    if (config.avatarType !== 'orb' && config.avatarUrl) {
      code += ` avatar-url="${config.avatarUrl}"`;
    }
    if (config.color) {
      code += ` color="${config.color}"`;
    }
    if (config.position) {
      code += ` position="${config.position}"`;
    }
    
    code += `></elevenlabs-convai>\n<script src="https://unpkg.com/@elevenlabs/convai-widget-embed@beta" async type="text/javascript"></script>`;
    return code;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    alert('Code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chat Widget</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Embed your AI agent on your website</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadWidgetFromElevenLabs}
              disabled={!elevenlabsAgentId || loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={widgetEnabled}
                onChange={(e) => setWidgetEnabled(e.target.checked)}
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
            <button onClick={copyToClipboard} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white">
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
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar Type</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="orb"
                      checked={config.avatarType === 'orb'}
                      onChange={(e) => handleConfigChange('avatarType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Orb (Voice visualization)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="link"
                      checked={config.avatarType === 'link'}
                      onChange={(e) => handleConfigChange('avatarType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Link (URL)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="image"
                      checked={config.avatarType === 'image'}
                      onChange={(e) => handleConfigChange('avatarType', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Image (Upload)</span>
                  </label>
                </div>
              </div>

              {config.avatarType === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Avatar URL</label>
                  <input
                    type="text"
                    value={config.avatarUrl}
                    onChange={(e) => handleConfigChange('avatarUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              )}

              {config.avatarType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Avatar</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {uploading ? 'Uploading...' : config.avatarImage ? config.avatarImage.name : 'Choose image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {config.avatarUrl && (
                    <div className="mt-2">
                      <img src={config.avatarUrl} alt="Avatar preview" className="w-16 h-16 rounded-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.color}
                    onChange={(e) => handleConfigChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.color}
                    onChange={(e) => handleConfigChange('color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                <select
                  value={config.position}
                  onChange={(e) => handleConfigChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Preview
          </h3>
          
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-h-[400px] relative overflow-hidden">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>

            {widgetEnabled && (
              <div
                className={`absolute ${
                  config.position.includes('bottom') ? 'bottom-4' : 'top-4'
                } ${
                  config.position.includes('right') ? 'right-4' : 'left-4'
                }`}
              >
                <div
                  className="rounded-full shadow-lg cursor-pointer flex items-center justify-center text-white font-medium w-14 h-14 overflow-hidden"
                  style={{ backgroundColor: config.color }}
                >
                  {config.avatarType === 'orb' ? (
                    '💬'
                  ) : config.avatarUrl ? (
                    <img src={config.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    '💬'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
