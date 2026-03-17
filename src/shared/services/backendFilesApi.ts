import { getAuthToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';

export interface FileRecord {
  id: string | number;
  user_id: number;
  folder_id: string | number | null;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  cloud_provider: 'google' | 'onedrive';
  cloud_file_id: string;
  description: string | null;
  created_at: string;
}

export interface FolderRecord {
  id: string | number;
  user_id: number;
  parent_id: string | number | null;
  name: string;
  cloud_provider: 'google' | 'onedrive';
  cloud_folder_id: string;
  created_at: string;
}

export interface CreateFolderData {
  name: string;
  cloudProvider: 'google' | 'onedrive';
  parentId?: string | number | null;
}

export interface UploadProgressCallback {
  (progress: number, fileName: string): void;
}

class BackendFilesApiService {
  private async getConnectionTokens() {
    try {
      const response = await fetch(`${API_BASE_URL}/file-manager/connection`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error getting connection tokens:', error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, options: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> } = {}) {
    const token = getAuthToken();

    const headers: Record<string, string> = {
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    };

    // Only add Content-Type for requests with body
    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getFiles(folderId?: string | number | null, pageToken?: string, limit = 50): Promise<{ data: FileRecord[]; pagination: any }> {
    const params = new URLSearchParams();
    if (folderId !== null && folderId !== undefined) {
      params.append('folderId', folderId.toString());
    }
    if (pageToken) params.append('pageToken', pageToken);
    params.append('limit', limit.toString());

    console.log('Getting files with params:', params.toString());
    const result = await this.makeRequest(`/oauth/documents?${params}`);
    console.log('Files API response:', result);

    if (result.success) {
      return result.data; // result.data contains { data: FileRecord[], pagination: ... }
    }
    return { data: [], pagination: {} };
  }

  async searchFiles(searchTerm: string): Promise<FileRecord[]> {
    const { data } = await this.getFiles();
    return data.filter(file =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file as any).originalFilename?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async uploadFile(
    file: File,
    folderId?: string | number | null,
    onProgress?: UploadProgressCallback
  ): Promise<FileRecord> {
    const connection = await this.getConnectionTokens();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cloudProvider', 'google');
    formData.append('accessToken', connection?.access_token || '');
    formData.append('description', '');
    if (folderId) formData.append('folderId', folderId.toString());

    const token = getAuthToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress, file.name);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.data || response);
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${API_BASE_URL}/oauth/documents/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  async uploadMultipleFiles(
    files: File[],
    folderId?: string | number | null,
    onProgress?: UploadProgressCallback
  ): Promise<FileRecord[]> {
    const uploadedFiles: FileRecord[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uploadedFile = await this.uploadFile(file, folderId, (progress) => {
          const overallProgress = ((i / files.length) * 100) + ((progress / files.length));
          onProgress?.(overallProgress, file.name);
        });
        uploadedFiles.push(uploadedFile);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    return uploadedFiles;
  }

  async getFileDownloadUrl(fileId: string | number): Promise<string> {
    return `${API_BASE_URL}/oauth/documents/${fileId}/download`;
  }

  async deleteFile(fileId: string | number): Promise<void> {
    const connection = await this.getConnectionTokens();
    await this.makeRequest(`/oauth/documents/${fileId}`, {
      method: 'DELETE',
      headers: {
        'cloud-access-token': connection?.access_token || ''
      }
    });
  }

  async renameFile(fileId: string | number, newName: string): Promise<void> {
    await this.makeRequest(`/oauth/documents/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ filename: newName }),
    });
  }

  async moveFile(fileId: string | number, newFolderId: string | number | null): Promise<void> {
    await this.makeRequest(`/oauth/documents/${fileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ folderId: newFolderId }),
    });
  }

  async getFolders(parentId?: string | number | null, pageToken?: string, limit = 50): Promise<{ data: FolderRecord[], nextPageToken?: string }> {
    const params = new URLSearchParams();
    if (parentId !== null && parentId !== undefined) {
      params.append('parentId', parentId.toString());
    }
    if (pageToken) params.append('pageToken', pageToken);
    params.append('limit', limit.toString());

    console.log('Getting folders with params:', params.toString());
    const result = await this.makeRequest(`/oauth/documents/folders?${params}`);
    console.log('Folders API response:', result);

    if (result.success) {
      return {
        data: result.data.data || [],
        nextPageToken: result.data.nextPageToken
      };
    }
    return { data: [] };
  }

  async createFolder(folderData: CreateFolderData): Promise<FolderRecord> {
    const connection = await this.getConnectionTokens();
    const result = await this.makeRequest('/oauth/documents/folders', {
      method: 'POST',
      body: JSON.stringify({
        ...folderData,
        accessToken: connection?.access_token || ''
      }),
    });
    return result.success ? result.data : result;
  }

  async deleteFolder(folderId: string | number): Promise<void> {
    const connection = await this.getConnectionTokens();
    await this.makeRequest(`/oauth/documents/folders/${folderId}`, {
      method: 'DELETE',
      body: JSON.stringify({ accessToken: connection?.access_token || '' }),
    });
  }

  async renameFolder(folderId: string | number, newName: string): Promise<void> {
    await this.makeRequest(`/oauth/documents/folders/${folderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: newName }),
    });
  }

  async moveFolder(folderId: string | number, newParentFolderId: string | number | null): Promise<void> {
    await this.makeRequest(`/oauth/documents/folders/${folderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ parentId: newParentFolderId }),
    });
  }

  async getFolderBreadcrumbs(folderId: string | number): Promise<Array<{ id: string | number, name: string }>> {
    try {
      const result = await this.makeRequest(`/oauth/documents/folders/${folderId}/breadcrumbs`);
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error getting breadcrumbs:', error);
      return [];
    }
  }

  async getFolderContents(folderId: string | number | null, filePageToken?: string, folderPageToken?: string): Promise<{ folders: FolderRecord[]; files: FileRecord[]; nextFilePageToken?: string; nextFolderPageToken?: string }> {
    console.log('Getting folder contents for folderId:', folderId);

    try {
      const [foldersResponse, filesResponse] = await Promise.all([
        this.getFolders(folderId, folderPageToken),
        this.getFiles(folderId, filePageToken)
      ]);

      console.log('Folder contents result:', { folders: foldersResponse.data, files: filesResponse.data });
      return {
        folders: foldersResponse.data,
        files: filesResponse.data,
        nextFilePageToken: filesResponse.pagination?.nextPageToken,
        nextFolderPageToken: foldersResponse.nextPageToken
      };
    } catch (error) {
      console.error('Error getting folder contents:', error);
      throw error;
    }
  }
}

export const backendFilesApi = new BackendFilesApiService();