import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface EagleViewConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentCredits: number;
}

const EagleViewConnectionModal: React.FC<EagleViewConnectionModalProps> = ({
    isOpen,
    onClose
}) => {
    const { orgSlug } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setLoading(false);
        }
    }, [isOpen]);

    const handleConnectOAuth = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/eagleview/authorize`,
                {
                    params: { orgSlug },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.data.url) {
                window.location.href = response.data.data.url;
            } else {
                throw new Error('Could not get authorization URL');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initiate connection. Please try again.');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Connect EagleView
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 text-center">
                    <div className="mb-8">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <img
                                src="https://www.google.com/s2/favicons?domain=eagleview.com&sz=128"
                                alt="EagleView"
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Connect your Account
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Sync your EagleView account to order and receive property measurements directly within BuilderLync.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleConnectOAuth}
                            disabled={loading}
                            className="w-full px-8 py-4 text-white bg-red-600 rounded-xl hover:bg-red-700 font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center group"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connecting...
                                </span>
                            ) : 'Sign in with EagleView'}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start space-x-3 text-left">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span>Secure Connection via EagleView OAuth 2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EagleViewConnectionModal;
