import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, MousePointer, TrendingUp, Eye } from 'lucide-react';

const TikTokAdsPage: React.FC = () => {
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
            window.history.replaceState({}, document.title, window.location.pathname);
            handleCallback(code);
        } else {
            fetchCampaigns();
        }
    }, [searchParams]);

    const handleCallback = async (code: string) => {
        try {
            setLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/social-ads/tiktok/callback?code=${code}`,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (response.ok) {
                await fetchCampaigns();
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || 'Failed to connect TikTok Ads account');
                setLoading(false);
            }
        } catch (err) {
            setError('Error connecting to TikTok Ads');
            setLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/social-ads/tiktok/campaigns`,
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.data || []);
                if (data.data && data.data.length > 0) {
                    setSelectedCampaign(data.data[0].id);
                    setMetrics(data.data[0].metrics || null);
                }
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || 'Not connected to TikTok Ads');
            }
        } catch (err) {
            setError('Failed to fetch campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleCampaignChange = (campaignId: string) => {
        setSelectedCampaign(campaignId);
        const camp = campaigns.find(c => c.id === campaignId);
        setMetrics(camp?.metrics || null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex flex-col items-center">
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={() => navigate(`/org/${orgSlug}/settings/integrations`)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                        Go to Integrations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/org/${orgSlug}/marketing`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TikTok Ads</h1>
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
                    <p className="text-gray-600 dark:text-gray-400">No campaigns found for your TikTok Ads account</p>
                </div>
            )}
        </div>
    );
};

export default TikTokAdsPage;
