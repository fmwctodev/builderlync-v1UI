import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import ProposalBuilder from '../components/proposals/ProposalBuilder';
import { proposalsApi } from '../services/proposalsApi';

export default function ProposalEditorPage() {
  const { proposalId } = useParams<{ proposalId: string}>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (proposalId) loadProposal();
  }, [proposalId]);

  const loadProposal = async () => {
    try {
      const data = await proposalsApi.getProposalById(Number(proposalId));
      setProposal(data);
    } catch (error) {
      console.error('Error loading proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 dark:text-gray-400">Loading proposal...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Proposal Header */}
      <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center">
          <button onClick={() => navigate('/proposals')} className="flex items-center text-primary-600 hover:text-primary-700 mr-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to proposals
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">Changes auto-saved</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-900 dark:text-white font-medium">
            {proposal?.address?.address || proposal?.title || 'Untitled Proposal'}
          </span>
          <button className="flex items-center px-3 py-1 text-primary-600 hover:text-primary-700 border border-primary-200 rounded">
            <Send className="w-4 h-4 mr-1" />
            Send
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            View proposal
          </button>
        </div>
      </div>

      {/* Proposal Builder for Editing */}
      <div className="flex-1 overflow-hidden">
        {proposalId && (
          <ProposalBuilder
            proposalId={proposalId}
            onClose={() => navigate('/proposals')}
          />
        )}
      </div>
    </div>
  );
}
