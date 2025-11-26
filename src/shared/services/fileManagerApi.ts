import { cloudDriveApi } from './cloudDriveApi';
import { cloudAuthService } from './cloudAuthService';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  createdAt: string;
  modifiedAt: string;
  webUrl?: string;
  downloadUrl?: string;
  provider: 'google' | 'onedrive';
  cloudFileId: string;
  parentId?: string;
  thumbnail?: string;
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fileManagerApi = {
  /**
   * Get user's folders
   */
  async getFolders(parentId?: string): Promise<FolderItem[]> {
    const token = localStorage.getItem('token');
    const url = new URL(`${API_BASE_URL}/documents/folders`);
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

    const response = await fetch(`${API_BASE_URL}/documents/folders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'cloud-access-token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        cloudProvider: connection.provider === 'google_drive' ? 'google' : 'onedrive',
        parentId
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
    const url = new URL(`${API_BASE_URL}/documents`);
    
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

      xhr.open('POST', `${API_BASE_URL}/documents/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('cloud-access-token', accessToken);
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

    const response = await fetch(`${API_BASE_URL}/documents/${fileId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'cloud-access-token': accessToken
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

    const response = await fetch(`${API_BASE_URL}/documents/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'cloud-access-token': accessToken
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

    const response = await fetch(`${API_BASE_URL}/documents/folders/${folderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'cloud-access-token': accessToken
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

    const response = await fetch(`${API_BASE_URL}/documents/${fileId}/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'cloud-access-token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
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

    const response = await fetch(`${API_BASE_URL}/documents/${fileId}`, {
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
  }
};