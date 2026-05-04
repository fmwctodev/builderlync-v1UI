import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, MessageSquare, Calendar, Users, BarChart3, Play, Pause, Copy, Trash2, Edit } from 'lucide-react';
import { campaignsApi } from '../../../shared/services/campaignsApi';
import { Campaign, CampaignStatus, CampaignType, CampaignFormData } from '../../roof-runner/types/campaigns';
import CampaignModal from '../../roof-runner/components/CampaignModal';

export const Marketing: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<CampaignType | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter, typeFilter, searchQuery]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignsApi.getCampaigns(typeFilter || undefined, statusFilter || undefined, searchQuery || undefined);
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (data: CampaignFormData, sendNow: boolean) => {
    try {
      await campaignsApi.createCampaign(data, sendNow);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      await campaignsApi.sendCampaign(id);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const handlePauseCampaign = async (id: string) => {
    try {
      await campaignsApi.pauseCampaign(id);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to pause campaign:', error);
    }
  };

  const handleDuplicateCampaign = async (id: string) => {
    try {
      await campaignsApi.duplicateCampaign(id);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to duplicate campaign:', error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignsApi.deleteCampaign(id);
        loadCampaigns();
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'sending': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    return type === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your email and SMS campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Create Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CampaignType | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first marketing campaign</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                        {campaign.subject && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{campaign.subject}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(campaign.type)}
                        <span className="text-sm text-gray-900 dark:text-white capitalize">{campaign.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {campaign.target_audience?.estimated_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleSendCampaign(campaign.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Send Campaign"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {campaign.status === 'sending' && (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="p-1 text-orange-600 hover:text-orange-700"
                            title="Pause Campaign"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicateCampaign(campaign.id)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Duplicate Campaign"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingCampaign(campaign)}
                          className="p-1 text-gray-600 hover:text-gray-700"
                          title="Edit Campaign"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:text-gray-700"
                          title="View Stats"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete Campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      <CampaignModal
        show={showCreateModal || !!editingCampaign}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCampaign(null);
        }}
        onSave={handleCreateCampaign}
        editingCampaign={editingCampaign}
      />
    </div>
  );
};