import React, { useState, useEffect } from 'react';
import { Info, Copy, RefreshCw, MoreVertical, Plus, ChevronDown } from 'lucide-react';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { organizationsApi, OrganizationBusinessInfo } from '../../../../shared/services/organizationsApi';

const BusinessInfo: React.FC = () => {
  const { currentOrganizationId } = useCurrentOrganization();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [friendlyBusinessName, setFriendlyBusinessName] = useState('');
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [brandedDomain, setBrandedDomain] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [businessNiche, setBusinessNiche] = useState('Roofing Contractor');
  const [businessCurrency, setBusinessCurrency] = useState('USD - US Dollar ($)');

  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [stateRegion, setStateRegion] = useState('Texas');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('GMT-06:00 America/Chicago (CST)');
  const [platformLanguage, setPlatformLanguage] = useState('English (United States)');
  const [outboundLanguage, setOutboundLanguage] = useState('');

  const [businessType, setBusinessType] = useState('Limited Liability Company Or Sole-Proprietorship');
  const [businessIndustry, setBusinessIndustry] = useState('CONSTRUCTION');
  const [registrationIdType, setRegistrationIdType] = useState('USA: Employer Identification Number (EIN)');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['usa-canada']);

  const [repFirstName, setRepFirstName] = useState('');
  const [repLastName, setRepLastName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repJobPosition, setRepJobPosition] = useState('CEO');
  const [repPhone, setRepPhone] = useState('');

  const [allowDuplicateContact, setAllowDuplicateContact] = useState(false);
  const [contactSearchPref, setContactSearchPref] = useState('Email');
  const [contactSearchSecondary, setContactSearchSecondary] = useState('Phone');

  useEffect(() => {
    if (currentOrganizationId) {
      loadBusinessInfo();
    }
  }, [currentOrganizationId]);

  const loadBusinessInfo = async () => {
    if (!currentOrganizationId) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await organizationsApi.getOrganizationBusinessInfo(currentOrganizationId);

      if (data) {
        setFriendlyBusinessName(data.friendly_business_name || '');
        setLegalBusinessName(data.legal_business_name || '');
        setBusinessEmail(data.business_email || '');
        setBusinessPhone(data.business_phone || '');
        setBrandedDomain(data.branded_domain || '');
        setBusinessWebsite(data.business_website || '');
        setBusinessNiche(data.business_niche || 'Roofing Contractor');
        setBusinessCurrency(data.business_currency || 'USD - US Dollar ($)');

        setStreetAddress(data.street_address || '');
        setCity(data.city || '');
        setPostalCode(data.postal_code || '');
        setStateRegion(data.state_region || 'Texas');
        setCountry(data.country || 'United States');
        setTimezone(data.timezone || 'GMT-06:00 America/Chicago (CST)');
        setPlatformLanguage(data.platform_language || 'English (United States)');
        setOutboundLanguage(data.outbound_language || '');

        setBusinessType(data.business_type || 'Limited Liability Company Or Sole-Proprietorship');
        setBusinessIndustry(data.business_industry || 'CONSTRUCTION');
        setRegistrationIdType(data.registration_id_type || 'USA: Employer Identification Number (EIN)');
        setRegistrationNumber(data.registration_number || '');
        setNotRegistered(data.not_registered || false);
        setSelectedRegions(data.business_regions || ['usa-canada']);

        setRepFirstName(data.representative_first_name || '');
        setRepLastName(data.representative_last_name || '');
        setRepEmail(data.representative_email || '');
        setRepJobPosition(data.representative_job_position || 'CEO');
        setRepPhone(data.representative_phone || '');

        setAllowDuplicateContact(data.allow_duplicate_contact || false);
        setContactSearchPref(data.contact_search_preference || 'Email');
        setContactSearchSecondary(data.contact_search_secondary || 'Phone');
      }
    } catch (err) {
      console.error('Error loading business info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load business information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBusinessInfo = async () => {
    if (!currentOrganizationId) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const businessInfoData: Partial<OrganizationBusinessInfo> = {
        friendly_business_name: friendlyBusinessName,
        legal_business_name: legalBusinessName,
        business_email: businessEmail,
        business_phone: businessPhone,
        branded_domain: brandedDomain,
        business_website: businessWebsite,
        business_niche: businessNiche,
        business_currency: businessCurrency,
        street_address: streetAddress,
        city: city,
        postal_code: postalCode,
        state_region: stateRegion,
        country: country,
        timezone: timezone,
        platform_language: platformLanguage,
        outbound_language: outboundLanguage,
        business_type: businessType,
        business_industry: businessIndustry,
        registration_id_type: registrationIdType,
        registration_number: registrationNumber,
        not_registered: notRegistered,
        business_regions: selectedRegions,
        representative_first_name: repFirstName,
        representative_last_name: repLastName,
        representative_email: repEmail,
        representative_job_position: repJobPosition,
        representative_phone: repPhone,
        allow_duplicate_contact: allowDuplicateContact,
        contact_search_preference: contactSearchPref,
        contact_search_secondary: contactSearchSecondary,
      };

      await organizationsApi.updateOrganizationBusinessInfo(currentOrganizationId, businessInfoData);

      setSuccessMessage('Business information updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating business info:', err);
      setError(err instanceof Error ? err.message : 'Failed to update business information');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading business information...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Information</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your company details and locations</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Location ID</span>
              <Info className="w-4 h-4" />
              <span className="font-mono">{currentOrganizationId?.substring(0, 20)}</span>
              <button
                onClick={() => copyToClipboard(currentOrganizationId || '')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-64 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-xs font-medium">{friendlyBusinessName?.toUpperCase() || 'BUSINESS LOGO'}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-semibold">Business Logo</span>
                  <br />
                  The proposed size is 350px * 180px. No bigger than 2.5 MB
                </p>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                    Upload
                  </button>
                  <button className="px-4 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                    Remove
                  </button>
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
              value={friendlyBusinessName}
              onChange={(e) => setFriendlyBusinessName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Legal Business Name</span>
              <Info className="w-4 h-4" />
            </label>
            <div className="relative">
              <input
                type="text"
                value={legalBusinessName}
                onChange={(e) => setLegalBusinessName(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:bg-red-50 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
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
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Phone
              </label>
              <input
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                value={brandedDomain}
                onChange={(e) => setBrandedDomain(e.target.value)}
                placeholder="Branded Domain"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                <Plus className="w-4 h-4" />
                <span>Add Domain</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Business Website
            </label>
            <input
              type="url"
              value={businessWebsite}
              onChange={(e) => setBusinessWebsite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Niche
              </label>
              <div className="relative">
                <select
                  value={businessNiche}
                  onChange={(e) => setBusinessNiche(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Roofing Contractor</option>
                  <option>General Contractor</option>
                  <option>Solar Installation</option>
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
                  value={businessCurrency}
                  onChange={(e) => setBusinessCurrency(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>USD - US Dollar ($)</option>
                  <option>EUR - Euro (€)</option>
                  <option>GBP - British Pound (£)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>API Key</span>
              <Info className="w-4 h-4" />
              <span className="font-mono">eyJh****-****-****-*****-*****TRbNgE</span>
              <button
                onClick={() => copyToClipboard('eyJh****-****-****-*****-*****TRbNgE')}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
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
            <div className="relative">
              <input
                type="text"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:bg-red-50 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Postal/Zip Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
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
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
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
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
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
                value={platformLanguage}
                onChange={(e) => setPlatformLanguage(e.target.value)}
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
                value={outboundLanguage}
                onChange={(e) => setOutboundLanguage(e.target.value)}
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
              onClick={handleUpdateBusinessInfo}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Update'}
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
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
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
                value={businessIndustry}
                onChange={(e) => setBusinessIndustry(e.target.value)}
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
                value={registrationIdType}
                onChange={(e) => setRegistrationIdType(e.target.value)}
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
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notRegistered"
            checked={notRegistered}
            onChange={(e) => setNotRegistered(e.target.checked)}
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
                  checked={selectedRegions.includes(region.id)}
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
            onClick={handleUpdateBusinessInfo}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Update Information'}
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
            <div className="relative">
              <input
                type="text"
                value={repFirstName}
                onChange={(e) => setRepFirstName(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:bg-red-50 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={repLastName}
              onChange={(e) => setRepLastName(e.target.value)}
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
            value={repEmail}
            onChange={(e) => setRepEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Position
          </label>
          <div className="relative">
            <select
              value={repJobPosition}
              onChange={(e) => setRepJobPosition(e.target.value)}
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
            value={repPhone}
            onChange={(e) => setRepPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleUpdateBusinessInfo}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Update Information'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Deduplication Preferences</h3>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAllowDuplicateContact(!allowDuplicateContact)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              allowDuplicateContact ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                allowDuplicateContact ? 'translate-x-5' : 'translate-x-0'
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
              value={contactSearchPref}
              onChange={(e) => setContactSearchPref(e.target.value)}
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
              value={contactSearchSecondary}
              onChange={(e) => setContactSearchSecondary(e.target.value)}
              className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
            >
              <option>Phone</option>
              <option>Email</option>
              <option>Name</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;
