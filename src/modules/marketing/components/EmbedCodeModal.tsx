import React, { useState } from 'react';
import { X, Copy, Check, Code, Link as LinkIcon, FileCode } from 'lucide-react';

interface EmbedCodeModalProps {
  form: {
    name: string;
    public_id: string;
    embed_code?: string;
  };
  onClose: () => void;
}

type EmbedType = 'script' | 'iframe' | 'link';

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ form, onClose }) => {
  const [activeTab, setActiveTab] = useState<EmbedType>('script');
  const [copiedType, setCopiedType] = useState<EmbedType | null>(null);

  const baseUrl = window.location.origin;
  const formUrl = `${baseUrl}/f/${form.public_id}`;

  const scriptEmbed = form.embed_code || `<!-- BuilderLynk Form Embed -->
<div id="builderlynk-form-${form.public_id}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${formUrl}';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '500px';
    iframe.onload = function() {
      window.addEventListener('message', function(e) {
        if (e.data.type === 'builderlynk-form-resize') {
          iframe.style.height = e.data.height + 'px';
        }
      });
    };
    document.getElementById('builderlynk-form-${form.public_id}').appendChild(iframe);
  })();
</script>`;

  const iframeEmbed = `<iframe
  src="${formUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none;">
</iframe>`;

  const embedOptions: Record<EmbedType, { label: string; icon: React.ReactNode; code: string; description: string }> = {
    script: {
      label: 'Script Embed',
      icon: <FileCode size={20} />,
      code: scriptEmbed,
      description: 'Recommended: Auto-resizing script that adapts to form content height',
    },
    iframe: {
      label: 'Simple iFrame',
      icon: <Code size={20} />,
      code: iframeEmbed,
      description: 'Basic iframe embed with fixed height',
    },
    link: {
      label: 'Direct Link',
      icon: <LinkIcon size={20} />,
      code: formUrl,
      description: 'Share this direct link to your form',
    },
  };

  const handleCopy = async (type: EmbedType) => {
    try {
      await navigator.clipboard.writeText(embedOptions[type].code);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Embed Form</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{form.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            {(Object.keys(embedOptions) as EmbedType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors relative ${
                  activeTab === type
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {embedOptions[type].icon}
                <span>{embedOptions[type].label}</span>
                {activeTab === type && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 dark:bg-red-400"></div>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {embedOptions[activeTab].description}
              </p>
            </div>

            <div className="relative">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                  {embedOptions[activeTab].code}
                </pre>
              </div>
              <button
                onClick={() => handleCopy(activeTab)}
                className="absolute top-2 right-2 flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {copiedType === activeTab ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {activeTab === 'script' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  How to use:
                </h4>
                <ol className="text-sm text-red-800 dark:text-red-200 space-y-1 list-decimal list-inside">
                  <li>Copy the code above</li>
                  <li>Paste it into your website's HTML where you want the form to appear</li>
                  <li>The form will automatically resize to fit its content</li>
                </ol>
              </div>
            )}

            {activeTab === 'iframe' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  How to use:
                </h4>
                <ol className="text-sm text-red-800 dark:text-red-200 space-y-1 list-decimal list-inside">
                  <li>Copy the iframe code above</li>
                  <li>Paste it into your website's HTML</li>
                  <li>Adjust the height attribute as needed for your form</li>
                </ol>
              </div>
            )}

            {activeTab === 'link' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                  How to use:
                </h4>
                <ol className="text-sm text-red-800 dark:text-red-200 space-y-1 list-decimal list-inside">
                  <li>Copy the link above</li>
                  <li>Share it via email, social media, or anywhere else</li>
                  <li>Users will be taken directly to your form</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
