import React from 'react';
import { Card } from '../components/Card';
import { mockBusinessProfile, mockBehaviorProfile } from '../lib/mockData';
import { X } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Business Profile */}
      <Card title="Business Profile" subtitle="Core information about your business">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Name
            </label>
            <input
              type="text"
              defaultValue={mockBusinessProfile.businessName}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Areas
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mockBusinessProfile.serviceAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm"
                >
                  {area}
                  <button className="hover:text-red-900 dark:hover:text-red-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add city..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Services Offered
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {mockBusinessProfile.servicesOffered.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm"
                >
                  {service}
                  <button className="hover:text-green-900 dark:hover:text-green-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add service..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Pipeline
              </label>
              <select
                defaultValue={mockBusinessProfile.defaultPipeline}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option>New Leads</option>
                <option>After Hours Leads</option>
                <option>Solar Leads</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Calendar
              </label>
              <select
                defaultValue={mockBusinessProfile.defaultCalendar}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option>Main Calendar</option>
                <option>Sales Calendar</option>
                <option>Service Calendar</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Lead Routing Rules */}
      <Card title="Lead Routing Rules" subtitle="Define how new leads are processed">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Stage for New Leads
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>New - Uncontacted</option>
                <option>Contacted</option>
                <option>Qualified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Not a Fit Stage
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Disqualified</option>
                <option>Out of Service Area</option>
                <option>Not Interested</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Spam Stage
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Spam</option>
                <option>Junk</option>
                <option>Delete</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Recipients
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              Who should receive notifications when Sierra books an appointment or captures a lead?
            </p>
            <select
              multiple
              size={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option>Office Manager (office@example.com)</option>
              <option>Sales Team (sales@example.com)</option>
              <option>Owner (owner@example.com)</option>
              <option>Service Coordinator (service@example.com)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Agent Behavior Toggles */}
      <Card title="Agent Behavior" subtitle="High-level behavior settings">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Always try to book appointment if qualified
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Sierra will attempt to book at least once per conversation
              </div>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Attempt second soft close if lead is unsure
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Try a gentle follow-up booking attempt before ending conversation
              </div>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white text-sm">
                Never mention software or BuilderLync
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Sierra presents as a human team member, not AI
              </div>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>

        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-900 dark:text-red-300">
            💡 For detailed behavior settings, persona configuration, and guardrails, visit the{' '}
            <button className="font-medium underline">Knowledge Base</button> tab.
          </p>
        </div>
      </Card>
    </div>
  );
}
