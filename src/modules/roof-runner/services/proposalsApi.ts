import axios from 'axios';
import type { CatalogItem } from '../../../shared/store/services/catalogApi';
import type { GenerateAiProposalRequest, GenerateAiProposalResponse } from '../types/aiProposal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5175/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export interface Address {
  uuid?: string;
  address: string;
  locality?: string;
  region_code?: string;
  postal_code?: string;
  lat?: string;
  lng?: string;
}

export interface ContractorSignature {
  name: string;
  font_type: string;
}

export interface Proposal {
  id: number;
  type: string;
  title: string;
  status: 'incomplete' | 'complete' | 'sent' | 'signed' | 'lost';
  signature_status?: 'not_sent' | 'pending_signature' | 'viewed' | 'signed' | 'declined' | 'expired' | 'voided';
  signature_status_updated_at?: string;
  identifier: string;
  template_id?: string;
  sections: any;
  author_id: number;
  assignee_id: number;
  job_id?: number;
  total: number;
  address?: Address;
  contractor_signature?: ContractorSignature;
  created_at: string;
  updated_at: string;
  report_id?: string;
  report?: any;
}

export interface CreateProposalRequest {
  template_id?: string;
  job_id?: number;
  title?: string;
  address?: Address;
  contractor_signature?: ContractorSignature;
  report_id?: string;
}

export interface UpdateProposalRequest {
  title?: string;
  status?: 'incomplete' | 'complete' | 'sent' | 'signed' | 'lost';
  sections?: any;
  total?: number;
  total_manual?: number;
  notes?: string;
  address?: Address;
  contractor_signature?: ContractorSignature;
}

const getCatalogFinalUnitCost = (catalogItem: CatalogItem): string => {
  const preTaxCost = Number(catalogItem.preTaxCost || 0);
  const materialPurchaseTax = Number(catalogItem.materialPurchaseTax || 0);
  const finalUnitCost = preTaxCost + (preTaxCost * materialPurchaseTax) / 100;

  return Number.isFinite(finalUnitCost) ? finalUnitCost.toFixed(2) : '0.00';
};

const mapCatalogItemToProposalItem = (catalogItem: CatalogItem) => ({
  id: crypto.randomUUID(),
  name: catalogItem.name,
  description: catalogItem.description || '',
  mapping: '',
  coverage: catalogItem.coverage?.toString() || '',
  unitCost: getCatalogFinalUnitCost(catalogItem),
  unit: catalogItem.unit || 'square',
  qty: '1',
  salesTax: catalogItem.salesTax?.toString() || '0',
  visible: true,
  checked: false,
  catalogItemId: String(catalogItem.id),
  pricingSource: 'catalog_live',
  priceSyncedAt: new Date().toISOString(),
});

const normalizeProposalSections = (sections: any) => ({
  ...(sections && typeof sections === 'object' ? sections : {}),
  settings:
    sections && typeof sections === 'object' && sections.settings && typeof sections.settings === 'object'
      ? sections.settings
      : {},
  sections:
    sections && typeof sections === 'object' && Array.isArray(sections.sections)
      ? sections.sections
      : [],
  items:
    sections && typeof sections === 'object' && Array.isArray(sections.items)
      ? sections.items
      : [],
  upgrades:
    sections && typeof sections === 'object' && Array.isArray(sections.upgrades)
      ? sections.upgrades
      : [],
});

