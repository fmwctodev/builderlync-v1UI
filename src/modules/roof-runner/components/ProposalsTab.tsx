import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, Calendar, User, Eye, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBackendProposalsByJobId, BackendProposal } from '../../../shared/store/services/backendProposalsApi';

interface ProposalsTabProps {
  onOpenProposalEditor?: (templateId?: string) => void;
  jobId?: number;
}

const ProposalsTab: React.FC<ProposalsTabProps> = ({ onOpenProposalEditor, jobId }) => {
  const [proposals, setProposals] = useState<BackendProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';

  useEffect(() => {
    const fetchProposals = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBackendProposalsByJobId(jobId);
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
        {/* <button
          onClick={() => onOpenProposalEditor?.()}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </button> */}
      </div>

      {!jobId ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Save Job to Access Proposals</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to save this job first before you can create or view proposals.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click "Create Job" or "Update Job" to save your changes and unlock proposal features.
          </p>
        </div>
      ) : loading ? (
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
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Proposal Image/Icon */}
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        
                        {/* Proposal Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">{proposal.title}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">#{proposal.identifier}</span>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize flex-shrink-0">
                              {proposal.status}
                            </span>
                          </div>

                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(proposal.total || 0)}
                              </span>
                            </div>

                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(proposal.updated_at || proposal.created_at)}</span>
                            </div>

                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>{proposal.author ? `${proposal.author.first_name} ${proposal.author.last_name}` : 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => navigate(`${orgPrefix}/proposals/editor/${proposal.id}`)}
                          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                          title="View Proposal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No proposals created for this job yet.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Proposals will appear here once they are created for this job.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProposalsTab;
