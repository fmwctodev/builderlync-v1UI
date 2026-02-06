import React, { useState, useEffect } from 'react';
import { User, Camera, ChevronDown, Edit } from 'lucide-react';
import { getCompanies, Company } from '../../../../shared/store/services/companiesApi';

interface ContactDetailsPanelProps {
  contact: any;
  activeTab: 'contact' | 'company';
  companySearch: string;
  onTabChange: (tab: 'contact' | 'company') => void;
  onCompanySearchChange: (value: string) => void;
  onAddCompany: () => void;
}

const ContactDetailsPanel: React.FC<ContactDetailsPanelProps> = ({
  contact,
  activeTab,
  companySearch,
  onTabChange,
  onCompanySearchChange,
  onAddCompany
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  const fetchCompanies = async () => {
    console.log('Fetching companies...');
    setLoading(true);
    try {
      const response = await getCompanies(contact?.id);
      console.log('Companies response:', response);
      setCompanies(response.data || []);
      setFilteredCompanies(response.data || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Company tab useEffect triggered, activeTab:', activeTab);
    if (activeTab === 'company') {
      fetchCompanies();
    }
  }, [activeTab]);

  useEffect(() => {
    if (companySearch) {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        (company.email && company.email.toLowerCase().includes(companySearch.toLowerCase()))
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [companySearch, companies]);
  return (
    <div className="w-1/2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        {/* Contact/Company Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => onTabChange('contact')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'contact'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Contact
          </button>
          <button
            onClick={() => onTabChange('company')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'company'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Company
          </button>
        </div>

        {activeTab === 'contact' ? (
          <>
            {/* Profile Image Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {contact.name}
                </h2>
                <p className="text-sm text-gray-500">{contact.email}</p>
              </div>
            </div>

            {/* Hide empty fields checkbox */}
            <div className="flex items-center gap-2 mb-6">
              <input type="checkbox" id="hideEmpty" className="rounded" />
              <label htmlFor="hideEmpty" className="text-sm text-gray-600 dark:text-gray-400">
                Hide empty fields
              </label>
            </div>

            {/* Contact Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ChevronDown className="w-4 h-4 text-red-600" />
                <h3 className="text-red-600 font-medium">Contact</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={contact.fullName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={contact.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                      readOnly
                    />
                    <Edit className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {contact.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      readOnly
                    />
                  </div>
                )}

                {contact.company && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={contact.company}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      readOnly
                    />
                  </div>
                )}

                {contact.type && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <input
                      type="text"
                      value={contact.type}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      readOnly
                    />
                  </div>
                )}

                {contact.labelOrRole && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={contact.labelOrRole}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      readOnly
                    />
                  </div>
                )}

                {contact.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={contact.address}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      readOnly
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Company Tab Content */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Add Company</h3>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search by company name or email"
                  value={companySearch}
                  onChange={(e) => onCompanySearchChange(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </div>
              ) : filteredCompanies.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCompanies.map(company => (
                    <div key={company.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <h4 className="font-medium text-gray-900 dark:text-white">{company.name}</h4>
                      {company.email && <p className="text-sm text-gray-500">{company.email}</p>}
                      {company.phone && <p className="text-sm text-gray-500">{company.phone}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-8 h-8 mx-auto mb-3 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No companies found</p>

                  <button
                    onClick={onAddCompany}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 mx-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Company
                  </button>
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={onAddCompany}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Company
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactDetailsPanel;