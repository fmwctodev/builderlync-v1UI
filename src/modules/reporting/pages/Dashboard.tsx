import React, { useState } from 'react';
import { Plus, TrendingUp, ChevronDown, FileText, Sparkles, BarChart3, Phone, Calendar, ShieldCheck } from 'lucide-react';
import ReportMetricsModal from '../components/ReportMetricsModal';
import { UnifiedReportsTab } from '../components/UnifiedReportsTab';
import { AIReportsTab } from '../components/AIReportsTab';
import { GoogleAdsTab } from '../components/GoogleAdsTab';
import { MetaAdsTab } from '../components/MetaAdsTab';
import { CallReportTab } from '../components/CallReportTab';
import { AppointmentReportTab } from '../components/AppointmentReportTab';
import { AttributionReportTab } from '../components/AttributionReportTab';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('ai-reports');
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
    // { id: 'custom-reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'ai-reports', label: 'AI Reports', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'google-ads', label: 'Google Ads', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'facebook-ads', label: 'Meta Ads', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'attribution-report', label: 'Lead Sources', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'call-report', label: 'Calls', icon: <Phone className="w-4 h-4" /> },
    { id: 'appointment', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Report', icon: <ShieldCheck className="w-4 h-4" /> }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'audit':
        return (
          <div className="p-6">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-12 text-center text-white shadow-xl">
              <h1 className="text-4xl font-bold mb-4">
                Generate Marketing Audit
              </h1>
              <h2 className="text-4xl font-bold mb-8">
                Report for <span className="text-emerald-300">Free!</span>
              </h2>

              <button className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg mb-12 transition-all shadow-lg hover:scale-105">
                Generate Report Now
              </button>

              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center space-x-4 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <span className="text-lg font-medium">View Reviews Information</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center space-x-4 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <span className="text-lg font-medium">View Website Performance Score</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center space-x-4 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <span className="text-lg font-medium">Check Your GBP Health</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center space-x-4 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <span className="text-lg font-medium">View SEO Score</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex items-center space-x-4 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <span className="text-lg font-medium">View Listing Information</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'appointment':
        return <AppointmentReportTab />;
      case 'call-report':
        return <CallReportTab />;
      case 'attribution-report':
        return <AttributionReportTab />;
      case 'ai-reports':
        return <AIReportsTab />;
      case 'google-ads':
        return <GoogleAdsTab />;
      case 'facebook-ads':
        return <MetaAdsTab />;
      default:
        return <UnifiedReportsTab onSwitchTab={setActiveTab} />;
    }
  };

  return (
    <>
      <ReportMetricsModal
        show={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        onCreateReport={handleCreateReport}
      />
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reporting</h1>
          </div>

          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-all relative ${activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
}