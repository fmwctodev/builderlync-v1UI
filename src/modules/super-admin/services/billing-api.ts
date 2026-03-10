import axios from 'axios';
import { Plan, Subscription, Invoice, RevenueMetrics } from '../types/billing';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const billingApi = {
    // Plans
    async getPlans(): Promise<Plan[]> {
        const response = await axios.get(`${API_BASE_URL}/super-admin/billing/plans`, { headers: getAuthHeaders() });
        return response.data.data;
    },

    async createPlan(planData: any): Promise<Plan> {
        const response = await axios.post(`${API_BASE_URL}/super-admin/billing/plans`, planData, { headers: getAuthHeaders() });
        return response.data.data;
    },

    async updatePlan(id: string, planData: any): Promise<Plan> {
        const response = await axios.put(`${API_BASE_URL}/super-admin/billing/plans/${id}`, planData, { headers: getAuthHeaders() });
        return response.data.data;
    },

    async togglePlanActive(id: string, active: boolean): Promise<Plan> {
        const response = await axios.patch(`${API_BASE_URL}/super-admin/billing/plans/${id}/toggle-active`, { active }, { headers: getAuthHeaders() });
        return response.data.data;
    },

    // Accounts Billing
    async getAllSubscriptions(): Promise<Subscription[]> {
        const response = await axios.get(`${API_BASE_URL}/super-admin/billing/accounts/subscriptions`, { headers: getAuthHeaders() });
        return response.data.data;
    },

    async syncStripeData(): Promise<any> {
        const response = await axios.post(`${API_BASE_URL}/super-admin/billing/sync/stripe`, {}, { headers: getAuthHeaders() });
        return response.data.data;
    },

    // Invoices
    async getAllInvoices(): Promise<Invoice[]> {
        const response = await axios.get(`${API_BASE_URL}/super-admin/billing/invoices`, { headers: getAuthHeaders() });
        return response.data.data;
    },

    // Metrics
    async getMetrics(): Promise<any> {
        const response = await axios.get(`${API_BASE_URL}/super-admin/billing/metrics`, { headers: getAuthHeaders() });
        return response.data.data;
    }
};
