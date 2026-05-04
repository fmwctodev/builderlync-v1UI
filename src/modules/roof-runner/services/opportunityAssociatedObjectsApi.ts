import { apiClient, buildQueryString } from '../../../shared/utils/api';

export interface OpportunityAssociatedObject {
  id: string;
  opportunity_id: string;
  object_type: 'job' | 'contact' | 'document' | 'proposal' | 'estimate';
  object_id: string;
  object_name: string;
  created_at: string;
}

export interface CreateAssociatedObjectRequest {
  opportunity_id: string;
  object_type: 'job' | 'contact' | 'document' | 'proposal' | 'estimate';
  object_id: string;
  object_name: string;
}

export const opportunityAssociatedObjectsApi = {
  async getAssociatedObjects(opportunityId: string): Promise<OpportunityAssociatedObject[]> {
    return apiClient.get(`/opportunities/${opportunityId}/associated-objects`);
  },

  async getAssociatedObjectsByType(
    opportunityId: string,
    objectType: 'job' | 'contact' | 'document' | 'proposal' | 'estimate'
  ): Promise<OpportunityAssociatedObject[]> {
    return apiClient.get(`/opportunities/${opportunityId}/associated-objects${buildQueryString({ object_type: objectType })}`);
  },

  async createAssociatedObject(objectData: CreateAssociatedObjectRequest): Promise<OpportunityAssociatedObject> {
    return apiClient.post('/opportunities/associated-objects', objectData);
  },

  async deleteAssociatedObject(objectId: string): Promise<void> {
    return apiClient.delete(`/opportunities/associated-objects/${objectId}`);
  },

  async checkAssociation(
    opportunityId: string,
    objectType: string,
    objectId: string
  ): Promise<boolean> {
    const objects = await this.getAssociatedObjectsByType(opportunityId, objectType as any);
    return objects.some(obj => obj.object_id === objectId);
  },
};
