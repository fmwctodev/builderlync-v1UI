import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_at: string;
}

const getCompanies = async () => {
  const token = localStorage.getItem('token');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

  const response = await fetch(`${API_BASE_URL}/companies?limit=100`, {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }

  return response.json();
};

interface CompanyListProps {
  refreshTrigger?: number;
}

export const CompanyList: React.FC<CompanyListProps> = ({ refreshTrigger }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, [refreshTrigger]);

  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      setCompanies(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading companies...</div>;
  }

  if (companies.length === 0) {
    return (
      <div className="p-8 text-center">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
        <p className="text-gray-500">Add your first company to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <div key={company.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Building2 className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
              </div>
              
              {company.description && (
                <p className="text-gray-600 mb-3">{company.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {company.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {company.phone}
                  </div>
                )}
                
                {company.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {company.email}
                  </div>
                )}
                
                {company.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {company.website}
                    </a>
                  </div>
                )}
                
                {(company.street_address || company.city || company.state) && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    <div>
                      {company.street_address && <div>{company.street_address}</div>}
                      {(company.city || company.state || company.zip) && (
                        <div>
                          {company.city}{company.city && company.state && ', '}{company.state} {company.zip}
                        </div>
                      )}
                      {company.country && <div>{company.country}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-400 ml-4">
              Added {new Date(company.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};