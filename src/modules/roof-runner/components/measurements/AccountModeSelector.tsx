import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ExternalLink, ChevronRight, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useMeasurementOrderContext } from '../../context/MeasurementOrderContext';
import CreditsBalanceDisplay from './CreditsBalanceDisplay';
import type { AccountMode } from '../../types/measurementOrder';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { integrationsApi, IntegrationConnection } from '../../../../shared/services/integrationsApi';

interface AccountModeSelectorProps {
  onContinue: () => void;
  onBack?: () => void;
}

const AccountModeSelector: React.FC<AccountModeSelectorProps> = ({
  onContinue,
  onBack,
}) => {
  const navigate = useNavigate();
  const { currentOrganizationId, currentOrganizationSlug } = useCurrentOrganization();
  const {
    accountMode,
    setAccountMode,
    clearAccountMode,
    eagleViewAuth,
    error,
    clearError,
  } = useMeasurementOrderContext();

  const [selectedMode, setSelectedMode] = useState<AccountMode | null>(accountMode);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [eagleViewIntegration, setEagleViewIntegration] = useState<IntegrationConnection | null>(null);
  const [isLoadingIntegration, setIsLoadingIntegration] = useState(true);

  useEffect(() => {
    const loadEagleViewIntegration = async () => {
      if (!currentOrganizationId) return;

      try {
        setIsLoadingIntegration(true);
        const integration = await integrationsApi.getIntegrationByName(currentOrganizationId, 'eagleview');
        setEagleViewIntegration(integration);
      } catch (err) {
        console.error('Error loading EagleView integration:', err);
      } finally {
        setIsLoadingIntegration(false);
      }
    };

    loadEagleViewIntegration();
  }, [currentOrganizationId]);

  const isEagleViewConnected = eagleViewIntegration?.status === 'connected' || eagleViewAuth;

  useEffect(() => {
    if (accountMode) {
      setSelectedMode(accountMode);
    }
  }, [accountMode]);

  const navigateToIntegrationsSettings = () => {
    navigate(`/org/${currentOrganizationSlug}/settings/integrations`);
  };

  const handleModeSelect = (mode: AccountMode) => {
    setValidationError(null);
    clearError();

    if (mode === 'eagleview' && !isEagleViewConnected) {
      navigateToIntegrationsSettings();
      return;
    }

    setSelectedMode(mode);
    setAccountMode(mode);
  };

  const handleContinue = () => {
    setValidationError(null);

    if (!selectedMode) {
      setValidationError('Please select a payment method to continue');
      return;
    }

    if (selectedMode === 'eagleview' && !isEagleViewConnected) {
      setValidationError('Please connect your EagleView account in Settings');
      return;
    }

    onContinue();
  };

  const handleChangeMode = () => {
    clearAccountMode();
    setSelectedMode(null);
    setValidationError(null);
  };

  const isCreditsSelected = selectedMode === 'credits';
  const isEagleViewSelected = selectedMode === 'eagleview';
  const canContinue = selectedMode && (selectedMode === 'credits' || isEagleViewConnected);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Select Payment Method
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose how you would like to pay for your measurement order
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <button
          type="button"
          onClick={() => handleModeSelect('credits')}
          className={`relative p-6 rounded-xl border-2 text-left transition-all ${
            isCreditsSelected
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {isCreditsSelected && (
            <div className="absolute top-4 right-4">
              <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              isCreditsSelected
                ? 'bg-primary-100 dark:bg-primary-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Wallet className={`h-6 w-6 ${
                isCreditsSelected
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className={`font-semibold ${
                isCreditsSelected
                  ? 'text-primary-900 dark:text-primary-100'
                  : 'text-gray-900 dark:text-white'
              }`}>
                BuilderLync Credits
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use your prepaid credit balance
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <CreditsBalanceDisplay showRefreshButton={isCreditsSelected} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleModeSelect('eagleview')}
          className={`relative p-6 rounded-xl border-2 text-left transition-all ${
            isEagleViewSelected
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {isEagleViewSelected && isEagleViewConnected && (
            <div className="absolute top-4 right-4">
              <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              isEagleViewSelected
                ? 'bg-primary-100 dark:bg-primary-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <ExternalLink className={`h-6 w-6 ${
                isEagleViewSelected
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className={`font-semibold ${
                isEagleViewSelected
                  ? 'text-primary-900 dark:text-primary-100'
                  : 'text-gray-900 dark:text-white'
              }`}>
                EagleView Account
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bill directly to your EagleView account
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            {isLoadingIntegration ? (
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center animate-pulse">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Checking connection...</div>
                </div>
              </div>
            ) : isEagleViewConnected ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {eagleViewIntegration?.external_account_name || eagleViewAuth?.accountName || 'Connected'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ready to use
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-medium">Not connected</div>
                  <div className="text-xs">Click to connect in Settings</div>
                </div>
              </div>
            )}
          </div>
        </button>
      </div>

      {(validationError || error) && (
        <div className="mb-6 flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{validationError || error}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          {accountMode && (
            <button
              type="button"
              onClick={handleChangeMode}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Change payment method
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModeSelector;
