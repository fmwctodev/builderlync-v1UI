import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Globe, TrendingUp } from 'lucide-react';

const GoogleBusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const [searchParams] = useSearchParams();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
    } else {
      fetchLocations();
    }
  }, [searchParams]);

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-analytics/google-business/callback?code=${code}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        await fetchLocations();
      } else {
        setError('Failed to connect Google Business account');
        setLoading(false);
      }
    } catch (err) {
      setError('Error connecting to Google Business');
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-analytics/google-business/locations`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const locs = data.data?.locations || data.data || [];
        setLocations(locs);
        if (locs.length > 0) {
          const firstLoc = locs[0].name;
          setSelectedLocation(firstLoc);
          fetchInsights(firstLoc);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = data.message || '';
        if (msg.toLowerCase().includes('quota exceeded') || response.status === 429) {
          setError('Google API Limit Reached: ' + msg);
        } else if (msg.toLowerCase().includes('not connected')) {
          setError('Not connected');
        } else {
          setError(msg || 'Failed to fetch locations');
        }
      }
    } catch (err) {
      setError('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (locationName: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-analytics/google-business/insights?locationName=${encodeURIComponent(locationName)}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setInsights(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }
  };

  const handleLocationChange = (locationName: string) => {
    setSelectedLocation(locationName);
    fetchInsights(locationName);
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

          {error?.includes('Google API Limit') ? (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Google's API is temporarily limiting requests. Your account is connected, but we cannot fetch locations right now.
                Please wait a minute and try again.
              </p>
              <button
                onClick={() => fetchLocations()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry Now
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your Google Business account to view insights</p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/google-analytics/google-business/connect`,
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
                Connect Google Business
              </button>
            </>
          )}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Google Business Profile</h1>
        </div>
      </div>

      {/* Location Selector */}
      {locations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Location
          </label>
          <select
            value={selectedLocation || ''}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {locations.map((location) => (
              <option key={location.name} value={location.name}>
                {location.title || location.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Location Details */}
      {selectedLocation && locations.find(l => l.name === selectedLocation) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location Details</h3>
          {(() => {
            const location = locations.find(l => l.name === selectedLocation);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {location?.storefrontAddress?.addressLines?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {location?.phoneNumbers?.primaryPhone || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {location?.websiteUri || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Insights Metrics */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Views</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {insights.profileViews || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Search Queries</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {insights.searchQueries || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Direction Requests</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {insights.directionRequests || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Calls</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {insights.phoneCalls || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 dark:text-green-400">Last 30 days</span>
            </div>
          </div>
        </div>
      )}

      {locations.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">No locations found for your Google Business account</p>
        </div>
      )}
    </div>
  );
};

export default GoogleBusinessPage;
