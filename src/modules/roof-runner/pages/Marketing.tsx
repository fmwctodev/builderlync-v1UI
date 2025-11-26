import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Target, Share2, TrendingUp, Plus,
  Image, Video, FileText, Smile, Hash, Tag, Link2, MapPin,
  Bold, Italic, ChevronDown, Sparkles, X, Calendar, Settings
} from 'lucide-react';
import CampaignModal from '../components/CampaignModal';
import { campaignsApi } from '../../../shared/services/campaignsApi';
import { Campaign, CampaignFormData } from '../types/campaigns';
import { Toast } from '../components/Toast';
import { socialMediaApi, SocialPlatform, CreateSocialPostData } from '../../../shared/services/socialMediaApi';
import SettingsModal from '../components/social-planner/SettingsModal';

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
    <div className="relative space-y-6">
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

      {/* COMING SOON Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-12 max-w-md mx-4 text-center">
          <TrendingUp className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-wide">
            COMING SOON
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Our Ads Manager feature is currently under development and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};

const SocialPlannerTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'comments' | 'statistics' | 'social-listening'>('planner');
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['facebook', 'instagram']);
  const [customizePerChannel, setCustomizePerChannel] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'all' | SocialPlatform>('all');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [platformOptions, setPlatformOptions] = useState<Record<string, any>>({
    facebook: { postType: 'feed' },
    instagram: { postType: 'feed' },
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('social-accounts');

  const subTabs = [
    { id: 'planner' as const, label: 'Planner' },
    { id: 'comments' as const, label: 'Comments', badge: 'New' },
    { id: 'statistics' as const, label: 'Statistics' },
    { id: 'social-listening' as const, label: 'Social Listening' },
  ];

  const MAX_CHARACTERS = 1500;
  const characterCount = postContent.length;

  const platforms = [
    { id: 'google_business' as SocialPlatform, name: 'Google Business', color: '#4285F4', connected: false },
    { id: 'facebook' as SocialPlatform, name: 'Facebook', color: '#1877F2', connected: true },
    { id: 'instagram' as SocialPlatform, name: 'Instagram', color: '#E4405F', connected: true },
    { id: 'linkedin' as SocialPlatform, name: 'LinkedIn', color: '#0A66C2', connected: false },
    { id: 'twitter' as SocialPlatform, name: 'Twitter', color: '#1DA1F2', connected: false },
    { id: 'tiktok' as SocialPlatform, name: 'TikTok', color: '#000000', connected: false },
    { id: 'youtube' as SocialPlatform, name: 'YouTube', color: '#FF0000', connected: false },
  ];

  const togglePlatform = (platformId: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const clearAllPlatforms = () => {
    setSelectedPlatforms([]);
  };

  const handleSaveDraft = async () => {
    try {
      await socialMediaApi.saveDraft({
        content: postContent,
        platforms: selectedPlatforms,
        platform_options: platformOptions,
        is_customize_per_channel: customizePerChannel,
      });
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  const handleNewPostClick = () => {
    if (activeSubTab !== 'planner') {
      setActiveSubTab('planner');
      setTimeout(() => {
        const postCreationElement = document.getElementById('post-creation-section');
        if (postCreationElement) {
          postCreationElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const postCreationElement = document.getElementById('post-creation-section');
      if (postCreationElement) {
        postCreationElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Action Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Social Planner</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
              title={viewMode === 'list' ? 'Switch to calendar view' : 'Switch to list view'}
            >
              <Calendar className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setSettingsInitialTab('social-accounts');
                setShowSettingsModal(true);
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setSettingsInitialTab('social-accounts');
                setShowSettingsModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Socials
            </button>

            <button
              onClick={handleNewPostClick}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <div className="flex items-center gap-6">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-all ${
                activeSubTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-gray-900 rounded">
                  {tab.badge}
                </span>
              )}
              {activeSubTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeSubTab === 'planner' && (
        <div className="h-full flex flex-col lg:flex-row gap-6 p-6" id="post-creation-section">
          {/* Left Panel - Post Creation */}
          <div className="flex-1 space-y-6">
            {/* Post To Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">Post to</h4>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customizePerChannel}
                onChange={(e) => setCustomizePerChannel(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Customize for each channel</span>
            </label>
          </div>

          {/* Platform Selection */}
          <div className="flex flex-wrap gap-3 mb-3">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => platform.connected && togglePlatform(platform.id)}
                disabled={!platform.connected}
                className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  selectedPlatforms.includes(platform.id)
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                } ${!platform.connected ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-300 cursor-pointer'}`}
              >
                <div className={`w-3 h-3 rounded-full ${platform.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{platform.name}</span>
                {selectedPlatforms.includes(platform.id) && (
                  <X size={14} className="text-red-600" />
                )}
              </button>
            ))}
          </div>

          {selectedPlatforms.length > 0 && (
            <button
              onClick={clearAllPlatforms}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Content Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Type content</h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Char limit: <span className={characterCount > MAX_CHARACTERS ? 'text-red-600' : ''}>{characterCount}</span> / {MAX_CHARACTERS}
              </span>
            </div>

            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write your post here..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
            <button className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
              <Sparkles size={16} />
              <span className="text-sm font-medium">AI</span>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Bold">
              <Bold size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Italic">
              <Italic size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Emoji">
              <Smile size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Image">
              <Image size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Video">
              <Video size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Document">
              <FileText size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Hashtag">
              <Hash size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Tag">
              <Tag size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Link">
              <Link2 size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Location">
              <MapPin size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Advanced Options */}
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span>Advanced options</span>
            <ChevronDown size={16} className={`transform transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
          </button>

          {showAdvancedOptions && (
            <div className="mt-4 space-y-4">
              {/* Platform-Specific Options */}
              {selectedPlatforms.includes('google_business') && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>Google Business Profile options</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Type</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>Call to Action</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Select button label</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>Select button label</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatforms.includes('facebook') && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                    <span>Facebook options</span>
                  </h5>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Post this as</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input type="radio" name="fb-type" defaultChecked className="mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Feed</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="fb-type" className="mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Reel</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="fb-type" className="mr-2" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Story</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatforms.includes('instagram') && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-pink-600"></div>
                    <span>Instagram options</span>
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Post this as</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input type="radio" name="ig-type" defaultChecked className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Feed</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="ig-type" className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Reel</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="ig-type" className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Story</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Invite collaborators</label>
                      <input
                        type="text"
                        placeholder="Invite collaborators by entering their Instagram username here."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatforms.includes('tiktok') && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-black dark:bg-white"></div>
                    <span>TikTok options</span>
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Who can view this video?</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option>Everyone</option>
                        <option>Friends</option>
                        <option>Only me</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Allow users to</label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Comment</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Duet</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Stitch</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedPlatforms.includes('youtube') && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-600"></div>
                    <span>YouTube options</span>
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        placeholder="Add a title"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Post Type</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input type="radio" name="yt-type" defaultChecked className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Video</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="yt-type" className="mr-2" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Short</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Save for later
          </button>
          <div className="flex space-x-3">
            <button className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Schedule Post
            </button>
            <button className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
              <span>Post</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Post Preview */}
      <div className="lg:w-[480px] flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Post Preview</h3>

            {/* Platform Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <button
                onClick={() => setActivePreviewTab('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  activePreviewTab === 'all'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {selectedPlatforms.map((platformId) => {
                const platform = platforms.find(p => p.id === platformId);
                return (
                  <button
                    key={platformId}
                    onClick={() => setActivePreviewTab(platformId)}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${
                      activePreviewTab === platformId
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {platform?.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
            {(activePreviewTab === 'all' ? selectedPlatforms : [activePreviewTab as SocialPlatform]).map((platformId) => {
              const platform = platforms.find(p => p.id === platformId);
              return (
                <div key={platformId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  {/* Mock Social Post Card */}
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">Your Business Name</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Just now</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform?.color }}></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{platform?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-3">
                    {postContent ? (
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{postContent}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Your post content will appear here...</p>
                    )}
                  </div>

                  {/* Media Placeholder */}
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-lg h-48 flex items-center justify-center mb-3">
                    <div className="text-center">
                      <Image size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Make your post stand out with a photo</p>
                    </div>
                  </div>

                  {/* Interaction Buttons */}
                  <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400 text-sm">
                    <button className="flex items-center space-x-1 hover:text-red-600">
                      <span>👍</span>
                      <span>Like</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-600">
                      <span>💬</span>
                      <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-red-600">
                      <span>↗️</span>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {selectedPlatforms.length === 0 && (
              <div className="text-center py-12">
                <Share2 size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">Select platforms to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
        )}

        {activeSubTab === 'comments' && (
          <CommentsTabContent platforms={platforms} />
        )}

        {activeSubTab === 'statistics' && (
          <StatisticsTabContent platforms={platforms} />
        )}

        {activeSubTab === 'social-listening' && (
          <SocialListeningTabContent />
        )}
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={settingsInitialTab}
      />
    </div>
  );
};

interface TabContentProps {
  platforms: Array<{ id: SocialPlatform; name: string; color: string; connected: boolean }>;
}

const CommentsTabContent: React.FC<TabContentProps> = ({ platforms }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');

  return (
    <div className="h-full flex gap-6 p-6">
      {/* Left Sidebar - Platform List */}
      <div className="w-64 flex-shrink-0 space-y-2">
        <button
          onClick={() => setSelectedPlatform('all')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedPlatform === 'all'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All Platforms
        </button>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            disabled={!platform.connected}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedPlatform === platform.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : platform.connected
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md">
            <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
            <span className="text-gray-400">→</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">End Date</span>
          </div>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300">
            <option>All Comments</option>
            <option>Replied</option>
            <option>Pending</option>
          </select>
          <input
            type="text"
            placeholder="Search by word"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
          />
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 mb-4 text-blue-500 dark:text-blue-400">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8L10.89 13.26C11.5833 13.7167 12.4167 13.7167 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">No comments yet</p>
        </div>
      </div>
    </div>
  );
};

const StatisticsTabContent: React.FC<TabContentProps> = ({ platforms }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  return (
    <div className="h-full flex gap-6 p-6">
      {/* Left Sidebar - Platform Filter */}
      <div className="w-64 flex-shrink-0 space-y-2">
        <button
          onClick={() => setSelectedPlatform('all')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedPlatform === 'all'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            disabled={!platform.connected}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedPlatform === platform.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : platform.connected
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Number of Posts</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Likes</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Followers</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">2</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Impressions</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">140</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Comments</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">1</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Post Performance</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Impressions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Likes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Comments</span>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Performance data over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialListeningTabContent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="h-full p-6 space-y-6">
      {/* Info Banner */}
      {showBanner && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Powerful Listening Ahead!</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You're already seeing social trends in action. Soon, we're expanding with in-depth analysis, smarter insights, and actionable data for your brand. The next version is on its way!
            </p>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header with Date and Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Social Trends</h2>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">Nov 25, 2025</span>
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300">
            Refresh
          </button>
        </div>
      </div>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Google Trends Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path fill="#34A853" d="M2 17l10 5 10-5-10-5-10 5z"/>
                <path fill="#FBBC04" d="M2 12l10 5 10-5-10-5-10 5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Google Trends</h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {[
              { rank: 1, name: 'santa fe - tolima', searches: '100.7K', badge: 'New' },
              { rank: 2, name: 'man city', searches: '23.4K', badge: 'New' },
              { rank: 3, name: 'sophie von der tann', searches: '20K', badge: 'New' },
              { rank: 4, name: 'jordan chiles', searches: '10.5K', badge: 'New' },
              { rank: 5, name: 'العجر', searches: '10K', badge: 'New' },
            ].map((trend) => (
              <div key={trend.rank} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                <span className="w-6 text-center text-sm font-medium text-gray-600 dark:text-gray-400">{trend.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{trend.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{trend.searches} Search</p>
                </div>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                  {trend.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pinterest Keywords Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E60023">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pinterest Keywords</h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {[
              { rank: 1, name: 'reze', pins: '756', trending: 'up' },
              { rank: 2, name: 'november nails', pins: '658', trending: null },
              { rank: 3, name: 'winter outfits', pins: '621', trending: null },
              { rank: 4, name: 'outfits invierno', pins: '500', trending: 'up' },
              { rank: 5, name: '67 brainrot', pins: '492', trending: 'up' },
            ].map((trend) => (
              <div key={trend.rank} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                <span className="w-6 text-center text-sm font-medium text-gray-600 dark:text-gray-400">{trend.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{trend.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{trend.pins} Pins</p>
                </div>
                {trend.trending === 'up' && (
                  <span className="text-green-500">
                    <TrendingUp className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wikipedia Pageviews Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#000000" d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.911 0 4.746v-.382c0-.165.103-.287.28-.287.346 0 .763.02 1.243.02 1.273 0 2.328-.02 3.162-.02.214 0 .321.122.321.287v.382c0 .165-.107.287-.321.287-.481.03-.896.15-1.167.361-.138.121-.172.271-.172.421 0 .15.062.42.172.69 1.247 3.001 3.514 8.729 3.921 9.57.406-.841 2.674-6.569 3.921-9.57.11-.27.172-.54.172-.69 0-.15-.034-.3-.172-.421-.271-.211-.686-.331-1.167-.361-.214 0-.321-.122-.321-.287v-.382c0-.165.107-.287.321-.287.834 0 1.889.02 3.162.02.48 0 .897-.02 1.243-.02.177 0 .28.122.28.287v.382c0 .165-.103.287-.28.287-.568.031-.941.121-1.122.271-.178.152-.368.538-.619 1.139-1.358 3.265-4.245 9.088-5.651 12.409-.405.902-.916 1.045-1.532-.029-.636-1.18-1.917-3.796-2.853-5.728z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wikipedia Pageviews</h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {[
              { rank: 1, name: 'Dharmendra', views: '386.7K', badge: null },
              { rank: 2, name: 'Sawyer Sweeten', views: '314.4K', badge: 'New' },
              { rank: 3, name: 'Google Chrome', views: '308.8K', badge: null },
              { rank: 4, name: 'Richard Branson', views: '160.2K', badge: 'New' },
              { rank: 5, name: 'Wicked: For Good', views: '149.5K', badge: null },
            ].map((trend) => (
              <div key={trend.rank} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded">
                <span className="w-6 text-center text-sm font-medium text-gray-600 dark:text-gray-400">{trend.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{trend.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{trend.views} Views</p>
                </div>
                {trend.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                    {trend.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;