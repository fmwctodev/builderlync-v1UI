import React, { useMemo, useState } from 'react';
import { Mail, Calendar, User, AlertCircle, Loader, RotateCcw } from 'lucide-react';
import { eSignatureApi } from '../services/eSignatureApi';

interface SendForSignatureModalProps {
  proposalId: number;
  proposalTitle: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
  mode?: 'send' | 'resend';
  initialSignerName?: string;
  initialSignerEmail?: string;
  initialExpiresInDays?: number;
}

export function SendForSignatureModal({
  proposalId,
  proposalTitle,
  onClose,
  onSuccess,
  mode = 'send',
  initialSignerName = '',
  initialSignerEmail = '',
  initialExpiresInDays = 30
}: SendForSignatureModalProps) {
  const [signerName, setSignerName] = useState(initialSignerName);
  const [signerEmail, setSignerEmail] = useState(initialSignerEmail);
  const [expiresInDays, setExpiresInDays] = useState(initialExpiresInDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const isResend = mode === 'resend';
  const successTitle = isResend ? 'Signature Request Resent' : 'Signature Request Sent';
  const modalTitle = isResend ? 'Resend for Signature' : 'Send for Signature';
  const submitLabel = isResend ? 'Resend Request' : 'Send Request';
  const helperText = useMemo(() => {
    if (isResend) {
      return 'This will create a fresh request for the same signer. You only need to confirm and choose the new expiry time.';
    }

    return `A secure link will be sent to ${signerEmail || 'the signer'} allowing them to review and sign the proposal.`;
  }, [isResend, signerEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!signerName.trim()) {
        throw new Error('Signer name is required');
      }
      if (!signerEmail.trim()) {
        throw new Error('Signer email is required');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signerEmail)) {
        throw new Error('Please enter a valid email address');
      }

      const result = await eSignatureApi.createSignatureRequest(proposalId, {
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim(),
        expiresInDays
      });

      setShareUrl(result.shareUrl);
      setSuccess(true);
      onSuccess(result);
    } catch (err) {
      setError((err as Error).message || 'Failed to create signature request');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">{successTitle}</h2>
            <p className="text-sm text-gray-600">
              A signature request has been created for <strong>{signerName}</strong>
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="mb-3 text-sm text-gray-700">
              <strong>Share this link with the signer:</strong>
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-600"
              />
              <button
                onClick={copyToClipboard}
                className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mb-6 space-y-2 text-sm text-gray-600">
            <p>Expires in {expiresInDays} days</p>
            <p>Signer can sign by typing or drawing</p>
            <p>Full audit trail maintained</p>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">{modalTitle}</h2>
          <p className="mt-1 text-sm text-gray-600">{proposalTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isResend ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <RotateCcw className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-900">Confirm resend to this signer</p>
                  <p className="mt-2 text-sm text-blue-800">{signerName}</p>
                  <p className="break-all text-sm text-blue-800">{signerEmail}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <User className="mr-2 inline h-4 w-4" />
                  Signer Name
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Full name of the signer"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <Mail className="mr-2 inline h-4 w-4" />
                  Signer Email
                </label>
                <input
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="signer@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Calendar className="mr-2 inline h-4 w-4" />
              Expires In (Days)
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <p>{helperText}</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-2">
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {loading ? (isResend ? 'Resending...' : 'Sending...') : submitLabel}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
