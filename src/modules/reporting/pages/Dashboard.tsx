import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportMetricsModal from '../components/ReportMetricsModal';
import { AppointmentReportTab } from '../components/AppointmentReportTab';
import { CallReportTab } from '../components/CallReportTab';
import { AttributionReportTab } from '../components/AttributionReportTab';
import { AIReportsTab } from '../components/ai/AIReportsTab';
import { GoogleAdsTab } from '../components/GoogleAdsTab';
import { MetaAdsTab } from '../components/MetaAdsTab';
import { UnifiedReportsTab } from '../components/UnifiedReportsTab';

export function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ai-reports');
  const [showMetricsModal, setShowMetricsModal] = useState(false);

  const handleCreateReport = (selectedMetrics: string[]) => {
    console.log('Creating report with metrics:', selectedMetrics);
  };

  const tabs = [
    { id: 'ai-reports', label: 'AI Reports' },
    { id: 'google-ads', label: 'Google Ads' },
    { id: 'facebook-ads', label: 'Meta Ads' },
    { id: 'attribution-report', label: 'Lead Sources' },
    { id: 'call-report', label: 'Calls' },
    { id: 'appointment', label: 'Appointments' },
    { id: 'custom-reports', label: 'Reports' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai-reports':
        return <AIReportsTab onNavigateToChat={() => navigate('/reporting/ai')} />;
      case 'appointment':
        return <AppointmentReportTab />;
      case 'call-report':
        return <CallReportTab />;
      case 'attribution-report':
        return <AttributionReportTab />;
      case 'google-ads':
        return <GoogleAdsTab />;
      case 'facebook-ads':
        return <MetaAdsTab />;
      case 'custom-reports':
        return <UnifiedReportsTab onSwitchTab={(tabId) => setActiveTab(tabId)} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ReportMetricsModal
        show={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        onCreateReport={handleCreateReport}
      />
      <div className="h-full flex flex-col bg-paper dark:bg-canvas">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reporting</h1>
          </div>

          <div className="flex items-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white rounded-t-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700 rounded-t-lg'
                }`}
              >
                {tab.label}
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
