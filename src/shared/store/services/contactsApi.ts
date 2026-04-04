import { getAuthToken } from '../../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface CreateContactRequest {
  fullName: string;
  type: string;
  labelOrRole: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  latitude?: number;
  longitude?: number;
  conatct_id?: number;
  timezone?: string;
}

export interface Contact {
  full_name: string;
  id: string;
  fullName: string;
  type: string;
  labelOrRole: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  createdByName?: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  data: Contact;
}

export interface ContactsListResponse {
  success: boolean;
  data: {
    contacts: Contact[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class ContactsApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    console.log("api response", response);
    if (!response.ok) {
      // Try to parse error details from JSON response
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Response wasn't JSON
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Throw an error that contains the API response data, so the caller can extract 'message' or 'error'
      const error = new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
      (error as any).response = { data: errorData };
      throw error;
    }

    return response.json();
  }

  async createContact(contactData: CreateContactRequest): Promise<ContactResponse> {
    return this.makeRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async getContacts(search?: string, type?: string, page: number = 1, limit: number = 10): Promise<ContactsListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(type && { type }),
    });

    return this.makeRequest(`/contacts?${params}`);
  }

  async searchContactsByTypeAndName(search: string, types: string[]): Promise<Contact[]> {
    const params = new URLSearchParams({ search, page: '1', limit: '25' });
    types.forEach(type => params.append('type', type));

    const result = await this.makeRequest(`/contacts?${params}`);
    return result.success ? result.data.contacts : [];
  }

  async getContactById(id: string): Promise<ContactResponse> {
    return this.makeRequest(`/contacts/${id}`);
  }

  async updateContact(id: string, contactData: CreateContactRequest): Promise<ContactResponse> {
    return this.makeRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id: string) {
    return this.makeRequest(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteContacts(ids: string[]) {
    return this.makeRequest('/contacts/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  async uploadContactsCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/contacts/upload-csv`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async exportContactsCsv(search?: string, type?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);

    return this.makeRequest(`/contacts/export?${params}`, {
      method: 'POST',
    });
  }

  async createNote(noteData: { data: string; contactId: number }) {
    return this.makeRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getNotes(contactId: number, page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({
      contactId: contactId.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    return this.makeRequest(`/notes?${params}`);
  }

  async deleteNote(noteId: number) {
    return this.makeRequest(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  async updateNote(noteId: number, data: string) {
    return this.makeRequest(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async replyToNote(noteId: number, data: string, contactId: number) {
    return this.makeRequest(`/notes/${noteId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ data, contactId }),
    });
  }

  async syncQuickBooksContacts(): Promise<{ synced: number; errors: string[] }> {
    const response = await this.makeRequest('/quickbooks/sync-contacts', {
      method: 'POST',
    });
    return response.data;
  }
}

const contactsApiService = new ContactsApiService();

export const createContact = contactsApiService.createContact.bind(contactsApiService);
export const getContacts = contactsApiService.getContacts.bind(contactsApiService);
export const searchContactsByTypeAndName = contactsApiService.searchContactsByTypeAndName.bind(contactsApiService);
export const getContactById = contactsApiService.getContactById.bind(contactsApiService);
export const updateContact = contactsApiService.updateContact.bind(contactsApiService);
export const deleteContact = contactsApiService.deleteContact.bind(contactsApiService);
export const deleteContacts = contactsApiService.deleteContacts.bind(contactsApiService);
export const uploadContactsCsv = contactsApiService.uploadContactsCsv.bind(contactsApiService);
export const exportContactsCsv = contactsApiService.exportContactsCsv.bind(contactsApiService);
export const createNote = contactsApiService.createNote.bind(contactsApiService);
export const getNotes = contactsApiService.getNotes.bind(contactsApiService);
export const deleteNote = contactsApiService.deleteNote.bind(contactsApiService);
export const updateNote = contactsApiService.updateNote.bind(contactsApiService);
export const replyToNote = contactsApiService.replyToNote.bind(contactsApiService);
export const syncQuickBooksContacts = contactsApiService.syncQuickBooksContacts.bind(contactsApiService);