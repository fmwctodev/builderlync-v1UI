import { useState, useEffect } from 'react';
import { opportunitiesApi } from '../../services/opportunitiesApi';
import type { OpportunityWithDetails } from '../../types/opportunities';

interface OpportunitiesTableProps {
  onRowClick?: (opportunityId: string) => void;
  selectedPipelineId?: string | null;
}

const DUMMY_TABLE_OPPORTUNITIES = [
  {
    id: '1',
    name: 'Commercial Roofing Project',
    contact: 'Youssef Fadil',
    stage: 'New Lead',
    value: 25000,
    status: 'Active',
    owner: 'John Smith',
    tags: ['Commercial', 'Roofing'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    name: 'Holiday Inn Renovation',
    contact: 'Mohammad Choudhry',
    stage: 'New Lead',
    value: 45000,
    status: 'Active',
    owner: 'Sarah Johnson',
    tags: ['Hotel', 'Renovation'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    name: 'Residential Repair',
    contact: 'Jose Jordan',
    stage: 'New Lead',
    value: 8500,
    status: 'Pending',
    owner: 'Mike Davis',
    tags: ['Residential', 'Repair'],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19'
  }
];

export default function OpportunitiesTable({ onRowClick, selectedPipelineId }: OpportunitiesTableProps) {
  const [opportunities, setOpportunities] = useState<OpportunityWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunities();
  }, [selectedPipelineId]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedPipelineId && selectedPipelineId !== 'default') {
        filters.pipeline_id = selectedPipelineId;
        const data = await opportunitiesApi.getOpportunities(filters);
        setOpportunities(data);
      } else {
        setOpportunities([]);
      }
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600 dark:text-gray-400">Loading opportunities...</div>
        </div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col items-center justify-center h-32">
          <div className="text-gray-600 dark:text-gray-400 mb-2">No opportunities yet</div>
          <div className="text-sm text-gray-500 dark:text-gray-500">Click "Add Opportunity" to create your first opportunity</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Opportunity Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Opportunity Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Opportunity Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Updated At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {opportunities.map((opportunity) => {
              const primaryContact = opportunity.contacts?.[0];
              const stageName = opportunity.stage?.name || 'Unknown';
              const stageColor = opportunity.stage?.color || '#dc2626';

              return (
                <tr
                  key={opportunity.id}
                  onClick={() => onRowClick?.(opportunity.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {opportunity.opportunity_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {primaryContact?.contact_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: stageColor }}
                    >
                      {stageName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${(opportunity.value || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${opportunity.status === 'open'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : opportunity.status === 'won'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : opportunity.status === 'lost'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                      {opportunity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {opportunity.owner_id || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {opportunity.tags && opportunity.tags.length > 0 ? (
                        opportunity.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(opportunity.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(opportunity.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}