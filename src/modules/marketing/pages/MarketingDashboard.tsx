import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, Target, Share2, TrendingUp, Plus, Settings, ExternalLink, Mail, MessageSquare } from 'lucide-react';
import CampaignModal from '../../roof-runner/components/CampaignModal';

const MarketingDashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/campaigns')) setActiveTab('campaigns');
    else if (path.includes('/ads-manager')) setActiveTab('ads-manager');
    else if (path.includes('/social-planner')) setActiveTab('social-planner');
    else setActiveTab('analytics');
  }, [location.pathname]);

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'ads-manager', label: 'Ads Manager', icon: TrendingUp },
    { id: 'social-planner', label: 'Social Planner', icon: Share2 },
    ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Marketing</h1>
        </div>

        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white rounded-t-lg'
                    : 'text-white hover:text-gray-200 bg-gray-700 dark:bg-gray-700 rounded-t-lg'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'ads-manager' && <AdsManagerTab />}
        {activeTab === 'social-planner' && <SocialPlannerTab />}
      </div>
    </div>
  );
};

const AnalyticsTab: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const platforms = [
    { id: 'all', label: 'All Platforms' },
    { id: 'google-analytics', label: 'Google Analytics' },
    { id: 'meta', label: 'Meta/Facebook' },
    { id: 'google-ads', label: 'Google Ads' },
    { id: 'tiktok', label: 'TikTok Ads' },
    { id: 'google-business', label: 'Google Business' },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Analytics</h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPlatform === platform.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">247</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12% from last month</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Marketing Spend</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$5,000</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This month</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">True Acquisition Cost</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">$333</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">$5,000 ÷ 15 closed jobs</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Jobs Closed</h4>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">15</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">From 247 leads</p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Website Visitors</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">2,450</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Leads Generated</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">247 (10.1%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Appointments Booked</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">89 (36.0%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Inspections Completed</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">67 (75.3%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Jobs Closed</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">23 (34.3%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignsTab: React.FC = () => {
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      name: 'Winter Roof Check',
      type: 'email',
      status: 'completed',
      recipients: 1247,
      sent: 1247,
      opened: 305,
      clicked: 89,
      created_at: '2024-01-15T10:00:00Z',
      sent_at: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Follow-up Sequence',
      type: 'sms',
      status: 'scheduled',
      recipients: 156,
      sent: 0,
      opened: 0,
      clicked: 0,
      created_at: '2024-01-20T09:00:00Z',
      scheduled_date: '2024-01-22T11:00:00Z'
    },
    {
      id: '3',
      name: 'Proposal Reminder',
      type: 'email',
      status: 'draft',
      recipients: 89,
      sent: 0,
      opened: 0,
      clicked: 0,
      created_at: '2024-01-18T16:00:00Z'
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const campaignTemplates = [
    {
      id: 'database_reactivation',
      name: 'Database Reactivation',
      description: 'Re-engage cold leads and past customers',
      target: 'Job Lost',
      type: 'Email + SMS',
      estimatedRecipients: 342
    },
    {
      id: 'follow_up',
      name: 'Follow-up Sequence',
      description: 'Automated follow-up for new leads',
      target: 'New Leads',
      type: 'SMS Series',
      estimatedRecipients: 156
    },
    {
      id: 'proposal_followup',
      name: 'Proposal Follow-up',
      description: 'Follow up on sent proposals',
      target: 'Proposal Sent',
      type: 'Email',
      estimatedRecipients: 89
    },
    {
      id: 'seasonal_maintenance',
      name: 'Seasonal Maintenance',
      description: 'Remind customers about seasonal roof maintenance',
      target: 'Past Customers',
      type: 'Email',
      estimatedRecipients: 567
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'sending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'paused': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateCampaign = (templateId?: string) => {
    setSelectedTemplate(templateId || null);
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = async (campaignData: any, sendNow: boolean) => {
    // Mock save campaign logic
    const newCampaign = {
      id: Date.now().toString(),
      ...campaignData,
      status: sendNow ? 'sending' : (campaignData.scheduled_date ? 'scheduled' : 'draft'),
      recipients: campaignData.target_audience?.estimated_count || 0,
      sent: sendNow ? campaignData.target_audience?.estimated_count || 0 : 0,
      opened: 0,
      clicked: 0,
      created_at: new Date().toISOString(),
      ...(sendNow && { sent_at: new Date().toISOString() })
    };
    
    setCampaigns(prev => [newCampaign, ...prev]);
    setShowCampaignModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email & SMS Campaigns</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create and manage your marketing campaigns</p>
        </div>
        <button 
          onClick={() => handleCreateCampaign()}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaigns.length}</p>
            </div>
            <Target className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{campaigns.reduce((sum, c) => sum + c.sent, 0).toLocaleString()}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">24.5%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">7.1%</p>
            </div>
            <ExternalLink className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Campaign Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Templates</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quick start with pre-built campaign templates</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {campaignTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-red-300 dark:hover:border-red-600 transition-colors">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">{template.name}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Target:</span>
                    <span className="text-gray-700 dark:text-gray-300">{template.target}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-gray-700 dark:text-gray-300">{template.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Recipients:</span>
                    <span className="text-gray-700 dark:text-gray-300">{template.estimatedRecipients}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCreateCampaign(template.id)}
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">All Campaigns</h4>
            <div className="flex items-center space-x-2">
              <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 dark:bg-gray-700 dark:text-white">
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sending">Sending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {campaign.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {campaign.type === 'email' ? (
                        <Mail className="h-4 w-4 text-blue-600 mr-2" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white capitalize">{campaign.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {campaign.recipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {campaign.sent > 0 ? (
                      <div className="text-sm">
                        <div className="text-gray-900 dark:text-white">
                          {((campaign.opened / campaign.sent) * 100).toFixed(1)}% opened
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {((campaign.clicked / campaign.sent) * 100).toFixed(1)}% clicked
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Not sent</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {campaign.sent_at ? formatDate(campaign.sent_at) : 
                     campaign.scheduled_date ? `Scheduled: ${formatDate(campaign.scheduled_date)}` :
                     formatDate(campaign.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        View
                      </button>
                      {campaign.status === 'draft' && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Edit
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                        Duplicate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <CampaignModal
          show={showCampaignModal}
          onClose={() => setShowCampaignModal(false)}
          onSave={handleSaveCampaign}
          initialData={selectedTemplate ? {
            name: campaignTemplates.find(t => t.id === selectedTemplate)?.name || '',
            type: 'email'
          } : undefined}
        />
      )}
    </div>
  );
};

const AdsManagerTab: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ads Manager</h3>
        <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          <Plus size={16} />
          <span>Create Ad</span>
        </button>
      </div>

      {/* Platform Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Google Ads</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connected</p>
          <button className="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            Create Google Ad
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">Meta/Facebook</h4>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Connected</p>
          <button className="w-full bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            Create Facebook Ad
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">TikTok Ads</h4>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Not Connected</p>
          <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Connect TikTok
          </button>
        </div>
      </div>

      {/* Manual Ad Creation Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Ad Campaign</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform</label>
              <select 
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Platform</option>
                <option value="google">Google Ads</option>
                <option value="facebook">Facebook/Meta</option>
                <option value="tiktok">TikTok Ads</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Name</label>
              <input
                type="text"
                placeholder="Enter campaign name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget</label>
              <input
                type="number"
                placeholder="Daily budget"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
              <textarea
                rows={3}
                placeholder="Describe your target audience"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ad Copy</label>
              <textarea
                rows={4}
                placeholder="Enter your ad copy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

const SocialPlannerTab: React.FC = () => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [postType, setPostType] = useState('unified');

  const channels = [
    { id: 'facebook', name: 'Facebook', connected: true },
    { id: 'instagram', name: 'Instagram', connected: true },
    { id: 'linkedin', name: 'LinkedIn', connected: false },
    { id: 'twitter', name: 'Twitter', connected: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Planner</h3>
        <button className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          <Plus size={16} />
          <span>New Post</span>
        </button>
      </div>

      {/* Channel Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Connected Channels</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-600">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${channel.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-900 dark:text-white">{channel.name}</span>
              </div>
              {!channel.connected && (
                <button className="text-xs text-primary-600 hover:underline dark:text-primary-400">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Post Creation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create Post</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Post Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="unified"
                  checked={postType === 'unified'}
                  onChange={(e) => setPostType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Unified Post</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="custom"
                  checked={postType === 'custom'}
                  onChange={(e) => setPostType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Custom per Channel</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Post Content</label>
            <textarea
              rows={4}
              placeholder="What's happening?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="time"
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              Save as Draft
            </button>
            <div className="space-x-2">
              <button className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
                Schedule Post
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Post Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Scheduled & Recent Posts</h4>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-600">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Winter roof maintenance tips...</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Scheduled for Dec 15, 2024 at 9:00 AM</p>
                <div className="flex space-x-2 mt-2">
                  <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs dark:bg-primary-900 dark:text-blue-200">Facebook</span>
                  <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs dark:bg-pink-900 dark:text-pink-200">Instagram</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-primary-600 hover:underline text-sm dark:text-primary-400">Edit</button>
                <button className="text-red-600 hover:underline text-sm dark:text-red-400">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;