import React, { useState } from 'react';
import { Card } from '../components/Card';
import { StatusChip } from '../components/StatusChip';
import { ChannelBadge } from '../components/ChannelBadge';
import { mockConversations } from '../lib/mockData';
import { Play, Eye } from 'lucide-react';

type TestTab = 'phone' | 'sms';

export function LogsTestingPage() {
  const [testTab, setTestTab] = useState<TestTab>('phone');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const getOutcomeStatus = (outcome: string) => {
    const statusMap: { [key: string]: 'success' | 'info' | 'warning' | 'neutral' } = {
      appointment_booked: 'success',
      info_provided: 'info',
      escalated: 'warning',
      spam: 'neutral',
      abandoned: 'neutral',
    };
    return statusMap[outcome] || 'neutral';
  };

  const selectedConv = mockConversations.find((c) => c.id === selectedConversation);

  return (
    <div className="space-y-6">
      {/* Test Console */}
      <Card title="Test Console" subtitle="Simulate Sierra's behavior with test scenarios">
        <div className="space-y-4">
          {/* Test Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTestTab('phone')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                testTab === 'phone'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Test Phone Call
            </button>
            <button
              onClick={() => setTestTab('sms')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                testTab === 'sms'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Test SMS
            </button>
          </div>

          {/* Test Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Scenario
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>New lead - Roof replacement</option>
                <option>Storm damage inquiry</option>
                <option>Pricing question</option>
                <option>Service area check</option>
                <option>Complaint/Escalation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Input (optional)
              </label>
              <input
                type="text"
                placeholder="Simulate specific user message..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            <Play className="w-4 h-4" />
            Generate Sample Flow
          </button>
        </div>
      </Card>

      {/* Conversation Logs */}
      <Card title="Conversation Logs" subtitle="Review past interactions with Sierra">
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Channel</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>All Channels</option>
                <option>Voice</option>
                <option>SMS</option>
                <option>Webchat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Outcome</label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>All Outcomes</option>
                <option>Appointment Booked</option>
                <option>Info Provided</option>
                <option>Escalated</option>
                <option>Spam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">
                Apply Filters
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Date/Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Job Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Outcome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockConversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(conv.dateTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <ChannelBadge channel={conv.channel} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      <div>{conv.contactName}</div>
                      <div className="text-xs text-gray-500">{conv.contactPhone}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{conv.jobType || '-'}</td>
                    <td className="px-4 py-4">
                      <StatusChip
                        label={conv.outcome.replace(/_/g, ' ')}
                        status={getOutcomeStatus(conv.outcome)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedConversation(conv.id)}
                        className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Conversation Detail Drawer */}
      {selectedConv && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation Details</h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Summary */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Contact</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedConv.contactName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{selectedConv.contactPhone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Outcome</div>
                  <StatusChip
                    label={selectedConv.outcome.replace(/_/g, ' ')}
                    status={getOutcomeStatus(selectedConv.outcome)}
                  />
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Transcript</h4>
              <div className="space-y-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-paper dark:bg-canvas">
                {selectedConv.transcript.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'sierra' && (
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        S
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-lg p-3 text-sm ${
                          msg.sender === 'sierra'
                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">{msg.timestamp}</span>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        U
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Captured Fields */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Captured Lead Data</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(selectedConv.capturedFields).map(([key, value]) =>
                  value ? (
                    <div key={key}>
                      <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