export const proposalsApi = {
  async createProposal(data: CreateProposalRequest): Promise<Proposal> {
    try {
      const response = await axios.post(`${API_BASE_URL}/proposals`, data, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  },

  async getProposals(filters?: { status?: string; job_id?: number }): Promise<Proposal[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'All proposals') {
        const statusMap: Record<string, string> = {
          'Draft': 'incomplete',
          'Open': 'open',
          'Sent': 'sent',
          'Won': 'signed',
          'Lost': 'lost'
        };
        const apiStatus = statusMap[filters.status] || filters.status;
        params.append('status', apiStatus);
      }
      if (filters?.job_id) params.append('job_id', filters.job_id.toString());

      const url = params.toString() ? `${API_BASE_URL}/proposals?${params.toString()}` : `${API_BASE_URL}/proposals`;
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  },

  async getProposalById(id: number): Promise<Proposal> {
    try {
      const response = await axios.get(`${API_BASE_URL}/proposals/${id}?select=report.response_data.ReportIds`, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw error;
    }
  },

  async updateProposal(id: number, data: UpdateProposalRequest): Promise<Proposal> {
    try {
      const response = await axios.put(`${API_BASE_URL}/proposals/${id}`, data, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating proposal:', error);
      throw error;
    }
  },

  async deleteProposal(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/proposals/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      throw error;
    }
  },

  async duplicateProposal(id: number): Promise<Proposal> {
    try {
      const response = await axios.post(`${API_BASE_URL}/proposals/${id}/duplicate`, {}, {
        headers: getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error duplicating proposal:', error);
      throw error;
    }
  },

  async getProposalsByOpportunity(opportunityId: string): Promise<Proposal[]> {
    try {
      // 1. Get associations
      const assocResponse = await axios.get(`${API_BASE_URL}/associated-objects?opportunity_id=${opportunityId}&object_type=proposal`, {
        headers: getAuthHeaders(),
      });
      const associations = assocResponse.data;
      console.log('Found proposal associations:', associations);

      if (!associations || associations.length === 0) return [];

      // 2. Get proposals for these IDs
      const proposalIds = associations.map((a: any) => a.object_id);

      // We can fetch all and filter or add an endpoint for bulk get.
      // For now, let's fetch all and filter to be safe, or just loop if small number.
      // But getProposals can take filters. Let's see if it supports multiple IDs.
      // If not, we'll fetch them individually or use the getProposals with a filter if we add it.

      const proposalsResults = await Promise.allSettled(
        proposalIds.map((id: string) => this.getProposalById(parseInt(id)))
      );

      const proposals = proposalsResults
        .filter((r): r is PromiseFulfilledResult<Proposal> => r.status === 'fulfilled')
        .map(r => r.value);

      console.log(`Loaded ${proposals.length} proposals for opportunity ${opportunityId}`);
      return proposals;
    } catch (error) {
      console.error('Error fetching proposals by opportunity:', error);
      return [];
    }
  },

  async linkProposalToOpportunity(proposalId: string, opportunityId: string, proposalTitle: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/opportunities/associated-objects`, {
        opportunity_id: opportunityId,
        object_type: 'proposal',
        object_id: proposalId,
        object_name: proposalTitle
      }, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error linking proposal to opportunity:', error);
      throw error;
    }
  },

  async unlinkProposalFromOpportunity(proposalId: string): Promise<void> {
    try {
      // Find the association record first
      // This is slightly inefficient but the current schema uses an association ID for deletion
      const assocResponse = await axios.get(`${API_BASE_URL}/associated-objects?object_type=proposal&object_id=${proposalId}`, {
        headers: getAuthHeaders(),
      });
      const associations = assocResponse.data;

      if (associations && associations.length > 0) {
        await axios.delete(`${API_BASE_URL}/opportunities/associated-objects/${associations[0].id}`, {
          headers: getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error('Error unlinking proposal from opportunity:', error);
      throw error;
    }
  },

  async addCatalogItemsToProposal(proposalId: number, catalogItems: CatalogItem[]): Promise<Proposal> {
    if (!catalogItems.length) {
      throw new Error('No catalog items provided');
    }

    const proposal = await this.getProposalById(proposalId);
    const normalizedSections = normalizeProposalSections(proposal.sections);
    const nextItems = [
      ...normalizedSections.items,
      ...catalogItems.map(mapCatalogItemToProposalItem),
    ];

    return this.updateProposal(proposalId, {
      sections: {
        ...normalizedSections,
        items: nextItems,
      },
    });
  },

  async generateAiProposal(data: GenerateAiProposalRequest): Promise<GenerateAiProposalResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/proposals/ai-generate`, data, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error generating AI proposal:', error);
      throw error;
    }
  }
};
