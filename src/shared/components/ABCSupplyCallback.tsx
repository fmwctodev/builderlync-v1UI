import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ABCSupplyCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            console.log("ABC Supply Callback:", { code, state });

            if (!code) {
                setError("No authorization code found.");
                return;
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("You must be logged in to complete the integration.");
                    return;
                }

                const storedUser = localStorage.getItem('user');
                let orgSlug = '';

                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        orgSlug = parsed.companySlug || parsed.company_slug || `company-${parsed.organizationId}`;
                    } catch (e) {
                        console.error("Failed to parse stored user", e);
                    }
                }

                if (!orgSlug) {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api'}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        const user = userData.data || userData;
                        orgSlug = user.companySlug || user.company_slug || `company-${user.organizationId}`;
                    }
                }

                if (orgSlug) {
                    const targetPath = `/org/${orgSlug}/settings/integrations`;
                    navigate(`${targetPath}?code=${code}&state=${state}`, { replace: true });

                } else {
                    setError("Could not determine organization for redirection.");
                }

            } catch (err) {
                console.error("Callback handling error:", err);
                setError("An error occurred during authentication.");
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 mb-4 text-xl font-semibold">Configuration Error</div>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="flex items-center space-x-3 text-gray-600">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-lg font-medium">Connecting your account...</span>
            </div>
        </div>
    );
};

export default ABCSupplyCallback;
