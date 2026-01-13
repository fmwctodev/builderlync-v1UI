import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, MousePointer, TrendingUp, Eye } from 'lucide-react';

const GoogleAdsPage: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const [searchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
    } else {
      fetchCampaigns();
    }
  }, [searchParams]);

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-ads/callback?code=${code}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.ok) {
        await fetchCampaigns();
      } else {
        setError('Failed to connect Google Ads account');
        setLoading(false);
      }
    } catch (err) {
      setError('Error connecting to Google Ads');
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-ads/campaigns`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedCampaign(data.data[0].id);
          fetchMetrics(data.data[0].id);
        }
      } else {
        setError('Not connected to Google Ads');
      }
    } catch (err) {
      setError('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (campaignId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-ads/metrics?campaignId=${encodeURIComponent(campaignId)}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    fetchMetrics(campaignId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const basePath = orgSlug ? `/org/${orgSlug}` : '';
              navigate(`${basePath}/marketing`);
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketing</span>
          </button>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{error}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your Google Ads account to view campaign metrics</p>
          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-analytics/connect`,
                  {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                  }
                );
                const data = await response.json();
                if (data.data?.authUrl) {
                  window.location.href = data.data.authUrl;
                }
              } catch (err) {
                alert('Failed to initiate connection');
              }
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Google Ads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const basePath = orgSlug ? `/org/${orgSlug}` : '';
              navigate(`${basePath}/marketing`);
            }}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Marketing</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Google Ads</h1>
        </div>
      </div>

      {/* Campaign Selector */}
      {campaigns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Campaign
          </label>
          <select
            value={selectedCampaign || ''}
            onChange={(e) => handleCampaignChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Campaign Details */}
      {selectedCampaign && campaigns.find(c => c.id === selectedCampaign) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Campaign Details</h3>
          {(() => {
            const campaign = campaigns.find(c => c.id === selectedCampaign);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {campaign?.status || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Budget</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${campaign?.budget || 'N/A'}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-5 w-5 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {metrics.clicks || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-5 w-5 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Impressions</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {metrics.impressions || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${metrics.cost || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversions</h4>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {metrics.conversions || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>
        </div>
      )}

      {campaigns.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">No campaigns found for your Google Ads account</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAdsPage;
