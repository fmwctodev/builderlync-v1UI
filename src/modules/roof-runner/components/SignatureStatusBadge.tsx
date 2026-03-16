import React, { useState } from 'react';
import {
  FileText,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  XCircle,
  Copy,
  RotateCcw,
  Ban
} from 'lucide-react';
import { SignatureStatus } from '../types/eSignature';
import { eSignatureApi } from '../services/eSignatureApi';
import { SendForSignatureModal } from './SendForSignatureModal';

interface SignatureStatusBadgeProps {
  status: SignatureStatus;
  proposalId: number;
  proposalTitle?: string;
  onSendClick?: () => void;
}

interface SignatureRequestListItem {
  id: number;
  signer_name: string;
  signer_email: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  viewed_at?: string;
  signed_at?: string;
  declined_at?: string;
  expires_at: string;
  token?: string;
}

export function SignatureStatusBadge({
  status,
  proposalId,
  proposalTitle = 'Proposal',
  onSendClick
}: SignatureStatusBadgeProps) {
  const [requests, setRequests] = useState<SignatureRequestListItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [resendRequest, setResendRequest] = useState<SignatureRequestListItem | null>(null);
  const [voidingRequestId, setVoidingRequestId] = useState<number | null>(null);

  const statusConfig: Record<SignatureStatus, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
    not_sent: {
      icon: <Mail className="h-4 w-4" />,
      label: 'Not Sent',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    },
    pending_signature: {
      icon: <Clock className="h-4 w-4" />,
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    viewed: {
      icon: <Eye className="h-4 w-4" />,
      label: 'Viewed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    signed: {
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Signed',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    declined: {
      icon: <XCircle className="h-4 w-4" />,
      label: 'Declined',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    expired: {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'Expired',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    voided: {
      icon: <XCircle className="h-4 w-4" />,
      label: 'Voided',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    }
  };

  const config = statusConfig[status];

  const loadRequests = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await eSignatureApi.getProposalSignatureRequests(proposalId);
      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.created_at || b.updated_at || 0).getTime() -
          new Date(a.created_at || a.updated_at || 0).getTime()
      );
      setRequests(sortedData);
    } catch (err) {
      console.error('Error loading signature requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (status === 'not_sent') {
      if (onSendClick) {
        onSendClick();
        return;
      }
      setShowSendModal(true);
      return;
    }

    if (!showDetails) {
      await loadRequests();
    }
    setShowDetails((prev) => !prev);
  };

  const copyRequestLink = (request: SignatureRequestListItem) => {
    if (!request.token) return;
    const shareUrl = `${window.location.origin}/proposal/sign?token=${request.token}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const canResend = (request: SignatureRequestListItem) => request.status !== 'signed';
  const canVoid = (request: SignatureRequestListItem) =>
    request.status === 'pending' || request.status === 'viewed';

  const getExpiresInDays = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (!Number.isFinite(diffDays)) return 30;
    return Math.min(90, Math.max(1, diffDays));
  };

  const refreshAfterMutation = async () => {
    setShowSendModal(false);
    setResendRequest(null);
    setShowDetails(true);
    await loadRequests();
  };

  const handleVoidRequest = async (request: SignatureRequestListItem) => {
    const confirmed = window.confirm(`Void the active signature request for ${request.signer_name}?`);
    if (!confirmed) return;

    try {
      setVoidingRequestId(request.id);
      await eSignatureApi.voidSignatureRequest(request.id);
      await loadRequests();
    } catch (err) {
      console.error('Error voiding signature request:', err);
      window.alert('Failed to void signature request.');
    } finally {
      setVoidingRequestId(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80 ${config.bgColor} ${config.color}`}
      >
        {config.icon}
        {config.label}
      </button>

      {showDetails && status !== 'not_sent' && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Signature Requests</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="py-4 text-center">
              <div className="inline-block animate-spin">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ) : requests.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">
              No signature requests
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.signer_name}
                      </p>
                      <p className="break-all text-xs text-gray-600 dark:text-gray-400">
                        {request.signer_email}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                      request.status === 'signed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                        : request.status === 'viewed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                            : request.status === 'declined'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {request.status === 'signed' && <CheckCircle className="h-3 w-3" />}
                      {request.status === 'viewed' && <Eye className="h-3 w-3" />}
                      {request.status === 'pending' && <Clock className="h-3 w-3" />}
                      {request.status === 'declined' && <XCircle className="h-3 w-3" />}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    {request.viewed_at && <p>Viewed: {new Date(request.viewed_at).toLocaleDateString()}</p>}
                    {request.signed_at && <p>Signed: {new Date(request.signed_at).toLocaleDateString()}</p>}
                    {request.declined_at && <p>Declined: {new Date(request.declined_at).toLocaleDateString()}</p>}
                    <p>Expires: {new Date(request.expires_at).toLocaleDateString()}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {request.token && (
                      <button
                        onClick={() => copyRequestLink(request)}
                        className="inline-flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        <Copy className="h-3 w-3" />
                        Copy Link
                      </button>
                    )}
                    {canResend(request) && (
                      <button
                        onClick={() => setResendRequest(request)}
                        className="inline-flex items-center gap-1 rounded border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Resend
                      </button>
                    )}
                    {canVoid(request) && (
                      <button
                        onClick={() => handleVoidRequest(request)}
                        disabled={voidingRequestId === request.id}
                        className="inline-flex items-center gap-1 rounded border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        <Ban className="h-3 w-3" />
                        {voidingRequestId === request.id ? 'Voiding...' : 'Void'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSendModal && (
        <SendForSignatureModal
          proposalId={proposalId}
          proposalTitle={proposalTitle}
          onClose={() => setShowSendModal(false)}
          onSuccess={refreshAfterMutation}
        />
      )}

      {resendRequest && (
        <SendForSignatureModal
          proposalId={proposalId}
          proposalTitle={proposalTitle}
          mode="resend"
          initialSignerName={resendRequest.signer_name}
          initialSignerEmail={resendRequest.signer_email}
          initialExpiresInDays={getExpiresInDays(resendRequest.expires_at)}
          onClose={() => setResendRequest(null)}
          onSuccess={refreshAfterMutation}
        />
      )}
    </div>
  );
}

interface SignatureStatusColumnProps {
  proposalId: number;
  status: SignatureStatus;
  proposalTitle?: string;
  onSendClick?: () => void;
}

export function SignatureStatusColumn({
  proposalId,
  status,
  proposalTitle,
  onSendClick
}: SignatureStatusColumnProps) {
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-gray-400" />
      <SignatureStatusBadge
        status={status}
        proposalId={proposalId}
        proposalTitle={proposalTitle}
        onSendClick={onSendClick}
      />
    </div>
  );
}
