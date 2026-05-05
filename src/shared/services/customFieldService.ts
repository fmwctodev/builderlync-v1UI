import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export interface CustomFieldDefinition {
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
    options?: any[];
    required: boolean;
    entity_type: 'contact' | 'job';
}

export const customFieldService = {
    async getFields(entityType?: string): Promise<CustomFieldDefinition[]> {
        const params = entityType ? { entityType } : {};
        const { data } = await axios.get(`${API_BASE_URL}/custom-fields`, {
            headers: getAuthHeaders(),
            params
        });
        return data.data || [];
    },

    async createField(field: Omit<CustomFieldDefinition, 'id'>): Promise<CustomFieldDefinition> {
        const { data } = await axios.post(`${API_BASE_URL}/custom-fields`, field, {
            headers: getAuthHeaders()
        });
        return data.data;
    },

    async updateField(id: string, field: Partial<CustomFieldDefinition>): Promise<CustomFieldDefinition> {
        const { data } = await axios.put(`${API_BASE_URL}/custom-fields/${id}`, field, {
            headers: getAuthHeaders()
        });
        return data.data;
    },

    async deleteField(id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/custom-fields/${id}`, {
            headers: getAuthHeaders()
        });
    },

    // Lead Scoring
    async getLeadScoring(): Promise<LeadScoringRules> {
        const { data } = await axios.get(`${API_BASE_URL}/custom-fields/lead-scoring`, {
            headers: getAuthHeaders()
        });
        return data.data || { hot_lead_score: 80, warm_lead_score: 50, cold_lead_score: 20 };
    },

    async updateLeadScoring(rules: Partial<LeadScoringRules>): Promise<LeadScoringRules> {
        const { data } = await axios.post(`${API_BASE_URL}/custom-fields/lead-scoring`, rules, {
            headers: getAuthHeaders()
        });
        return data.data;
    }
};

export interface LeadScoringRules {
    hot_lead_score: number;
    warm_lead_score: number;
    cold_lead_score: number;
}
