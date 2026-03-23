import React, { useState } from 'react';
import { Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { LeadPipelineType } from '../../types/instantEstimatorSettings';
import { instantEstimatorSettingsApi } from '../../services/instantEstimatorSettingsApi';

interface LeadNotificationsSectionProps {
  webhookEnabled: boolean;
  webhookUrl: string;
  notificationEmail: string;
  defaultPipelineType: LeadPipelineType;
  onWebhookEnabledChange: (value: boolean) => void;
  onWebhookUrlChange: (value: string) => void;
  onNotificationEmailChange: (value: string) => void;
  onPipelineTypeChange: (value: LeadPipelineType) => void;
}

export const LeadNotificationsSection: React.FC<LeadNotificationsSectionProps> = ({
  webhookEnabled,
  webhookUrl,
  notificationEmail,
  defaultPipelineType,
  onWebhookEnabledChange,
  onWebhookUrlChange,
  onNotificationEmailChange,
  onPipelineTypeChange,
}) => {
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTestWebhook = async () => {
    if (!webhookUrl) return;

    setTestingWebhook(true);
    setWebhookTestResult(null);

    try {
      const result = await instantEstimatorSettingsApi.testWebhook(webhookUrl);
      setWebhookTestResult(result);
    } catch (error) {
      setWebhookTestResult({
        success: false,
        message: 'Failed to test webhook',
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex gap-8">
        <div className="w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Lead notifications & pipeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure how leads from instant estimators are handled. Leads will automatically create
            opportunities in the selected pipeline category.
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default pipeline type
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              New leads will be added as opportunities in this pipeline category
            </p>
            <select
              value={defaultPipelineType}
              onChange={(e) => onPipelineTypeChange(e.target.value as LeadPipelineType)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notification email
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Receive email notifications when new leads are generated
              </p>
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => onNotificationEmailChange(e.target.value)}
                placeholder="email@example.com"
                className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={webhookEnabled}
                onChange={(e) => onWebhookEnabledChange(e.target.checked)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable webhook notifications
              </span>
            </label>

            {webhookEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Webhook URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => onWebhookUrlChange(e.target.value)}
                      placeholder="https://your-webhook-endpoint.com/leads"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={handleTestWebhook}
                      disabled={!webhookUrl || testingWebhook}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testingWebhook ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Test
                    </button>
                  </div>
                </div>

                {webhookTestResult && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      webhookTestResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {webhookTestResult.success ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm">{webhookTestResult.message}</span>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  A POST request will be sent to this URL whenever a new lead is created
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
