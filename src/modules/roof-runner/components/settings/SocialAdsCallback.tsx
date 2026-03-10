import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../../shared/store/hooks';
import axios from 'axios';

export const SocialAdsCallback: React.FC<{ platform: 'facebook' | 'tiktok' }> = ({ platform }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector((state: any) => state.auth);

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(location.search);
            const code = urlParams.get('code') || 'mock_auth_code'; // support mock clicks

            const orgSlug = user?.companySlug || localStorage.getItem('currentOrganizationSlug');

            try {
                await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/social-ads/${platform}/callback?code=${code}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                // Redirect back to integrations
                navigate(`/org/${orgSlug}/settings/integrations`, { replace: true });
            } catch (error) {
                console.error(`Error connecting ${platform}:`, error);
                navigate(`/org/${orgSlug}/settings/integrations?error=${platform}`, { replace: true });
            }
        };

        handleCallback();
    }, [location, navigate, platform, user]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
                Connecting your {platform === 'facebook' ? 'Facebook / Meta' : 'TikTok'} Ads account...
            </p>
        </div>
    );
};

export default SocialAdsCallback;
