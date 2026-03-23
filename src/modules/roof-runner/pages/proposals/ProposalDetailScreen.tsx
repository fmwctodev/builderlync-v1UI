import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard as Edit2, Send, Download, FileText, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, User, DollarSign } from 'lucide-react';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { getProposalWithLineItems } from '../../services/proposalsNewApi';
import { getAuditTrail } from '../../services/proposalAuditApi';
import { getStatusColor, getStatusLabel, formatCurrency, formatRelativeDate } from './proposalUtils';
import type { Proposal, ProposalLineItem, ProposalAuditEvent, ProposalStatus } from '../../types/proposalIntegration';

function StatusIcon({ status }: { status: ProposalStatus }) {
  switch (status) {
    case 'accepted': return <CheckCircle size={18} className="text-green-500" />;
    case 'declined': return <XCircle size={18} className="text-red-500" />;
    case 'waiting': return <Clock size={18} className="text-blue-500" />;
    case 'expired': return <AlertCircle size={18} className="text-orange-500" />;
    default: return <FileText size={18} className="text-gray-400" />;
  }
}

function AuditTimeline({ events }: { events: ProposalAuditEvent[] }) {
  const eventLabel = (type: string) => {
    const map: Record<string, string> = {
      proposal_created: 'Proposal created',
      proposal_updated: 'Proposal updated',
      proposal_sent: 'Proposal sent',
      proposal_viewed: 'Customer viewed',
      proposal_accepted: 'Proposal accepted',
      proposal_declined: 'Proposal declined',
      line_item_added: 'Line item added',
      line_item_edited: 'Line item edited',
      line_item_deleted: 'Line item removed',
      signature_received: 'Signature received',
      proposal_expired: 'Proposal expired',
      proposal_archived: 'Proposal archived',
    };
    return map[type] || type.replace(/_/g, ' ');
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event, i) => (
        <div key={event.id || i} className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white font-medium">
              {eventLabel(event.event_type)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {formatRelativeDate(event.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProposalDetailScreen() {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { currentOrganizationId } = useCurrentOrganization();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [lineItems, setLineItems] = useState<ProposalLineItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<ProposalAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLineItems, setShowLineItems] = useState(true);
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    if (!proposalId || !currentOrganizationId) return;
    (async () => {
      setIsLoading(true);
      try {
        const [pRes, aRes] = await Promise.all([
          getProposalWithLineItems(proposalId, currentOrganizationId),
          getAuditTrail(proposalId, currentOrganizationId),
        ]);
        if (pRes.success && pRes.data) {
          setProposal(pRes.data);
          setLineItems(pRes.data.line_items || []);
        } else {
          setError(pRes.message || 'Failed to load');
        }
        if (aRes.success && aRes.data) {
          setAuditEvents(aRes.data);
        }
      } catch {
        setError('Failed to load proposal');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [proposalId, currentOrganizationId]);

  const subtotal = lineItems.reduce((s, i) => s + i.quantity * i.unit_price, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-red-500 text-sm text-center">{error || 'Proposal not found'}</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-600">
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-3 py-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 p-1">
            <ArrowLeft size={22} />
          </button>
          <h1 className="flex-1 text-lg font-bold text-gray-900 dark:text-white truncate">Preview</h1>
          <button
            onClick={() => navigate(`../proposals/${proposalId}/edit`)}
            className="p-2 text-gray-500 dark:text-gray-400"
          >
            <Edit2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 pb-32 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{proposal.title}</h2>
              {proposal.property_address && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{proposal.property_address}</p>
                </div>
              )}
            </div>
            <span className={`text-sm px-3 py-1 rounded-full font-semibold flex-shrink-0 ${getStatusColor(proposal.status as ProposalStatus)}`}>
              {getStatusLabel(proposal.status as ProposalStatus)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(proposal.value || subtotal)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatRelativeDate(proposal.created_at)}</p>
            </div>
          </div>

          {proposal.expires_at && (
            <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
              <Clock size={12} />
              Expires {new Date(proposal.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowLineItems(!showLineItems)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-red-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Line Items</span>
              <span className="text-xs text-gray-400">({lineItems.length})</span>
            </div>
            {showLineItems ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {showLineItems && (
            <div className="border-t border-gray-100 dark:border-gray-700">
              {lineItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No line items</p>
              ) : (
                <>
                  {lineItems.map((item, i) => (
                    <div key={item.id} className={`px-5 py-3 flex items-center justify-between gap-3 ${i > 0 ? 'border-t border-gray-50 dark:border-gray-700/50' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name || item.item_name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{item.quantity} {item.unit || 'unit'} @ {formatCurrency(item.unit_price)}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t-2 border-gray-100 dark:border-gray-700 px-5 py-4">
                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>{formatCurrency(proposal.value || subtotal)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-red-600" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Activity</span>
              {auditEvents.length > 0 && (
                <span className="text-xs text-gray-400">({auditEvents.length})</span>
              )}
            </div>
            {showActivity ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {showActivity && (
            <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4">
              <AuditTimeline events={auditEvents} />
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={() => navigate(`../proposals/${proposalId}/edit`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <Edit2 size={16} />
            Edit
          </button>
          <button
            onClick={() => navigate(`../proposals/${proposalId}/edit`)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium text-white"
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
