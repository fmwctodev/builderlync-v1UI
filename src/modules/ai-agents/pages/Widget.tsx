import { Code, Copy, Settings } from 'lucide-react';
import { useState } from 'react';

export function Widget() {
  const [config, setConfig] = useState({
    theme: 'light',
    primaryColor: '#ef4444',
    position: 'bottom-right',
    size: 'medium',
    welcomeMessage: 'Hi! How can I help you today?',
    placeholder: 'Type your message...'
  });

  const generateEmbedCode = () => {
    return `<!-- BuilderLync AI Chat Widget -->
<script>
  window.BuilderLyncConfig = {
    theme: "${config.theme}",
    primaryColor: "${config.primaryColor}",
    position: "${config.position}",
    size: "${config.size}",
    welcomeMessage: "${config.welcomeMessage}",
    placeholder: "${config.placeholder}"
  };
</script>
<script src="${window.location.origin}/chat-widget.js" async></script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    alert('Code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-600 dark:text-gray-400">
          Embed your AI agent on your website with a customizable chat widget
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Widget Configuration
            </h3>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Embed Code
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              <select
                value={config.position}
                onChange={(e) => setConfig({ ...config, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                onChange={(e) => setConfig({ ...config, size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welcome Message
              </label>
              <textarea
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Input Placeholder
              </label>
              <input
                type="text"
                value={config.placeholder}
                onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Embed Code</span>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-300 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <pre className="text-sm text-gray-300 overflow-x-auto">
                <code>{generateEmbedCode()}</code>
              </pre>
            </div>

            <div className="mt-6 bg-gray-100 dark:bg-gray-900 rounded-lg p-4 min-h-[300px] relative">
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                Widget Preview
              </div>
              <div
                className={`absolute ${
                  config.position.includes('bottom') ? 'bottom-4' : 'top-4'
                } ${config.position.includes('right') ? 'right-4' : 'left-4'}`}
              >
                <div
                  className="rounded-full shadow-lg cursor-pointer flex items-center justify-center text-white font-medium"
                  style={{
                    backgroundColor: config.primaryColor,
                    width: config.size === 'small' ? '48px' : config.size === 'medium' ? '56px' : '64px',
                    height: config.size === 'small' ? '48px' : config.size === 'medium' ? '56px' : '64px'
                  }}
                >
                  💬
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
