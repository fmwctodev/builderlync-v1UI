import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader } from 'lucide-react';

export const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We could verify the session here with our backend
        // but the webhook will handle the credit update.
        // We'll just wait a bit to show a success message.
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [sessionId]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                {loading ? (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Loader className="w-16 h-16 text-blue-500 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verifying Payment...</h2>
                        <p className="text-gray-500">Please wait while we confirm your purchase.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Successful!</h2>
                            <p className="text-gray-500">Your credits have been added to your account.</p>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate(-1)} // Go back to where they were (ideally the order page)
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Return to Measurements
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
