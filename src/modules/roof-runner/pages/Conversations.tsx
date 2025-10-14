import React, { useState } from 'react';
import { ChevronDown, Search, Filter, Edit, X, MessageCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const Conversations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [showTriggerDropdown, setShowTriggerDropdown] = useState(false);
  const [inboxTab, setInboxTab] = useState('unread');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'conversations'
                ? 'bg-red-100 dark:bg-red-900/30 text-[#dc2626] dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>Conversations</span>
          </button>
          <button
            onClick={() => setActiveTab('manual-actions')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'manual-actions'
                ? 'bg-red-100 dark:bg-red-900/30 text-[#dc2626] dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>Manual actions</span>
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'snippets'
                ? 'bg-red-100 dark:bg-red-900/30 text-[#dc2626] dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>Snippets</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowTriggerDropdown(!showTriggerDropdown)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'trigger-links'
                  ? 'bg-red-100 dark:bg-red-900/30 text-[#dc2626] dark:text-red-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>Trigger Links</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTriggerDropdown && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('links');
                      setShowTriggerDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Links
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('analyze');
                      setShowTriggerDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {activeTab === 'conversations' && (
          <div className="flex h-full gap-4">
            {/* Inbox Section */}
            <div className="w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Inbox Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Inbox</h3>

                {/* Inbox Tabs */}
                <div className="flex space-x-1 mb-3">
                  {['unread', 'recents', 'starred', 'all'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setInboxTab(tab)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        inboxTab === tab
                          ? 'bg-red-100 dark:bg-red-900/30 text-[#dc2626] dark:text-red-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Search and Actions */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-[#dc2626] dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Filter className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Inbox List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Contact {i + 1}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Last message preview...</p>
                        </div>
                        <span className="text-xs text-gray-400">2m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Section */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">JS</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">John Smith</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">+13073727509</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                    Tuesday, October 14, 2025
                  </span>
                </div>
                
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    <p className="text-sm">Hi, I received your quote for the roofing project. Could you provide more details about the timeline?</p>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">10:30 AM</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-500 text-white">
                    <p className="text-sm">Hello! Thanks for reaching out. The project would take approximately 3-5 days depending on weather conditions. We can start next week if you approve.</p>
                    <p className="text-xs mt-1 text-blue-100">11:15 AM</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    <p className="text-sm">That sounds good. What about the materials? Are they included in the quote?</p>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">2:20 PM</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-500 text-white">
                    <p className="text-sm">Yes, all materials are included. We use premium shingles with a 25-year warranty.</p>
                    <p className="text-xs mt-1 text-blue-100">2:45 PM</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600">
                    <p className="text-sm">Thanks for the quote, when can we schedule?</p>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">3:54 PM</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {/* Channel Selection */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">SMS</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-green-100 hover:text-green-700">WhatsApp</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-700">Yelp</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-purple-100 hover:text-purple-700">IG</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-700">Messenger</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-indigo-100 hover:text-indigo-700">DM</button>
                  </div>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-yellow-100 hover:text-yellow-700">Internal Comment</button>
                </div>

                {/* Message Input */}
                <textarea
                  placeholder="Type a message..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Insert Snippets">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Attach File">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Insert Emoji">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Request Money">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="More Options">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                      Clear
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* User Details Section */}
            <div className="w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Details</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Contact Info */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Contact</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email</span>
                      <button className="text-blue-500 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Phone</span>
                        <button className="text-blue-500 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">+13073727509</p>
                    </div>
                  </div>
                </div>

                {/* Owner */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Owner (Assigned to)</span>
                    <select className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option>Unassigned</option>
                      <option>John Doe</option>
                      <option>Jane Smith</option>
                      <option>Mike Johnson</option>
                    </select>
                  </div>
                </div>

                {/* Followers */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Followers</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search followers"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Tags */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tags</span>
                    <button className="text-blue-500 hover:text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Customer</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                  </div>
                </div>

                {/* Active Automations */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Active Automations</span>
                </div>

                {/* DND Settings */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">DND</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">DND</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">DND All</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">DND Calls & Voicemails</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">DND Text Messages</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">DND Emails</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">DND Incoming</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                  </div>
                </div>

                {/* Last Inbound Call */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Inbound Call</span>
                    <p className="text-gray-900 dark:text-white">Tue Oct 14 2025 03:54:02</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'manual-actions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manual Actions</h2>

            <div className="space-y-6">
              {/* Search and Select in single row */}
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Type to Search Workflows"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />

                <select className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option>Select Assignee</option>
                </select>
              </div>

              {/* Status Message */}
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">Good Work!</h3>
                <p className="text-gray-600 dark:text-gray-400">You have no pending tasks</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'snippets' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create snippets to quickly insert predefined content into messages for faster, consistent communication.
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors">
                    All Snippets
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Folders
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddFolderModal(true)}
                    className="px-3 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Add Folder
                  </button>
                  <button className="px-3 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                    Add Snippets
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search Snippets"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Search Snippets"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Body</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Folder</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">How can I book a consultation?</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">You can book a call with a career coach by visiting our booking page.</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300"></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Text</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">What areas do you focus on?</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">To learn more about the focused areas of our career coaching program, you can visit our website.</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300"></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Text</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Page 1 of 1</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">10 / page</span>
            </div>
          </div>
        )}
        {activeTab === 'links' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Trigger links allow you to put links inside SMS messages and emails, which allow you to track specific customer actions and trigger events based on when the link is clicked.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddLinkModal(true)}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Add Link
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trigger Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">Trigger Link</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Sample Link</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">https://example.com</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">sample_key</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Edit | Delete</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'analyze' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Analyze</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Trigger links allow you to put links inside SMS messages and emails, which allow you to track specific customer actions and trigger events based on when the link is clicked.
            </p>
            
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You do not have any trigger link yet.
              </p>
              <button
                onClick={() => setShowAddLinkModal(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Click here to create your first trigger link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Message</h3>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Direct Message</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send direct message to a contact</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Start New Chat</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Group Message</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send group SMS to contacts</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Start New Group Chat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Filters</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4">Clear Filters</button>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Assigned (Contact Owner)</h4>
                  <div className="space-y-1 ml-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />My Chat</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Assigned To</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Unassigned</label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Follower Assignment (Contact)</h4>
                  <div className="space-y-1 ml-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Followed by Me</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Followed by Specific User</label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Mentions</h4>
                  <div className="space-y-1 ml-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Mentions of Me</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Mentions of Specific User</label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Last Message Direction</h4>
                  <div className="space-y-1 ml-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Inbound</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Outbound</label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Last Outbound Message Type</h4>
                  <div className="space-y-1 ml-2">
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Manual</label>
                    <label className="flex items-center"><input type="checkbox" className="mr-2" />Automated</label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Last Message Channel</h4>
                  <div className="space-y-1 ml-2">
                    {['Email', 'SMS', 'GBP', 'Live Chat', 'Whatsapp', 'Facebook', 'Calls', 'Voicemail', 'Instagram'].map(channel => (
                      <label key={channel} className="flex items-center"><input type="checkbox" className="mr-2" />{channel}</label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add new folder</h3>
                <button
                  onClick={() => setShowAddFolderModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder name
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddFolderModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddFolderModal(false);
                    setFolderName('');
                  }}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showAddLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Link</h3>
                <button
                  onClick={() => setShowAddLinkModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={linkName}
                    onChange={(e) => setLinkName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link URL
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowAddLinkModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddLinkModal(false);
                    setLinkName('');
                    setLinkUrl('');
                  }}
                  className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Conversations;