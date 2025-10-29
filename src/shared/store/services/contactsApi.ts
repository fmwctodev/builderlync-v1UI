import axios from 'axios';

const API_BASE_URL = 'https://builderlyncapi.testenvapp.com/api';

export interface CreateContactRequest {
  fullName: string;
  type: string;
  labelOrRole: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    full_name: string;
    type: string;
    label_or_role: string;
    email: string;
    phone: string;
    company: string;
    address: string;
    latitude: number;
    longitude: number;
    created_at: string;
    updated_at: string;
    created_by: null;
  };
}

export const createContact = async (contactData: CreateContactRequest): Promise<ContactResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.post<ContactResponse>(
    `${API_BASE_URL}/contacts`,
    contactData,
    {
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getContacts = async (search?: string, type?: string, page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('token');

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await axios.get(
    `${API_BASE_URL}/contacts?${params.toString()}`,
    {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getContactById = async (id: number): Promise<ContactResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<ContactResponse>(
    `${API_BASE_URL}/contacts/${id}`,
    {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateContact = async (id: number, contactData: CreateContactRequest): Promise<ContactResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.put<ContactResponse>(
    `${API_BASE_URL}/contacts/${id}`,
    contactData,
    {
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const uploadContactsCsv = async (file: File) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(
    `${API_BASE_URL}/contacts/upload-csv`,
    formData,
    {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export interface CreateNoteRequest {
  data: string;
  contactId: number;
}

export const createNote = async (noteData: CreateNoteRequest) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/notes`,
    noteData,
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getNotes = async (contactId: number, page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('token');

  const response = await axios.get(
    `${API_BASE_URL}/notes?contactId=${contactId}&page=${page}&limit=${limit}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const deleteNote = async (noteId: number) => {
  const token = localStorage.getItem('token');

  const response = await axios.delete(
    `${API_BASE_URL}/notes/${noteId}`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const updateNote = async (noteId: number, data: string) => {
  const token = localStorage.getItem('token');

  const response = await axios.put(
    `${API_BASE_URL}/notes/${noteId}`,
    { data },
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const replyToNote = async (noteId: number, data: string, contactId: number) => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/notes/${noteId}/replies`,
    { data, contactId },
    {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};