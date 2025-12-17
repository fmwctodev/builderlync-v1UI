import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calculator, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { getProposalsByJobId, Proposal } from '../../../shared/store/services/proposalsApi';

interface ProposalsTabProps {
  onOpenProposalEditor?: (templateId?: string) => void;
  jobId?: number;
}

const ProposalsTab: React.FC<ProposalsTabProps> = ({ onOpenProposalEditor, jobId }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const measurements = [
    {
      id: 'measurement-1',
      name: 'Main Roof Area',
      sqft: '2,450 sq ft',
      date: '2024-01-15'
    },
    {
      id: 'measurement-2',
      name: 'Garage Roof',
      sqft: '650 sq ft',
      date: '2024-01-15'
    }
  ];

  useEffect(() => {
    const fetchProposals = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getProposalsByJobId(jobId);
        if (response.success) {
          setProposals(response.data);
        }
      } catch (error) {
        console.error('Error fetching proposals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [jobId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300';
      case 'waiting': return 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-300';
      case 'payments': return 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300';
      case 'draft': return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'archived': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'waiting': return 'Pending';
      case 'payments': return 'Payment';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Proposals</h2>
        <button
          onClick={() => onOpenProposalEditor?.()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Proposals List Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {proposals.length > 0 ? 'Created Proposals' : 'No Proposals Yet'}
            </h3>

            {proposals.length > 0 ? (
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => onOpenProposalEditor?.(proposal.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                          <h4 className="font-medium text-gray-900 dark:text-white">{proposal.title}</h4>
                        </div>

                        <div className="flex items-center mt-3 space-x-6">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(proposal.value || 0)}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(proposal.date_modified || proposal.created_at)}</span>
                          </div>

                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(proposal.status)}`}>
                            {getStatusLabel(proposal.status)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No proposals created for this job yet.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Click "Create Proposal" above to get started or create from a measurement below.
                </p>
              </div>
            )}
          </div>

          {/* Create from Measurement Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create from Measurement</h3>
            <div className="space-y-3">
              {measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => onOpenProposalEditor?.(measurement.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Calculator className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                        <h4 className="font-medium text-gray-900 dark:text-white">{measurement.name}</h4>
                      </div>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{measurement.sqft}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">Measured on {measurement.date}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
              <p className="text-sm text-primary-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Create proposals directly from your measurements to automatically populate square footage and material calculations.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProposalsTab;
