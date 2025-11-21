import React, { useState } from 'react';
import { Info, Copy, RefreshCw, MoreVertical, Plus, ChevronDown } from 'lucide-react';

const BusinessInfo: React.FC = () => {
  const [allowDuplicateContact, setAllowDuplicateContact] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState(['usa-canada']);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Information</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your company details and locations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Location ID</span>
              <Info className="w-4 h-4" />
              <span className="font-mono">UjgnUUR2dZcfcP4fcgTK</span>
              <button
                onClick={() => copyToClipboard('UjgnUUR2dZcfcP4fcgTK')}
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
                  <p className="text-xs font-medium">TARRY TOWN</p>
                  <p className="text-xs font-medium">ROOFING</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-semibold">Business Logo</span>
                  <br />
                  The proposed size is 350px * 180px. No bigger than 2.5 MB
                </p>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
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
              defaultValue="Tarrytown Roofing"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                defaultValue="Tarrytown Roofing LLC"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                defaultValue="sales@tarrytownroofing.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Phone
              </label>
              <input
                type="tel"
                defaultValue="+1 737-734-2911"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              defaultValue="https://tarrytownroofing.com/"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Niche
              </label>
              <div className="relative">
                <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
                <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
                defaultValue="1717 W 6th Street STE 100"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                defaultValue="Austin"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Postal/Zip Code
              </label>
              <input
                type="text"
                defaultValue="78703"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State / Prov / Region
            </label>
            <div className="relative">
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option>Select language</option>
                <option>English</option>
                <option>Spanish</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Update
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
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
              defaultValue="99-4425498"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notRegistered"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={region.id} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {region.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Update Information
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
                defaultValue="James"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              defaultValue="Kuntz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Representative Email
          </label>
          <input
            type="email"
            defaultValue="wolfgang@tarrytownroofing.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Position
          </label>
          <div className="relative">
            <select className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
            defaultValue="+1 713-824-3620"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Update Information
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Deduplication Preferences</h3>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAllowDuplicateContact(!allowDuplicateContact)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              allowDuplicateContact ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
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
            <select className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base">
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
            <select className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base">
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
