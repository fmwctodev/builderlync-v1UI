import React, { useState } from 'react';
import { ArrowLeft, Edit, ExternalLink, Copy, QrCode, Code, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const InstantEstimatorManage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [estimatorName] = useState('test');

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/instant-estimator')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all estimators
            </button>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            <ExternalLink className="w-4 h-4" />
            Preview
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{estimatorName}</h1>
          <Edit className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Share and embed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share and embed</h2>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <input
                type="text"
                value="https://app.roofr.com/instant-estimator/eebbc217-988d-4b00-a877-65433879db57/TarrytownRoofingLLC"
                readOnly
                className="flex-1 bg-transparent text-gray-600 dark:text-gray-300 text-sm"
              />
              <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm">
                <Copy className="w-4 h-4" />
                Copy link
              </button>
            </div>

            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                <Edit className="w-4 h-4" />
                Edit link
              </button>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                <QrCode className="w-4 h-4" />
                QR code
              </button>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
                <Code className="w-4 h-4" />
                Embed code
              </button>
            </div>
          </div>

          {/* Lead questionnaire */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead questionnaire</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Manage questions
              </button>
            </div>
            
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Questions (9)</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Get started, Address & slope, Building type, Current material, Desired material, Timeline, Financing, Project details, Contact form
            </p>
          </div>

          {/* Material options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Material options</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add the materials you offer along with their approximate prices, which should include tear-off, waste, and markup costs. Your customers will have the option to choose the materials they want and will receive estimates based on the information you provide below.
            </p>
            
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 italic mb-4">No materials added</p>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mx-auto">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Pricing settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pricing settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Restrict customer to the materials I've configured pricing for
                  </span>
                </label>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Choose how you would like to specify your pricing
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pricing" defaultChecked />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Per square foot</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pricing" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Per square</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show prices as range</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show financing options</span>
                </label>
                <div className="ml-6 mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Add financing link</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">Add link</button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Provide a link to your financing page that will appear alongside each estimate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Default job owner */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default job owner</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The default assignee will be assigned to every new lead that is created from this estimator
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default job owner
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option>James Wolfgang Kuntz</option>
              </select>
            </div>
          </div>

          {/* Contact information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select a user profile to populate the contact card. To update your contact information please edit your profile in setting. Other users will need to edit their own profile if changes are required.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Point of contact
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option>None</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a user to add their contact card or add scheduling
                </p>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Scheduling</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add a link to your calendar. Customers will be directed from the link in your contact card.
            </p>
            
            <button className="text-blue-600 hover:text-blue-700 text-sm">Add a scheduling link</button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Add a link from Calendly, Google Calendar, Doodle, etc
            </p>
          </div>

          {/* Additional content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Additional content</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Tell your customers more about your business with additional content that can help build trust. Manage the content in Instant Estimator settings.
            </p>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show CompanyCam Project Showcase</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show social media links</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                Manage social media links in profile & branding settings
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstantEstimatorManage;