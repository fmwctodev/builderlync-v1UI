import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Target, Share2, TrendingUp, Plus } from 'lucide-react';
import CampaignModal from '../components/CampaignModal';
import { campaignsApi } from '../../../shared/services/campaignsApi';
import { Campaign, CampaignFormData } from '../types/campaigns';
import { Toast } from '../components/Toast';

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');

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

        {/* Sub Navigation */}
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

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'ads-manager' && <AdsManagerTab />}
        {activeTab === 'social-planner' && <SocialPlannerTab />}
      </div>
    </div>
  );
};

const AnalyticsTab: React.FC = () => {
  const navigate = useNavigate();

  const platforms = [
    { id: 'all', label: 'All Platforms' },
    { id: 'google-analytics', label: 'Google Analytics' },
    { id: 'meta', label: 'Meta/Facebook' },
    { id: 'google-ads', label: 'Google Ads' },
    { id: 'tiktok', label: 'TikTok Ads' },
    { id: 'google-business', label: 'Google Business' },
  ];

  const handlePlatformClick = (platformId: string) => {
    navigate(`/marketing/analytics/${platformId}`);
  };

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Platform Analytics</h3>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformClick(platform.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
            <span className="text-sm font-medium text-gray-900 dark:text-white">15 (22.4%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CampaignsTab: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await campaignsApi.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleSaveCampaign = async (data: CampaignFormData, sendNow: boolean) => {
    try {
      setIsLoading(true);
      await campaignsApi.createCampaign(data, sendNow);
      setToast({ show: true, message: sendNow ? 'Campaign sent successfully!' : 'Campaign saved as draft', type: 'success' });
      setShowModal(false);
      loadCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      setToast({ show: true, message: 'Failed to save campaign', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await campaignsApi.deleteCampaign(id);
      setToast({ show: true, message: 'Campaign deleted successfully', type: 'success' });
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setToast({ show: true, message: 'Failed to delete campaign', type: 'error' });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      scheduled: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-blue-200',
      sending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="space-y-6">
      <CampaignModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCampaign}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email & SMS Campaigns</h3>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Plus size={16} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Campaigns</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{campaign.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{campaign.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-700 text-sm dark:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Database Reactivation</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Re-engage cold leads and past customers</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Target:</span>
              <span className="text-gray-900 dark:text-white">Job Lost</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-white">SMS + Email</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Use Template
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Follow-up Sequence</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Automated follow-up for new leads</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Target:</span>
              <span className="text-gray-900 dark:text-white">New Leads</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-white">SMS Series</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Use Template
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Proposal Follow-up</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Follow up on sent proposals</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Target:</span>
              <span className="text-gray-900 dark:text-white">Proposal Sent</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <span className="text-gray-900 dark:text-white">Email</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
};

const AdsManagerTab: React.FC = () => {
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
    </div>
  );
};

const SocialPlannerTab: React.FC = () => {
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
    </div>
  );
};

export default Marketing;