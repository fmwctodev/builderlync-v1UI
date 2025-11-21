import React, { useState } from 'react';
import { Plus, TrendingUp, ChevronDown } from 'lucide-react';
import ReportMetricsModal from '../components/ReportMetricsModal';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('custom-reports');
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handleCreateReport = (selectedMetrics: string[]) => {
    console.log('Creating report with metrics:', selectedMetrics);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    console.log('Selected year:', year);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  const tabs = [
    { id: 'custom-reports', label: 'Reports' },
    { id: 'google-ads', label: 'Google Ads Report' },
    { id: 'facebook-ads', label: 'Facebook Ads Report' },
    { id: 'attribution-report', label: 'Attribution Report' },
    { id: 'call-report', label: 'Call Report' },
    { id: 'appointment', label: 'Appointment Report' },
    { id: 'audit', label: 'Audit Report' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'audit':
        return (
          <div className="p-6">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-12 text-center text-white">
              <h1 className="text-4xl font-bold mb-4">
                Generate Marketing Audit
              </h1>
              <h2 className="text-4xl font-bold mb-8">
                Report for <span className="text-green-400">Free!</span>
              </h2>

              <button className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold text-lg mb-12 transition-colors">
                Generate Report Now
              </button>

              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-2xl">☀️</span>
                  </div>
                  <span className="text-lg font-medium">View Reviews Information</span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 text-2xl">🎯</span>
                  </div>
                  <span className="text-lg font-medium">View Website Performance Score</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-2xl">✓</span>
                  </div>
                  <span className="text-lg font-medium">Check Your GBP Health</span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-2xl">🔍</span>
                  </div>
                  <span className="text-lg font-medium">View SEO Score</span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 text-2xl">📋</span>
                  </div>
                  <span className="text-lg font-medium">View Listing Information</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'appointment':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
                  <span className="text-gray-900 dark:text-white">2025-09-15</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-900 dark:text-white">2025-10-15</span>
                  <button className="text-gray-400 hover:text-gray-600">
                    📅
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>All Calendars</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>Date Added</option>
                </select>
                <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  ⊞
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Booked</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Confirmed</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Cancelled</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Showed</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">No Show</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Invalid</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Rescheduled</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Channel</h3>
                  <button className="text-gray-400 hover:text-gray-600">Funnel</button>
                </div>
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary-600 dark:text-primary-400">🔍</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">No Data Found</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Source</h3>
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary-600 dark:text-primary-400">🔍</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">No Data Found</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 Appointment Owners</h3>
                <div className="h-48 flex items-center justify-center">
                  <div className="flex space-x-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-6 bg-primary-400 rounded-t ${i % 3 === 0 ? 'h-16' : i % 3 === 1 ? 'h-20' : 'h-12'}`}></div>
                    ))}
                  </div>
                  <div className="ml-8 text-gray-500 dark:text-gray-400">No Data Found</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Most Popular Days (No of Appointments Booked Day Wise)</h3>
                <div className="h-48 flex items-center justify-center">
                  <div className="flex space-x-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-6 bg-primary-400 rounded-t ${i % 3 === 0 ? 'h-16' : i % 3 === 1 ? 'h-20' : 'h-12'}`}></div>
                    ))}
                  </div>
                  <div className="ml-8 text-gray-500 dark:text-gray-400">No Data Found</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 Calendars with Cancellations</h3>
                <div className="h-48 flex items-center justify-center">
                  <div className="flex space-x-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-6 bg-primary-400 rounded-t ${i % 3 === 0 ? 'h-16' : i % 3 === 1 ? 'h-20' : 'h-12'}`}></div>
                    ))}
                  </div>
                  <div className="ml-8 text-gray-500 dark:text-gray-400">No Data Found</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 Calendars with Reschedules</h3>
                <div className="h-48 flex items-center justify-center">
                  <div className="flex space-x-2">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className={`w-6 bg-primary-400 rounded-t ${i % 3 === 1 ? 'h-16' : i % 3 === 2 ? 'h-20' : 'h-12'}`}></div>
                    ))}
                  </div>
                  <div className="ml-8 text-gray-500 dark:text-gray-400">No Data Found</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-end">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    All Status
                  </button>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    Columns
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Appointment Id</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Requested Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Calendar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date Added</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Appointment Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Outcome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rescheduled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td colSpan={13} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-gray-400 dark:text-gray-500 text-2xl">📅</span>
                          </div>
                          <span>No appointments</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'call-report':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>2023-09-09</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>2023-10-09</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>All numbers</option>
                </select>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  Export
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Outgoing</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Call by Status</h3>
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="#D1D5DB" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="251.2" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Avg. call duration: 0s</span>
                  <span className="mx-2">|</span>
                  <span>Total call duration: 0s</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">First-time calls by status</h3>
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="40" stroke="#D1D5DB" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="251.2" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Avg. call duration: 0s</span>
                  <span className="mx-2">|</span>
                  <span>Total call duration: 0s</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Call Sources</h3>
              </div>
              <div className="p-6">
                <div className="flex">
                  <div className="flex-1">
                    <div className="h-48 flex items-end justify-start space-x-8 pl-8">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-24 bg-primary-400 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Source 1</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-32 bg-primary-500 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Source 2</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-20 bg-primary-300 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Source 3</span>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-gray-500 dark:text-gray-400">No Data Found</div>
                  </div>

                  <div className="w-px bg-gray-200 dark:bg-gray-700 mx-8"></div>

                  <div className="flex-1">
                    <div className="h-48 flex flex-col justify-center items-center">
                      <div className="grid grid-cols-4 gap-8 text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-8">
                        <div>Source</div>
                        <div>Total Calls</div>
                        <div>Won Deals</div>
                        <div>Avg Duration</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-gray-400 dark:text-gray-500 text-2xl">📄</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400">No Data</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex space-x-4">
                  <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded text-sm">All calls</button>
                  <button className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm">Incoming</button>
                  <button className="px-3 py-1 text-gray-600 dark:text-gray-400 text-sm">Outgoing</button>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    Columns
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Number Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Call Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Keyword</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Recording</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">First Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Device Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Marketing Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Call Flow</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Landing Page</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qualified Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td colSpan={14} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-gray-400 dark:text-gray-500 text-2xl">📞</span>
                          </div>
                          <span>No call data available</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'attribution-report':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>2023-09-15</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>2023-10-15</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  View Attribution
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Attribution</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">$</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenue Closed</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">A$0.00</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">🎯</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Won</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">👥</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Leads</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Revenue Generated</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-500 rounded"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Leads</span>
                  </div>
                </div>
                <select className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                  <option>Day</option>
                </select>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-center">
                    <div className="h-32 bg-primary-100 dark:bg-primary-900 rounded mb-4 flex items-end justify-center">
                      <div className="w-full h-8 bg-primary-200 dark:bg-primary-800 rounded-b"></div>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">No Data Found</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Session Events</span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    Columns
                  </button>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    Export
                  </button>
                  <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    Filters
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Event Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Content</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">UTM Medium</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">UTM Content</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">UTM Source</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">UTM Term</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Referrer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">URL Link</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">page_visit</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">DIRECT TRAFFIC</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">🔗</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white text-sm">Oct 08 2023<br/>04:24 AM</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">page_visit</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">DIRECT TRAFFIC</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">🔗</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white text-sm">Oct 08 2023<br/>04:22 AM</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">page_visit</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">DIRECT TRAFFIC</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">🔗</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white text-sm">Oct 08 2023<br/>04:22 AM</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">page_visit</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">DIRECT TRAFFIC</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">🔗</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white text-sm">Oct 08 2023<br/>04:21 AM</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">page_visit</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">DIRECT TRAFFIC</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">-</td>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400">🔗</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white text-sm">Oct 08 2023<br/>04:21 AM</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'facebook-ads':
        return (
          <div className="p-6">
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
              <p className="text-primary-800 dark:text-primary-200 text-sm">
                You're viewing sample data. Click here to integrate your Facebook account and select the Facebook Ad Account ID for which you want to see the data.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm">👁️</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Impressions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">175,235</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">-7%</div>
                <div className="h-20 bg-primary-100 dark:bg-primary-900 rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path d="M0,60 Q75,20 150,40 T300,45" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                    <path d="M0,60 Q75,20 150,40 T300,45 L300,80 L0,80 Z" fill="#93C5FD" opacity="0.3"/>
                  </svg>
                  <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Jan 2021</span>
                    <br/>
                    <span className="font-semibold">Impressions: 47,896</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 dark:text-primary-400 text-sm">👆</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">21,138</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">7.5%</div>
                <div className="h-20 bg-primary-100 dark:bg-primary-900 rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path d="M0,70 Q75,30 150,25 T300,50" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                    <path d="M0,70 Q75,30 150,25 T300,50 L300,80 L0,80 Z" fill="#93C5FD" opacity="0.3"/>
                  </svg>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-400 text-sm">🎯</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conversions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">7,125</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">4%</div>
                <div className="h-20 bg-primary-100 dark:bg-primary-900 rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path d="M0,65 Q75,35 150,30 T300,40" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                    <path d="M0,65 Q75,35 150,30 T300,40 L300,80 L0,80 Z" fill="#93C5FD" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Client Spends</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$2,085.00</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average CPC</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.10</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cost per Conversion</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.29</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input type="text" placeholder="Type to search" className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clicks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ROI %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CTR</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPS</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Leads</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Impressions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Average Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Lawn Space Gardening</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">5,010</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$210.41</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$3,357.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">1,595.46%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.04</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">7.18%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">75</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$2.81</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">115</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$1.83</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">32,188</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$44.76</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Furniture Logistics</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">4,833</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$581.97</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$2,637.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">453.12%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.12</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">7.16%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">57</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$10.21</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">88</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$6.61</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">29,646</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$46.26</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Interior Design: High-end Residential</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">3,852</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$627.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$3,102.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">494.74%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.16</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">8.79%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">73</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$8.59</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">82</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$7.65</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">43,777</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$42.49</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Interior Design: Retail</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">3,878</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$195.03</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$2,628.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">1,347.46%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.05</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">7.16%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">76</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$2.57</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">83</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$2.35</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">18,827</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$37.54</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Planning and Trimming</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">3,635</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$272.99</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$3,133.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">1,147.56%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.13</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">7.16%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">68</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$6.55</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">119</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$3.57</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">24,797</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$46.07</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                5 Results
              </div>
            </div>
          </div>
        );
      case 'google-ads':
        return (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm">👁️</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Impressions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">175,235</div>
                <div className="h-20 bg-primary-100 dark:bg-primary-900 rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path d="M0,60 Q75,20 150,40 T300,45" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                    <path d="M0,60 Q75,20 150,40 T300,45 L300,80 L0,80 Z" fill="#93C5FD" opacity="0.3"/>
                  </svg>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 dark:text-primary-400 text-sm">👆</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">21,138</div>
                <div className="h-20 bg-primary-100 dark:bg-primary-900 rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path d="M0,70 Q75,30 150,25 T300,50" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                    <path d="M0,70 Q75,30 150,25 T300,50 L300,80 L0,80 Z" fill="#93C5FD" opacity="0.3"/>
                  </svg>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-400 text-sm">🎯</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conversions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">7,125</div>
                <div className="h-20 bg-primary-100 dark:bg-primary-900 rounded relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 80">
                    <path d="M0,65 Q75,35 150,30 T300,40" stroke="#3B82F6" strokeWidth="2" fill="none"/>
                    <path d="M0,65 Q75,35 150,30 T300,40 L300,80 L0,80 Z" fill="#93C5FD" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Client Spends</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$2,085.00</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Average CPC</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.10</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cost per Conversion</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.29</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Conversion Rate</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">6.90%</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input type="text" placeholder="Type to search" className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clicks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ROI %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CPC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Lawn Space Gardening</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">5,010</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$210.41</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$3,357.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">1,595.46%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.04</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">0.00%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Furniture Logistics</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">4,833</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$581.97</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$2,637.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">453.12%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.12</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">0.00%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-primary-600 dark:text-primary-400 underline">Interior Design: High-end Residential</td>
                      <td className="px-4 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">●</span></td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">3,852</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$627.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$3,102.00</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">494.74%</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">$0.16</td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">0.00%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex">
            <div className="w-1/3 bg-white dark:bg-gray-800 p-6 border-r border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-gray-600 dark:text-gray-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reports Overview</h2>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Create Multi-Page Reports</span>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Schedule the Report to your Team Members and Stakeholders</span>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Add Reports Insights</span>
                </div>
              </div>
              <button
                onClick={() => setShowMetricsModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center mb-8 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Report
              </button>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="mb-2">Looking to Track Key Client Metrics at a glance?</p>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Try Dashboards</a>
              </div>
            </div>
            <div className="flex-1 p-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Reports</h3>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="appearance-none px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
                  <p className="text-center text-gray-600 dark:text-gray-400">Find a report you already created</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <ReportMetricsModal
        show={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        onCreateReport={handleCreateReport}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reporting</h1>

          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-700 border-b-2 border-red-700 dark:bg-red-900/30 dark:text-red-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {renderTabContent()}
      </div>
    </>
  );
}