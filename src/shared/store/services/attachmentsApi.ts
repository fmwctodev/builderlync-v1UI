import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://builderlyncapi.testenvapp.com/api';

export interface Attachment {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  job_id?: number | null;
  folder_id?: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface AttachmentsResponse {
  success: boolean;
  message: string;
  data: Attachment[];
}

export const getAttachments = async (): Promise<AttachmentsResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<AttachmentsResponse>(
    `${API_BASE_URL}/documents`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const getAttachmentsByJobId = async (jobId: number): Promise<AttachmentsResponse> => {
  const token = localStorage.getItem('token');

  const response = await axios.get<AttachmentsResponse>(
    `${API_BASE_URL}/jobs/${jobId}/attachments`,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const uploadAttachment = async (formData: FormData): Promise<{ success: boolean; message: string; data: Attachment }> => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/documents/upload`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};

export const createJobAttachment = async (
  jobId: number,
  attachmentData: Partial<Attachment>
): Promise<{ success: boolean; message: string; data: Attachment }> => {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/jobs/${jobId}/attachments`,
    attachmentData,
    {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.data;
};
