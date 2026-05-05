import React, { useState } from 'react';
import { X, Check, Wallet, ArrowRight } from 'lucide-react';
import { paymentService } from '../../services/paymentService';

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    orgSlug: string;
}

const CREDIT_PACKS = [
    { id: 'starter', name: 'Starter Pack', credits: 10, price: 49, desc: '10 credits for occasional use', perCredit: 4.90 },
    { id: 'standard', name: 'Standard Pack', credits: 25, price: 99, desc: '25 credits - Best value for small teams', perCredit: 3.96, popular: true },
    { id: 'pro', name: 'Pro Pack', credits: 50, price: 179, desc: '50 credits for growing businesses', perCredit: 3.58 },
    { id: 'enterprise', name: 'Enterprise Pack', credits: 100, price: 299, desc: '100 credits for high-volume users', perCredit: 2.99 },
];

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose, currentBalance, orgSlug }) => {
    const [selectedPackId, setSelectedPackId] = useState<string>('standard');

    if (!isOpen) return null;

    const selectedPack = CREDIT_PACKS.find(p => p.id === selectedPackId);
    const newBalance = currentBalance + (selectedPack?.credits || 0);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Wallet className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                                        Buy Credits
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Current balance: {currentBalance} credits
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CREDIT_PACKS.map((pack) => (
                                <div
                                    key={pack.id}
                                    onClick={() => setSelectedPackId(pack.id)}
                                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer bg-white dark:bg-gray-800 ${selectedPackId === pack.id
                                        ? pack.popular ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-900 dark:border-white ring-1 ring-gray-900'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {pack.popular && (
                                        <div className="absolute -top-3 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                            Most Popular
                                        </div>
                                    )}

                                    {selectedPackId === pack.id && (
                                        <div className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center ${pack.popular ? 'bg-red-600' : 'bg-gray-900 dark:bg-white'}`}>
                                            <Check className={`w-3 h-3 ${pack.popular ? 'text-white' : 'text-white dark:text-gray-900'}`} />
                                        </div>
                                    )}

                                    <h3 className={`font-bold text-lg mb-1 ${pack.popular ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                        {pack.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3">{pack.desc}</p>

                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">${pack.price.toFixed(2)}</span>
                                        <span className="text-sm text-gray-500">for {pack.credits} credits</span>
                                    </div>
                                    <p className="text-xs text-gray-400">${pack.perCredit.toFixed(2)} per credit</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-row-reverse gap-3">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm items-center gap-2"
                                onClick={async () => {
                                    try {
                                        console.log('Initiating checkout with', selectedPack);
                                        const session = await paymentService.createCheckoutSession(selectedPack, orgSlug);
                                        if (session.url) {
                                            window.location.href = session.url;
                                        }
                                    } catch (error) {
                                        console.error('Checkout failed:', error);
                                        alert('Failed to initiate checkout. Please try again.');
                                    }
                                }}
                            >
                                <ArrowRight className="w-4 h-4" />
                                Continue to Checkout
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="mt-4 sm:mt-0 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            New balance after purchase: <span className="text-gray-900 dark:text-white font-bold">{newBalance} credits</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
