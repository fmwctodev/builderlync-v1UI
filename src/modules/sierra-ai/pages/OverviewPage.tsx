import React, { useState } from 'react';
import { Card } from '../components/Card';
import { StatusChip } from '../components/StatusChip';
import { ChannelBadge } from '../components/ChannelBadge';
import {
  Bot,
  Phone,
  MessageSquare,
  Calendar,
  TrendingUp,
  PhoneCall,
  MessageCircle,
  TestTube,
  Send,
  Eye,
  FileText,
  Globe,
  Save,
  Rocket,
} from 'lucide-react';
import {
  mockSierraConfig,
  mockTwilioNumbers,
  mockActivityStats,
} from '../lib/mockData';

interface OverviewPageProps {
  agentStatus: 'active' | 'paused';
  onToggleStatus: () => void;
  onNavigate: (tab: string) => void;
}

export function OverviewPage({ agentStatus, onToggleStatus, onNavigate }: OverviewPageProps) {
  const [showTestCallDrawer, setShowTestCallDrawer] = useState(false);
  const [showTestSMSModal, setShowTestSMSModal] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const leadCaptureQuality = 87;

  const handleSave = async () => {
    console.log('Saving changes...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Changes saved successfully');
  };

  const handlePublish = async () => {
    console.log('Publishing to live...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setHasPendingChanges(false);
    console.log('Published to live successfully');
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Channel Health */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Voice:</span>
              <StatusChip
                label={mockSierraConfig.channels.voice.status === 'connected' ? 'Connected' : 'Not Connected'}
                status={mockSierraConfig.channels.voice.status === 'connected' ? 'success' : 'error'}
              />
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">SMS:</span>
              <StatusChip
                label={mockSierraConfig.channels.sms.status === 'connected' ? 'Connected' : 'Not Connected'}
                status={mockSierraConfig.channels.sms.status === 'connected' ? 'success' : 'error'}
              />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Webchat:</span>
              <StatusChip
                label={mockSierraConfig.channels.webchat.status === 'enabled' ? 'Enabled' : 'Disabled'}
                status={mockSierraConfig.channels.webchat.status === 'enabled' ? 'info' : 'neutral'}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={handlePublish}
              disabled={!hasPendingChanges}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                hasPendingChanges
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Publish to Live
            </button>
          </div>
        </div>
      </div>
      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Agent Status Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Bot className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <button
              onClick={onToggleStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                agentStatus === 'active' ? 'bg-green-600' : 'bg-gray-400'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  agentStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sierra is {agentStatus === 'active' ? 'Active' : 'Paused'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {agentStatus === 'active'
                ? 'Currently answering calls & messages'
                : 'Not answering new calls & messages'}
            </p>
          </div>
        </Card>

        {/* Connected Numbers Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <StatusChip label={`${mockTwilioNumbers.length} Active`} status="success" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connected Numbers</h3>
            <div className="mt-3 space-y-2">
              {mockTwilioNumbers.slice(0, 3).map((number) => (
                <div key={number.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate">{number.label}</span>
                  <div className="flex gap-1">
                    {number.channels.map((ch) => (
                      <ChannelBadge key={ch} channel={ch} size="sm" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate('numbers-routing')}
              className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Manage Numbers →
            </button>
          </div>
        </Card>

        {/* Today's Activity Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Activity</h3>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Calls handled</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mockActivityStats.callsHandled}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">SMS/Chats</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mockActivityStats.smsChatsHandled}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Appointments</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mockActivityStats.appointmentsBooked}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Lead Capture Quality Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <StatusChip
              label={leadCaptureQuality >= 80 ? 'Excellent' : leadCaptureQuality >= 60 ? 'Good' : 'Needs Work'}
              status={leadCaptureQuality >= 80 ? 'success' : leadCaptureQuality >= 60 ? 'warning' : 'error'}
            />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Capture Quality</h3>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{leadCaptureQuality}%</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Name + Location</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${leadCaptureQuality}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                % of conversations with name + location captured
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" subtitle="Test Sierra's behavior and review performance">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTestCallDrawer(true)}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-600 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
          >
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/50">
              <PhoneCall className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Test Inbound Call</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Simulate call flow</div>
            </div>
          </button>

          <button
            onClick={() => setShowTestSMSModal(true)}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50">
              <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Send Test SMS</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Test SMS templates</div>
            </div>
          </button>

          <button
            onClick={() => {}}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
          >
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/50">
              <Eye className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Open Webchat Preview</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">See widget in action</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('logs-testing')}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group"
          >
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50">
              <TestTube className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">View Conversation Logs</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Review past interactions</div>
            </div>
          </button>
        </div>
      </Card>

      {/* Webchat Preview */}
      <Card title="Webchat Preview" subtitle="See how your webchat widget appears to visitors">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
            {/* Mock Website Header */}
            <div className="bg-primary-600 text-white p-4 rounded-t-lg">
              <h2 className="font-bold text-lg">Elite Roofing & Solar</h2>
              <p className="text-sm opacity-90">Professional Roofing Solutions</p>
            </div>

            {/* Chat Widget */}
            <div className="p-4 space-y-4">
              {/* Widget Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Sierra</div>
                  <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Online now
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Hi! I'm Sierra from Elite Roofing & Solar. How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <div className="bg-red-600 text-white rounded-lg rounded-tr-none p-3 max-w-[80%]">
                    <p className="text-sm">I need a quote for a roof replacement</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <p className="text-sm text-gray-900 dark:text-white">
                      I'd be happy to help with that! We offer free roof inspections. What's your name and what city
                      are you located in?
                    </p>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled
                />
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Test Call Drawer (simplified - would be a full drawer component) */}
      {showTestCallDrawer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Test Inbound Call</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This would open a test console to simulate an inbound call scenario.
            </p>
            <button
              onClick={() => setShowTestCallDrawer(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Test SMS Modal (simplified) */}
      {showTestSMSModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Send Test SMS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This would open a form to send a test SMS message.
            </p>
            <button
              onClick={() => setShowTestSMSModal(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
