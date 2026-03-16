import axios from 'axios';
import {
  CreateSignatureRequestInput,
  SignatureRequestResponse,
  VerifyTokenResponse,
  SignatureData,
  SignatureRequestDetails,
  ProposalWithSignatureStatus
} from '../types/eSignature';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const eSignatureApi = {
  /**
   * Create a signature request for a proposal
   */
  async createSignatureRequest(
    proposalId: number,
    input: CreateSignatureRequestInput
  ): Promise<SignatureRequestResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/proposals/${proposalId}/signature-requests`,
        input,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating signature request:', error);
      throw error;
    }
  },

  /**
   * Freeze proposal document and generate hash
   */
  async freezeProposalDocument(
    proposalId: number,
    requestId: number,
    frozenHtml: string
  ): Promise<{ documentHash: string }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/proposals/${proposalId}/freeze-document`,
        { requestId, frozenHtml },
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error freezing document:', error);
      throw error;
    }
  },

  /**
   * Verify token and get request details (public)
   */
  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/proposals/signature/verify-token`,
        { params: { token } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  },

  /**
   * Mark signature request as viewed (public)
   */
  async markAsViewed(requestId: number): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/proposals/signature/mark-viewed`,
        { requestId }
      );
    } catch (error) {
      console.error('Error marking as viewed:', error);
      throw error;
    }
  },

  /**
   * Submit signature (public)
   */
  async submitSignature(
    requestId: number,
    signatureData: SignatureData
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/proposals/signature/submit`,
        { requestId, signatureData }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error submitting signature:', error);
      throw error;
    }
  },

  /**
   * Decline signature request (public)
   */
  async declineSignature(
    requestId: number,
    reason?: string
  ): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/proposals/signature/decline`,
        { requestId, reason }
      );
    } catch (error) {
      console.error('Error declining signature:', error);
      throw error;
    }
  },

  /**
   * Get all signature requests for a proposal
   */
  async getProposalSignatureRequests(proposalId: number): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/proposals/${proposalId}/signature-requests`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching signature requests:', error);
      throw error;
    }
  },

  /**
   * Get signature request details
   */
  async getSignatureRequestDetails(requestId: number): Promise<SignatureRequestDetails> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/proposals/signature-requests/${requestId}`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching signature request details:', error);
      throw error;
    }
  },

  /**
   * Void a signature request
   */
  async voidSignatureRequest(requestId: number, reason?: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/proposals/signature-requests/${requestId}/void`,
        { reason },
        { headers: getAuthHeaders() }
      );
    } catch (error) {
      console.error('Error voiding signature request:', error);
      throw error;
    }
  }
};
