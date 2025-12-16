import React, { useState } from 'react';
import { Card } from '../components/Card';
import { mockWidgetConfig } from '../lib/mockData';

type ChannelTab = 'voice' | 'sms' | 'webchat';

export function ChannelsPage() {
  const [activeTab, setActiveTab] = useState<ChannelTab>('voice');

  return (
    <div className="space-y-6">
      {/* Channel Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'voice', label: 'Voice' },
          { id: 'sms', label: 'SMS & MMS' },
          { id: 'webchat', label: 'Webchat' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ChannelTab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <Card title="Voice Settings">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Enable Voice Channel</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Hours
                </label>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Monday - Friday: 8:00 AM - 6:00 PM
                  <br />
                  Saturday: 9:00 AM - 2:00 PM
                  <br />
                  Sunday: Closed
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  After Hours Behavior
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="after_hours" defaultChecked />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Sierra answers and offers callback scheduling
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="after_hours" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Send to voicemail</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="after_hours" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Forward to backup number</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'sms' && (
        <div className="space-y-6">
          <Card title="SMS & MMS Settings">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Enable SMS Channel</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inbound Greeting
                </label>
                <textarea
                  rows={2}
                  defaultValue="Hi! This is Sierra with Elite Roofing & Solar. Thanks for reaching out! How can I help you?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Allow MMS (Photo Messages)</span>
              </label>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'webchat' && (
        <div className="space-y-6">
          <Card title="Webchat Settings">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={mockWidgetConfig.enabled} className="rounded" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Enable Webchat Widget</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Widget Title
                </label>
                <input
                  type="text"
                  defaultValue={mockWidgetConfig.title}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Welcome Message
                </label>
                <textarea
                  rows={2}
                  defaultValue={mockWidgetConfig.welcomeMessage}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  defaultValue={mockWidgetConfig.primaryColor}
                  className="w-20 h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Widget Position
                </label>
                <select
                  defaultValue={mockWidgetConfig.position}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">
                Copy Install Snippet
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
