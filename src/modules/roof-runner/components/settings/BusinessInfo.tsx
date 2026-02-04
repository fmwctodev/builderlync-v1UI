import React, { useState, useEffect } from 'react';
import { Info, Copy, RefreshCw, MoreVertical, Plus, ChevronDown, Upload, Trash2, Save } from 'lucide-react';
import { BusinessInfo as BusinessInfoType, getBusinessInfo, updateBusinessInfo, uploadBusinessLogo, generateApiKey } from '../../../../shared/store/services/businessInfoApi';

const BusinessInfo: React.FC = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadBusinessInfo();
  }, []);
  const loadBusinessInfo = async () => {
    try {
      setLoading(true);
      const response = await getBusinessInfo();
      if (response.success) {
        setBusinessInfo(response.data);
        if (response.data.business_logo) {
          setLogoPreview(response.data.business_logo);
        }
      } else {
        // Show default values even if API fails
        const defaultBusinessInfo: BusinessInfoType = {
          friendly_business_name: '',
          legal_business_name: '',
          business_email: '',
          business_phone: '',
          branded_domain: '',
          business_website: '',
          business_niche: 'Roofing Contractor',
          business_currency: 'USD',
          business_logo: '',
          street_address: '',
          city: '',
          postal_code: '',
          state: '',
          country: 'United States',
          time_zone: 'GMT-06:00 America/Chicago (CST)',
          platform_language: 'English (United States)',
          outbound_language: '',
          business_type: 'Limited Liability Company Or Sole-Proprietorship',
          business_industry: 'CONSTRUCTION',
          business_registration_id_type: 'USA: Employer Identification Number (EIN)',
          business_registration_number: '',
          is_not_registered: false,
          business_regions: ['usa-canada'],
          representative_first_name: '',
          representative_last_name: '',
          representative_email: '',
          representative_job_position: 'CEO',
          representative_phone: '',
          allow_duplicate_contact: false,
          primary_search_field: 'Email',
          secondary_search_field: 'Phone',
          location_id: 'Not generated',
          api_key: 'Not generated'
        };
        setBusinessInfo(defaultBusinessInfo);
        setError(null);
      }
    } catch (err: any) {
      // Show default values even if request fails
      const defaultBusinessInfo: BusinessInfoType = {
        friendly_business_name: '',
        legal_business_name: '',
        business_email: '',
        business_phone: '',
        branded_domain: '',
        business_website: '',
        business_niche: 'Roofing Contractor',
        business_currency: 'USD',
        business_logo: '',
        street_address: '',
        city: '',
        postal_code: '',
        state: '',
        country: 'United States',
        time_zone: 'GMT-06:00 America/Chicago (CST)',
        platform_language: 'English (United States)',
        outbound_language: '',
        business_type: 'Limited Liability Company Or Sole-Proprietorship',
        business_industry: 'CONSTRUCTION',
        business_registration_id_type: 'USA: Employer Identification Number (EIN)',
        business_registration_number: '',
        is_not_registered: false,
        business_regions: ['usa-canada'],
        representative_first_name: '',
        representative_last_name: '',
        representative_email: '',
        representative_job_position: 'CEO',
        representative_phone: '',
        allow_duplicate_contact: false,
        primary_search_field: 'Email',
        secondary_search_field: 'Phone',
        location_id: 'Not generated',
        api_key: 'Not generated'
      };
      setBusinessInfo(defaultBusinessInfo);
      setError(null);
      console.error('Error loading business info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!businessInfo) return;

    try {
      setSaving(true);

      const response = await updateBusinessInfo(businessInfo);
      if (response.success) {
        alert('Business information saved successfully!');
      } else {
        setError('Failed to save business information: ' + response.message);
      }
    } catch (err: any) {
      setError('Failed to save business information');
      console.error('Error saving business info:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        setError('Logo file size must be less than 2.5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload logo immediately
      try {
        const response = await uploadBusinessLogo(file);
        if (response.success && businessInfo) {
          const updatedInfo = { ...businessInfo, business_logo: response.data.logoUrl };
          setBusinessInfo(updatedInfo);

          // If no existing record (id is missing), create one with logo
          if (!businessInfo.id) {
            await updateBusinessInfo({ business_logo: response.data.logoUrl });
          }
        }
      } catch (err) {
        setError('Failed to upload logo');
        console.error('Error uploading logo:', err);
      }
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const response = await generateApiKey();
      if (response.success && businessInfo) {
        setBusinessInfo({ ...businessInfo, api_key: response.data.apiKey });
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const updateField = (field: keyof BusinessInfoType, value: any) => {
    if (businessInfo) {
      setBusinessInfo({ ...businessInfo, [field]: value });
    }
  };

  const toggleRegion = (region: string) => {
    if (businessInfo && businessInfo.business_regions) {
      const regions = businessInfo.business_regions.includes(region)
        ? businessInfo.business_regions.filter((r: string) => r !== region)
        : [...businessInfo.business_regions, region];
      updateField('business_regions', regions);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!businessInfo) return null;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Information</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your company details and locations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h3>
            {/* <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Location ID</span>
              <Info className="w-4 h-4" />
              <span className="font-mono">{businessInfo.location_id || 'Not generated'}</span>
              <button
                onClick={() => copyToClipboard(businessInfo.location_id || '')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div> */}
          </div>

          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-64 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Business Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-xs font-medium">{businessInfo.friendly_business_name || 'BUSINESS'}</p>
                    <p className="text-xs font-medium">LOGO</p>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-semibold">Business Logo</span>
                  <br />
                  The proposed size is 350px * 180px. No bigger than 2.5 MB
                </p>
                <div className="flex items-center space-x-2">
                  <label className="px-4 py-1.5 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer">
                    <Upload className="w-4 h-4 inline mr-1" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  {logoPreview && (
                    <button
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                        updateField('business_logo', '');
                      }}
                      className="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Friendly Business Name
            </label>
            <input
              type="text"
              value={businessInfo.friendly_business_name}
              onChange={(e) => updateField('friendly_business_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Legal Business Name</span>
              <Info className="w-4 h-4" />
            </label>
            <input
              type="text"
              value={businessInfo.legal_business_name}
              onChange={(e) => updateField('legal_business_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the exact legal business name, as registered with the EIN
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Email
              </label>
              <input
                type="email"
                value={businessInfo.business_email}
                onChange={(e) => updateField('business_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Phone
              </label>
              <input
                type="tel"
                value={businessInfo.business_phone}
                onChange={(e) => updateField('business_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Branded Domain</span>
              <Info className="w-4 h-4" />
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Branded Domain"
                value={businessInfo.branded_domain || ''}
                onChange={(e) => updateField('branded_domain', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Website
            </label>
            <input
              type="url"
              value={businessInfo.business_website || ''}
              onChange={(e) => updateField('business_website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Niche
              </label>
              <div className="relative">
                <select
                  value={businessInfo.business_niche}
                  onChange={(e) => updateField('business_niche', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="Roofing Contractor">Roofing Contractor</option>
                  <option value="General Contractor">General Contractor</option>
                  <option value="Solar Installation">Solar Installation</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span>Business Currency</span>
                <Info className="w-4 h-4" />
              </label>
              <div className="relative">
                <select
                  value={businessInfo.business_currency}
                  onChange={(e) => updateField('business_currency', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>API Key</span>
              <Info className="w-4 h-4" />
              <span className="font-mono">{businessInfo.api_key ? `${businessInfo.api_key.substring(0, 8)}****` : 'Not generated'}</span>
              <button
                onClick={() => copyToClipboard(businessInfo.api_key || '')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleGenerateApiKey}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div> */}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex items-center space-x-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Physical Address</h3>
            <Info className="w-4 h-4 text-gray-400" />
          </div>

          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Street Address</span>
              <Info className="w-4 h-4" />
            </label>
            <input
              type="text"
              value={businessInfo.street_address}
              onChange={(e) => updateField('street_address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={businessInfo.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Postal/Zip Code
              </label>
              <input
                type="text"
                value={businessInfo.postal_code}
                onChange={(e) => updateField('postal_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State / Prov / Region
            </label>
            <div className="relative">
              <select
                value={businessInfo.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>Texas</option>
                <option>California</option>
                <option>Florida</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <div className="relative">
              <select
                value={businessInfo.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>United States</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Zone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={businessInfo.time_zone}
                onChange={(e) => updateField('time_zone', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>GMT-06:00 America/Chicago (CST)</option>
                <option>GMT-05:00 America/New_York (EST)</option>
                <option>GMT-08:00 America/Los_Angeles (PST)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Platform Language</span>
              <Info className="w-4 h-4" />
            </label>
            <div className="relative">
              <select
                value={businessInfo.platform_language}
                onChange={(e) => updateField('platform_language', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>English (United States)</option>
                <option>Spanish (Spain)</option>
                <option>French (France)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Outbound communication language for custom values</span>
              <Info className="w-4 h-4" />
            </label>
            <div className="relative">
              <select
                value={businessInfo.outbound_language || ''}
                onChange={(e) => updateField('outbound_language', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>Select language</option>
                <option>English</option>
                <option>Spanish</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Type
            </label>
            <div className="relative">
              <select
                value={businessInfo.business_type}
                onChange={(e) => updateField('business_type', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>Limited Liability Company Or Sole-Proprietorship</option>
                <option>Corporation</option>
                <option>Partnership</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Industry
            </label>
            <div className="relative">
              <select
                value={businessInfo.business_industry}
                onChange={(e) => updateField('business_industry', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>CONSTRUCTION</option>
                <option>Technology</option>
                <option>Healthcare</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Registration ID Type
            </label>
            <div className="relative">
              <select
                value={businessInfo.business_registration_id_type}
                onChange={(e) => updateField('business_registration_id_type', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>USA: Employer Identification Number (EIN)</option>
                <option>Canada: Business Number (BN)</option>
                <option>UK: Company Registration Number (CRN)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Registration Number
            </label>
            <input
              type="text"
              value={businessInfo.business_registration_number || ''}
              onChange={(e) => updateField('business_registration_number', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notRegistered"
            checked={businessInfo.is_not_registered}
            onChange={(e) => updateField('is_not_registered', e.target.checked)}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="notRegistered" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            My business is Not registered
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Business Regions of Operations
          </label>
          <div className="space-y-2">
            {[
              { id: 'africa', label: 'Africa' },
              { id: 'asia', label: 'Asia' },
              { id: 'europe', label: 'Europe' },
              { id: 'latin-america', label: 'Latin America' },
              { id: 'usa-canada', label: 'USA and Canada' }
            ].map((region) => (
              <div key={region.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={region.id}
                  checked={businessInfo.business_regions?.includes(region.id) || false}
                  onChange={() => toggleRegion(region.id)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor={region.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {region.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Information'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Authorized Representative</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={businessInfo.representative_first_name}
              onChange={(e) => updateField('representative_first_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={businessInfo.representative_last_name}
              onChange={(e) => updateField('representative_last_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Representative Email
          </label>
          <input
            type="email"
            value={businessInfo.representative_email}
            onChange={(e) => updateField('representative_email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Position
          </label>
          <div className="relative">
            <select
              value={businessInfo.representative_job_position}
              onChange={(e) => updateField('representative_job_position', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option>CEO</option>
              <option>CTO</option>
              <option>CFO</option>
              <option>COO</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number (With Country Code)
          </label>
          <input
            type="tel"
            value={businessInfo.representative_phone}
            onChange={(e) => updateField('representative_phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Information'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Deduplication Preferences</h3>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => updateField('allow_duplicate_contact', !businessInfo.allow_duplicate_contact)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${businessInfo.allow_duplicate_contact ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${businessInfo.allow_duplicate_contact ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
          </button>
          <span className="text-base text-gray-900 dark:text-white">Allow Duplicate Contact</span>
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 dark:text-white mb-3">
            Find existing contacts based on
          </label>
          <div className="relative">
            <select
              value={businessInfo.primary_search_field}
              onChange={(e) => updateField('primary_search_field', e.target.value)}
              className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
            >
              <option>Email</option>
              <option>Phone</option>
              <option>Name</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-base font-medium text-gray-900 dark:text-white mb-3">
            Second preference for search (Optional)
          </label>
          <div className="relative">
            <select
              value={businessInfo.secondary_search_field || ''}
              onChange={(e) => updateField('secondary_search_field', e.target.value)}
              className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
            >
              <option>Phone</option>
              <option>Email</option>
              <option>Name</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;
