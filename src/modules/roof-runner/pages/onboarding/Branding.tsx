import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Palette, Loader } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

export const Branding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#dc2626');
  const [secondaryColor, setSecondaryColor] = useState('#1f2937');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.branding_config) {
        const config = settings.branding_config;
        if (config.company_name) setCompanyName(config.company_name);
        if (config.website) setWebsite(config.website);
        if (config.tagline) setTagline(config.tagline);
        if (config.description) setDescription(config.description);
        if (config.primary_color) setPrimaryColor(config.primary_color);
        if (config.secondary_color) setSecondaryColor(config.secondary_color);
      }
    } catch (err) {
      console.error('Error loading branding config:', err);
    }
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.updateBrandingConfig(currentOrganization.id, {
        company_name: companyName,
        website,
        tagline,
        description,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        configured_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 7);
      navigate('/onboarding/billing');
    } catch (err) {
      console.error('Error saving branding config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.completeStep(user.id, currentOrganization.id, 7);
      navigate('/onboarding/billing');
    } catch (err) {
      console.error('Error skipping step:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={7}
      title="Define Your Brand"
      description="Set up your brand identity for consistent customer communication and marketing."
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Company Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Roofing & Construction"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Your trusted roofing partner"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe your business, services, and what makes you unique..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Brand Colors
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: primaryColor }}
                />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Main brand color for buttons and accents
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: secondaryColor }}
                />
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-20 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supporting color for text and backgrounds
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Logo Upload
            </h3>
          </div>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Upload your company logo
            </p>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              Choose File
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              PNG or JPG, recommended 400x400px
            </p>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            Your branding will be used across proposals, invoices, emails, and customer-facing documents.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/pipeline')}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Back
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            <span>Continue</span>
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
