import { cloudDriveApi } from './cloudDriveApi';
import { cloudAuthService } from './cloudAuthService';

export interface FileItem {
  id: number;
  user_id: number;
  folder_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  cloud_provider: 'google' | 'onedrive';
  cloud_file_id: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: number;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
  provider: 'google' | 'onedrive';
  cloudFolderId: string;
  createdAt: string;
  createdBy: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export const fileManagerApi = {
  /**
   * Get user's folders
   */
  async getFolders(parentId?: string): Promise<FolderItem[]> {
    const token = localStorage.getItem('token');
    const url = new URL(`${API_BASE_URL}/oauth/documents/folders`);
    if (parentId) {
      url.searchParams.set('parentId', parentId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch folders');
    }

    const data = await response.json();
    return data.data || [];
  },

  /**
   * Create a new folder
   */
  async createFolder(name: string, parentId?: string): Promise<FolderItem> {
    const connection = await cloudDriveApi.getCurrentUserConnection();
    if (!connection) {
      throw new Error('No cloud drive connected');
    }

    const accessToken = await cloudAuthService.getValidAccessToken(connection);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/oauth/documents/folders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        cloudProvider: connection.provider === 'google_drive' ? 'google' : 'onedrive',
        parentId,
        accessToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get files in a folder
   */
  async getFiles(folderId?: string, page = 1, limit = 20): Promise<{ files: FileItem[], pagination: any }> {
    const token = localStorage.getItem('token');
    const url = new URL(`${API_BASE_URL}/oauth/documents`);
    
    if (folderId) url.searchParams.set('folderId', folderId);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    const data = await response.json();
    return {
      files: data.data?.data || [],
      pagination: data.data?.pagination || {}
    };
  },

  /**
   * Upload a file
   */
  async uploadFile(
    file: File, 
    folderId?: string, 
    description?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileItem> {
    const connection = await cloudDriveApi.getCurrentUserConnection();
    if (!connection) {
      throw new Error('No cloud drive connected');
    }

    const accessToken = await cloudAuthService.getValidAccessToken(connection);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('cloudProvider', connection.provider === 'google_drive' ? 'google' : 'onedrive');
    if (folderId) formData.append('folderId', folderId);
    if (description) formData.append('description', description);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.data);
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/oauth/documents/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      formData.append('accessToken', accessToken);
      xhr.send(formData);
    });
  },

  /**
   * Download a file
   */
  async downloadFile(fileId: string): Promise<Blob> {
    const connection = await cloudDriveApi.getCurrentUserConnection();
    if (!connection) {
      throw new Error('No cloud drive connected');
    }

    const accessToken = await cloudAuthService.getValidAccessToken(connection);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/oauth/documents/${fileId}/download?accessToken=${encodeURIComponent(accessToken)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response.blob();
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    const connection = await cloudDriveApi.getCurrentUserConnection();
    if (!connection) {
      throw new Error('No cloud drive connected');
    }

    const accessToken = await cloudAuthService.getValidAccessToken(connection);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/oauth/documents/${fileId}?accessToken=${encodeURIComponent(accessToken)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  },

  /**
   * Delete a folder
   */
  async deleteFolder(folderId: string): Promise<void> {
    const connection = await cloudDriveApi.getCurrentUserConnection();
    if (!connection) {
      throw new Error('No cloud drive connected');
    }

    const accessToken = await cloudAuthService.getValidAccessToken(connection);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/oauth/documents/folders/${folderId}?accessToken=${encodeURIComponent(accessToken)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete folder');
    }
  },

  /**
   * Share a file
   */
  async shareFile(fileId: string, email?: string): Promise<void> {
    const connection = await cloudDriveApi.getCurrentUserConnection();
    if (!connection) {
      throw new Error('No cloud drive connected');
    }

    const accessToken = await cloudAuthService.getValidAccessToken(connection);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/oauth/documents/${fileId}/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, accessToken })
    });

    if (!response.ok) {
      throw new Error('Failed to share file');
    }
  },

  /**
   * Get file details
   */
  async getFileDetails(fileId: string): Promise<FileItem> {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/oauth/documents/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch file details');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get file thumbnail
   */
  async getFileThumbnail(fileId: string): Promise<string> {
    const connection = await cloudDriveApi.getCurrentUserConnection();
    if (!connection) {
      throw new Error('No cloud drive connected');
    }

    const accessToken = await cloudAuthService.getValidAccessToken(connection);
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/oauth/documents/${fileId}/thumbnail?accessToken=${encodeURIComponent(accessToken)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get thumbnail');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
};