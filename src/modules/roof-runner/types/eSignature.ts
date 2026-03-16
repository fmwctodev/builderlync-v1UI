// E-Signature Types

export type SignatureStatus = 'not_sent' | 'pending_signature' | 'viewed' | 'signed' | 'declined' | 'expired' | 'voided';
export type RequestStatus = 'pending' | 'viewed' | 'signed' | 'declined' | 'expired' | 'voided';
export type SignatureType = 'typed' | 'drawn';
export type AuditEventType = 
  | 'signature_request_created'
  | 'signature_request_viewed'
  | 'signature_request_signed'
  | 'signature_request_declined'
  | 'signature_request_expired'
  | 'signature_request_voided';

export interface SignatureData {
  type: SignatureType;
  text?: string;
  imageDataUrl: string;
}

export interface SignatureRequest {
  id: number;
  proposal_id: number;
  signer_name: string;
  signer_email: string;
  contact_id?: number;
  status: RequestStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  viewed_at?: string;
  signed_at?: string;
  declined_at?: string;
  declined_reason?: string;
  created_by: number;
}

export interface ProposalSignature {
  id: number;
  request_id: number;
  signature_type: SignatureType;
  signer_name: string;
  signature_image_url?: string;
  signature_image_key?: string;
  typed_text?: string;
  ip_address?: string;
  user_agent?: string;
  signed_at: string;
  created_at: string;
}

export interface ProposalDocumentSnapshot {
  id: number;
  proposal_id: number;
  request_id: number;
  frozen_html: string;
  document_hash: string;
  created_at: string;
}

export interface ProposalAuditEvent {
  id: number;
  proposal_id: number;
  request_id?: number;
  event_type: AuditEventType;
  event_data?: Record<string, any>;
  created_by?: number;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SignatureRequestDetails {
  request: SignatureRequest;
  signature?: ProposalSignature;
  auditEvents: ProposalAuditEvent[];
}

export interface CreateSignatureRequestInput {
  signerName: string;
  signerEmail: string;
  contactId?: number;
  expiresInDays?: number;
}

export interface SignatureRequestResponse {
  requestId: number;
  token: string;
  tokenHash: string;
  shareUrl: string;
  expiresAt: string;
}

export interface VerifyTokenResponse {
  tokenRecord: {
    id: number;
    request_id: number;
    token_hash: string;
    expires_at: string;
    accessed_count: number;
    last_accessed_at?: string;
  };
  request: SignatureRequest;
  proposal: any;
  snapshot?: ProposalDocumentSnapshot;
  signature?: ProposalSignature | null;
}

export interface SendForSignatureInput {
  proposalId: number;
  signerName: string;
  signerEmail: string;
  contactId?: number;
  expiresInDays?: number;
  subject?: string;
  message?: string;
}

export interface ProposalWithSignatureStatus {
  id: number;
  title: string;
  status: string;
  signature_status: SignatureStatus;
  signature_status_updated_at?: string;
  total: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}
