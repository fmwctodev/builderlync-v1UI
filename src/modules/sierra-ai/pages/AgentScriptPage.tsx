import React, { useState } from 'react';
import { Card } from '../components/Card';
import { mockAgentScript } from '../lib/mockData';
import { GripVertical } from 'lucide-react';

export function AgentScriptPage() {
  const [scenario, setScenario] = useState('new_call');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Script Editor */}
      <div className="space-y-6">
        <Card title="Greeting & Identification">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice Greeting
              </label>
              <textarea
                rows={3}
                defaultValue={mockAgentScript.greeting.voice}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMS Greeting
              </label>
              <textarea
                rows={2}
                defaultValue={mockAgentScript.greeting.sms}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        <Card title="Lead Data Capture">
          <div className="space-y-3">
            {Object.entries(mockAgentScript.leadCapture).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="text"
                  defaultValue={value}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Qualifying Questions">
          <div className="space-y-2">
            {mockAgentScript.qualifyingQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                <span className="flex-1 text-sm text-gray-900 dark:text-white">{q.question}</span>
                <input type="checkbox" checked={q.required} readOnly className="rounded" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Booking Pitch & Closing">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Booking Pitch
              </label>
              <textarea
                rows={2}
                defaultValue={mockAgentScript.bookingPitch}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Closing Language
              </label>
              <textarea
                rows={2}
                defaultValue={mockAgentScript.closingLanguage}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Script Preview */}
      <div className="space-y-6">
        <Card title="Script Preview">
          <div className="mb-4">
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="new_call">New Inbound Call</option>
              <option value="missed_call_sms">Missed Call Recovery SMS</option>
              <option value="webchat">Inbound Webchat</option>
            </select>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 min-h-[400px]">
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  S
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                    {mockAgentScript.greeting.voice}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">00:00</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="flex-1 flex justify-end">
                  <div className="bg-red-600 text-white rounded-lg p-3 text-sm max-w-[80%]">
                    Hi, I need a roof inspection.
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  C
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                  S
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                    {mockAgentScript.leadCapture.namePrompt}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">00:15</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
