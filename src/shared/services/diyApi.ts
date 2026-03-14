import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const diyApi = {
    async getAllProjects(orgSlug: string) {
        const { data } = await axios.get(`${API_BASE_URL}/diy/org/${orgSlug}`, {
            headers: getAuthHeaders(),
        });
        return data.data;
    },

    async getProject(id: number) {
        const { data } = await axios.get(`${API_BASE_URL}/diy/${id}`, {
            headers: getAuthHeaders(),
        });
        return data.data;
    },

    async saveProject(projectData: any) {
        const { data } = await axios.post(`${API_BASE_URL}/diy/save`, projectData, {
            headers: getAuthHeaders(),
        });
        return data.data;
    },

    async deleteProject(id: number) {
        const { data } = await axios.delete(`${API_BASE_URL}/diy/${id}`, {
            headers: getAuthHeaders(),
        });
        return data.data;
    }
};
