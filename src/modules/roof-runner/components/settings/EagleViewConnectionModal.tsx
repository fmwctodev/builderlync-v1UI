import React, { useState, useEffect } from 'react';
import { X, Building2, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface EagleViewConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentCredits: number;
}

const EagleViewConnectionModal: React.FC<EagleViewConnectionModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    currentCredits
}) => {
    const [step, setStep] = useState<'selection' | 'connect-own'>('selection');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep('selection');
            setError(null);
            setClientId('');
            setClientSecret('');
        }
    }, [isOpen]);

    const handleConnectOwn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200/api'}/eagleview/connect`,
                { clientId, clientSecret },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to connect. Please check your credentials.');
        } finally {
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

                <div className="p-6">
                    {step === 'selection' ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => setStep('connect-own')}
                                className="w-full flex items-start p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-left group"
                            >
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/50">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        Connect My Account
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Use your own EagleView credentials. You will be billed directly by EagleView.
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    // Just close for now, as selecting this means they are using the default
                                    onClose();
                                }}
                                className="w-full flex items-start p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                            >
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        Use Platform Account
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        Use our enterprise account. Credits will be deducted from your balance.
                                    </p>
                                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                        Credits Available: {currentCredits}
                                    </div>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleConnectOwn} className="space-y-4">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg flex items-start space-x-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Enter your EagleView Client ID and Client Secret. These can be found in your EagleView developer portal.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Client ID
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                                    placeholder="Enter Client ID"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Client Secret
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={clientSecret}
                                    onChange={(e) => setClientSecret(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                                    placeholder="Enter Client Secret"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('selection')}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? 'Connecting...' : 'Connect Account'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EagleViewConnectionModal;
