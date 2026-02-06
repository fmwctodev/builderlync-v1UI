import axios from 'axios';
import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

const getHeaders = () => {
    const token = getAuthToken();
    return {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface Activity {
    id: number;
    contactId: number;
    activityType: string;
    title: string;
    description: string;
    metadata: any;
    createdBy: number;
    createdByName: string;
    createdAt: string;
}

export interface ContactTask {
    id?: number;
    contactId: number;
    title: string;
    description?: string;
    dueDate: string;
    isRecurring: boolean;
    assignedTo: number;
    assigneeName?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    createdBy?: number;
    createdAt?: string;
}

export interface Appointment {
    id?: number;
    contactId: number;
    title: string;
    description?: string;
    teamMember: number;
    teamMemberName?: string;
    appointmentDate: string;
    appointmentTime: string;
    duration: number;
    meetingLocation?: string;
    status: 'confirmed' | 'unconfirmed' | 'cancelled' | 'completed';
    attendees?: any;
    internalNotes?: string;
    createdAt?: string;
}

export interface ContactDocument {
    id: number;
    contactId: number;
    filename: string;
    originalFilename: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    section: 'all' | 'internal' | 'sent' | 'received';
    description?: string;
    createdBy: number;
    createdByName: string;
    createdAt: string;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    customer_id: number;
    customer_name: string;
    issue_date: string;
    due_date: string;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    notes?: string;
    createdAt: string;
}

export const contactModulesApi = {
    // Activities
    getActivities: async (contactId: number, page = 1, limit = 10) => {
        const response = await axios.get(`${API_BASE_URL}/contacts/${contactId}/activities?page=${page}&limit=${limit}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    // Tasks
    getTasks: async (contactId: number, page = 1, limit = 10) => {
        const response = await axios.get(`${API_BASE_URL}/contacts/${contactId}/tasks?page=${page}&limit=${limit}`, {
            headers: getHeaders()
        });
        return response.data;
    },
    createTask: async (contactId: number, taskData: Partial<ContactTask>) => {
        console.log('Creating task:', { contactId, taskData });
        const response = await axios.post(`${API_BASE_URL}/contacts/${contactId}/tasks`, taskData, {
            headers: getHeaders()
        });
        return response.data;
    },
    updateTask: async (taskId: number, taskData: Partial<ContactTask>) => {
        const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, taskData, {
            headers: getHeaders()
        });
        return response.data;
    },
    deleteTask: async (taskId: number) => {
        const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    // Appointments
    getAppointments: async (contactId: number, page = 1, limit = 10) => {
        const response = await axios.get(`${API_BASE_URL}/contacts/${contactId}/appointments?page=${page}&limit=${limit}`, {
            headers: getHeaders()
        });
        return response.data;
    },
    createAppointment: async (contactId: number, appointmentData: Partial<Appointment>) => {
        const response = await axios.post(`${API_BASE_URL}/contacts/${contactId}/appointments`, appointmentData, {
            headers: getHeaders()
        });
        return response.data;
    },
    updateAppointment: async (appointmentId: number, appointmentData: Partial<Appointment>) => {
        const response = await axios.put(`${API_BASE_URL}/appointments/${appointmentId}`, appointmentData, {
            headers: getHeaders()
        });
        return response.data;
    },
    deleteAppointment: async (appointmentId: number) => {
        const response = await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    // Documents
    getDocuments: async (contactId: number, section = 'all', page = 1, limit = 10) => {
        const response = await axios.get(`${API_BASE_URL}/contacts/${contactId}/documents?section=${section}&page=${page}&limit=${limit}`, {
            headers: getHeaders()
        });
        return response.data;
    },
    uploadDocument: async (contactId: number, formData: FormData) => {
        const response = await axios.post(`${API_BASE_URL}/contacts/${contactId}/documents`, formData, {
            headers: {
                ...getHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteDocument: async (documentId: number) => {
        const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`, {
            headers: getHeaders()
        });
        return response.data;
    },

    // Invoices/Transactions
    getInvoices: async (contactId: number) => {
        const response = await axios.get(`${API_BASE_URL}/invoices?customer_id=${contactId}`, {
            headers: getHeaders()
        });
        return response.data;
    }
};
