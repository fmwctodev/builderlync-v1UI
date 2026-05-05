import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Cancelled</h2>
                        <p className="text-gray-500">Your payment was not completed and no credits were added.</p>
                    </div>
                    <div className="pt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
