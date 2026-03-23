import React, { useState, useEffect } from 'react';
import { X, Coins, Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import {
  getCreditPackages,
  createStripeCheckoutSession,
  createCreditPurchase,
  CreditPackage,
} from '../../services/creditPurchaseApi';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
  requiredCredits?: number;
}

export function BuyCreditsModal({
  isOpen,
  onClose,
  currentBalance = 0,
  requiredCredits,
}: BuyCreditsModalProps) {
  const { currentOrganizationId } = useCurrentOrganization();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCreditPackages();
      setPackages(data);
      const popular = data.find(p => p.is_popular);
      if (popular) {
        setSelectedPackage(popular);
      } else if (data.length > 0) {
        setSelectedPackage(data[0]);
      }
    } catch (err) {
      console.error('Error loading packages:', err);
      setError('Failed to load credit packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !currentOrganizationId) return;

    try {
      setIsProcessing(true);
      setError(null);

      const currentUrl = window.location.href;
      const successUrl = `${window.location.origin}${window.location.pathname}?credits_purchase=success`;
      const cancelUrl = `${window.location.origin}${window.location.pathname}?credits_purchase=cancelled`;

      const { checkoutUrl, sessionId } = await createStripeCheckoutSession({
        organizationId: currentOrganizationId,
        packageId: selectedPackage.id,
        successUrl,
        cancelUrl,
      });

      await createCreditPurchase(
        currentOrganizationId,
        selectedPackage.id,
        selectedPackage.credits,
        selectedPackage.price_cents,
        sessionId
      );

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const shortage = requiredCredits ? Math.max(0, requiredCredits - currentBalance) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Coins className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Buy Credits
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current balance: {currentBalance} credits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {shortage > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    You need {shortage} more {shortage === 1 ? 'credit' : 'credits'}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                    Select a package below to continue with your order.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No credit packages available at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {pkg.is_popular && (
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}

                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className={`font-semibold ${
                      selectedPackage?.id === pkg.id
                        ? 'text-primary-900 dark:text-primary-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {pkg.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${
                      selectedPackage?.id === pkg.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {formatPrice(pkg.price_cents)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      for {pkg.credits} credits
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(Math.round(pkg.price_cents / pkg.credits))} per credit
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <div>
            {selectedPackage && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New balance after purchase:{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentBalance + selectedPackage.credits} credits
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={!selectedPackage || isProcessing}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Continue to Checkout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyCreditsModal;
